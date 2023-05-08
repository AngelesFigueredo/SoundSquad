const express = require("express");
const router = express.Router();

const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");
const User = require("../models/User.model");
const Post = require("../models/Post.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/my-profile", isLoggedIn, async (req, res, next) => {
  try {
    try {
      const user = await User.findById(req.session.currentUser._id);
      const posts = await Post.find({ author: user._id });
      res.render("main/profile", { posts, user, session: req.session });
    } catch {
      res.redirect("/login");
    }
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/edit/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("auth/edit-profile", { user, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/home", isLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(2);
    res.render("main/home", { posts, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/edit/:id", isLoggedIn, async (req, res, next) => {
  const { body } = req;
  const { id } = req.params;
  console.log("body", body, "id", id);
  try {
    await User.findByIdAndUpdate(id, body);
    res.redirect("/my-profile");
  } catch (error) {
    res.render("error", { error });
  }
});

module.exports = router;
