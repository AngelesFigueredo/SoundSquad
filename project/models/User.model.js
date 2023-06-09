const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
    },

    lastName: {
      type: String,
    },

    age: {
      type: Number,
    },

    profileImg: {
      type: String,
      default: "https://res.cloudinary.com/dioxc2frd/image/upload/v1684568890/user-icon_zofu17.png",
    },

    role: {
      type: String,
      enum: ["STANDARD", "PREMIUM", "ADMIN"],
      default: "STANDARD",
      required: true,
    },

    description: {
      type: String,
    },

    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],

    playlists: [{ type: Schema.Types.ObjectId, ref: "Playlist" }],

    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    eventsRequests: {
      type: [{ user: {type: String}, event: { type: String } }],
      default: []
    },

    postMentions: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    commentMentions: [{ type: Schema.Types.ObjectId, ref: "Comment" }],

    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],

    sentFriendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },

  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
