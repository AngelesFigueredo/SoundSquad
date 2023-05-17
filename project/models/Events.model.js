const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    name: String,
    author: { type: Schema.Types.ObjectId, ref: "User"},
    profilePic: {
      type: String,
      default: "/images/event-default.jpg"
    },
    admin: [{ type: Schema.Types.ObjectId, ref: "User"}],
    concertApiId: {
        type: String,
        }, 
    artist: String, 
    date: String, 
    venue: String,
    description: String,
    members: [{type: Schema.Types.ObjectId, ref: "User" }], 
    joinRequests: [{type: Schema.Types.ObjectId, ref: "User" }], 
    messages:[{type: Schema.Types.ObjectId, ref: "Message"}]
  },
  {
    timestamps: true,
  }
);

const Event = model("Event", eventSchema);

module.exports = Event;
