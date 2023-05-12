const express = require("express");
const router = express.Router();

const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Playlist = require("../models/Playlist.model");
const Message = require("../models/Message.model");
const Conversation = require("../models/Conversation.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/my-profile", isLoggedIn, async (req, res, next) => {
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
        myProfile: true,
      });
    } catch {
      res.redirect("/login");
    }
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/profile/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.params.id);
    const currentUser = req.session.currentUser;
    const myUser = await User.findById(req.session.currentUser._id);

    if (currentUser._id === id) {
      res.redirect("/my-profile");
    }

    if (myUser.friends.includes(user._id)) {
      res.render("main/profile", {
        user,
        myProfile: false,
        friendship: "true",
      });
    } else if (myUser.sentFriendRequests.includes(user._id)) {
      res.render("main/profile", {
        user,
        myProfile: false,
        friendship: "pendingOut",
      });
    } else if (myUser.friendRequests.includes(user._id)) {
      res.render("main/profile", {
        user,
        myProfile: false,
        friendship: "pendingIn",
      });
    } else if (myUser.pendingFriendRequests.includes(user._id)) {
      res.render("main/profile", {
        user,
        myProfile: false,
        friendship: "pending",
      });
    } else {
      res.render("main/profile", {
        user,
        myProfile: false,
        friendship: "false",
      });
    }
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/edit/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("auth/edit-profile", { user, session: req.session });
  } catch (error) {
    res.render("error", { error });
  }
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

router.get("/messages", async (req, res, next) => {
  try {
    const { currentUser } = req.session;
    const conversations = await Conversation.find({
      users: currentUser._id,
    })
      .populate("users")
      .sort({ createdAt: -1 });

    // Loop through the conversations and add the otherUser property to each one
    const conversationsWithOtherUser = conversations.map((conversation) => {
      const otherUser = conversation.users.find(
        (user) => String(user._id) !== String(currentUser._id)
      );
      const otherUserComplete = User.findById(otherUser._id);
      const otherUserName = otherUserComplete.username;
      return {
        conversation: conversation,
        otherUser: otherUser._id,
        otherUserName,
      };
    });
    // Pass the conversationsWithOtherUsers array to the view
    res.render("main/messages", { conversationsWithOtherUser });
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/:id/playlists", isLoggedIn, async (req, res, next) => {
  const user = req.session.currentUser;
  const playlists = await Playlist.find({ followers: { $in: [user._id] } });
  res.render("main/playlists", { playlists });
});

router.get("/new-message", async (req, res, next) => {
  const users = await User.find().populate("username");
  res.render("main/new-message", { users });
});

router.get("/new-message/:id", async (req, res, next) => {
  const user = User.findById(req.params.id);
  try {
    res.render("main/new-message", { user });
  } catch (error) {
    res.render("error", { error });
  }
});

router.post("/new-message", async (req, res, next) => {
  try {
    const { currentUser } = req.session;
    const { userId } = req.params;
    const { content } = req.body;

    // Find or create conversation
    let conversation = await Conversation.findOneAndUpdate(
      {
        users: { $all: [currentUser._id, userId] },
      },
      {
        $setOnInsert: { users: [currentUser._id, userId] },
      },
      { upsert: true, new: true }
    );

    // Create new message
    const message = await Message.create({
      author: currentUser._id,
      for: userId,
      content,
    });

    // Add message ObjectId to conversation messages array
    conversation.messages.push(message._id);
    await conversation.save();

    const conversations = await Conversation.find({
      users: currentUser._id,
    })
      .populate("users")
      .sort({ createdAt: -1 });

    // Loop through the conversations and add the otherUser property to each one
    const conversationsWithOtherUser = conversations.map((conversation) => {
      const otherUser = conversation.users.find(
        (user) => String(user._id) !== String(currentUser._id)
      );
      const otherUserComplete = User.findById(otherUser._id);
      const otherUserName = otherUserComplete.username;
      return {
        conversation: conversation,
        otherUser: otherUser._id,
        otherUserName,
      };
    });

    // Pass the conversationsWithOtherUsers array to the view
    res.render("main/messages", { conversationsWithOtherUser });
  } catch (error) {
    console.log(error);
    res.render("error", { error });
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

router.get("/:id/friends", async (req, res, next) => {
  const user = await User.findById(req.params.id).populate(
    "friends",
    "username"
  );
  res.render("main/friends", { friends: user.friends });
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
