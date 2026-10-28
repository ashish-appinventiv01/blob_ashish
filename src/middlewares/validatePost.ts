import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { POST_STATUSES, PostStatus } from "../model/post.model";
import { PostListQuery } from "../Modules/post/post.interface";
import { AppError } from "../utils/AppError";

const SORTS = ["newest", "oldest", "mostCommented"] as const;

function readBody(req: Request): Record<string, unknown> {
  return req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
}

function readTitle(value: unknown): string {
  const title = typeof value === "string" ? value.trim() : "";
  if (title.length < 5 || title.length > 120) {
    throw new AppError(MESSAGES.titleLength, 400);
  }
  return title;
}

function readBodyText(value: unknown): string {
  const body = typeof value === "string" ? value.trim() : "";
  if (body.length < 20) {
    throw new AppError(MESSAGES.bodyLength, 400);
  }
  return body;
}

function readTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new AppError(MESSAGES.tagsInvalid, 400);
  }

  if (value.length > 5) {
    throw new AppError(MESSAGES.tagsLimit, 400);
  }

  const tags = value.map((tag) => {
    if (typeof tag !== "string") {
      throw new AppError(MESSAGES.tagsInvalid, 400);
    }

    const normalized = tag.trim().toLowerCase();
    if (!normalized) {
      throw new AppError(MESSAGES.tagsInvalid, 400);
    }

    return normalized;
  });

  return [...new Set(tags)];
}

function readStatus(value: unknown): PostStatus {
  if (typeof value !== "string" || !POST_STATUSES.includes(value as PostStatus)) {
    throw new AppError(MESSAGES.invalidStatus, 400);
  }

  return value as PostStatus;
}

export function validateCreatePost(req: Request, _res: Response, next: NextFunction): void {
  try {
    const body = readBody(req);
    const title = readTitle(body.title);
    const postBody = readBodyText(body.body);
    const tags = body.tags === undefined ? [] : readTags(body.tags);
    const status = body.status === undefined ? "draft" : readStatus(body.status);

    req.body = { title, body: postBody, tags, status };
    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdatePost(req: Request, _res: Response, next: NextFunction): void {
  try {
    const body = readBody(req);
    const changes: {
      title?: string;
      body?: string;
      tags?: string[];
      status?: PostStatus;
    } = {};

    if (body.title !== undefined) {
      changes.title = readTitle(body.title);
    }
    if (body.body !== undefined) {
      changes.body = readBodyText(body.body);
    }
    if (body.tags !== undefined) {
      changes.tags = readTags(body.tags);
    }
    if (body.status !== undefined) {
      changes.status = readStatus(body.status);
    }

    if (Object.keys(changes).length === 0) {
      throw new AppError(MESSAGES.postUpdateEmpty, 400);
    }

    req.body = changes;
    next();
  } catch (error) {
    next(error);
  }
}

function readQueryValue(value: unknown, label: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(`${label} must be a string`, 400);
  }

  return value;
}

function readPositiveInt(value: unknown, fallback: number, invalidMessage: string, max?: number): number {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new AppError(invalidMessage, 400);
  }

  const parsed = Number(value);
  if (max !== undefined && parsed > max) {
    throw new AppError(invalidMessage, 400);
  }

  return parsed;
}

export function parsePageLimit(query: Request["query"]): { page: number; limit: number } {
  return {
    page: readPositiveInt(readQueryValue(query.page, "page"), 1, MESSAGES.invalidPage),
    limit: readPositiveInt(readQueryValue(query.limit, "limit"), 10, MESSAGES.invalidLimit, 50),
  };
}

export function parsePostListQuery(query: Request["query"]): PostListQuery {
  const { page, limit } = parsePageLimit(query);
  const searchValue = readQueryValue(query.search, "search")?.trim();
  const tagValue = readQueryValue(query.tag, "tag")?.trim().toLowerCase();
  const sortValue = readQueryValue(query.sort, "sort") ?? "newest";

  if (!SORTS.includes(sortValue as PostListQuery["sort"])) {
    throw new AppError(MESSAGES.invalidSort, 400);
  }

  return {
    page,
    limit,
    search: searchValue || undefined,
    tag: tagValue || undefined,
    sort: sortValue as PostListQuery["sort"],
  };
}
