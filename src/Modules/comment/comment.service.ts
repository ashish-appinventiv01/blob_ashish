import { MESSAGES } from "../../constants/messages";
import { postCache } from "../../providers/redis";
import { postRepository } from "../post/post.repository";
import { AppError } from "../../utils/AppError";
import { objectId } from "../../utils/objectId";
import { CommentListQuery, CreateCommentInput } from "./comment.interface";
import { commentRepository } from "./comment.repository";

class CommentService {
  private async requirePublishedPost(postId: string) {
    if (!objectId.isObjectId(postId)) throw new AppError(MESSAGES.invalidPostId, 400);
    const post = await postRepository.findPublishedPostById(postId);
    if (!post) throw new AppError(MESSAGES.postNotFound, 404);
    return post;
  }

  async createCommentOnPost(input: CreateCommentInput) {
    await this.requirePublishedPost(input.postId);

    const comment = await commentRepository.createComment({
      postId: input.postId,
      userId: input.user.id,
      userName: input.user.name,
      text: input.text,
    });

    const updated = await postRepository.incrementCommentCount(input.postId);
    if (updated.matchedCount === 0) {
      await commentRepository.deleteCommentById(comment._id);
      throw new AppError(MESSAGES.postNotFound, 404);
    }

    await postCache.invalidate(input.postId);
    return comment;
  }

  async listPostComments(query: CommentListQuery) {
    await this.requirePublishedPost(query.postId);
    return commentRepository.findCommentsByPost(query.postId, query.page, query.limit);
  }

  async deleteCommentForUser(commentId: string, userId: string): Promise<void> {
    if (!objectId.isObjectId(commentId)) {
      throw new AppError(MESSAGES.invalidCommentId, 400);
    }

    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) {
      throw new AppError(MESSAGES.commentNotFound, 404);
    }

    const post = await postRepository.findPostById(comment.postId.toString());
    const isCommentAuthor = comment.userId.toString() === userId;
    const isPostAuthor = post?.author.toString() === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      throw new AppError(MESSAGES.forbiddenCommentDelete, 403);
    }

    const deleted = await commentRepository.deleteCommentById(comment._id);
    if (deleted.deletedCount === 1) {
      await postRepository.decrementCommentCount(comment.postId);
      await postCache.invalidate(comment.postId.toString());
    }
  }
}

export const commentService = new CommentService();
