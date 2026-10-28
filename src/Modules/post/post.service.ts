import { MESSAGES } from "../../constants/messages";
import { cache, CacheStatus, postCache, redisConfig } from "../../providers/redis";
import { AppError } from "../../utils/AppError";
import { objectId } from "../../utils/objectId";
import { PublicUser } from "../user/user.interface";
import { CreatePostInput, PostListQuery, PostListResult, UpdatePostInput } from "./post.interface";
import { postRepository } from "./post.repository";

type PublishedPostListBody = {
  success: true;
  data: PostListResult["data"];
  pagination: PostListResult["pagination"];
};

class PostService {
  private assertPostId(id: string): void {
    if (!objectId.isObjectId(id)) {
      throw new AppError(MESSAGES.invalidPostId, 400);
    }
  }

  private async requireOwnPost(id: string, userId: string, action: "update" | "delete") {
    this.assertPostId(id);
    const post = await postRepository.findPostById(id);

    if (!post) {
      throw new AppError(MESSAGES.postNotFound, 404);
    }

    if (post.author.toString() !== userId) {
      throw new AppError(action === "delete" ? MESSAGES.forbiddenDelete : MESSAGES.forbiddenUpdate, 403);
    }

    return post;
  }

  async createPostForUser(user: PublicUser, input: CreatePostInput) {
    const post = await postRepository.createPost({
      title: input.title,
      body: input.body,
      tags: input.tags,
      status: input.status,
      author: user.id,
      authorName: user.name,
    });
    await postCache.bumpListVersion();
    return post;
  }

  async getPublishedPost(id: string): Promise<{ post: unknown; cacheStatus: CacheStatus }> {
    this.assertPostId(id);
    const { value, cacheStatus } = await cache.aside(redisConfig.keys.post(id), redisConfig.ttl.post, async () => {
      const post = await postRepository.findPublishedPostById(id);
      if (!post) throw new AppError(MESSAGES.postNotFound, 404);
      return post;
    });
    return { post: value, cacheStatus };
  }

  async listPublishedPosts(query: PostListQuery): Promise<{ body: PublishedPostListBody; cacheStatus: CacheStatus }> {
    const version = (await cache.get(redisConfig.keys.postListVersion())) ?? "0";
    const { value, cacheStatus } = await cache.aside(
      redisConfig.keys.postList(version, query),
      redisConfig.ttl.postList,
      async () => {
        const result = await postRepository.findPublishedPosts(query);
        return { success: true as const, data: result.data, pagination: result.pagination };
      },
    );
    return { body: value, cacheStatus };
  }

  async updateOwnPost(id: string, userId: string, changes: UpdatePostInput) {
    await this.requireOwnPost(id, userId, "update");
    const updated = await postRepository.updatePostById(id, changes);

    if (!updated) {
      throw new AppError(MESSAGES.postNotFound, 404);
    }

    await postCache.invalidate(id);
    return updated;
  }

  async deleteOwnPost(id: string, userId: string): Promise<void> {
    const post = await this.requireOwnPost(id, userId, "delete");
    await postRepository.deletePostAndComments(post._id);
    await postCache.invalidate(id);
  }

  listOwnPosts(userId: string) {
    return postRepository.findPostsByAuthor(userId);
  }
}

export const postService = new PostService();
