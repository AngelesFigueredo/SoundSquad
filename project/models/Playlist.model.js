const { Schema, model } = require("mongoose");

const playlistSchema = new Schema(
  {
    title: String,
    description: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    songs: [String],
    followers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Playlist = model("Playlist", playlistSchema);

module.exports = Playlist;
