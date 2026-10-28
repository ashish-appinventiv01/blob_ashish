import { Types } from "mongoose";
import { PostModel } from "../../model/post.model";
import { escapeRegex } from "../../utils/escapeRegex";
import { deleteCommentsByPostId } from "../comment/comment.repository.js";
import { CreatePostInput, PostListItem, PostListQuery, PostListResult, UpdatePostInput } from "./post.interface";

export type { PostListItem, PostListQuery };

type FacetPost = Omit<PostListItem, "_id" | "author"> & {
  _id: Types.ObjectId;
  author: Types.ObjectId;
};

type FacetResult = {
  data: FacetPost[];
  meta: Array<{ total: number }>;
};

export function createPost(input: CreatePostInput & { author: string; authorName: string }) {
  return PostModel.create(input);
}

export function findPostById(id: string) {
  return PostModel.findById(id);
}

export function findPublishedPostById(id: string) {
  return PostModel.findOne({ _id: id, status: "published" });
}

export function findPostsByAuthor(authorId: string) {
  return PostModel.find({ author: authorId }).sort({ createdAt: -1 });
}

export function updatePostById(id: string, changes: UpdatePostInput) {
  return PostModel.findByIdAndUpdate(id, changes, { returnDocument: "after", runValidators: true });
}

export function incrementCommentCount(postId: string) {
  return PostModel.updateOne({ _id: postId, status: "published" }, { $inc: { commentCount: 1 } });
}

export function decrementCommentCount(postId: Types.ObjectId) {
  return PostModel.updateOne({ _id: postId, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });
}

export async function deletePostAndComments(postId: Types.ObjectId): Promise<void> {
  await deleteCommentsByPostId(postId);
  await PostModel.deleteOne({ _id: postId });
}

export async function findPublishedPosts(query: PostListQuery): Promise<PostListResult> {
  const match: Record<string, unknown> = { status: "published" };

  if (query.search) {
    match.title = { $regex: escapeRegex(query.search), $options: "i" };
  }

  if (query.tag) {
    match.tags = query.tag;
  }

  const sort: Record<string, 1 | -1> =
    query.sort === "oldest"
      ? { createdAt: 1 }
      : query.sort === "mostCommented"
        ? { commentCount: -1, createdAt: -1 }
        : { createdAt: -1 };

  const [result] = await PostModel.aggregate<FacetResult>([
    { $match: match },
    {
      $facet: {
        data: [
          { $sort: sort },
          { $skip: (query.page - 1) * query.limit },
          { $limit: query.limit },
          { $project: { body: 0 } },
        ],
        meta: [{ $count: "total" }],
      },
    },
  ]);

  const total = result?.meta[0]?.total ?? 0;
  const data = (result?.data ?? []).map((post) => ({
    _id: post._id.toString(),
    title: post.title,
    tags: post.tags,
    author: post.author.toString(),
    authorName: post.authorName,
    status: post.status,
    commentCount: post.commentCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    },
  };
}
