const express = require("express");
const router = express.Router();
const axios = require("axios");
const Event = require("../models/Events.model")
const {
  isEventMember
} = require("../middlewares/event-guard");

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

router.get("/event-details/:eventId", isEventMember, async(req, res, next) => {
    const eventId = req.params.eventId
    const event = await Event.findById(eventId).populate("joinRequests")
    const isAdmin = event.admin == req.session.currentUser._id
    let notifications
    let joinRequests
    if(isAdmin){ 
        notifications = event.joinRequests.length
        
    }
    if(notifications){
        joinRequests = event.joinRequests
        console.log("esto tendría que ser sole el join request", joinRequests)
    }
    
    
    res.render("events/event-page", 
    { session: req.session, event, isAdmin, notifications, joinRequests});
});

router.get("/show-participants", async(req, res, next) => {
    res.send("/show-partipants")
});

router.post("/accept")

module.exports = router;