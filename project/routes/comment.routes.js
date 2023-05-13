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
  const { postId } = req.params;
  const mentions = content.match(/@(\w+)/g) || [];
  const usernames = mentions.map((mention) => mention.substring(1));
  const mentionedUsers = await User.find({ username: { $in: usernames } });
  const mentionsIds = mentionedUsers.map((user) => user._id);

  const comment = await Comment.create({
    content,
    author: currentUser._id,
    mentions: mentionsIds,
    post: postId,
  });

  mentionedUsers.forEach(async (user) => {
    await User.findByIdAndUpdate(user._id, {
      $push: {
        commentMentions: comment._id,
        notifications: {
          message: `${currentUser.username} te ha mencionado en un comentario`,
          source: "commentMention",
          author: currentUser._id,
          fatherPost: postId,
        },
      },
    });
  });

  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });
  res.redirect("/home");
});

router.post("/comment/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.findByIdAndDelete(id);
    res.redirect("/home");
  } catch (error) {
    res.render("error", { error });
  }
});

module.exports = router;
