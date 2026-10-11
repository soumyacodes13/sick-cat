import { useState, useRef } from "react";
import playbackManager from "../services/playbackManager";

const PLATFORMS = {
  spotify: {
    label: "Spotify",
    color: "#1db954",
    url: (title, artist) => `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`,
  },
  youtube: {
    label: "YouTube",
    color: "#ff0000",
    url: (title, artist) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`,
  },
  applemusic: {
    label: "Apple Music",
    color: "#fc3c44",
    url: (title, artist) => `https://music.apple.com/search?term=${encodeURIComponent(`${title} ${artist}`)}`,
  },
};

export default function SongCard({
  song,
  onSave,
  onDelete,
  platform = "spotify",
  onPlay,
  activeTrack,
  isPlayingTrack,
  onChooseVersion,
}) {
  const [saving, setSaving] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const audioRef = useRef(null);

  const isActive = activeTrack && (
    (song._id && activeTrack._id && song._id === activeTrack._id) ||
    (song.title === activeTrack.title && song.artist === activeTrack.artist)
  );
  const isPlayingThis = isActive && isPlayingTrack;

  const handleSave = async (e) => {
    e.stopPropagation();
    setSaving(true);
    await onSave?.(song);
    setSaving(false);
  };

  const togglePreview = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
      playbackManager.onPreviewEnd(audio);
    } else {
      playbackManager.onPreviewStart(audio);
      document.querySelectorAll("audio").forEach(a => { if (a !== audio) a.pause(); });
      audio.play().catch(e => console.error("Audio preview play error:", e));
      setPreviewPlaying(true);
    }
  };

  const artwork = song.albumArt || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80";
  const p = PLATFORMS[platform] || PLATFORMS.spotify;
  const externalUrl = p.url(song.title || "", song.artist || "");

  return (
    <li
      onClick={() => onPlay?.(song)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: "10px 12px", borderRadius: 16,
        background: isActive ? "rgba(210, 248, 61, 0.08)" : "transparent",
        border: `1px solid ${isActive ? "rgba(210, 248, 61, 0.25)" : "transparent"}`,
        marginBottom: 4, listStyle: "none", cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Left Thumbnail & Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src={artwork}
            alt=""
            style={{
              width: 50, height: 50, borderRadius: 14,
              objectFit: "cover", display: "block",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          />
          {isPlayingThis && (
            <div style={{
              position: "absolute", bottom: -2, right: -2, width: 14, height: 14,
              borderRadius: "50%", background: "#d2f83d", border: "2px solid #09070f",
            }} />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            color: isActive ? "#d2f83d" : "#ffffff",
            fontWeight: 700, fontSize: "0.88rem", margin: "0 0 3px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {song.title || "Unknown Title"}
          </p>
          <p style={{
            color: "#948ea1", fontSize: "0.74rem", fontWeight: 500, margin: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            By {song.artist || "Unknown Artist"} {song.moodTag && `• ${song.moodTag}`}
          </p>
        </div>
      </div>

      {/* Hidden 30s preview element */}
      {song.previewUrl && (
        <audio
          ref={audioRef}
          src={song.previewUrl}
          onEnded={() => {
            setPreviewPlaying(false);
            playbackManager.onPreviewEnd(audioRef.current);
          }}
          onPause={() => {
            setPreviewPlaying(false);
            playbackManager.onPreviewEnd(audioRef.current);
          }}
          style={{ display: "none" }}
        />
      )}

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Optional 30s clip button */}
        {song.previewUrl && (
          <button
            onClick={togglePreview}
            style={{
              padding: "4px 8px", borderRadius: 9999, border: "1px solid rgba(255, 255, 255, 0.12)",
              background: previewPlaying ? "rgba(210, 248, 61, 0.2)" : "transparent",
              color: previewPlaying ? "#d2f83d" : "rgba(255, 255, 255, 0.6)",
              fontSize: "0.66rem", fontWeight: 700, cursor: "pointer",
            }}
            title="30-second iTunes Preview"
          >
            {previewPlaying ? "⏸ Clip" : "30s"}
          </button>
        )}

        {/* Versions selector button */}
        {onChooseVersion && (
          <button
            onClick={(e) => { e.stopPropagation(); onChooseVersion(song); }}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)", border: "none", cursor: "pointer",
              color: "rgba(255, 255, 255, 0.5)", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            title="Alternative versions"
          >
            🎬
          </button>
        )}

        {/* Save button */}
        {onSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.06)", border: "none", cursor: "pointer",
              color: "rgba(255, 255, 255, 0.7)", fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.15s",
            }}
            title="Save to playlist"
          >
            {saving ? "…" : "♡"}
          </button>
        )}

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(song._id); }}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(244, 63, 94, 0.1)", border: "none", cursor: "pointer",
              color: "#fb7185", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            title="Remove from playlist"
          >
            ✕
          </button>
        )}

        {/* Round Play Button (Primary) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(song);
          }}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: isPlayingThis ? "#d2f83d" : "rgba(255, 255, 255, 0.09)",
            border: "none", cursor: "pointer",
            color: isPlayingThis ? "#000000" : "#ffffff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isPlayingThis ? 14 : 12, fontWeight: 900,
            boxShadow: isPlayingThis ? "0 4px 14px rgba(210, 248, 61, 0.4)" : "none",
            transition: "all 0.15s ease",
          }}
          title={isPlayingThis ? "Pause" : "Play"}
        >
          {isPlayingThis ? "⏸" : "▶"}
        </button>
      </div>
    </li>
  );
}
