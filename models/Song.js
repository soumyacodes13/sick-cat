const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: String,
    artist: String,
    albumArt: String,
    previewUrl: String,
    moodTag: String,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);
