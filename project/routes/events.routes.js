const express = require("express");
const router = express.Router();
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


// single event main page
router.get("/event-details/:eventId", isEventMember, async(req, res, next) => {
    const eventId = req.params.eventId
    const event = await Event.findById(eventId)
        .populate("joinRequests")
        .populate({
            path: "messages",
            select: ["content", "author", "createdAt"],
            populate: {
                path: "author",
                select: ["username", 
                "_id"],
            },
            options: {
                sort: { createdAt: 1 }, 
            },
        })
    const mess = event.messages.length
    event.messages.forEach((message)=>{
       message.isYou = message.author._id == req.session.currentUser._id
    })

    const isAdmin = event.admin.includes(req.session.currentUser._id) 
    let notifications
    let joinRequests
    if(isAdmin){ 
        notifications = event.joinRequests.length
    }
    if(notifications){
        joinRequests = event.joinRequests
        // console.log("esto tendría que ser sole el join request", joinRequests
    }
    
    res.render("events/event-details", 
    { session: req.session, event, isAdmin, notifications, joinRequests});
});
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
    console.log("se supone que esto nos esta sacando del evento", event)
    if(event.members.length == 0){
        res.redirect(`/delete-event/${eventId}`)
    }else{
        res.redirect(`/join/${eventId}`)
    }
});

router.post("/delete-event/:eventId", async(req, res, next) => {
    const eventId = req.params.eventId
    await Event.findByIdAndDelete(eventId)
    res.redirect("/home")
});

router.get("/edit-event/:eventId", isEventMember, async(req, res, next) => {
    const eventId = req.params.eventId
    const userId = req.session.currentUser._id
    const event = await Event.findById(eventId).populate("members")
    event.members.forEach((member)=>{
            member.isAdmin = event.admin.includes(member._id)
            member.isYou = member._id == userId
    })
    
    res.render("events/edit", {session: req.session, event})
});

router.post("/edit-event/:eventId", async(req, res, next) => {
    const eventId = req.params.eventId
    const {name, description} = req.body
    await Event.findByIdAndUpdate(eventId, {name, description})
    
    res.redirect(`/show-event/${eventId}`)
});

router.post("/make-admin/:newAdminId", async(req, res, next) => {
    const newAdminId = req.params.newAdminId
    const {eventId} = req.body
    await Event.findByIdAndUpdate(eventId, {$push: { admin: newAdminId}})
    
    res.redirect(`/show-event/${eventId}`)
});

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


module.exports = router;