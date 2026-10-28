import { Types } from "mongoose";
import { CommentModel } from "../../model/comment.model";
import { CommentListItem, CommentListResult, NewComment } from "./comment.interface";

export type { CommentListItem };

type FacetComment = Omit<CommentListItem, "_id" | "postId" | "userId"> & {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
};

type FacetResult = {
  data: FacetComment[];
  meta: Array<{ total: number }>;
};

class CommentRepository {
  createComment(input: NewComment) {
    return CommentModel.create(input);
  }

  findCommentById(id: string) {
    return CommentModel.findById(id);
  }

  deleteCommentById(id: Types.ObjectId) {
    return CommentModel.deleteOne({ _id: id });
  }

  deleteCommentsByPostId(postId: Types.ObjectId) {
    return CommentModel.deleteMany({ postId });
  }

  async findCommentsByPost(postId: string, page: number, limit: number): Promise<CommentListResult> {
    const [result] = await CommentModel.aggregate<FacetResult>([
      { $match: { postId: new Types.ObjectId(postId) } },
      {
        $facet: {
          data: [{ $sort: { createdAt: -1, _id: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ]);

    const total = result?.meta[0]?.total ?? 0;

    return {
      data: (result?.data ?? []).map((comment) => ({
        _id: comment._id.toString(),
        postId: comment.postId.toString(),
        userId: comment.userId.toString(),
        userName: comment.userName,
        text: comment.text,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }
}

export const commentRepository = new CommentRepository();
