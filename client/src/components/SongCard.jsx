import { useState, useRef } from "react";

const MOOD_COLORS = { happy:"#f59e0b", calm:"#22d3ee", chaotic:"#f43f5e", sad:"#818cf8", focus:"#34d399" };
const MOOD_EMOJI  = { happy:"😄", calm:"😌", chaotic:"🌪️", sad:"😢", focus:"🎯" };

const PLATFORMS = {
  spotify: {
    label: "Spotify",
    color: "#1db954",
    bg: "rgba(30,215,96,0.08)",
    border: "rgba(30,215,96,0.4)",
    url: (title, artist) => `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`,
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#1db954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    color: "#ff0000",
    bg: "rgba(255,0,0,0.07)",
    border: "rgba(255,0,0,0.3)",
    url: (title, artist) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`,
    icon: (
      <svg width="12" height="11" viewBox="0 0 24 24" fill="#ff0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  applemusic: {
    label: "Apple Music",
    color: "#fc3c44",
    bg: "rgba(252,60,68,0.07)",
    border: "rgba(252,60,68,0.3)",
    url: (title, artist) => `https://music.apple.com/search?term=${encodeURIComponent(`${title} ${artist}`)}`,
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#fc3c44">
        <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a6.303 6.303 0 0 0-1.73-.694 9.552 9.552 0 0 0-1.608-.232c-.08-.005-.326-.02-.41-.024H6.17c-.09.004-.336.02-.415.024a9.552 9.552 0 0 0-1.608.232 6.32 6.32 0 0 0-1.73.694C1.31 1.623.563 2.622.24 3.934A9.23 9.23 0 0 0 0 6.124v11.754a9.23 9.23 0 0 0 .24 2.19c.317 1.31 1.062 2.31 2.18 3.043a6.303 6.303 0 0 0 1.73.694 9.552 9.552 0 0 0 1.608.232c.08.005.326.02.41.024h11.663c.09-.004.336-.02.415-.024a9.552 9.552 0 0 0 1.608-.232 6.303 6.303 0 0 0 1.73-.694c1.118-.734 1.863-1.734 2.18-3.043a9.23 9.23 0 0 0 .24-2.19V6.124zM12 18.655a6.655 6.655 0 1 1 0-13.31 6.655 6.655 0 0 1 0 13.31zm0-10.88a4.226 4.226 0 1 0 0 8.452 4.226 4.226 0 0 0 0-8.452zm6.908-1.955a1.56 1.56 0 1 1-3.12 0 1.56 1.56 0 0 1 3.12 0z"/>
      </svg>
    ),
  },
};

export default function SongCard({ song, onSave, onDelete, platform = "spotify" }) {
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleSave = async () => {
    setSaving(true);
    await onSave(song);
    setSaving(false);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      // Pause all other audios on the page first
      document.querySelectorAll("audio").forEach(a => { if (a !== audio) a.pause(); });
      audio.play();
      setPlaying(true);
    }
  };

  const p = PLATFORMS[platform] || PLATFORMS.spotify;
  const externalUrl = p.url(song.title || "", song.artist || "");

  return (
    <li style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
      borderRadius: 14, background: "var(--card)",
      border: "1px solid rgba(196,165,140,0.2)", marginBottom: 8, listStyle: "none",
      transition: "background 0.2s, border-color 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.borderColor = "rgba(196,165,140,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.borderColor = "rgba(196,165,140,0.2)"; }}
    >
      {/* Album Art */}
      {song.albumArt
        ? <img src={song.albumArt} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
        : <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#e8a87c,#e8909a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎵</div>
      }

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.82rem", margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {song.title || "Unknown Title"}
        </p>
        <p style={{ color: "var(--text-light)", fontSize: "0.72rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {song.artist || "Unknown Artist"}
          {song.moodTag && (
            <span style={{
              marginLeft: 6, fontSize: "0.65rem",
              background: `${MOOD_COLORS[song.moodTag] || "#c4a882"}18`,
              color: MOOD_COLORS[song.moodTag] || "#c4a882",
              padding: "1px 7px", borderRadius: 20,
            }}>
              {MOOD_EMOJI[song.moodTag] || "🎵"} {song.moodTag}
            </span>
          )}
        </p>

        {/* Hidden audio element — controlled by play button */}
        {song.previewUrl && (
          <audio
            ref={audioRef}
            src={song.previewUrl}
            onEnded={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
            style={{ display: "none" }}
          />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>

        {/* Play / Pause */}
        {song.previewUrl && (
          <button onClick={togglePlay} style={{
            padding: "4px 11px", borderRadius: 20, fontSize: "0.7rem", cursor: "pointer",
            border: `1px solid ${playing ? "rgba(232,168,124,0.6)" : "rgba(159,122,234,0.4)"}`,
            background: playing ? "rgba(232,168,124,0.18)" : "rgba(159,122,234,0.1)",
            color: playing ? "#c4956a" : "#9f7aea",
            fontWeight: 700, transition: "all 0.2s", whiteSpace: "nowrap",
          }}>
            {playing ? "⏸" : "▶"}
          </button>
        )}

        {/* Platform link */}
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          padding: "4px 11px", borderRadius: 20, fontSize: "0.7rem", textDecoration: "none",
          border: `1px solid ${p.border}`, background: p.bg, color: p.color,
          fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.2s",
        }}>
          {p.icon} {p.label}
        </a>

        {/* Save */}
        {onSave && (
          <button onClick={handleSave} disabled={saving} style={{
            padding: "4px 11px", borderRadius: 20, fontSize: "0.7rem",
            cursor: saving ? "not-allowed" : "pointer",
            border: "1px solid rgba(232,168,124,0.5)", background: "rgba(232,168,124,0.12)",
            color: "#c4956a", fontWeight: 700, opacity: saving ? 0.5 : 1, transition: "all 0.2s",
          }}>
            {saving ? "..." : "+ Save"}
          </button>
        )}

        {/* Delete */}
        {onDelete && (
          <button onClick={() => onDelete(song._id)} style={{
            padding: "4px 11px", borderRadius: 20, fontSize: "0.7rem", cursor: "pointer",
            border: "1px solid rgba(232,144,154,0.4)", background: "rgba(232,144,154,0.08)",
            color: "#d08090", fontWeight: 700, transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(232,144,154,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(232,144,154,0.08)"}
          >
            ✕
          </button>
        )}
      </div>
    </li>
  );
}
