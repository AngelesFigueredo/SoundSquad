const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../../models/User.model");

/* GET home page */
router.get("/audd", (req, res, next) => {
  res.render("audD/audd", { session: req.session, currentUser: req.session.currentUser });
});

router.post("/song-details", async (req, res, next) => {
  const { currentUser } = req.session;
  const user = await User.findById(currentUser._id).populate({
    path: "playlists",
    select: "title",
  });
  const base64Audio = req.body.audioData;
  const data = {
    api_token: process.env.AUDD_TOKEN,
    audio: base64Audio,
    return: "apple_music,spotify",
  };
  axios({
    method: "post",
    url: "https://api.audd.io/",
    data: data,
    headers: { "Content-Type": "multipart/form-data" },
  })
    .then((response) => {
      const songId = response.data.result.spotify.id
      res.redirect(`/song/${songId}`)
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/concerts-audd", (req, res, next) => {
  const tmApiKey = process.env.TICKET_CONSUMER_KEY;
  const artistName = req.body.artist;
  let foundConcerts = undefined;
  axios
    .get(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${tmApiKey}&keyword=${artistName}`
    )
    .then((response) => {
      if (response.data && response.data._embedded) {
        const events = response.data._embedded.events;
         foundConcerts = events.filter(event => event.name.includes(artistName));
      }
      res.render("audD/concerts", {foundConcerts})  
     })
    .catch(error => {
    console.log(error);
  });
});
module.exports = router;
