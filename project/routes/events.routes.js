const {
  isEventMember
} = require("../middlewares/event-guard");

const express = require("express");
const router = express.Router();
const Event = require("../models/Events.model")
const Message = require("../models/Message.model")
const app = require('express')();
const http = require('http').Server(app);
const cors = require('cors');


router.use(cors());


// event creation 
router.get("/events/:concertId", async(req, res, next) => {
    const concertId = req.params.concertId
    const data = {concertId}
    const createdEvents = await Event.find({concertApiId: concertId})
    if(createdEvents.length === 0){
        data.noEvents = "No events have been found you create your own event"
    }else{
        data.events = createdEvents
    }
  res.render("events/events", { session: req.session, data});
});

router.get("/create-event/:concertId", (req, res, next) => {
    const concertId = req.params
    res.render("events/create", { session: req.session, concertId});
});

router.post("/create-event/:concertId", async(req, res, next) => {
    const concertId = req.params.concertId
    try {
        await Event.create(req.body)
        res.redirect(`/events/${concertId}`);
    } catch (error) {
        console.log(error)
        next()
    }
});

router.get("/join/:eventId", async(req, res, next)=>{
    const event = await Event.findById(req.params.eventId)
    const userId = req.session.currentUser._id
    
    res.render("events/ask-to-participate", { 
        session: req.session, 
        eventId : req.params.eventId, 
        concertId : event.concertApiId,
        sentRequest :  event.joinRequests.includes(userId)
    })
})

router.post("/send-join-request/:eventId", async(req, res, next)=>{
    const eventId = req.params.eventId
    const userId = req.body.userId
    await Event.findByIdAndUpdate(eventId, { $push: { joinRequests: userId}})
    res.redirect(`/join/${req.params.eventId}`)
})

// event's data
router.get("/show-event/:eventId",isEventMember, async(req, res, next) => {
    const eventId = req.params.eventId
    const userId = req.session.currentUser._id
    const event = await Event.findById(eventId).populate("members")
    event.isAdmin = event.admin.includes(req.session.currentUser._id)
    event.members.forEach((member)=>{
            member.isAdmin = event.admin.includes(member._id)
            member.isYou = member._id == userId
    })
    
    res.render("events/show-event", {session: req.session, event})
});

// leave a event 
router.post("/leave-event/:eventId",isEventMember, async(req, res, next) => {
    const eventId = req.params.eventId
    const userId = req.session.currentUser._id
    await Event.findByIdAndUpdate(eventId,  { $pull: { members: userId } })
    //In case the event is left empty
    const event = await Event.findById(eventId)
    if(event.members.length == 0){
        res.redirect(`/delete-event/${eventId}`)
    }else{
        res.redirect(`/join/${eventId}`)
    }
});

module.exports = router;