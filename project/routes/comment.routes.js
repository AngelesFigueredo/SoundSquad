const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");

// ****************************************************************************************
// POST route - create a comment of a specific post
// ****************************************************************************************

// ... your code here
router.post("/posts/:postId/comment", async (req, res) => {
  const { content, author } = req.body;
  let user = await User.findOne({ username: author });
  if (!user) {
    user = await User.create({ username: author });
  }
  const comment = await Comment.create({ content, author: user._id });
  await Post.findByIdAndUpdate(req.params.postId, {
    $push: { comments: comment._id },
  });
  res.redirect(`/posts/${req.params.postId}`);
});

module.exports = router;
