const {
  isEventMember
} = require("../middlewares/event-guard");

const User = require("../models/User.model")
const express = require("express");
const router = express.Router();
const Event = require("../models/Events.model")
const Message = require("../models/Message.model")
const app = require('express')();
const multer = require("multer");
const uploader = require("../config/cloudinary.config");
const trimUrl = require("../utils/trimUrl")
const http = require('http').Server(app);
const cors = require('cors');
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});;

// live group chat routes

router.use(cors()); // IMPORTANT as we are working with 2 servers
// most explorer will have problem with the Cros Cross-Origin Resource Sharing
// so we have to configure it so it can receive data from our other port

// see group chat and notifications
router.get("/event-details/:eventId", [cors(), isEventMember], async (req, res, next) => {
  const { currentUser } = req.session
  const users = await User.find({ friends: { $in: [currentUser._id] } }).populate("username")
  const eventId = req.params.eventId
  const event = await Event.findById(eventId)
    .populate("joinRequests")

    .populate("members")

    .populate({
      path: "messages",
      select: ["content", "author", "createdAt"],
      populate: {
        path: "author",

        select: ["username", "_id","profileImg"],

      },
      options: {
        sort: { createdAt: 1 },
      },
    })
  event.noMessagesYet = event.messages.length == 0
  event.messages.forEach((message) => {
    message.isYou = message.author._id == req.session.currentUser._id
    const dateString = message.createdAt
    const date = new Date(dateString);

    const options = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    message.time = formattedDate
  })
  const isAdmin = event.admin.includes(req.session.currentUser._id)
  let notifications
  let joinRequests
  if (isAdmin) {
    notifications = event.joinRequests.length
  }
  if (notifications) {
    joinRequests = event.joinRequests

  }
  event.key = process.env.TICKET_CONSUMER_KEY
  res.render("events/event-details",
    { session: req.session, event, isAdmin, notifications, joinRequests, users });

});

// send a message
router.post("/event-details/:eventId",  cors(), async (req, res, next) => {
    const eventId = req.params.eventId;
    const message = await Message.create(req.body);

    await Event.findByIdAndUpdate(eventId, { $push: { messages: message } });
    io.emit("new message", message); // emit a new message event
    res.redirect(`/event-details/${eventId}`);
});

// routes for group admins

// DELETE EVENT
router.get("/delete-event/:eventId", async(req, res, next) => {
    const eventId = req.params.eventId
    await Event.findByIdAndDelete(eventId)
    res.redirect("/home")
});

//EDIT EVENT
router.get("/edit-event/:eventId", isEventMember, async(req, res, next) => {
    const eventId = req.params.eventId
    const userId = req.session.currentUser._id
    const event = await Event.findById(eventId).populate("members")
    event.members.forEach((member)=>{
            member.isAdmin = event.admin.includes(member._id)
            member.isYou = member._id == userId
    })
    

    res.render("events/edit", {session: req.session, event, currentUser: req.session.currentUser})

});

router.post("/edit-event/:eventId",  uploader.single("profilePic"),async(req, res, next) => {
    const eventId = req.params.eventId
    console.log("el req.file", req.file)
    let {name, description, profilePic} = req.body
    // si nos viene la url desde una cosa que se ha subido
    if(req.file && req.file.path){
      profilePic = req.file.path
    }
    // si nos viene de una foto que hemos tomado 
    if(req.body.picUrl && !req.file){
      profilePic= trimUrl(req.body.picUrl[0])
    }
    await Event.findByIdAndUpdate(eventId, {name, description, profilePic})
    
    res.redirect(`/show-event/${eventId}`)
});

// MAKE GROUP MEMBER NEW ADMIN
router.post("/make-admin/:newAdminId", async(req, res, next) => {
    const newAdminId = req.params.newAdminId
    const {eventId} = req.body
    await Event.findByIdAndUpdate(eventId, {$push: { admin: newAdminId}})
    
    res.redirect(`/show-event/${eventId}`)
});

// KICK SOMEONE OUT OF THE GROUP
router.post("/kick-out/:oldMember", async(req, res, next) => {
    const oldMember = req.params.oldMember
    const {eventId} = req.body
    await Event.findByIdAndUpdate(eventId, {$pull: { members: oldMember}})
    
    res.redirect(`/show-event/${eventId}`)
});


//accept and reject notifications

router.post("/decline-request", async(req, res, next) => {
    const {askerId, eventId} = req.body
    await Event.findByIdAndUpdate(eventId, {$pull: { joinRequests: askerId}})
    res.redirect(`/event-details/${eventId}`)
});

router.post("/accept-request", async(req, res, next) => {
    const {askerId, eventId} = req.body
    await Event.findByIdAndUpdate(eventId, {$pull: { joinRequests: askerId}})
    await Event.findByIdAndUpdate(eventId, {$push: { members: askerId}})
    res.redirect(`/event-details/${eventId}`)
})

router.post("/share-event/:eventId/", async (req, res, next)=>{
  const { currentUser } = req.session
  const friendName = currentUser.username
  const { user } = req.body
  const { eventId } = req.params
  await User.findByIdAndUpdate(user, { $push: { eventsRequests: { user: friendName, event: eventId.toString() } }})
  console.log(friendName, eventId)
  res.redirect(`/event-details/${eventId}`)
  })

// CONNECT TO THE SOCKET.IO SERVER

http.listen(4000, () => {
  console.log("socket.io listening on *:4000");
});




module.exports = router;