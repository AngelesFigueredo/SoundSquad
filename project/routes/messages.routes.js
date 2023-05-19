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
        select: "username profileImg",
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

router.post("/new-message/create-conversation/:id", async (req, res, next) => {
  try {
    const { currentUser } = req.session;
    const { content } = req.body;
    const { id } = req.params
    const { ObjectId } = require("mongodb");
    const toId = new ObjectId(id);
    const fromId = new ObjectId(currentUser._id);

    const message = await Message.create({
      author: currentUser._id,
      to: id,
      content,
    });

   const conversation = await Conversation.create({
        users: [toId, fromId],
        messages: message._id,
      });
    // console.log(conversation)
    res.redirect(`/messages/${conversation._id}`)
    } catch (error) {
    console.log(error);
    res.render("error", { error });
  }
});

router.post("/new-message/:id", async (req, res, next) => {
  const { currentUser } = req.session;
  const { body } = req;
  const { conversation, author, to } = body;

  const message = await Message.create({
    body,
    content: body.content,
    author,
    to,
  });

  await Conversation.findByIdAndUpdate(conversation, {
    $push: { messages: message._id },
  });

  const fullConversation = await Conversation.findById(conversation);

  res.redirect(`/messages/${conversation}`);
  // res.render("main/conversation", { fullConversation, currentUser });
});

module.exports = router;
