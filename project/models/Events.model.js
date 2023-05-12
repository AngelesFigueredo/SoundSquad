const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    name: String,
    profilePic: {
      type: String,
      default: "/images/event-default.jpg"
    },
    admin: { type: Schema.Types.ObjectId, ref: "User"},
    concertApiId: {
        type: String,
        }, 
    description: String,
    members: [{type: Schema.Types.ObjectId, ref: "User" }], 
    joinRequests: [{type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: true,
  }
);

const Event = model("Event", eventSchema);

module.exports = Event;
