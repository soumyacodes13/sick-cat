export default function MiniPlayer({ track, isPlaying, onTogglePlay, onNext, onExpand }) {
  if (!track) return null;

  return (
    <div
      onClick={onExpand}
      style={{
        position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 32px)", maxWidth: 440, height: 60,
        zIndex: 45, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 14px", borderRadius: 9999,
        background: "rgba(24, 18, 34, 0.92)", backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateX(-50%) translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateX(-50%) translateY(0)"}
    >
      {/* Left Artwork & Track Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
        <img
          src={track.albumArt || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80"}
          alt=""
          style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            margin: "0 0 2px", fontSize: "0.84rem", fontWeight: 700,
            color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {track.title || "Unknown Title"}
          </p>
          <p style={{
            margin: 0, fontSize: "0.72rem", fontWeight: 500,
            color: "#948ea1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {track.artist || "Unknown Artist"}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={onTogglePlay}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#d2f83d", border: "none", cursor: "pointer",
            color: "#000000", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, boxShadow: "0 4px 12px rgba(210, 248, 61, 0.35)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {onNext && (
          <button
            onClick={onNext}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)", border: "none", cursor: "pointer",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
            }}
            title="Next Track"
          >
            ⏭
          </button>
        )}
      </div>
    </div>
  );
}
