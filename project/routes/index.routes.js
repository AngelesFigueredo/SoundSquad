const express = require("express");
const router = express.Router();
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");
const uploader = require("../config/cloudinary.config");
const trimUrl = require("../utils/trimUrl")
let spotifyAccessToken;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

spotifyApi
  .clientCredentialsGrant()
  .then((data) => {
    spotifyApi.setAccessToken(data.body["access_token"]);
    spotifyAccessToken = data.body["access_token"];
  })
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
router.get("/", isLoggedOut, (req, res, next) => {
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


router.get("/my-profile", isLoggedIn, async (req, res, next) => {

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
      res.render("main/profile", {
        posts,
        user,
        session: req.session,
        myProfile,
        currentUser: req.session.currentUser

      });
    } catch {
      res.redirect("/login");
    }
  } catch (error) {
    res.render("error", { error });
  }
});


router.get('/users/:username', isLoggedIn, async (req, res) => {

  const username = req.params.username;
  // Perform the necessary logic to check if the username exists
  const user = await User.find({username})
  

  if (usernameExists) {
    // Redirect to the user profile page
    res.redirect(`/users/${username}`);
  } else {
    // Return an error response or any other desired response
    res.status(404).send('User not found');
  }
});


router.get("/profile/:id", isLoggedIn, async (req, res, next) => {

  const myProfile = false;
  try {
    const { id } = req.params;
    const user = await User.findById(req.params.id);
    const currentUser = req.session.currentUser;
    const myUser = await User.findById(req.session.currentUser._id);

    if (currentUser._id === id) {
      return res.redirect("/my-profile");
    }

    if (myUser.friends.includes(user._id)) {

      res.render("main/profile", {
        user,
        myProfile,
        friendship: "true",
        currentUser: req.session.currentUser
      });
    } else if (myUser.sentFriendRequests.includes(user._id)) {

      res.render("main/profile", {
        user,
        myProfile,
        friendship: "pendingOut",
        currentUser: req.session.currentUser
      });
    } else if (myUser.friendRequests.includes(user._id)) {

      res.render("main/profile", {
        user,
        myProfile,
        friendship: "pendingIn",
        currentUser: req.session.currentUser
      });
      // } else if (myUser.pendingFriendRequests.includes(user._id)) {
      //   res.render("main/profile", {
      //     user,
      //     myProfile: false,
      //     friendship: "pending",
      //   });
    } else {

      res.render("main/profile", {
        user,
        myProfile,
        friendship: "false",
        currentUser: req.session.currentUser
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

    console.log(user)
    res.render("auth/edit-profile", { user, session: req.session, currentUser: req.session.currentUser});

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

    const eventsRequests = user.eventsRequests.map((request) => ({
      user: request.user,
      event: request.event.toString(), // Convert ObjectId to string
    }));

    const posts = user.postMentions;
    const comments = user.commentMentions;
    const friendRequests = user.friendRequests;

    res.render("main/notifications", {
      eventsRequests,
      posts,
      comments,
      friendRequests,
      session: req.session,
      currentUser: req.session.currentUser,
    });
  } catch (error) {
    console.log(error);
    res.render("error", { error });
  }
});

router.get("/my-events", isLoggedIn, (req, res, next) => {
  try{
  res.redirect(`/user/events/${req.session.currentUser._id}`)}
  catch (error) {console.log(error)}
})

router.get("/new-message", isLoggedIn, async (req, res, next) => {

  const users = await User.find().populate("username");
  res.render("main/new-message", { users, currentUser: req.session.currentUser });
});

// router.get("/new-message/:id", async (req, res, next) => {
//   const user = User.findById(req.params.id);
//   try {
//     res.render("main/new-message", { user });
//   } catch (error) {
//     res.render("error", { error });
//   }
// });

router.get("/:id/friends", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("friends", "name lastName username profileImg");
    res.render("main/friends", { friends: user.friends, currentUser: req.session.currentUser });
  } catch (error) {
    console.log(error);
    next(error);
  }
});


// router.get("/search", async)


router.get("/search", isLoggedIn, async (req, res, next) => {

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
    const artistsInfoShort = sortedArtists.slice(0, 5).map((artist) => {
      let imgSong = "/images/event-default.jpg"
      if(artist.images[0]){

         imgSong = artist.images[0].url
      }
      return({
      name: artist.name,
      id: artist.id,
      img: imgSong,
      uri: artist.uri,
    })});

    const artistsInfoLong = sortedArtists.map((artist) => {
      let imgSong = "/images/event-default.jpg"
      if(artist.images[0]){

         imgSong = artist.images[0].url
      }
      return({
      name: artist.name,
      id: artist.id,
      img: imgSong,
    })})



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
      let imgSong = "/images/event-default.jpg"
      if(song.album.images[0]){
         imgSong = song.album.images[0].url
      }
      return {
        name: song.name,
        artists: artists,
        id: song.id,
        img: imgSong
      };
    });

    const songsInfoLong = sortedSongs.map((song) => {
      let artists = song.artists[0].name;
      if (song.artists[1]) {
        artists += ` y ${song.artists[1].name}`;
      }
      let imgSong = "/images/event-default.jpg"
      if(song.album.images[0]){
         imgSong = song.album.images[0].url
      }
      return {
        name: song.name,
        artists: artists,
        id: song.id,
        img: imgSong
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
        // so it does give the error "cannot read properties of undefined"
        
        if (response.data && response.data._embedded
          && response.data._embedded.events) {
          let concerts = response.data._embedded.events;
          
          concertsInfoShort = concerts.slice(0, 5).map((concert) => { 
            let imgSong = "/images/event-default.jpg"
            if(concert.images && concert.images[0]){
                imgSong = concert.images[0].url
            }
            let city =""
            // so it does give the error "cannot read properties of undefined"
            if(concert._embedded && concert._embedded.venues[0] &&
              concert._embedded.venues[0].city){
                city = concert._embedded.venues[0].city.name
              }
            return({
            name: concert.name,
            city: city,
            date: concert.dates.start.localDate,
            id: concert.id,
            img: imgSong
          })});

          concertsInfoLong = concerts.map((concert) => { 
            let imgSong = "/images/event-default.jpg"
            if(concert.images && concert.images[0]){
                imgSong = concert.images[0].url
            }
            if(concert._embedded && concert._embedded.venues[0] &&
              concert._embedded.venues[0].city){
                city = concert._embedded.venues[0].city.name
              }
            return({
            name: concert.name,
            city: city,
            date: concert.dates.start.localDate,
            id: concert.id,
            img: imgSong
          })});
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

          currentUser: req.session.currentUser

        });
      });
  } catch (error) {
    next(error);
  }
});


