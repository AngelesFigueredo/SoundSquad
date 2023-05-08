const express = require("express");
const router = express.Router();

const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");
const User = require("../models/User.model");

router.get("/", (req, res, next) => {
  res.render("admin/home");
});
router.get("/all-users", checkRole("ADMIN"), async (req, res, next) => {
  try {
    const users = await User.find();
    res.render("admin/all-users", { users });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("admin/user-details", { user });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/edit/:id", checkRole("ADMIN"), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("admin/edit-profile", { user, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/edit/:id", checkRole("ADMIN"), async (req, res, next) => {
  const { body } = req;
  const { id } = req.params;
  console.log("body", body, "id", id);
  try {
    await User.findByIdAndUpdate(id, body);
    res.redirect("/admin");
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/:id/delete", checkRole("ADMIN"), async (req, res, next) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.redirect("/admin/all-users");
  } catch {
    (error) => {
      res.render("error", { error });
    };
  }
});

module.exports = router;
