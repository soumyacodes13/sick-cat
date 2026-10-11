import { useEffect, useRef, useState } from "react";

// Safe script loader for YouTube IFrame API
function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    // If script is already inserted, wait for callback
    const existingScript = document.getElementById("youtube-iframe-api-script");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve(window.YT);
    };
  });
}

export default function YouTubePlayer({ track, onPlayingChange, onClose, onFindAlternative }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [playerState, setPlayerState] = useState("loading"); // loading, ready, playing, paused, error
  const [errorMessage, setErrorMessage] = useState(null);
  const [showVideo, setShowVideo] = useState(true);

  const videoId = track?.youtubeVideoId;

  useEffect(() => {
    let isMounted = true;
    if (!videoId) return;

    setErrorMessage(null);
    setPlayerState("loading");

    loadYouTubeAPI().then((YT) => {
      if (!isMounted || !containerRef.current) return;

      // Clean up previous player instance if any
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) { console.error(e); }
        playerRef.current = null;
      }

      try {
        const player = new YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: () => {
              if (!isMounted) return;
              setPlayerState("ready");
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              // YT.PlayerState: PLAYING (1), PAUSED (2), ENDED (0), BUFFERING (3)
              if (event.data === YT.PlayerState.PLAYING) {
                setPlayerState("playing");
                onPlayingChange?.(true);
              } else if (event.data === YT.PlayerState.PAUSED) {
                setPlayerState("paused");
                onPlayingChange?.(false);
              } else if (event.data === YT.PlayerState.ENDED) {
                setPlayerState("ready");
                onPlayingChange?.(false);
              } else if (event.data === YT.PlayerState.BUFFERING) {
                setPlayerState("buffering");
              }
            },
            onError: (event) => {
              if (!isMounted) return;
              onPlayingChange?.(false);
              // Error codes:
              // 2: Invalid video ID
              // 5: HTML5 player error
              // 100: Video not found or private
              // 101, 150: Embedding disabled by owner
              if (event.data === 101 || event.data === 150) {
                setErrorMessage("This video cannot be embedded on external sites by request of the creator.");
              } else if (event.data === 100) {
                setErrorMessage("This video is unavailable or has been removed.");
              } else {
                setErrorMessage("Unable to play video on this device.");
              }
              setPlayerState("error");
            },
          },
        });
        playerRef.current = player;
      } catch (err) {
        console.error("Failed to initialize YouTube player:", err);
        setErrorMessage("Error initializing player.");
        setPlayerState("error");
      }
    });

    return () => {
      isMounted = false;
      onPlayingChange?.(false);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) { console.error(e); }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    try {
      if (playerState === "playing") {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (e) { console.error(e); }
  };

  const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track?.title || ""} ${track?.artist || ""}`)}`;

  if (!track) return null;

  return (
    <div className="cozy-card fi3" style={{
      background: "var(--card)", border: "1.5px solid var(--border)",
      borderRadius: 18, padding: "16px 18px",
      boxShadow: "0 6px 20px rgba(180,140,40,0.12)",
      marginBottom: 16, transition: "all 0.3s ease",
    }}>
      {/* Top bar: Track info and controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: showVideo && !errorMessage ? 12 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
          {track.albumArt ? (
            <img src={track.albumArt} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#ff0000,#cc0000)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18 }}>
              ▶
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#ff0000", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="12" height="10" viewBox="0 0 24 24" fill="#ff0000">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube Playback
              </span>
              {playerState === "buffering" && <span style={{ fontSize: "0.68rem", color: "var(--text-light)" }}>· Buffering...</span>}
              {playerState === "loading" && <span style={{ fontSize: "0.68rem", color: "var(--text-light)" }}>· Connecting...</span>}
            </div>
            <p style={{ color: "var(--text)", fontWeight: 800, fontSize: "0.88rem", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {track.title || "Unknown Song"}
            </p>
            <p style={{ color: "var(--text-light)", fontSize: "0.74rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {track.artist || "Unknown Artist"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {!errorMessage && (
            <button onClick={togglePlayPause} style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #e8a87c, #e8909a)",
              color: "white", fontSize: 14, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(232,168,124,0.35)",
              transition: "transform 0.15s",
            }}
              title={playerState === "playing" ? "Pause" : "Play"}
            >
              {playerState === "playing" ? "⏸" : "▶"}
            </button>
          )}

          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
            padding: "5px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700,
            textDecoration: "none", border: "1px solid rgba(255,0,0,0.3)",
            background: "rgba(255,0,0,0.06)", color: "#e11d48",
            display: "flex", alignItems: "center", gap: 4,
          }}
            title="Open on YouTube"
          >
            ↗ YouTube
          </a>

          {!errorMessage && (
            <button onClick={() => setShowVideo(v => !v)} style={{
              background: "none", border: "1px solid var(--border)",
              borderRadius: 20, padding: "4px 8px", fontSize: "0.68rem",
              color: "var(--text-mid)", cursor: "pointer", fontWeight: 700,
            }}>
              {showVideo ? "Hide Video" : "Show Video"}
            </button>
          )}

          {onClose && (
            <button onClick={onClose} style={{
              background: "none", border: "none",
              color: "var(--text-light)", cursor: "pointer", fontSize: 16,
              padding: "4px 6px",
            }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Error state with fallback */}
      {errorMessage && (
        <div style={{
          marginTop: 10, padding: "12px 14px", borderRadius: 12,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          color: "#b91c1c", fontSize: "0.78rem",
        }}>
          <p style={{ margin: "0 0 8px", fontWeight: 700 }}>⚠️ {errorMessage}</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
              padding: "5px 12px", borderRadius: 20, background: "#ef4444",
              color: "white", textDecoration: "none", fontWeight: 800, fontSize: "0.72rem",
            }}>
              Listen on YouTube Directly ↗
            </a>
            {onFindAlternative && (
              <button onClick={() => onFindAlternative(track)} style={{
                padding: "5px 12px", borderRadius: 20, background: "var(--card)",
                border: "1px solid var(--border)", color: "var(--text)",
                cursor: "pointer", fontWeight: 700, fontSize: "0.72rem",
              }}>
                Choose Another Version 🔄
              </button>
            )}
          </div>
        </div>
      )}

      {/* Official YouTube embedded iframe container */}
      <div style={{
        display: showVideo && !errorMessage ? "block" : "none",
        position: "relative",
        paddingTop: "56.25%", // 16:9 Aspect Ratio
        borderRadius: 14,
        overflow: "hidden",
        background: "#000",
        marginTop: 6,
      }}>
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
