const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const saltRounds = 10;
const multer = require("multer");
const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");

// Signup
router.get("/sign-up", isLoggedOut, (req, res, next) =>
  res.render("auth/signup-form")
);

router.post("/sign-up", isLoggedOut, (req, res, next) => {
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
      session: req.session,
    });
  }
});

router.get("/take-photo", (req, res, next) => {
  res.render("auth/photo-form.hbs", { session: req.session });
});

// Login
router.get("/login", isLoggedOut, (req, res, next) =>
  res.render("auth/login-form", { session: req.session })
);
router.post("/login", isLoggedOut, (req, res, next) => {
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
        res.render("main/home", { session: req.session });
      }
    })
    .catch((error) => next(error));
});

// Logout
router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
