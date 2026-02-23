const express = require("express");
const axios = require("axios");
const Song = require("../models/Song");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* --- SEARCH (no auth needed) --- */
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Search query required" });

    const response = await axios.get("https://itunes.apple.com/search", {
      params: { term: query, media: "music", limit: 5 }
    });

    const songs = response.data.results.map(song => ({
      title: song.trackName,
      artist: song.artistName,
      albumArt: song.artworkUrl100,
      previewUrl: song.previewUrl
    }));

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* --- MOOD (no auth needed) --- */
router.get("/mood", async (req, res) => {
  try {
    const mood = req.query.mood;
    const moodMap = { happy: "pop", calm: "acoustic", chaotic: "dance", sad: "indie", focus: "lofi" };
    const searchTerm = moodMap[mood] || "pop";

    const response = await axios.get("https://itunes.apple.com/search", {
      params: { term: searchTerm, media: "music", limit: 5 }
    });

    const songs = response.data.results.map(song => ({
      title: song.trackName,
      artist: song.artistName,
      albumArt: song.artworkUrl100,
      previewUrl: song.previewUrl
    }));

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* --- SHARED PLAYLIST — all songs from everyone, no auth needed --- */
router.get("/public", async (req, res) => {
  try {
    const songs = await Song.find({})
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(songs);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

/* --- SAVE SONG (auth required) --- */
router.post("/", protect, async (req, res) => {
  try {
    const { title, artist, albumArt, previewUrl, moodTag } = req.body;
    const userId = req.user._id;

    const existing = await Song.findOne({ title, artist });
    if (existing) return res.status(400).json({ message: "Song already in playlist" });

    const newSong = await Song.create({ title, artist, albumArt, previewUrl, moodTag, user: userId });
    res.json(newSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* --- GET SHARED PLAYLIST — all songs from everyone --- */
router.get("/", protect, async (req, res) => {
  try {
    const songs = await Song.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* --- DELETE SONG (auth required) --- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    await song.deleteOne();
    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;