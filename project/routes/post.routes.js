const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");

const {
  isLoggedIn
} = require("../middlewares/route-guard");

router.get("/post-create", isLoggedIn, async (req, res) => {
  try {
    res.render("posts/create");
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/post/:id/details", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate("author comments")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
        },
      });
    res.render("posts/details", { post, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});
router.post("/post-create", async (req, res) => {
  try {
    const { body } = req;
    const { content } = req.body;
    const { currentUser } = req.session;
    const mentions = content.match(/@(\w+)/g) || [];
    const usernames = mentions.map((mention) => mention.substring(1));

    const mentionedUsers = await User.find({ username: { $in: usernames } });
    const mentionsIds = mentionedUsers.map((user) => user._id);

    const post = await Post.create({
      ...body,
      author: currentUser._id,
      mentions: mentionsIds,
    });

    mentionedUsers.forEach(async (user) => {
      await User.findByIdAndUpdate(user._id, {
        $push: {
          postMentions: post._id,
          notifications: {
            message: `${currentUser.username} te ha mencionado en un post`,
            source: "postMention",
            author: currentUser._id,
            post: post._id,
          },
        },
      });
    });

    res.redirect("/home");
  } catch (error) {
    console.log(error);
    res.render("error", { error });
  }
});

router.post("/posts/:id/:lastroute/delete", async (req, res) => {
  try {
    const { id, lastroute } = req.params;
    await Post.findByIdAndDelete(id);
    if (lastroute === "my-profile") {
      res.redirect("/my-profile");
    } else if (lastroute === "home") {
      res.redirect("/home");
    }
  } catch (error) {
    res.render("error", { error });
  }
});

module.exports = router;
