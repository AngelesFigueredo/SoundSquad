const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");

// ****************************************************************************************
// POST route - create a comment of a specific post
// ****************************************************************************************

router.post("/:postId/comment", async (req, res) => {
  const { content } = req.body;
  const { currentUser } = req.session;

  const comment = await Comment.create({ content, author: currentUser._id });
  await Post.findByIdAndUpdate(req.params.postId, {
    $push: { comments: comment._id },
  });
  res.redirect("/home");
});

module.exports = router;
