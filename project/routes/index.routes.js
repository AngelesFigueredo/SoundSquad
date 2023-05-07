const express = require("express");
const router = express.Router();

const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");
const User = require("../models/User.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/my-profile", isLoggedIn, async (req, res, next) => {
  try {
    const myProfile = User.findById(req.session.currentUser._id);
    res.render("my-profile", { user });
  } catch (error) {
    res.render("error", { error });
  }
});

module.exports = router;
