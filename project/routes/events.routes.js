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
  const User = require("../models/User.model");
  
  
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
    res.render("events/events", { session: req.session, data, currentUser: req.session.currentUser});
  });
  

  router.get("/create-event/:concertId", (req, res, next) => {
      const concertId = req.params
      const apiKey = process.env.TICKET_CONSUMER_KEY
      res.render("events/create", { session: req.session, concertId, apiKey, currentUser: req.session.currentUser}, );
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
  
  router.get("/user/events/:id", async(req,res,next)=>{
    try{
    const { currentUser } = req.session
    const routeId = req.params.id
    const otherUser = await User.findById(req.params.id)
    const ownedEvents = await Event.find({ author: currentUser._id });
    const followedEvents = await Event.find({ members: { $in: [currentUser._id] } });
    const othersOwnedEvents = await Event.find({ author: routeId})
    const othersFollowedEvents = await Event.find({ members: { $in: [routeId]}})

    res.render("events/user-events", { 
        ownedEvents,
        followedEvents,
        otherUser,
        othersOwnedEvents,
        othersFollowedEvents,
        myEvents: currentUser._id === routeId,
        othersEvents: currentUser._id !== routeId,
        currentUser: req.session.currentUser
    })
    } catch (error) 
    {console.log(error)}
  })

  //// comentar 

  router.get("/join/:eventId", async(req, res, next)=>{
      const event = await Event.findById(req.params.eventId)
      const userId = req.session.currentUser._id
      
      res.render("events/ask-to-participate", { 
          session: req.session, 
          eventId : req.params.eventId, 
          concertId : event.concertApiId,
          sentRequest :  event.joinRequests.includes(userId),
          currentUser: req.session.currentUser
      })
  })
  
  router.post("/send-join-request/:eventId", async(req, res, next)=>{
      const { currentUser } = req.session
      const eventId = req.params.eventId
      const userId = req.body.userId
      const event = Event.findById(eventId)
      // const eventAuthor = event.author._id
      await Event.findByIdAndUpdate(eventId, { $push: { joinRequests: userId}})
      // await User.findByIdAndUpdate(eventAuthor, { $push: { event: eventId, user: currentUser._id}})
      res.redirect(`/join/${req.params.eventId}`)
  }) 
  
  ////////comentar 

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
      
      res.render("events/show-event", {session: req.session, event, currentUser: req.session.currentUser})
  });
  
  // leave an event 
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
  
  // in order see the location of the concert in a map
  router.post("/get-directions", async(req, res, next)=>{
      const {longitude, latitude} = req.body
      const apiToken = process.env.MAPBOX_TOKEN
      res.render("events/maps", {longitude, latitude, apiToken})
  })

  router.post("/event-requests/:userId/:eventId/accept", async(req, res, next)=>{
    try{
    const { id } = req.session
    const { userId, eventId } = req.params
    await Event.findByIdAndUpdate(eventId, { $push: { members: userId}})
    await User.findByIdAndUpdate(id, {
        $pull: {
          eventsRequests: {
            $elemMatch: { event: eventId, user: userId },
          },
        },
      });
      res.redirect("/notifications")
  } catch (error)
  {console.log(error)}
})

  router.post("/event-requests/:userId/:eventId/cancel", async(req, res, next)=>{
    try{
        const { id } = req.session
        const { userId, eventId } = req.params
        await User.findByIdAndUpdate(id, {
            $pull: {
              eventsRequests: {
                $elemMatch: { event: eventId, user: userId },
              },
            },
          });
          res.redirect("/notifications")
      } catch (error)
      {console.log(error)}
  })
  

module.exports = router;
