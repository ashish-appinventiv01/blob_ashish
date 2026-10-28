import mongoose, { InferSchemaType } from "mongoose";

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be between 5 and 120 characters"],
      maxlength: [120, "Title must be between 5 and 120 characters"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      minlength: [20, "Body must be at least 20 characters"],
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 5,
        message: "A post can have at most 5 tags",
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: POST_STATUSES,
      default: "draft",
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({ tags: 1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ status: 1, commentCount: -1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

postSchema.pre("validate", function () {
  if (typeof this.body === "string") {
    this.body = this.body.trim();
  }
});

export type PostDocument = InferSchemaType<typeof postSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const PostModel = mongoose.model("Post", postSchema);
