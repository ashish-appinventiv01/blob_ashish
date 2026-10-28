import { MESSAGES } from "../../constants/messages";
import {
  createPost,
  deletePostAndComments,
  findPostById,
  findPostsByAuthor,
  findPublishedPostById,
  findPublishedPosts,
  updatePostById,
} from "./post.repository";
import { AppError } from "../../utils/AppError";
import { isObjectId } from "../../utils/objectId";
import { PublicUser } from "../user/user.interface";
import { CreatePostInput, PostListQuery, UpdatePostInput } from "./post.interface";

function assertPostId(id: string): void {
  if (!isObjectId(id)) {
    throw new AppError(MESSAGES.invalidPostId, 400);
  }
}

async function requireOwnPost(id: string, userId: string, action: "update" | "delete") {
  assertPostId(id);
  const post = await findPostById(id);

  if (!post) {
    throw new AppError(MESSAGES.postNotFound, 404);
  }

  if (post.author.toString() !== userId) {
    throw new AppError(action === "delete" ? MESSAGES.forbiddenDelete : MESSAGES.forbiddenUpdate, 403);
  }

  return post;
}

export async function createPostForUser(user: PublicUser, input: CreatePostInput) {
  return createPost({
    title: input.title,
    body: input.body,
    tags: input.tags,
    status: input.status,
    author: user.id,
    authorName: user.name,
  });
}

export async function getPublishedPost(id: string) {
  assertPostId(id);
  const post = await findPublishedPostById(id);

  if (!post) {
    throw new AppError(MESSAGES.postNotFound, 404);
  }

  return post;
}

export function listPublishedPosts(query: PostListQuery) {
  return findPublishedPosts(query);
}

export async function updateOwnPost(id: string, userId: string, changes: UpdatePostInput) {
  await requireOwnPost(id, userId, "update");
  const updated = await updatePostById(id, changes);

  if (!updated) {
    throw new AppError(MESSAGES.postNotFound, 404);
  }

  return updated;
}

export async function deleteOwnPost(id: string, userId: string): Promise<void> {
  const post = await requireOwnPost(id, userId, "delete");
  await deletePostAndComments(post._id);
}

export function listOwnPosts(userId: string) {
  return findPostsByAuthor(userId);
}
