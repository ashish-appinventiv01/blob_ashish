import { Request, Response } from "express";
import { MESSAGES } from "../../constants/messages";
import { parsePostListQuery } from "../../middlewares/validatePost";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { PublicUser } from "../user/user.interface";
import { CreatePostInput, UpdatePostInput } from "./post.interface";
import {
  createPostForUser,
  deleteOwnPost,
  getPublishedPost,
  listOwnPosts,
  listPublishedPosts,
  updateOwnPost,
} from "./post.service";

function requireUser(req: Request): PublicUser {
  if (!req.user) {
    throw new AppError(MESSAGES.unauthorized, 401);
  }

  return req.user;
}

function readPostId(req: Request): string {
  const id = req.params.id;
  if (typeof id !== "string") {
    throw new AppError(MESSAGES.invalidPostId, 400);
  }

  return id;
}

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPublishedPosts(parsePostListQuery(req.query));
  res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const input: CreatePostInput = {
    title: req.body.title as string,
    body: req.body.body as string,
    tags: req.body.tags as string[],
    status: req.body.status as CreatePostInput["status"],
  };
  const post = await createPostForUser(requireUser(req), input);

  res.status(201).json(post);
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await getPublishedPost(readPostId(req));
  res.status(200).json(post);
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await updateOwnPost(readPostId(req), requireUser(req).id, req.body as UpdatePostInput);
  res.status(200).json(post);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await deleteOwnPost(readPostId(req), requireUser(req).id);
  res.status(200).json({ success: true, message: MESSAGES.postDeleted });
});

export const listMyPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await listOwnPosts(requireUser(req).id);
  res.status(200).json(posts);
});
