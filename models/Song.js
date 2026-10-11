const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: String,
    artist: String,
    albumArt: String,
    previewUrl: String,
    moodTag: String,

    youtubeVideoId: {
      type: String,
      default: null
    },
    playbackProvider: {
      type: String,
      enum: ["youtube", "preview"],
      default: "youtube"
    },
    youtubeVideoTitle: {
      type: String,
      default: null
    },
    youtubeChannelTitle: {
      type: String,
      default: null
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);
