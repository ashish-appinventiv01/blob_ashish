import { PublicUser } from "../user/user.interface";

export interface CreateCommentInput {
  postId: string;
  user: PublicUser;
  text: string;
}

export interface NewComment {
  postId: string;
  userId: string;
  userName: string;
  text: string;
}

export interface CommentListQuery {
  postId: string;
  page: number;
  limit: number;
}

export interface CommentListItem {
  _id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentListResult {
  data: CommentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
