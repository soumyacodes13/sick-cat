import { useState } from "react";

export default function CuratedCard({ featuredSong, onPlay }) {
  const [liked, setLiked] = useState(false);

  const title = featuredSong?.title || "Discover weekly";
  const subtitle = featuredSong ? `By ${featuredSong.artist}` : "The original slow instrumental best playlists.";
  const image = featuredSong?.albumArt || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";

  return (
    <div style={{
      background: "linear-gradient(135deg, #d8b4fe 0%, #c084fc 50%, #a855f7 100%)",
      borderRadius: 24, padding: "20px 22px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "relative", overflow: "hidden",
      boxShadow: "0 10px 30px rgba(168, 85, 247, 0.25)",
      marginBottom: 26,
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: "absolute", top: -30, right: -30, width: 140, height: 140,
        borderRadius: "50%", background: "rgba(255, 255, 255, 0.3)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />

      {/* Left content */}
      <div style={{ flex: 1, zIndex: 1, paddingRight: 14 }}>
        <h3 style={{
          margin: "0 0 6px", fontSize: "1.28rem", fontWeight: 900,
          color: "#120826", letterSpacing: "-0.02em",
        }}>
          {title}
        </h3>
        <p style={{
          margin: "0 0 16px", fontSize: "0.78rem", fontWeight: 600,
          color: "rgba(18, 8, 38, 0.72)", lineHeight: 1.4, maxWidth: 220,
        }}>
          {subtitle}
        </p>

        {/* Action icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => onPlay?.(featuredSong || { title: "Discover weekly", artist: "Curated" })}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "#120826", border: "none", cursor: "pointer",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, boxShadow: "0 4px 12px rgba(18, 8, 38, 0.3)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            title="Play curated music"
          >
            ▶
          </button>

          <button
            onClick={() => setLiked(v => !v)}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(18, 8, 38, 0.1)", border: "none", cursor: "pointer",
              color: liked ? "#e11d48" : "#120826", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, transition: "background 0.2s",
            }}
          >
            {liked ? "♥" : "♡"}
          </button>

          <button
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(18, 8, 38, 0.1)", border: "none", cursor: "pointer",
              color: "#120826", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13,
            }}
            title="Download / Save"
          >
            ↓
          </button>

          <button
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(18, 8, 38, 0.1)", border: "none", cursor: "pointer",
              color: "#120826", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13,
            }}
            title="More options"
          >
            •••
          </button>
        </div>
      </div>

      {/* Right Artwork / Cutout */}
      <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
        <img
          src={image}
          alt="Curated"
          style={{
            width: 100, height: 100, borderRadius: 20,
            objectFit: "cover", boxShadow: "0 8px 24px rgba(18, 8, 38, 0.2)",
            border: "2px solid rgba(255, 255, 255, 0.4)",
          }}
        />
      </div>
    </div>
  );
}
