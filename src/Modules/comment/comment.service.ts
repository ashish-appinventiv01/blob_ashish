import { MESSAGES } from "../../constants/messages";
import {
  decrementCommentCount,
  findPostById,
  findPublishedPostById,
  incrementCommentCount,
} from "../post/post.repository";
import { createComment, deleteCommentById, findCommentById, findCommentsByPost } from "./comment.repository";
import { AppError } from "../../utils/AppError";
import { isObjectId } from "../../utils/objectId";
import { CommentListQuery, CreateCommentInput } from "./comment.interface";

export async function createCommentOnPost(input: CreateCommentInput) {
  if (!isObjectId(input.postId)) {
    throw new AppError(MESSAGES.invalidPostId, 400);
  }

  const post = await findPublishedPostById(input.postId);
  if (!post) {
    throw new AppError(MESSAGES.postNotFound, 404);
  }

  const comment = await createComment({
    postId: input.postId,
    userId: input.user.id,
    userName: input.user.name,
    text: input.text,
  });

  const updated = await incrementCommentCount(input.postId);
  if (updated.matchedCount === 0) {
    await deleteCommentById(comment._id);
    throw new AppError(MESSAGES.postNotFound, 404);
  }

  return comment;
}

export async function listPostComments(query: CommentListQuery) {
  if (!isObjectId(query.postId)) {
    throw new AppError(MESSAGES.invalidPostId, 400);
  }

  const post = await findPublishedPostById(query.postId);
  if (!post) {
    throw new AppError(MESSAGES.postNotFound, 404);
  }

  return findCommentsByPost(query.postId, query.page, query.limit);
}

export async function deleteCommentForUser(commentId: string, userId: string): Promise<void> {
  if (!isObjectId(commentId)) {
    throw new AppError(MESSAGES.invalidCommentId, 400);
  }

  const comment = await findCommentById(commentId);
  if (!comment) {
    throw new AppError(MESSAGES.commentNotFound, 404);
  }

  const post = await findPostById(comment.postId.toString());
  const isCommentAuthor = comment.userId.toString() === userId;
  const isPostAuthor = post?.author.toString() === userId;

  if (!isCommentAuthor && !isPostAuthor) {
    throw new AppError(MESSAGES.forbiddenCommentDelete, 403);
  }

  const deleted = await deleteCommentById(comment._id);
  if (deleted.deletedCount === 1) {
    await decrementCommentCount(comment.postId);
  }
}
