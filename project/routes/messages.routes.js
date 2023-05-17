const express = require("express");
const router = express.Router();

const {
  isLoggedIn,
  isLoggedOut,
  checkRole,
} = require("../middlewares/route-guard");
const Message = require("../models/Message.model");
const Conversation = require("../models/Conversation.model");

const User = require("../models/User.model");

router.get("/messages", isLoggedIn, async (req, res, next) => {

  try {
    const { currentUser } = req.session;
    const conversationsForView = await Conversation.find({
      users: currentUser._id,
    })
      .populate("users")
      .sort({ createdAt: 1 });


    res.render("main/messages", { conversationsForView, currentUser: req.session.currentUser });

  } catch (error) {
    console.log(error);
    res.render("error", { error });
  }
});


router.get("/messages/:id", isLoggedIn, async (req, res, next) => {

  const { id } = req.params;
  const { currentUser } = req.session;
  let otherUser;


  const myUser = await User.findById(currentUser._id).populate("username")

  const conversation = await Conversation.findById(id)
    .populate({
      path: "messages",
      select: ["content", "author", "createdAt"],
      populate: {
        path: "author",
        select: "username",
        model: 'User'

      },
      options: {
        sort: { createdAt: 1 }, // sort messages by creation date in ascending order
      },
    })
    .populate({
      path: "users",
      select: ["_id", "username"],
    });

  if (conversation.users[0].username === currentUser.username) {
    otherUser = conversation.users[1];
  } else {
    otherUser = conversation.users[0];
  }

  console.log(currentUser.username)
  res.render("main/conversation", { conversation, currentUser, otherUser, myUser });

});

router.post("/new-message", async (req, res, next) => {
  try {
    const { currentUser } = req.session;
    const { content, to } = req.body;
    const { ObjectId } = require("mongodb");
    const toId = new ObjectId(to);
    const fromId = new ObjectId(currentUser._id);

    const message = await Message.create({
      author: fromId,
      for: toId,
      content,
    });

    let conversations = await Conversation.findOneAndUpdate(
      {
        $and: [{ users: fromId }, { users: toId }],
      },
      {
        $push: { messages: message._id },
      },
      { new: true }
    );

    if (!conversations) {
      conversations = await Conversation.create({
        users: [fromId, toId],
        messages: message._id,
      });
    }
    const conversationsForView = await Conversation.find({
      users: { $in: currentUser._id },
    }).populate({
      path: "users",
      select: ["_id", "username"],
    });

    res.render("main/messages", {
      conversationsForView,
      currentUser,
    });
  } catch (error) {
    console.log(error);
    res.render("error", { error });
  }
});

router.post("/new-message/:id", async (req, res, next) => {
  const { currentUser } = req.session;
  const { body } = req;
  const { conversation } = body;

  const message = await Message.create({
    body,
    content: body.content,
  });

  await Conversation.findByIdAndUpdate(conversation, {
    $push: { messages: message._id },
  });

  const fullConversation = await Conversation.findById(conversation);

  res.redirect(`/messages/${conversation}`);
  // res.render("main/conversation", { fullConversation, currentUser });
});

module.exports = router;
