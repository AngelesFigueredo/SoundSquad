const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const saltRounds = 10;

// Signup
router.get("/sign-up", (req, res, next) => res.render("auth/signup"));

router.post("/sign-up", (req, res, next) => {
  const { userPwd, profileImg } = req.body;

  if (profileImg !== String || profileImg === "") {
    profileImg = undefined;
  }

  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(userPwd, salt))
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
router.get("/login", (req, res, next) => res.render("auth/login"));
router.post("/login", (req, res, next) => {
  const { email, userPwd } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.render("auth/login", {
          errorMessage: "Email not registered",
        });
        return;
      } else if (bcrypt.compareSync(userPwd, user.password) === false) {
        res.render("auth/login", {
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
