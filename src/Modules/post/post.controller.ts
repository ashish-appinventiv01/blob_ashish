import { Request, Response } from "express";
import { MESSAGES } from "../../constants/messages";
import { postValidator } from "../../middlewares/validatePost";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { PublicUser } from "../user/user.interface";
import { CreatePostInput, UpdatePostInput } from "./post.interface";
import { postService } from "./post.service";

class PostController {
  private requireUser(req: Request): PublicUser {
    if (!req.user) {
      throw new AppError(MESSAGES.unauthorized, 401);
    }

    return req.user;
  }

  private readPostId(req: Request): string {
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new AppError(MESSAGES.invalidPostId, 400);
    }

    return id;
  }

  listPosts = asyncHandler.wrap(async (req: Request, res: Response) => {
    const result = await postService.listPublishedPosts(postValidator.parsePostListQuery(req.query));
    res.set("X-Cache", result.cacheStatus);
    res.status(200).json(result.body);
  });

  createPost = asyncHandler.wrap(async (req: Request, res: Response) => {
    const post = await postService.createPostForUser(this.requireUser(req), req.body as CreatePostInput);

    res.status(201).json(post);
  });

  getPost = asyncHandler.wrap(async (req: Request, res: Response) => {
    const result = await postService.getPublishedPost(this.readPostId(req));
    res.set("X-Cache", result.cacheStatus);
    res.status(200).json(result.post);
  });

  updatePost = asyncHandler.wrap(async (req: Request, res: Response) => {
    const post = await postService.updateOwnPost(this.readPostId(req), this.requireUser(req).id, req.body as UpdatePostInput);
    res.status(200).json(post);
  });

  deletePost = asyncHandler.wrap(async (req: Request, res: Response) => {
    await postService.deleteOwnPost(this.readPostId(req), this.requireUser(req).id);
    res.status(200).json({ success: true, message: MESSAGES.postDeleted });
  });

  listMyPosts = asyncHandler.wrap(async (req: Request, res: Response) => {
    const posts = await postService.listOwnPosts(this.requireUser(req).id);
    res.status(200).json(posts);
  });
}

export const postController = new PostController();
