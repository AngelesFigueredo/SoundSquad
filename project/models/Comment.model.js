const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    content: String,
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    fatherPost: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  {
    timestamps: true,
  }
);

const Comment = model("Comment", commentSchema);

module.exports = Comment;