router.get("/artist/:id", isLoggedIn, async (req, res, next) => {

  const { id } = req.params;
  try {
    const urlSearch = `https://api.spotify.com/v1/artists/${id}`;
    axios
      .get(urlSearch, {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      })
      .then((response) => {
        artist = response.data

        res.render("main/artist-details", { artist, currentUser: req.session.currentUser });

      });
  } catch (error) {
    console.log(error);
  }
});


router.get("/concert/:id", isLoggedIn, async (req, res, next) => {

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
    }).populate("author");
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
    }).populate("author");
    const otherEvents = await Event.find({ concertApiId: id }).populate("author");

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
          key: process.env.TICKET_CONSUMER_KEY,
          currentUser: req.session.currentUser

        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
});


router.get("/song/:id", isLoggedIn, async (req, res, next) => {

  const { id } = req.params;
  try {
    const { currentUser } = req.session
    const user = await User.findById(currentUser._id).populate({
      path: "playlists",
      select: "title"})

    const urlSearch = `https://api.spotify.com/v1/tracks/${id}`;
    const response = await axios.get(urlSearch, {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });
    const song = response.data
    console.log(id)

    res.render("main/track-details", { song, user, id, currentUser: req.session.currentUser });

  } catch (error) {
    console.log(error);
  }
});

router.post("/edit/:id", uploader.single("profileImg"), async (req, res, next) => {
  const { body } = req;
  const { id } = req.params;
  let { profileImg } = req.body;
    // si nos viene la url desde una cosa que se ha subido
    if (req.file && req.file.path) {
      profileImg = req.file.path;
    }
    // si nos viene de una foto que hemos tomado 
    if(req.body.picUrl){
      profileImg= trimUrl(req.body.picUrl)
    }

  try {
    const interests = body.interests; 
    const updatedData = {
      name: body.name,
      lastName: body.lastName,
      age: body.age,
      description: body.description,
      profileImg
    };

    // Update the user with the updated data
    await User.findByIdAndUpdate(id, updatedData);

    // Redirect to the profile edit page
    res.redirect("/my-profile");
  } catch (error) {
    console.log(error);
    // Handle the error
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
