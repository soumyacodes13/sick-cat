import { useState } from "react";

export default function NowPlayingScreen({
  track,
  isPlaying,
  onTogglePlay,
  onPrevious,
  onNext,
  onClose,
  onChooseVersion,
  showVideo,
  onToggleVideo,
  youtubePlayerElement,
}) {
  const [liked, setLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  if (!track) return null;

  const artwork = track.albumArt || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
  const youtubeUrl = track.youtubeVideoId
    ? `https://www.youtube.com/watch?v=${track.youtubeVideoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title || ""} ${track.artist || ""}`)}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "radial-gradient(circle at 50% 25%, #251838 0%, #110d1c 45%, #09070f 90%)",
      display: "flex", flexDirection: "column",
      padding: "24px 24px 32px", overflowY: "auto",
      animation: "fadeIn 0.25s ease-out",
    }}>
      {/* Top Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, maxWidth: 440, width: "100%", margin: "0 auto 20px",
      }}>
        <button
          onClick={onClose}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)", border: "none", cursor: "pointer",
            color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}
          title="Minimize player"
        >
          ←
        </button>

        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.9)" }}>
          Now Playing
        </span>

        <button
          onClick={() => setLiked(v => !v)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)", border: "none", cursor: "pointer",
            color: liked ? "#f43f5e" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17,
          }}
          title="Save to favorites"
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{
        maxWidth: 400, width: "100%", margin: "0 auto",
        display: "flex", flexDirection: "column", alignItems: "center", flex: 1,
        justifyContent: "space-between", gap: 20,
      }}>
        {/* Centered Artwork with Ambient Glow OR Embedded Video */}
        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", margin: "10px 0" }}>
          {/* Ambient backlight glow */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.25) 50%, transparent 75%)",
            filter: "blur(40px)", pointerEvents: "none",
          }} />

          {showVideo ? (
            <div style={{ width: "100%", maxWidth: 360, borderRadius: 24, overflow: "hidden", zIndex: 1, boxShadow: "0 14px 40px rgba(0,0,0,0.6)" }}>
              {youtubePlayerElement}
            </div>
          ) : (
            <div style={{
              width: 240, height: 240, borderRadius: "50%",
              overflow: "hidden", position: "relative", zIndex: 1,
              boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(168, 85, 247, 0.25)",
              border: "3px solid rgba(255, 255, 255, 0.1)",
            }}>
              <img
                src={artwork}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        {/* Video / Artwork Switcher pill */}
        <div style={{ display: "flex", gap: 8, zIndex: 1 }}>
          <button
            onClick={onToggleVideo}
            style={{
              padding: "5px 14px", borderRadius: 9999, border: "1px solid rgba(255, 255, 255, 0.12)",
              background: showVideo ? "#d2f83d" : "rgba(255, 255, 255, 0.08)",
              color: showVideo ? "#000000" : "rgba(255, 255, 255, 0.8)",
              fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
            }}
          >
            {showVideo ? "🎬 Show Album Art" : "📺 Show YouTube Video"}
          </button>

          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "5px 14px", borderRadius: 9999, border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(255, 255, 255, 0.08)", color: "rgba(255, 255, 255, 0.8)",
              fontSize: "0.72rem", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
            }}
          >
            ↗ YouTube
          </a>
        </div>

        {/* Track Title and Artist */}
        <div style={{ textAlign: "center", width: "100%", zIndex: 1 }}>
          <h2 style={{
            margin: "0 0 6px", fontSize: "1.45rem", fontWeight: 800,
            color: "#ffffff", letterSpacing: "-0.01em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {track.title || "Unknown Title"}
          </h2>
          <p style={{
            margin: 0, fontSize: "0.86rem", fontWeight: 500,
            color: "#9f97ad", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {track.artist || "Unknown Artist"}
          </p>
        </div>

        {/* Subtle Lyric / Vibe Quote snippet */}
        <div style={{
          textAlign: "center", padding: "0 10px", lineHeight: 1.6,
          color: "#8a8397", fontSize: "0.78rem", zIndex: 1,
        }}>
          <p style={{ margin: 0, opacity: 0.6 }}>Whispers in the midnight breeze,</p>
          <p style={{ margin: "2px 0", color: "#ffffff", fontWeight: 700, opacity: 0.9 }}>
            Carrying dreams across the seas,
          </p>
          <p style={{ margin: 0, opacity: 0.6 }}>I close my eyes, let go, and drift away.</p>
        </div>

        {/* Scrubber / Progress timeline */}
        <div style={{ width: "100%", zIndex: 1, padding: "0 8px" }}>
          <div style={{
            position: "relative", height: 5, borderRadius: 5,
            background: "rgba(255, 255, 255, 0.15)", overflow: "visible",
            display: "flex", alignItems: "center", cursor: "pointer",
          }}>
            <div style={{
              width: "35%", height: "100%", borderRadius: 5,
              background: "#d2f83d", position: "relative",
            }}>
              <div style={{
                position: "absolute", right: -5, top: -4,
                width: 13, height: 13, borderRadius: "50%",
                background: "#d2f83d", boxShadow: "0 0 8px rgba(210, 248, 61, 0.8)",
              }} />
            </div>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 8,
            fontSize: "0.72rem", color: "#8a8397", fontWeight: 600,
          }}>
            <span>0:28</span>
            <span>-2:15</span>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", maxWidth: 360, zIndex: 1, padding: "0 10px",
        }}>
          {/* Shuffle button */}
          <button
            onClick={() => setIsShuffle(v => !v)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: isShuffle ? "#d2f83d" : "rgba(255, 255, 255, 0.5)",
              fontSize: 18,
            }}
            title="Shuffle"
          >
            🔀
          </button>

          {/* Previous */}
          <button
            onClick={onPrevious}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)", border: "none", cursor: "pointer",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}
            title="Previous track"
          >
            ⏮
          </button>

          {/* Play / Pause - Large Lime Button */}
          <button
            onClick={onTogglePlay}
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#d2f83d", border: "none", cursor: "pointer",
              color: "#000000", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 900,
              boxShadow: "0 8px 24px rgba(210, 248, 61, 0.45)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)", border: "none", cursor: "pointer",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}
            title="Next track"
          >
            ⏭
          </button>

          {/* Change version / candidate selector */}
          <button
            onClick={() => onChooseVersion?.(track)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255, 255, 255, 0.5)", fontSize: 18,
            }}
            title="Choose alternative YouTube version"
          >
            🎬
          </button>
        </div>
      </div>
    </div>
  );
}
