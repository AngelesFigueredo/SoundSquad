const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    content: String,
  },
  {
    timestamps: true,
  }
);

const Message = model("Message", postSchema);

module.exports = Message;
