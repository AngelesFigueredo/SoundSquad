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

router.get("/my-profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.session.currentUser._id);
    res.render("main/profile", { user, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/edit/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("auth/edit-profile", { user, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/home", async (req, res, next) => {
  try {
    res.render("main/home", { session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/edit/:id", async (req, res, next) => {
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
