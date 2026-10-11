/**
 * PlaybackManager
 * Centralized, authoritative playback engine, provider adapter, and lifecycle coordinator.
 * 
 * Supports:
 * 1. Background-capable Direct Audio Engine (HTML5 Audio + Media Session API for Android screen-off playback)
 * 2. Embedded YouTube Engine (for compliant foreground video playback)
 * 3. Bidirectional audio coordination and source exclusivity (at most ONE source active at any time)
 * 4. System lock-screen and notification controls via navigator.mediaSession
 */

export class PlaybackManager {
  constructor() {
    this.player = null; // YouTube player instance
    this.audioElement = null; // Direct HTML5 Audio instance for background playback
    this.activeTrack = null;
    this.activeProvider = "youtube"; // 'audio' | 'youtube'
    this.isPlaying = false;
    this.playerState = "unstarted"; // 'unstarted' | 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'
    this.errorMessage = null;
    this.activePreviewAudio = null;
    this.listeners = new Set();
    this.onTrackEndedCallback = null;
    this.onNextCallback = null;
    this.onPreviousCallback = null;
    this.currentTime = 0;
    this.duration = 0;

    // Lazily initialize direct HTML5 audio element if in browser
    if (typeof window !== "undefined" && typeof Audio !== "undefined") {
      this.initAudioElement();
    }
  }

  // Initialize the dedicated background HTML5 audio element
  initAudioElement(customAudio) {
    if (customAudio) {
      this.audioElement = customAudio;
      return;
    }
    if (this.audioElement || typeof Audio === "undefined") return;

    try {
      const audio = new Audio();
      audio.preload = "auto";

      audio.addEventListener("playing", () => {
        this.isPlaying = true;
        this.playerState = "playing";
        this.updateMediaSessionState();
        this.notify();
      });

      audio.addEventListener("pause", () => {
        // Only set paused if audio is the active provider
        if (this.activeProvider === "audio") {
          this.isPlaying = false;
          this.playerState = "paused";
          this.updateMediaSessionState();
          this.notify();
        }
      });

      audio.addEventListener("ended", () => {
        if (this.activeProvider === "audio") {
          this.isPlaying = false;
          this.playerState = "ended";
          this.updateMediaSessionState();
          this.notify();
          if (typeof this.onTrackEndedCallback === "function") {
            this.onTrackEndedCallback();
          }
        }
      });

      audio.addEventListener("timeupdate", () => {
        if (this.activeProvider === "audio") {
          this.currentTime = audio.currentTime || 0;
          this.duration = audio.duration || 0;
          this.notify();
          this.updateMediaSessionPosition();
        }
      });

      audio.addEventListener("error", () => {
        if (this.activeProvider === "audio") {
          this.isPlaying = false;
          this.playerState = "error";
          this.errorMessage = "Unable to load audio stream.";
          this.updateMediaSessionState();
          this.notify();
        }
      });

      this.audioElement = audio;
    } catch {
      // Audio element initialization fallback
    }
  }

