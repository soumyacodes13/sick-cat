const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  // FIX: memories must be scoped to a user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: { type: String, required: true },
  caption: { type: String, required: true },
  mood: { type: String },
  unlockDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Memory", memorySchema);
