const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const saltRounds = 10;

// Signup
router.get("/sign-up", (req, res, next) => res.render("auth/signup-form"));

router.post("/sign-up", (req, res, next) => {
  const { userPwd1, userPwd2, profileImg } = req.body;

  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(userPwd1, salt))
    .then((hashedPassword) =>
      User.create({ ...req.body, password: hashedPassword })
    )
    .then(() => res.redirect("/"))
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

// Login
router.get("/login", (req, res, next) => res.render("auth/login-form"));
router.post("/login", (req, res, next) => {
  const { usernameOrEmail, password } = req.body;

  User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  })
    .then((user) => {
      if (!user) {
        res.render("auth/login-form", {
          errorMessage: "User not found",
        });
        return;
      } else if (bcrypt.compareSync(password, user.password) === false) {
        res.render("auth/login-form", {
          errorMessage: "Incorrect password",
        });
        return;
      } else {
        req.session.currentUser = user;
        res.redirect("/");
      }
    })
    .catch((error) => next(error));
});

// Logout
router.post("/logout", (req, res, next) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
