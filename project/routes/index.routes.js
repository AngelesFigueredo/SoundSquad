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
const Event = require("../models/Events.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/home", async (req, res, next) => {
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
        console.log(posts)
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

router.get("/edit/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("auth/edit-profile", { user, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/notifications", async (req, res, next) => {
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

    //Similar items
    const regex = new RegExp(query, "i");

    //Users
    const users = await User.find({ username: regex });

    //Events
    const events = await Event.find({ name: regex });

    //Artists
    const artists = await spotifyApi.searchArtists(query);
    const sortedArtists = artists.body.artists.items.sort(
      (a, b) => b.followers - a.followers
    );
    const artistsInfoShort = sortedArtists.slice(0, 5).map((artist) => ({
      name: artist.name,
      id: artist.id,
      uri: artist.uri,
    }));

    const artistsInfoLong = sortedArtists.map((artist) => ({
      name: artist.name,
      id: artist.id,
    }));

    //Songs
    const songs = await spotifyApi.searchTracks(query);
    const sortedSongs = songs.body.tracks.items.sort(
      (a, b) => b.popularity - a.popularity
    );
    const songsInfoShort = sortedSongs.slice(0, 5).map((song) => {
      let artists = song.artists[0].name;
      if (song.artists[1]) {
        artists += ` y ${song.artists[1].name}`;
      }
      return {
        name: song.name,
        artists: artists,
        id: song.id,
      };
    });

    const songsInfoLong = sortedSongs.map((song) => {
      let artists = song.artists[0].name;
      if (song.artists[1]) {
        artists += ` y ${song.artists[1].name}`;
      }
      return {
        name: song.name,
        artists: artists,
        id: song.id,
      };
    });

    //events
    const tmApiKey = process.env.TICKET_CONSUMER_KEY;
    let concertsInfoShort = undefined;
    let concertsInfoLong = undefined;

    axios
      .get(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${tmApiKey}&keyword=${query}`
      )
      .then((response) => {
        if (response.data && response.data._embedded) {
          let concerts = response.data._embedded.events;
          // console.log("HOLIIIIIIIIss", concerts[0]);

          concertsInfoShort = concerts.slice(0, 5).map((concert) => ({
            name: concert.name,
            city: concert._embedded.venues[0].city.name,
            date: concert.dates.start.localDate,
            id: concert.id,
          }));

          concertsInfoLong = concerts.map((concert) => ({
            name: concert.name,
            city: concert._embedded.venues[0].city.name,
            date: concert.dates.start.localDate,
            id: concert.id,
          }));
        }

        res.render("main/search-results", {
          users,
          events,
          query,
          artistsInfoShort,
          artistsInfoLong,
          songsInfoShort,
          songsInfoLong,
          concertsInfoShort,
          concertsInfoLong,
        });
      });
  } catch (error) {
    next(error);
  }
});

router.get("/artist/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const urlSearch = `https://api.spotify.com/v1/artists/${id}`;
    axios.get(urlSearch).then((response) => {
      console.log(response);
    });
    res.render("main/artist-details");
  } catch (error) {
    console.log(error);
  }
});

router.get("/concert/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const { currentUser } = req.session;
    const friendIds = currentUser.friends;
    const tmApiKey = process.env.TICKET_CONSUMER_KEY;
    let concertInfo = undefined;
    const myEvents = await Event.find({
      author: currentUser._id,
      concertApiId: id,
    });
    const followedEvents = await Event.find({
      members: currentUser._id,
      concertApiId: id,
    });
    const friendEvents = await Event.find({
      $and: [
        { concertApiId: id },
        {
          $or: [
            { author: { $in: friendIds } },
            { members: { $in: friendIds } },
          ],
        },
      ],
    });
    const otherEvents = await Event.find({ concertApiId: id });

    axios
      .get(
        `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${tmApiKey}`
      )
      .then((response) => {
        concertInfo = response.data;
        res.render("main/concert-details", {
          concertInfo,
          myEvents,
          followedEvents,
          friendEvents,
          otherEvents,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
});

router.get("/song/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const urlSearch = `https://api.spotify.com/vi/tracks/${id}`;
    axios.get(urlSearch).then((response) => {
      console.log(response);
    });
    res.render("main/song-details");
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
