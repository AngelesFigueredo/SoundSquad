const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const multer = require("multer");

const uploader = require("../config/cloudinary.config");
const saltRounds = 10;

const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");

// Signup
router.get("/sign-up", isLoggedOut, (req, res, next) =>
  res.render("auth/signup-form")
);

router.post(
  "/sign-up",
  [isLoggedOut, uploader.single("profileImg")],
  async(req, res, next) => {
    console.log(req.body)
    let { password, password2, profileImg } = req.body;
    // si nos viene la url desde una cosa que se ha subido
    if(req.file && req.file.path){
      profileImg = req.file.path
    }
    if(req.body.picUrl){
      profileImg= req.body.picUrl
    }
    // si nos viene de una foto que hemos tomado 

    
    if (password === password2) {
      bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) =>
          User.create({ ...req.body, profileImg, password: hashedPassword })
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
  }
);

router.get("/take-photo", (req, res, next) => {
  res.render("auth/photo-form.hbs", { session: req.session });
});

// Login
router.get("/login", isLoggedOut, (req, res, next) => {
  res.render("auth/login-form", { session: req.session });
});
router.post("/login", isLoggedOut, async (req, res, next) => {
  const { usernameOrEmail, password } = req.body;
  const posts = await Post.find().sort({ createdAt: -1 }).limit(2);

  User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  })
    .then((user) => {
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
        res.render("main/home", { posts, session: req.session });
      }
    })
    .catch((error) => next(error));
});

// Logout
router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
