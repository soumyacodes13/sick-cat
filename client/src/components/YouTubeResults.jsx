import { useState, useEffect } from "react";
import api from "../services/api";

export default function YouTubeResults({ song, onSelect, onClose }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!song) return;
    setLoading(true);
    setError(null);

    const query = `${song.title || ""} ${song.artist || ""}`.trim();
    api.get(`/songs/youtube-search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        setCandidates(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch YouTube candidates:", err);
        setError("Could not load video candidates. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [song]);

  if (!song) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}
      onClick={onClose}
    >
      <div style={{
        background: "var(--card)", border: "1.5px solid var(--border)",
        borderRadius: 20, maxWidth: 480, width: "100%", maxHeight: "80vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text)" }}>
              Choose YouTube Version
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--text-light)" }}>
              for "{song.title}" by {song.artist}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "var(--text-light)",
            fontSize: 18, cursor: "pointer", padding: "4px 8px",
          }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "14px 18px", overflowY: "auto", flex: 1 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-light)", fontSize: "0.85rem" }}>
              🔍 Finding matching videos on YouTube...
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#e11d48", fontSize: "0.8rem" }}>
              {error}
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-light)", fontSize: "0.85rem" }}>
              No matches found.
            </div>
          )}

          {!loading && !error && (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {candidates.map((item) => (
                <li
                  key={item.videoId}
                  onClick={() => onSelect(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "8px 10px",
                    borderRadius: 14, background: "rgba(255,255,255,0.4)",
                    border: "1px solid var(--border)", cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#e8a87c";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    style={{ width: 64, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.title}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "var(--text-light)" }}>
                      {item.channelTitle}
                    </p>
                  </div>
                  <button style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: "0.7rem",
                    fontWeight: 700, background: "linear-gradient(135deg,#e8a87c,#e8909a)",
                    color: "white", border: "none", cursor: "pointer", flexShrink: 0,
                  }}>
                    Play ▶
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
