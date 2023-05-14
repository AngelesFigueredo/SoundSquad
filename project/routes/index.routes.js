const express = require("express");
const router = express.Router();
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Playlist = require("../models/Playlist.model");
const Event = require("../models/Events.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/home", isLoggedIn, async (req, res, next) => {
  try {
    const id = req.session.currentUser._id;
    const user = await User.findById(id);
    const idsForPosts = [user._id, ...user.friends];
    const posts = await Post.find({ author: { $in: idsForPosts } })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("author comments")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
        },
      });
    res.render("main/home", {
      posts,
      currentUser: req.session.currentUser,
    });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/my-profile", async (req, res, next) => {
  const myProfile = true;
  try {
    try {
      const user = await User.findById(req.session.currentUser._id);
      const posts = await Post.find({ author: user._id })
        .populate("author comments")
        .populate({
          path: "comments",
          populate: { path: "author", model: "User" },
        })
        .sort({ createdAt: -1 });

      console.log("miperfilvamoooooos", myProfile);

      res.render("main/profile", {
        posts,
        user,
        session: req.session,
        myProfile,
      });
    } catch {
      res.redirect("/login");
    }
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/profile/:id", async (req, res, next) => {
  const myProfile = false;
  try {
    const { id } = req.params;
    const user = await User.findById(req.params.id);
    const currentUser = req.session.currentUser;
    const myUser = await User.findById(req.session.currentUser._id);

    if (currentUser._id === id) {
      console.log("tevasa tu perfil", myProfile);
      return res.redirect("/my-profile");
    }

    if (myUser.friends.includes(user._id)) {
      console.log("others perfil", myProfile);

      res.render("main/profile", {
        user,
        myProfile,
        friendship: "true",
      });
    } else if (myUser.sentFriendRequests.includes(user._id)) {
      console.log("others perfil", myProfile);

      res.render("main/profile", {
        user,
        myProfile,
        friendship: "pendingOut",
      });
    } else if (myUser.friendRequests.includes(user._id)) {
      console.log("others perfil", myProfile);

      res.render("main/profile", {
        user,
        myProfile,
        friendship: "pendingIn",
      });
      // } else if (myUser.pendingFriendRequests.includes(user._id)) {
      //   res.render("main/profile", {
      //     user,
      //     myProfile: false,
      //     friendship: "pending",
      //   });
    } else {
      console.log("others perfil", myProfile);

      res.render("main/profile", {
        user,
        myProfile,
        friendship: "false",
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error", { error });
  }
});

router.get("/new-playlist", async (req, res, next) => {
  const { currentUser } = req.session;
  const user = await User.findById(currentUser._id);
  res.render("main/new-playlist", { user });
});

router.get("/edit/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("auth/edit-profile", { user, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/notifications", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const user = await User.findById(currentUser._id)
      .populate({
        path: "postMentions",
        populate: {
          path: "author",
          model: "User",
        },
      })
      .populate({
        path: "commentMentions",
        populate: [
          {
            path: "fatherPost",
            model: "Post",
            populate: {
              path: "author",
              model: "User",
            },
          },
          {
            path: "author",
            model: "User",
          },
        ],
      })
      .populate({
        path: "friendRequests",
        model: "User",
      });
    const posts = user.postMentions;
    const comments = user.commentMentions;
    const friendRequests = user.friendRequests;
    res.render("main/notifications", {
      posts,
      comments,
      friendRequests,
      session: req.session,
    });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/:id/playlists", isLoggedIn, async (req, res, next) => {
  const user = req.session.currentUser;
  const playlists = await Playlist.find({ followers: { $in: [user._id] } });
  res.render("main/playlists", { playlists });
});

router.get("/my-playlists", async (req, res, next) => {
  const { currentUser } = req.session;
  const myUser = await User.findById(currentUser._id).populate({
    path: "playlists",
    select: "title description",
  });
  const playlists = myUser.playlists;
  res.render("main/playlists", { playlists });
});

router.get("/new-message", async (req, res, next) => {
  const users = await User.find().populate("username");
  res.render("main/new-message", { users });
});

// router.get("/new-message/:id", async (req, res, next) => {
//   const user = User.findById(req.params.id);
//   try {
//     res.render("main/new-message", { user });
//   } catch (error) {
//     res.render("error", { error });
//   }
// });

router.get("/:id/friends", async (req, res, next) => {
  const user = await User.findById(req.params.id).populate(
    "friends",
    "username"
  );
  res.render("main/friends", { friends: user.friends });
});

// router.get("/search", async)

router.get("/search", async (req, res, next) => {
  try {
    const { query } = req.query;

    // Use a regular expression to match users whose usernames contain the search term or a similar term
    const regex = new RegExp(query, "i");
    const users = await User.find({ username: regex });

    const events = await Event.find({ name: regex });

    const artists = await spotifyApi.searchArtists(query);
    const artistsInfo = artists.map((e) => {
      console.log("git ");
    });
    console.log(songs.body.artists.items);

    res.render("main/search-results", { users, events, query });
  } catch (error) {
    next(error);
  }
});

router.get("/playlist/:id", async (req, res, next) => {
  const playlist = await Playlist.findById(req.params.id).populate("author");
  res.render("main/playlist-details", { playlist });
});

router.post("/new-playlist", async (req, res, next) => {
  const { body } = req;
  const playlist = await Playlist.create(body);
  await User.findByIdAndUpdate(body.author, { playlists: playlist._id });
  res.redirect("/my-playlists");
});

router.post("/:id/addtoplaylist", async (req, res, next) => {
  try {
    const { playlists } = req.body;
    await Playlist.findByIdAndUpdate(playlists, { songs: req.params.id });
    res.redirect("/my-playlists");
  } catch (error) {
    console.log(error);
  }
});

router.post("/edit/:id", isLoggedIn, async (req, res, next) => {
  const { body } = req;
  const { id } = req.params;
  try {
    await User.findByIdAndUpdate(id, body);
    res.redirect("/my-profile");
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/friend-requests/:id", async (req, res, next) => {
  const { id } = req.params;
  const { currentUser } = req.session;
  try {
    await Promise.all([
      User.findByIdAndUpdate(id, {
        $push: { friendRequests: currentUser._id },
      }),
      User.findByIdAndUpdate(currentUser._id, {
        $push: { sentFriendRequests: id },
      }),
    ]);
    res.redirect(`/profile/${id}`);
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/friend-requests/:id/accept", async (req, res, next) => {
  const { id } = req.params;
  const { currentUser } = req.session;
  try {
    await Promise.all([
      User.findByIdAndUpdate(id, {
        $push: { friends: currentUser._id },
        $pull: { sentFriendRequests: currentUser._id },
      }),
      User.findByIdAndUpdate(currentUser._id, {
        $push: { friends: id },
        $pull: { friendRequests: id },
      }),
    ]);
    res.redirect("/notifications");
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/friend-requests/:id/cancel", async (req, res, next) => {
  const { id } = req.params;
  const { currentUser } = req.session;
  try {
    await Promise.all([
      User.findByIdAndUpdate(id, {
        $pull: { friendRequests: currentUser._id },
        $pull: { sentFriendRequests: currentUser._id },
      }),
      User.findByIdAndUpdate(currentUser._id, {
        $pull: { sentFriendRequests: id },
        $pull: { friendRequests: id },
      }),
    ]);
    res.redirect("/notifications");
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/unfollow/:id", async (req, res, next) => {
  const { id } = req.params;
  const { currentUser } = req.session;
  try {
    await Promise.all([
      User.findByIdAndUpdate(id, {
        $pull: { friends: currentUser._id },
      }),
      User.findByIdAndUpdate(currentUser._id, {
        $pull: { friends: id },
      }),
    ]);
    res.redirect(`/profile/${id}`);
  } catch (error) {
    res.render("error", { error });
  }
});

module.exports = router;
