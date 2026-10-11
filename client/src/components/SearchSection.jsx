import { useState } from "react";
import SongCard from "./SongCard";
import api from "../services/api";

export default function SearchSection({
  onSave,
  platform,
  onPlay,
  activeTrack,
  isPlayingTrack,
  onChooseVersion,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setLoading(true);
      setHasSearched(true);
      const res = await api.get(`/songs/search?q=${encodeURIComponent(searchTerm)}`);
      setSongs(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search Input Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={{
          flex: 1, position: "relative", display: "flex", alignItems: "center",
        }}>
          <span style={{
            position: "absolute", left: 18, color: "rgba(255, 255, 255, 0.4)",
            fontSize: 16, pointerEvents: "none",
          }}>
            🔍
          </span>
          <input
            style={{
              width: "100%", background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 9999, padding: "0 18px 0 46px", height: 46,
              fontSize: "0.88rem", color: "#ffffff", outline: "none",
              fontFamily: "inherit", transition: "all 0.2s ease",
            }}
            placeholder="Search songs, artists, or albums..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            onFocus={e => {
              e.target.style.borderColor = "#d2f83d";
              e.target.style.background = "rgba(255, 255, 255, 0.09)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.target.style.background = "rgba(255, 255, 255, 0.06)";
            }}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          style={{
            padding: "0 22px", height: 46, borderRadius: 9999, border: "none",
            background: loading || !searchTerm.trim() ? "rgba(255, 255, 255, 0.1)" : "#d2f83d",
            color: loading || !searchTerm.trim() ? "rgba(255, 255, 255, 0.4)" : "#000000",
            fontWeight: 800, fontSize: "0.85rem",
            cursor: loading || !searchTerm.trim() ? "not-allowed" : "pointer",
            boxShadow: loading || !searchTerm.trim() ? "none" : "0 4px 14px rgba(210, 248, 61, 0.35)",
            fontFamily: "inherit", transition: "all 0.2s ease",
          }}
        >
          {loading ? "…" : "Search"}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && [1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            height: 64, borderRadius: 16, background: "rgba(255, 255, 255, 0.04)",
            marginBottom: 8, animation: "pulseGlow 1.4s ease-in-out infinite",
          }}
        />
      ))}

      {/* Empty State after search */}
      {!loading && hasSearched && songs.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#948ea1" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎵</div>
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>No songs found for "{searchTerm}"</p>
          <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#6b6577" }}>Try searching for a different artist or song name.</p>
        </div>
      )}

      {/* Default placeholder */}
      {!hasSearched && (
        <div style={{ textAlign: "center", padding: "36px 0", color: "#948ea1" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎧</div>
          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>Find your favorite songs</p>
          <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#6b6577" }}>Type a title or artist to discover music</p>
        </div>
      )}

      {/* Results list */}
      <ul style={{ padding: 0, margin: 0 }}>
        {songs.map((song, i) => (
          <SongCard
            key={i}
            song={song}
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
