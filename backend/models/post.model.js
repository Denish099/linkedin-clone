import mongoose, { mongo } from "mongoose";

const postSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        content: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        created: { type: Date, default: Date.now() },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
