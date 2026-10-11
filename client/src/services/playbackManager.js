/**
 * PlaybackManager
 * Centralized, authoritative playback engine and lifecycle coordinator.
 * Guarantees that at most one audio source (YouTube or HTML5 audio preview)
 * is playing at any time across the entire application.
 */

export class PlaybackManager {
  constructor() {
    this.player = null;
    this.activeTrack = null;
    this.isPlaying = false;
    this.playerState = "unstarted"; // 'unstarted' | 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'
    this.errorMessage = null;
    this.activePreviewAudio = null;
    this.listeners = new Set();
    this.onTrackEndedCallback = null;
    this.currentTime = 0;
    this.duration = 0;
  }

  // Subscribe React components to playback updates
  subscribe(listener) {
    this.listeners.add(listener);
    // Emit immediate state
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
      isPlaying: this.isPlaying,
      playerState: this.playerState,
      errorMessage: this.errorMessage,
      currentTime: this.currentTime,
      duration: this.duration,
    };
  }

  // Set the single authoritative YT.Player instance
  setPlayer(player) {
    this.player = player;
  }

  getPlayer() {
    return this.player;
  }

  setOnTrackEnded(callback) {
    this.onTrackEndedCallback = callback;
  }

  // Coordinate previews: stop all HTML5 audio elements across the document
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

  // Called when any HTML5 preview starts playing
  onPreviewStart(audioElement) {
    // 1. Starting a preview must pause YouTube playback immediately
    if (this.player && typeof this.player.pauseVideo === "function") {
      try {
        this.player.pauseVideo();
      } catch {
        // Ignored
      }
    }
    this.isPlaying = false;
    this.playerState = "paused";

    // 2. Pause any previous preview audio
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

  // Called when a preview audio stops or finishes
  onPreviewEnd(audioElement) {
    if (this.activePreviewAudio === audioElement) {
      this.activePreviewAudio = null;
    }
  }

  // Imperative Play command
  play() {
    // Starting YouTube playback must pause all active previews first
    this.stopAllPreviews();

    if (this.player && typeof this.player.playVideo === "function") {
      try {
        this.player.playVideo();
      } catch (err) {
        console.error("Failed to play video:", err);
      }
    }
  }

  // Imperative Pause command
  pause() {
    if (this.player && typeof this.player.pauseVideo === "function") {
      try {
        this.player.pauseVideo();
      } catch (err) {
        console.error("Failed to pause video:", err);
      }
    }
  }

  // Toggle Play/Pause on the single authoritative player
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Seek to specific time in seconds
  seekTo(seconds) {
    if (this.player && typeof this.player.seekTo === "function") {
      try {
        this.player.seekTo(seconds, true);
        this.currentTime = seconds;
        this.notify();
      } catch {
        // Ignored
      }
    }
  }

  // Update playback time progress
  updateProgress(currentTime, duration) {
    this.currentTime = currentTime || 0;
    this.duration = duration || 0;
    this.notify();
  }

  // Request to play a track
  playTrack(track) {
    if (!track) return;

    // FR-2: Check if clicking the currently active track
    const isSameTrack =
      this.activeTrack &&
      ((track._id && this.activeTrack._id && track._id === this.activeTrack._id) ||
        (track.youtubeVideoId &&
          this.activeTrack.youtubeVideoId &&
          track.youtubeVideoId === this.activeTrack.youtubeVideoId) ||
        (track.title === this.activeTrack.title && track.artist === this.activeTrack.artist));

    if (isSameTrack) {
      // Toggle play/pause instead of recreating or restarting
      this.togglePlay();
      return;
    }

    // FR-3 & FR-4: Stop all preview audio and stop previous YouTube track
    this.stopAllPreviews();
    if (this.activeTrack && this.player && typeof this.player.stopVideo === "function") {
      try {
        this.player.stopVideo();
      } catch {
        // Ignored
      }
    }

    this.activeTrack = track;
    this.errorMessage = null;
    this.currentTime = 0;
    this.duration = 0;

    if (track.youtubeVideoId) {
      if (this.player && typeof this.player.loadVideoById === "function") {
        // Reuse existing single player instance
        try {
          this.player.loadVideoById(track.youtubeVideoId);
          this.playerState = "loading";
          this.isPlaying = true;
          this.notify();
        } catch (err) {
          console.error("Error loading video in existing player:", err);
          this.playerState = "error";
          this.isPlaying = false;
          this.errorMessage = "Failed to load track.";
          this.notify();
        }
      } else {
        // Player will be initialized by the single YouTubePlayer component
        this.playerState = "loading";
        this.isPlaying = true;
        this.notify();
      }
    } else {
      this.isPlaying = false;
      this.playerState = "unstarted";
      this.notify();
    }
  }

  // Handle YouTube Player onStateChange events
  handleYTStateChange(data, YT) {
    const states = YT?.PlayerState || {
      PLAYING: 1,
      PAUSED: 2,
      ENDED: 0,
      BUFFERING: 3,
      CUED: 5,
    };

    if (data === states.PLAYING) {
      // YouTube is now playing: guarantee all preview audio elements are stopped
      this.stopAllPreviews();
      this.isPlaying = true;
      this.playerState = "playing";
      this.notify();
    } else if (data === states.PAUSED) {
      this.isPlaying = false;
      this.playerState = "paused";
      this.notify();
    } else if (data === states.ENDED) {
      this.isPlaying = false;
      this.playerState = "ended";
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
    this.isPlaying = false;
    this.playerState = "error";

    if (errorCode === 101 || errorCode === 150) {
      this.errorMessage = "This video cannot be embedded on external sites by request of the creator.";
    } else if (errorCode === 100) {
      this.errorMessage = "This video is unavailable or has been removed.";
    } else {
      this.errorMessage = "Unable to play video on this device.";
    }

    this.notify();
  }

  // Complete cleanup / destroy
  destroy() {
    this.stopAllPreviews();
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
    this.notify();
  }
}

// Export singleton instance for the app
export const playbackManager = new PlaybackManager();
export default playbackManager;
