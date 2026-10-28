import { Request, Response } from "express";
import { MESSAGES } from "../../constants/messages";
import { parseCommentListQuery } from "../../middlewares/validateComment";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { PublicUser } from "../user/user.interface";
import { CreateCommentInput } from "./comment.interface";
import { createCommentOnPost, deleteCommentForUser, listPostComments } from "./comment.service";

function requireUser(req: Request): PublicUser {
  if (!req.user) {
    throw new AppError(MESSAGES.unauthorized, 401);
  }

  return req.user;
}

function readId(req: Request): string {
  const id = req.params.id;
  if (typeof id !== "string") {
    throw new AppError(MESSAGES.invalidPostId, 400);
  }

  return id;
}

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parseCommentListQuery(req.query);
  const result = await listPostComments({ postId: readId(req), page, limit });
  res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateCommentInput = {
    postId: readId(req),
    user: requireUser(req),
    text: req.body.text as string,
  };
  const comment = await createCommentOnPost(input);
  res.status(201).json(comment);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") {
    throw new AppError(MESSAGES.invalidCommentId, 400);
  }

  await deleteCommentForUser(id, requireUser(req).id);
  res.status(200).json({ success: true, message: MESSAGES.commentDeleted });
});
