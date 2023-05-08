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
      default: "images/user-icon.png",
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

    favouriteArtists: {
      type: ["String"],
    },

    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],

    playlists: [{ type: Schema.Types.ObjectId, ref: "Song" }],

    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  },

  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
