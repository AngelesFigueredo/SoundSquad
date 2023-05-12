const Event = require("../models/Events.model")

const isEventMember = async(req, res, next) =>{
    const eventId = req.params.eventId
    const event = await Event.findById(eventId)
    if(event.members.includes(req.session.currentUser._id)){
        next()
    }else{
        res.redirect(`/join/${eventId}`)
    }
}

module.exports = { isEventMember }