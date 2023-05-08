const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");

router.get("/post-create", async (req, res) => {
  try {
    res.render("posts/create");
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/post-create", async (req, res) => {
  try {
    const { body } = req;
    const { currentUser } = req.session;

    const post = await Post.create({ ...body, author: currentUser._id });
    const posts = await Post.find().sort({ createdAt: -1 }).limit(2);
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { posts: post._id },
    });
    res.render("main/home", { posts });
  } catch (error) {
    console.log(error);
    res.render("error", { error });
  }
});

module.exports = router;
