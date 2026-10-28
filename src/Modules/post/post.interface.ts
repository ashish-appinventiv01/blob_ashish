import { PostStatus } from "../../model/post.model";

export interface CreatePostInput {
  title: string;
  body: string;
  tags: string[];
  status: PostStatus;
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
  tags?: string[];
  status?: PostStatus;
}

export interface PostListQuery {
  page: number;
  limit: number;
  search?: string;
  tag?: string;
  sort: "newest" | "oldest" | "mostCommented";
}

export interface PostListItem {
  _id: string;
  title: string;
  tags: string[];
  author: string;
  authorName: string;
  status: PostStatus;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostListResult {
  data: PostListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
