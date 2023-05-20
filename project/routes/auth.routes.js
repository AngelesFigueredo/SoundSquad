const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const multer = require("multer");

const uploader = require("../config/cloudinary.config");
const trimUrl = require("../utils/trimUrl")
const saltRounds = 10;

const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");

// Signup

router.get("/sign-up", isLoggedOut, (req, res, next) =>
  res.render("auth/signup-form", { currentUser: req.session.currentUser })

);

router.post(
  "/sign-up",
  [isLoggedOut, uploader.single("profileImg")],

  async(req, res, next) => {
    let { password, password2, profileImg } = req.body;
    // si nos viene la url desde una cosa que se ha subido
    if (req.file && req.file.path) {
      profileImg = req.file.path;
    }
    // si nos viene de una foto que hemos tomado 
    if(req.body.picUrl){
      profileImg= trimUrl(req.body.picUrl)
    }


    if (password === password2) {
      bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) =>
          User.create({ ...req.body, profileImg, password: hashedPassword })
        )
        .then(() => res.redirect("/"))
        .catch((error) => {
          res.render("error", { error })
        });
    } else {
      res.render("auth/signup-form", {
        errorMessage: "Las contraseñas no coinciden",
        session: req.session,
      });
    }
  }
);

router.get("/take-photo", isLoggedIn, (req, res, next) => {
  res.render("auth/photo-form.hbs", { session: req.session, currentUser: req.session.currentUser });
});

// Login
router.get("/login", isLoggedOut, (req, res, next) => {
  res.render("auth/login-form", { session: req.session, currentUser: req.session.currentUser });
});

router.post("/login", async (req, res, next) => {
  const { usernameOrEmail, password } = req.body;

  User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  })
    .then((user) => {
      if (!user) {
        res.render("auth/login-form", {
          errorMessage: "No se ha encontrado al usuario",
        });
        return;
      } else if (!bcrypt.compareSync(password, user.password)) {
        res.render("auth/login-form", {
          errorMessage: "Contraseña incorrecta",
        });

        return;
      } else {
        req.session.currentUser = user;
        req.app.locals.isLogged = true;
        req.app.locals.currentUser = user.toObject();
        res.redirect("/home");
      }
    })
    .catch((error) => res.render("error", { error }));
});

// Logout
router.get("/logout", (req, res) => {
  req.app.locals.isLogged = false;
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
