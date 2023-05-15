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

router.get("/new-playlist", async (req, res, next) => {
  const { currentUser } = req.session;
  const user = await User.findById(currentUser._id);
  res.render("main/new-playlist", { user });
});

router.get("/playlists-list/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentUser } = req.session;
    const playlists = await Playlist.find({ followers: { $in: [currentUser._id] } });
    console.log("------------------", currentUser);
    res.render("main/playlists", { playlists, currentUser, id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/my-playlists", async (req, res, next) => {
  const { currentUser } = req.session;
  const myUser = await User.findById(currentUser._id).populate({
    path: "playlists",
    select: "title description",
  });
  const playlists = myUser.playlists;
  console.log(myUser);
  res.render("main/playlists", { playlists });
});

router.get("/playlist-details/:id", async (req, res, next) => {
  try {
    const { currentUser } = req.session;
    const playlist = await Playlist.findById(req.params.id).populate("author");
    const tracks = await spotifyApi.getTracks(playlist.songs);
    const songs = tracks.body.tracks;
    res.render("main/playlist-details", { playlist, songs, currentUser });
  } catch (error) {
    console.log(error);
  }
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
    await Playlist.findByIdAndUpdate(playlists, {
      $push: { songs: req.params.id },
    });
    res.redirect("/my-playlists");
  } catch (error) {
    console.log(error);
  }
});

router.post("/follow-playlist/:id", async (req, res, next) => {
  const { currentUser } = req.session;
  const { id } = req.params;

  await User.findByIdAndUpdate(currentUser._id, { $push: { playlists: id } });
});

module.exports = router;
