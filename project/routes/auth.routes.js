const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const saltRounds = 10;
const multer = require("multer");

// Signup
router.get("/sign-up", (req, res, next) => res.render("auth/signup-form"));

router.post("/sign-up", multer().none(), (req, res, next) => {
  const { password, password2, profileImg } = req.body;

  if (password === password2) {
    bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) =>
        User.create({ ...req.body, password: hashedPassword })
      )
      .then(() => res.redirect("/"))
      .catch((error) => {
        console.log(error);
        next(error);
      });
  } else {
    res.render("auth/signup-form", {
      errorMessage: "Las contraseñas no coinciden",
    });
  }
});

router.get("/take-photo", (req, res, next) => {
  res.render("auth/photo-form.hbs");
});

// Login
router.get("/login", (req, res, next) => res.render("auth/login-form"));
router.post("/login", (req, res, next) => {
  const { usernameOrEmail, password } = req.body;

  User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  })
    .then((user) => {
      console.log(user);
      if (!user) {
        res.render("auth/login-form", {
          errorMessage: "User not found",
        });
        return;
      } else if (!bcrypt.compareSync(password, user.password)) {
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
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
