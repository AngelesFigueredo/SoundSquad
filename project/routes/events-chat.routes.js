const express = require("express");
const router = express.Router();
const Event = require("../models/Events.model")
const Message = require("../models/Message.model")
const {
  isEventMember
} = require("../middlewares/event-guard");


router.post("/send-event-message/:eventId", async(req, res, next) => {
   const {eventId} = req.params
   const message = await Message.create(req.body)
   await Event.findByIdAndUpdate(eventId, {$push:{messages: message}})
   res.redirect(`/event-details/${eventId}`)

});

module.exports = router;