import { Types } from "mongoose";
import { PostModel } from "../../model/post.model";
import { regexUtil } from "../../utils/escapeRegex";
import { commentRepository } from "../comment/comment.repository";
import { CreatePostInput, PostListItem, PostListQuery, PostListResult, UpdatePostInput } from "./post.interface";

export type { PostListItem, PostListQuery };

type FacetPost = Omit<PostListItem, "_id" | "author"> & {
  _id: Types.ObjectId;
  author: Types.ObjectId;
};

type FacetResult = {
  data: FacetPost[];
  meta: Array<{ total: number }>;
};

class PostRepository {
  createPost(input: CreatePostInput & { author: string; authorName: string }) {
    return PostModel.create(input);
  }

  findPostById(id: string) {
    return PostModel.findById(id);
  }

  findPublishedPostById(id: string) {
    return PostModel.findOne({ _id: id, status: "published" });
  }

  findPostsByAuthor(authorId: string) {
    return PostModel.find({ author: authorId }).sort({ createdAt: -1 });
  }

  updatePostById(id: string, changes: UpdatePostInput) {
    return PostModel.findByIdAndUpdate(id, changes, { returnDocument: "after", runValidators: true });
  }

  incrementCommentCount(postId: string) {
    return PostModel.updateOne({ _id: postId, status: "published" }, { $inc: { commentCount: 1 } });
  }

  decrementCommentCount(postId: Types.ObjectId) {
    return PostModel.updateOne({ _id: postId, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });
  }

  async deletePostAndComments(postId: Types.ObjectId): Promise<void> {
    await commentRepository.deleteCommentsByPostId(postId);
    await PostModel.deleteOne({ _id: postId });
  }

  async findPublishedPosts(query: PostListQuery): Promise<PostListResult> {
    const match: Record<string, unknown> = { status: "published" };

    if (query.search) {
      match.title = { $regex: regexUtil.escape(query.search), $options: "i" };
    }

    if (query.tag) {
      match.tags = query.tag;
    }

    const sort: Record<string, 1 | -1> =
      query.sort === "oldest"
        ? { createdAt: 1 }
        : query.sort === "mostCommented"
          ? { commentCount: -1, createdAt: -1 }
          : { createdAt: -1 };

    const [result] = await PostModel.aggregate<FacetResult>([
      { $match: match },
      {
        $facet: {
          data: [
            { $sort: sort },
            { $skip: (query.page - 1) * query.limit },
            { $limit: query.limit },
            { $project: { body: 0 } },
          ],
          meta: [{ $count: "total" }],
        },
      },
    ]);

    const total = result?.meta[0]?.total ?? 0;
    const data = (result?.data ?? []).map((post) => ({
      _id: post._id.toString(),
      title: post.title,
      tags: post.tags,
      author: post.author.toString(),
      authorName: post.authorName,
      status: post.status,
      commentCount: post.commentCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      },
    };
  }
}

export const postRepository = new PostRepository();
