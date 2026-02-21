const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Memory = require("../models/Memory");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Memory
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "memory_vault" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const memory = await Memory.create({
      // FIX: attach user to memory
      user: req.user._id,
      imageUrl: result.secure_url,
      caption: req.body.caption,
      mood: req.body.mood,
      unlockDate: req.body.unlockDate,
    });

    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// FIX: Removed unprotected /all route — use GET / instead

// Get Memories for current user
router.get("/", protect, async (req, res) => {
  try {
    const today = new Date();

    const unlocked = await Memory.find({
      user: req.user._id,  // FIX: only return this user's memories
      unlockDate: { $lte: today },
    }).sort({ createdAt: -1 });

    const lockedCount = await Memory.countDocuments({
      user: req.user._id,  // FIX: only count this user's locked memories
      unlockDate: { $gt: today },
    });

    res.json({ unlocked, lockedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
