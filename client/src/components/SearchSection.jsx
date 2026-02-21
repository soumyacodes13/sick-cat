import { useState } from "react";
import SongCard from "./SongCard";
import api from "../services/api";

export default function SearchSection({ onSave, platform }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setLoading(true); setHasSearched(true);
      const res = await api.get(`/songs/search?q=${encodeURIComponent(searchTerm)}`);
      setSongs(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input
          style={{
            flex: 1, background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(196,165,140,0.3)",
            borderRadius: 50, padding: "0 18px", height: 44, fontSize: "0.85rem", color: "#7c6a5e",
            outline: "none", fontFamily: "Nunito,sans-serif", transition: "border-color 0.2s",
          }}
          placeholder="Search songs or artists..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          onFocus={e => e.target.style.borderColor = "#e8a87c"}
          onBlur={e => e.target.style.borderColor = "rgba(196,165,140,0.3)"}
        />
        <button onClick={handleSearch} disabled={loading || !searchTerm.trim()} style={{
          padding: "0 20px", height: 44, borderRadius: 50, border: "none",
          background: loading || !searchTerm.trim() ? "rgba(232,168,124,0.3)" : "linear-gradient(135deg,#e8a87c,#e8909a)",
          color: "white", fontWeight: 800, fontSize: "0.82rem",
          cursor: loading || !searchTerm.trim() ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 14px rgba(232,168,124,0.35)",
          fontFamily: "Nunito,sans-serif",
        }}>
          {loading ? "..." : "🔍"}
        </button>
      </div>

      {loading && [1, 2, 3].map(i => (
        <div key={i} style={{ height: 64, borderRadius: 14, background: "rgba(255,255,255,0.5)", marginBottom: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}

      {!loading && hasSearched && songs.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#c4a882" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎵</div>
          <p>No songs found for "{searchTerm}"</p>
        </div>
      )}

      {!hasSearched && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#c4a882" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎧</div>
          <p style={{ fontSize: "0.82rem" }}>Type a song or artist and press Enter</p>
        </div>
      )}

      <ul style={{ padding: 0, margin: 0 }}>
        {songs.map((song, i) => <SongCard key={i} song={song} onSave={onSave} platform={platform} />)}
      </ul>
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
    </div>
  );
}
