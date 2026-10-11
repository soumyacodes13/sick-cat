import { useEffect, useRef, useState } from "react";
import playbackManager from "../services/playbackManager";

// Safe script loader for YouTube IFrame API (single promise)
let apiPromise = null;
function loadYouTubeAPI() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const existingScript = document.getElementById("youtube-iframe-api-script");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) {
        try {
          prevCallback();
        } catch {
          // Ignored
        }
      }
      resolve(window.YT);
    };
  });
  return apiPromise;
}

export default function YouTubePlayer({
  track,
  isExpanded = false,
  showVideo = true,
  onToggleVideo,
  onExpand,
  onClose,
  onFindAlternative,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [playbackState, setPlaybackState] = useState(() => playbackManager.getState());
  const progressTimerRef = useRef(null);
  const currentVideoIdRef = useRef(track?.youtubeVideoId);

  const videoId = track?.youtubeVideoId;

  // Keep currentVideoIdRef in sync via effect, avoiding ref write during render
  useEffect(() => {
    currentVideoIdRef.current = videoId;
  }, [videoId]);

  // Subscribe to playbackManager state updates
  useEffect(() => {
    const unsubscribe = playbackManager.subscribe((state) => {
      setPlaybackState(state);
    });
    return unsubscribe;
  }, []);

  // Initialize or update the YouTube player instance
  useEffect(() => {
    let isMounted = true;
    if (!videoId) return;

    loadYouTubeAPI().then((YT) => {
      if (!isMounted || !containerRef.current || !YT) return;

      // If player already exists, load new video instead of destroying and recreating
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.loadVideoById === "function") {
            playerRef.current.loadVideoById(videoId);
          }
        } catch (e) {
          console.error("Error loading video in existing player:", e);
        }
        return;
      }

      // Initialize the ONE player instance
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
            onReady: (event) => {
              if (!isMounted) return;
              // If video changed while initializing, load latest
              if (currentVideoIdRef.current && currentVideoIdRef.current !== videoId) {
                event.target.loadVideoById(currentVideoIdRef.current);
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              playbackManager.handleYTStateChange(event.data, YT);
            },
            onError: (event) => {
              if (!isMounted) return;
              playbackManager.handleYTError(event.data);
            },
          },
        });

        playerRef.current = player;
        playbackManager.setPlayer(player);
      } catch (err) {
        console.error("Failed to initialize YouTube player:", err);
        playbackManager.handleYTError(999);
      }
    });

    return () => {
      // Intentionally keep player alive across screen navigation to prevent duplicate re-initialization
    };
  }, [videoId]);

  // Track progress polling while playing
  useEffect(() => {
    if (playbackState.isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          try {
            const current = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || 0;
            playbackManager.updateProgress(current, dur);
          } catch {
            // Ignored
          }
        }
      }, 500);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [playbackState.isPlaying]);

  // On genuine component unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      playbackManager.destroy();
    };
  }, []);

  if (!track) return null;

  const isPiP = !isExpanded || !showVideo;
  const youtubeUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track?.title || ""} ${track?.artist || ""}`)}`;

  const styleExpanded = {
    position: "fixed",
    top: 76,
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(360px, calc(100vw - 48px))",
    zIndex: 105,
    borderRadius: 20,
    background: "#161122",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 14px 40px rgba(0, 0, 0, 0.7)",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const stylePiP = {
    position: "fixed",
    bottom: 154,
    right: 18,
    width: "min(170px, 42vw)",
    zIndex: 48,
    borderRadius: 12,
    background: "#161122",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6)",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return (
    <div style={isPiP ? stylePiP : styleExpanded} onClick={isPiP ? onExpand : undefined}>
      {/* Header bar only when expanded */}
      {!isPiP && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(255, 255, 255, 0.03)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#d2f83d", letterSpacing: "0.06em" }}>
              ▶ YOUTUBE LIVE
            </span>
            {playbackState.playerState === "buffering" && (
              <span style={{ fontSize: "0.68rem", color: "#948ea1" }}>· Buffering…</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "3px 9px", borderRadius: 9999, fontSize: "0.65rem", fontWeight: 700,
                textDecoration: "none", border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.08)", color: "#ffffff",
              }}
            >
              ↗ YouTube
            </a>
            {onToggleVideo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVideo();
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 9999, padding: "3px 8px", fontSize: "0.65rem",
                  color: "#948ea1", cursor: "pointer", fontWeight: 700,
                }}
              >
                Minimize
              </button>
            )}
            {onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{
                  background: "none", border: "none", color: "#948ea1",
                  cursor: "pointer", fontSize: "0.8rem", padding: "2px 6px",
                }}
                title="Close Player"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 16:9 Video Container with YouTube IFrame */}
      <div style={{ position: "relative", paddingTop: "56.25%", background: "#000000" }}>
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

        {/* PiP expand pill overlay when in mini corner mode */}
        {isPiP && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onExpand?.();
            }}
            style={{
              position: "absolute", top: 4, right: 4,
              background: "rgba(0,0,0,0.75)", color: "#d2f83d",
              fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px",
              borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 3,
              border: "1px solid rgba(210, 248, 61, 0.3)",
              backdropFilter: "blur(4px)",
            }}
            title="Expand Video"
          >
            ↖ Maximize
          </div>
        )}
      </div>

      {/* Error notification banner if video cannot be embedded */}
      {playbackState.errorMessage && !isPiP && (
        <div style={{
          padding: "10px 14px", background: "rgba(244, 63, 94, 0.12)",
          borderTop: "1px solid rgba(244, 63, 94, 0.25)", color: "#fecdd3", fontSize: "0.75rem",
        }}>
          <p style={{ margin: "0 0 8px", fontWeight: 700 }}>⚠️ {playbackState.errorMessage}</p>
          <div style={{ display: "flex", gap: 6 }}>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
              padding: "4px 10px", borderRadius: 9999, background: "#f43f5e",
              color: "#ffffff", textDecoration: "none", fontWeight: 800, fontSize: "0.7rem",
            }}>
              Open on YouTube ↗
            </a>
            {onFindAlternative && (
              <button onClick={() => onFindAlternative(track)} style={{
                padding: "4px 10px", borderRadius: 9999, background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)", color: "#ffffff",
                cursor: "pointer", fontWeight: 700, fontSize: "0.7rem",
              }}>
                Choose Another Version 🔄
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
