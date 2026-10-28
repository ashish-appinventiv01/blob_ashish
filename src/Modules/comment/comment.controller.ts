import { Request, Response } from "express";
import { MESSAGES } from "../../constants/messages";
import { commentValidator } from "../../middlewares/validateComment";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { PublicUser } from "../user/user.interface";
import { CreateCommentInput } from "./comment.interface";
import { commentService } from "./comment.service";

class CommentController {
  private requireUser(req: Request): PublicUser {
    if (!req.user) {
      throw new AppError(MESSAGES.unauthorized, 401);
    }

    return req.user;
  }

  private readId(req: Request): string {
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new AppError(MESSAGES.invalidPostId, 400);
    }

    return id;
  }

  listComments = asyncHandler.wrap(async (req: Request, res: Response) => {
    const { page, limit } = commentValidator.parseCommentListQuery(req.query);
    const result = await commentService.listPostComments({ postId: this.readId(req), page, limit });
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  });

  createComment = asyncHandler.wrap(async (req: Request, res: Response) => {
    const input: CreateCommentInput = {
      postId: this.readId(req),
      user: this.requireUser(req),
      text: req.body.text as string,
    };
    const comment = await commentService.createCommentOnPost(input);
    res.status(201).json(comment);
  });

  deleteComment = asyncHandler.wrap(async (req: Request, res: Response) => {
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new AppError(MESSAGES.invalidCommentId, 400);
    }

    await commentService.deleteCommentForUser(id, this.requireUser(req).id);
    res.status(200).json({ success: true, message: MESSAGES.commentDeleted });
  });
}

export const commentController = new CommentController();
