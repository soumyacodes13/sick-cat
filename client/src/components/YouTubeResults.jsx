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
      position: "fixed", inset: 0,
      background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 16, animation: "fadeIn 0.2s ease-out",
    }}
      onClick={onClose}
    >
      <div style={{
        background: "#161122", border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 24, maxWidth: 460, width: "100%", maxHeight: "80vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
      }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "18px 22px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
              Choose Video Version
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "#948ea1" }}>
              "{song.title}" • {song.artist}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255, 255, 255, 0.08)", border: "none", color: "rgba(255, 255, 255, 0.7)",
            fontSize: 16, cursor: "pointer", width: 32, height: 32, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            ✕
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "36px 0", color: "#948ea1", fontSize: "0.85rem" }}>
              🔍 Searching YouTube for eligible versions…
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#f43f5e", fontSize: "0.82rem" }}>
              {error}
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div style={{ textAlign: "center", padding: "36px 0", color: "#948ea1", fontSize: "0.85rem" }}>
              No matches found.
            </div>
          )}

          {!loading && !error && (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {candidates.map((item) => (
                <li
                  key={item.videoId}
                  onClick={() => onSelect(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    borderRadius: 16, background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.06)", cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#d2f83d";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  }}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    style={{ width: 68, height: 46, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#ffffff",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.title}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#948ea1" }}>
                      {item.channelTitle}
                    </p>
                  </div>
                  <button style={{
                    padding: "5px 12px", borderRadius: 9999, fontSize: "0.72rem",
                    fontWeight: 800, background: "#d2f83d", color: "#000000",
                    border: "none", cursor: "pointer", flexShrink: 0,
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