  // Subscribe React components to playback updates
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error("Error in playback subscriber:", err);
      }
    });
  }

  getState() {
    return {
      activeTrack: this.activeTrack,
      activeProvider: this.activeProvider,
      isPlaying: this.isPlaying,
      playerState: this.playerState,
      errorMessage: this.errorMessage,
      currentTime: this.currentTime,
      duration: this.duration,
    };
  }

  setPlayer(player) {
    this.player = player;
  }

  getPlayer() {
    return this.player;
  }

  getAudioElement() {
    return this.audioElement;
  }

  setOnTrackEnded(callback) {
    this.onTrackEndedCallback = callback;
  }

  setOnNext(callback) {
    this.onNextCallback = callback;
  }

  setOnPrevious(callback) {
    this.onPreviousCallback = callback;
  }

  // ══════════════════════════════════════════════════
  // Media Session API Integration (Android Screen-Off)
  // ══════════════════════════════════════════════════
  updateMediaSession(track) {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (!track) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }

    try {
      const artworkUrl = track.albumArt || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
      
      if (typeof window.MediaMetadata !== "undefined") {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: track.title || "Unknown Title",
          artist: track.artist || "Unknown Artist",
          album: track.moodTag ? `${track.moodTag} Vibes` : "Sick Cat Music",
          artwork: [
            { src: artworkUrl, sizes: "96x96", type: "image/jpeg" },
            { src: artworkUrl, sizes: "128x128", type: "image/jpeg" },
            { src: artworkUrl, sizes: "192x192", type: "image/jpeg" },
            { src: artworkUrl, sizes: "256x256", type: "image/jpeg" },
            { src: artworkUrl, sizes: "512x512", type: "image/jpeg" },
          ],
        });
      }

      this.updateMediaSessionState();

      // Register system action handlers for lock-screen controls
      const actionHandlers = [
        ["play", () => this.play()],
        ["pause", () => this.pause()],
        ["previoustrack", () => this.previous()],
        ["nexttrack", () => this.next()],
        ["seekto", (details) => {
          if (details && typeof details.seekTime === "number") {
            this.seekTo(details.seekTime);
          }
        }],
        ["stop", () => this.destroy()],
      ];

      for (const [action, handler] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch {
          // Unsupported action on current browser
        }
      }
    } catch {
      // Ignored
    }
  }

  updateMediaSessionState() {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = this.isPlaying ? "playing" : "paused";
    } catch {
      // Ignored
    }
  }

  updateMediaSessionPosition() {
    if (
      typeof window === "undefined" ||
      !("mediaSession" in navigator) ||
      !("setPositionState" in navigator.mediaSession)
    ) {
      return;
    }
    try {
      if (this.duration > 0 && this.currentTime >= 0 && this.currentTime <= this.duration) {
        navigator.mediaSession.setPositionState({
          duration: this.duration,
          playbackRate: 1,
          position: Math.min(this.currentTime, this.duration),
        });
      }
    } catch {
      // Ignored
    }
  }

  // ══════════════════════════════════════════════════
  // Audio Exclusivity & Previews
  // ══════════════════════════════════════════════════
  stopAllPreviews() {
    if (this.activePreviewAudio) {
      try {
        if (!this.activePreviewAudio.paused) {
          this.activePreviewAudio.pause();
        }
      } catch {
        // Ignored
      }
      this.activePreviewAudio = null;
    }

    if (typeof document !== "undefined") {
      try {
        const audioEls = document.querySelectorAll("audio");
        audioEls.forEach((audio) => {
          // Don't stop our background playback audio element
          if (this.audioElement && audio === this.audioElement) return;
          try {
            if (!audio.paused) {
              audio.pause();
              audio.currentTime = 0;
            }
          } catch {
            // Ignored
          }
        });
      } catch {
        // Ignored
      }
    }
  }

  onPreviewStart(audioElement) {
    // Starting a preview must pause any active track (YouTube or background audio)
    this.pause();
    this.isPlaying = false;
    this.playerState = "paused";

    if (this.activePreviewAudio && this.activePreviewAudio !== audioElement) {
      try {
        if (!this.activePreviewAudio.paused) {
          this.activePreviewAudio.pause();
        }
      } catch {
        // Ignored
      }
    }

    this.activePreviewAudio = audioElement;
    this.notify();
  }

  onPreviewEnd(audioElement) {
    if (this.activePreviewAudio === audioElement) {
      this.activePreviewAudio = null;
    }
  }

  // ══════════════════════════════════════════════════
  // Playback Adapter Operations
  // ══════════════════════════════════════════════════
  play() {
    this.stopAllPreviews();
    this.isPlaying = true;
    this.playerState = "playing";

    if (this.activeProvider === "audio") {
      if (this.audioElement && typeof this.audioElement.play === "function") {
        this.audioElement.play().catch((err) => {
          console.error("Failed to play audio stream:", err);
        });
      }
    } else {
      if (this.player && typeof this.player.playVideo === "function") {
        try {
          this.player.playVideo();
        } catch (err) {
          console.error("Failed to play YouTube video:", err);
        }
      }
    }

    this.updateMediaSessionState();
    this.notify();
  }

  pause() {
    if (this.activeProvider === "audio") {
      if (this.audioElement && typeof this.audioElement.pause === "function") {
        try {
          this.audioElement.pause();
        } catch {
          // Ignored
        }
      }
    } else {
      if (this.player && typeof this.player.pauseVideo === "function") {
        try {
          this.player.pauseVideo();
        } catch {
          // Ignored
        }
      }
    }

    this.isPlaying = false;
    this.playerState = "paused";
    this.updateMediaSessionState();
    this.notify();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seekTo(seconds) {
    const sec = Math.max(0, seconds);
    this.currentTime = sec;

    if (this.activeProvider === "audio") {
      if (this.audioElement) {
        try {
          this.audioElement.currentTime = sec;
        } catch {
          // Ignored
        }
      }
    } else {
      if (this.player && typeof this.player.seekTo === "function") {
        try {
          this.player.seekTo(sec, true);
        } catch {
          // Ignored
        }
      }
    }

    this.updateMediaSessionPosition();
    this.notify();
  }

  next() {
    if (typeof this.onNextCallback === "function") {
      this.onNextCallback();
    } else if (typeof this.onTrackEndedCallback === "function") {
      this.onTrackEndedCallback();
    }
  }

  previous() {
    if (typeof this.onPreviousCallback === "function") {
      this.onPreviousCallback();
    }
  }

  updateProgress(currentTime, duration) {
    this.currentTime = currentTime || 0;
    this.duration = duration || 0;
    this.updateMediaSessionPosition();
    this.notify();
  }

  // ══════════════════════════════════════════════════
  // Play Track Routing (Direct Audio Stream vs YouTube)
  // ══════════════════════════════════════════════════
  playTrack(track) {
    if (!track) return;

    // Check if clicking the currently active track
    const isSameTrack =
      this.activeTrack &&
      ((track._id && this.activeTrack._id && track._id === this.activeTrack._id) ||
        (track.youtubeVideoId &&
          this.activeTrack.youtubeVideoId &&
          track.youtubeVideoId === this.activeTrack.youtubeVideoId) ||
        (track.streamUrl &&
          this.activeTrack.streamUrl &&
          track.streamUrl === this.activeTrack.streamUrl) ||
        (track.title === this.activeTrack.title && track.artist === this.activeTrack.artist));

    if (isSameTrack) {
      this.togglePlay();
      return;
    }

    // Stop all other audio sources
    this.stopAllPreviews();

    // Check target provider: direct audio stream (background-capable) or YouTube
    const streamUrl = track.streamUrl || track.audioUrl;
    const isAudioProvider = Boolean(streamUrl || track.playbackProvider === "audio");

    if (isAudioProvider && streamUrl) {
      // 1. DIRECT AUDIO STREAM MODE (Screen-off / Background-capable)
      // Stop previous YouTube player if YouTube was the active provider
      if (this.activeProvider === "youtube" && this.activeTrack && this.player && typeof this.player.stopVideo === "function") {
        try {
          this.player.stopVideo();
        } catch {
          // Ignored
        }
      }

      this.activeProvider = "audio";
      this.activeTrack = track;
      this.errorMessage = null;
      this.currentTime = 0;
      this.duration = track.duration || 0;
      this.playerState = "loading";
      this.isPlaying = true;

      this.initAudioElement();
      if (this.audioElement) {
        try {
          this.audioElement.src = streamUrl;
          this.audioElement.currentTime = 0;
          this.audioElement.play().catch((err) => {
            console.warn("Direct audio play error:", err);
          });
        } catch (err) {
          console.error("Failed to load direct audio source:", err);
        }
      }

      this.updateMediaSession(track);
      this.notify();
    } else {
      // 2. YOUTUBE EMBEDDED MODE (Compliant Foreground Playback)
      // Stop direct audio stream if audio was active
      if (this.activeProvider === "audio") {
        if (this.audioElement && typeof this.audioElement.pause === "function") {
          try {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
          } catch {
            // Ignored
          }
        }
      } else if (this.activeTrack && this.player && typeof this.player.stopVideo === "function") {
        // Stop previous YouTube video
        try {
          this.player.stopVideo();
        } catch {
          // Ignored
        }
      }

      this.activeProvider = "youtube";
      this.activeTrack = track;
      this.errorMessage = null;
      this.currentTime = 0;
      this.duration = 0;

      if (track.youtubeVideoId) {
        if (this.player && typeof this.player.loadVideoById === "function") {
          try {
            this.player.loadVideoById(track.youtubeVideoId);
            this.playerState = "loading";
            this.isPlaying = true;
          } catch (err) {
            console.error("Error loading video in existing player:", err);
            this.playerState = "error";
            this.isPlaying = false;
            this.errorMessage = "Failed to load track.";
          }
        } else {
          this.playerState = "loading";
          this.isPlaying = true;
        }
      } else {
        this.isPlaying = false;
        this.playerState = "unstarted";
      }

      this.updateMediaSession(track);
      this.notify();
    }
  }

  // Handle YouTube Player onStateChange events
  handleYTStateChange(data, YT) {
    // Only process if YouTube is the active provider
    if (this.activeProvider !== "youtube") return;

    const states = YT?.PlayerState || {
      PLAYING: 1,
      PAUSED: 2,
      ENDED: 0,
      BUFFERING: 3,
      CUED: 5,
    };

    if (data === states.PLAYING) {
      this.stopAllPreviews();
      this.isPlaying = true;
      this.playerState = "playing";
      this.updateMediaSessionState();
      this.notify();
    } else if (data === states.PAUSED) {
      this.isPlaying = false;
      this.playerState = "paused";
      this.updateMediaSessionState();
      this.notify();
    } else if (data === states.ENDED) {
      this.isPlaying = false;
      this.playerState = "ended";
      this.updateMediaSessionState();
      this.notify();
      if (typeof this.onTrackEndedCallback === "function") {
        this.onTrackEndedCallback();
      }
    } else if (data === states.BUFFERING) {
      this.playerState = "buffering";
      this.notify();
    }
  }

  // Handle YouTube Player onError events
  handleYTError(errorCode) {
    if (this.activeProvider !== "youtube") return;

    this.isPlaying = false;
    this.playerState = "error";

    if (errorCode === 101 || errorCode === 150) {
      this.errorMessage = "This video cannot be embedded on external sites by request of the creator.";
    } else if (errorCode === 100) {
      this.errorMessage = "This video is unavailable or has been removed.";
    } else {
      this.errorMessage = "Unable to play video on this device.";
    }

    this.updateMediaSessionState();
    this.notify();
  }

  // Complete cleanup / destroy
  destroy() {
    this.stopAllPreviews();

    if (this.audioElement && typeof this.audioElement.pause === "function") {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {
        // Ignored
      }
    }

    if (this.player && typeof this.player.destroy === "function") {
      try {
        this.player.destroy();
      } catch {
        // Ignored
      }
    }

    this.player = null;
    this.activeTrack = null;
    this.isPlaying = false;
    this.playerState = "unstarted";
    this.errorMessage = null;
    this.currentTime = 0;
    this.duration = 0;

    this.updateMediaSession(null);
    this.notify();
  }
}

// Export singleton instance for the app
export const playbackManager = new PlaybackManager();
export default playbackManager;
