import { useState } from "react";
import api from "../services/api";
import SongCard from "./SongCard";

const MOODS = [
  { key: "happy", label: "Happy", emoji: "😄" },
  { key: "calm", label: "Calm", emoji: "😌" },
  { key: "focus", label: "Focus", emoji: "🎯" },
  { key: "chaotic", label: "Energetic", emoji: "⚡" },
  { key: "sad", label: "Melancholy", emoji: "🌧️" },
];

export default function MoodSection({
  onSave,
  platform,
  onPlay,
  activeTrack,
  isPlayingTrack,
  onChooseVersion,
}) {
  const [moodSongs, setMoodSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState(null);

  const handleMood = async (mood) => {
    try {
      setLoading(true);
      setActiveMood(mood.key);
      const res = await api.get(`/songs/mood?mood=${mood.key}`);
      setMoodSongs(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: "0.82rem", color: "#948ea1", fontWeight: 600, marginBottom: 12 }}>
        Explore music by vibe
      </p>

      {/* Filter Pill Chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {MOODS.map(mood => {
          const isActive = activeMood === mood.key;
          return (
            <button
              key={mood.key}
              onClick={() => handleMood(mood)}
              disabled={loading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 9999, fontSize: "0.82rem",
                cursor: loading ? "not-allowed" : "pointer",
                border: `1px solid ${isActive ? "#d2f83d" : "rgba(255, 255, 255, 0.08)"}`,
                background: isActive ? "#d2f83d" : "rgba(255, 255, 255, 0.06)",
                color: isActive ? "#000000" : "#948ea1",
                fontWeight: isActive ? 800 : 600,
                boxShadow: isActive ? "0 4px 14px rgba(210, 248, 61, 0.35)" : "none",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: isActive ? "scale(1.02)" : "scale(1)",
              }}
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading && [1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            height: 64, borderRadius: 16, background: "rgba(255, 255, 255, 0.04)",
            marginBottom: 8, animation: "pulseGlow 1.4s ease-in-out infinite",
          }}
        />
      ))}

      {!activeMood && (
        <div style={{ textAlign: "center", padding: "36px 0", color: "#948ea1" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
          <p style={{ margin: 0, fontSize: "0.86rem", fontWeight: 600 }}>Select a mood above</p>
          <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#6b6577" }}>Discover tailored songs to match your vibe</p>
        </div>
      )}

      {!loading && activeMood && moodSongs.length === 0 && (
        <p style={{ color: "#948ea1", textAlign: "center", padding: "24px 0", fontSize: "0.84rem" }}>
          No songs found for this mood.
        </p>
      )}

      <ul style={{ padding: 0, margin: 0 }}>
        {moodSongs.map((song, i) => (
          <SongCard
            key={i}
            song={{ ...song, moodTag: activeMood }}
            onSave={onSave}
            platform={platform}
            onPlay={onPlay}
            activeTrack={activeTrack}
            isPlayingTrack={isPlayingTrack}
            onChooseVersion={onChooseVersion}
          />
        ))}
      </ul>
    </div>
  );
}
