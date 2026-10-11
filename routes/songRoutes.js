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

/* --- YOUTUBE SEARCH (no auth needed) --- */
router.get("/youtube-search", async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) return res.status(400).json({ message: "Search query required" });
    if (query.length > 200) return res.status(400).json({ message: "Search query too long" });

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "YouTube API key not configured" });

    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults: 5,
        key: apiKey,
      },
    });

    const results = (response.data.items || []).map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    }));

    res.json(results);
  } catch (error) {
    console.error("YouTube search error:", error.response?.data?.error?.message || error.message);
    if (error.response?.data?.error?.errors?.[0]?.reason === "quotaExceeded") {
      return res.status(429).json({ message: "YouTube API quota exceeded. Please try again later." });
    }
    res.status(500).json({ message: "Failed to search YouTube" });
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
    const {
      title,
      artist,
      albumArt,
      previewUrl,
      moodTag,
      youtubeVideoId,
      playbackProvider,
      youtubeVideoTitle,
      youtubeChannelTitle,
    } = req.body;
    const userId = req.user._id;

    const existing = await Song.findOne({ title, artist, user: userId });
    if (existing) return res.status(400).json({ message: "Song already in playlist" });

    const newSong = await Song.create({
      title,
      artist,
      albumArt,
      previewUrl,
      moodTag,
      youtubeVideoId: youtubeVideoId || null,
      playbackProvider: playbackProvider || "youtube",
      youtubeVideoTitle: youtubeVideoTitle || null,
      youtubeChannelTitle: youtubeChannelTitle || null,
      user: userId,
    });
    res.json(newSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* --- UPDATE SAVED SONG (auth required) --- */
router.put("/:id", protect, async (req, res) => {
  try {
    const { youtubeVideoId, youtubeVideoTitle, youtubeChannelTitle, playbackProvider } = req.body;
    const song = await Song.findOne({ _id: req.params.id, user: req.user._id });
    if (!song) return res.status(404).json({ message: "Song not found" });

    if (youtubeVideoId !== undefined) song.youtubeVideoId = youtubeVideoId;
    if (youtubeVideoTitle !== undefined) song.youtubeVideoTitle = youtubeVideoTitle;
    if (youtubeChannelTitle !== undefined) song.youtubeChannelTitle = youtubeChannelTitle;
    if (playbackProvider !== undefined) song.playbackProvider = playbackProvider;

    await song.save();
    res.json(song);
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