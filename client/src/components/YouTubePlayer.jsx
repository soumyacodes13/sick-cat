import { useEffect, useRef, useState } from "react";

// Safe script loader for YouTube IFrame API
function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

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

export default function YouTubePlayer({ track, onPlayingChange, onClose, onFindAlternative, isPlaying, onTogglePlay }) {
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

  const youtubeUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track?.title || ""} ${track?.artist || ""}`)}`;

  if (!track) return null;

  return (
    <div style={{
      background: "#161122", border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 20, padding: "16px 18px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
      marginBottom: 20, transition: "all 0.3s ease",
    }}>
      {/* Top bar: Track info and controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: showVideo && !errorMessage ? 14 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
          <img
            src={track.albumArt || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80"}
            alt=""
            style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#d2f83d", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 4 }}>
                ▶ YouTube Live
              </span>
              {playerState === "buffering" && <span style={{ fontSize: "0.68rem", color: "#948ea1" }}>· Buffering…</span>}
              {playerState === "loading" && <span style={{ fontSize: "0.68rem", color: "#948ea1" }}>· Connecting…</span>}
            </div>
            <p style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.88rem", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {track.title || "Unknown Song"}
            </p>
            <p style={{ color: "#948ea1", fontSize: "0.74rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
              background: "#d2f83d", color: "#000000",
              fontSize: 14, fontWeight: 900,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(210, 248, 61, 0.35)",
              transition: "transform 0.15s",
            }}
              title={playerState === "playing" ? "Pause" : "Play"}
            >
              {playerState === "playing" ? "⏸" : "▶"}
            </button>
          )}

          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
            padding: "5px 12px", borderRadius: 9999, fontSize: "0.7rem", fontWeight: 700,
            textDecoration: "none", border: "1px solid rgba(255, 255, 255, 0.15)",
            background: "rgba(255, 255, 255, 0.08)", color: "#ffffff",
            display: "flex", alignItems: "center", gap: 4,
          }}
            title="Open on YouTube"
          >
            ↗ YouTube
          </a>

          {!errorMessage && (
            <button onClick={() => setShowVideo(v => !v)} style={{
              background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 9999, padding: "5px 10px", fontSize: "0.68rem",
              color: "#948ea1", cursor: "pointer", fontWeight: 700,
            }}>
              {showVideo ? "Hide Video" : "Show Video"}
            </button>
          )}

          {onClose && (
            <button onClick={onClose} style={{
              background: "none", border: "none",
              color: "#948ea1", cursor: "pointer", fontSize: 16,
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
          marginTop: 10, padding: "14px 16px", borderRadius: 14,
          background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.25)",
          color: "#fecdd3", fontSize: "0.8rem",
        }}>
          <p style={{ margin: "0 0 10px", fontWeight: 700 }}>⚠️ {errorMessage}</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
              padding: "6px 14px", borderRadius: 9999, background: "#f43f5e",
              color: "#ffffff", textDecoration: "none", fontWeight: 800, fontSize: "0.74rem",
            }}>
              Open on YouTube Directly ↗
            </a>
            {onFindAlternative && (
              <button onClick={() => onFindAlternative(track)} style={{
                padding: "6px 14px", borderRadius: 9999, background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)", color: "#ffffff",
                cursor: "pointer", fontWeight: 700, fontSize: "0.74rem",
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
        background: "#000000",
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
