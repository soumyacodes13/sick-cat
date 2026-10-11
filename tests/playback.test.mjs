import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import { PlaybackManager } from "../client/src/services/playbackManager.js";

// Mock YouTube Player factory
function createMockYTPlayer() {
  return {
    playVideoCalls: 0,
    pauseVideoCalls: 0,
    stopVideoCalls: 0,
    destroyCalls: 0,
    loadedVideos: [],
    cuedVideos: [],
    seekCalls: [],
    currentTime: 10,
    duration: 200,

    playVideo() {
      this.playVideoCalls++;
    },
    pauseVideo() {
      this.pauseVideoCalls++;
    },
    stopVideo() {
      this.stopVideoCalls++;
    },
    destroy() {
      this.destroyCalls++;
    },
    loadVideoById(id) {
      this.loadedVideos.push(id);
    },
    cueVideoById(id) {
      this.cuedVideos.push(id);
    },
    seekTo(seconds, allowSeekAhead) {
      this.seekCalls.push({ seconds, allowSeekAhead });
    },
    getCurrentTime() {
      return this.currentTime;
    },
    getDuration() {
      return this.duration;
    },
  };
}

// Mock HTML5 Audio element
function createMockAudio(src = "https://example.com/audio.mp3") {
  return {
    src,
    paused: true,
    currentTime: 0,
    duration: 180,
    playCalls: 0,
    pauseCalls: 0,
    listeners: new Map(),

    addEventListener(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    },

    dispatchEvent(event) {
      const cbs = this.listeners.get(event) || [];
      cbs.forEach((cb) => cb());
    },

    play() {
      this.playCalls++;
      this.paused = false;
      this.dispatchEvent("playing");
      return Promise.resolve();
    },

    pause() {
      this.pauseCalls++;
      this.paused = true;
      this.dispatchEvent("pause");
    },
  };
}

// Mock MediaSession API
function setupMockMediaSession() {
  const actionHandlers = new Map();
  const mediaSessionMock = {
    metadata: null,
    playbackState: "none",
    positionState: null,
    setActionHandler(action, handler) {
      actionHandlers.set(action, handler);
    },
    setPositionState(state) {
      this.positionState = state;
    },
  };

  Object.defineProperty(globalThis.navigator, "mediaSession", {
    value: mediaSessionMock,
    configurable: true,
    writable: true,
  });

  globalThis.window = {
    MediaMetadata: class {
      constructor(data) {
        Object.assign(this, data);
      }
    },
  };

  return actionHandlers;
}

describe("Single Playback Engine & Audio Coordination (PRD / ytbug.md)", () => {
  let manager;
  let mockPlayer;

  beforeEach(() => {
    manager = new PlaybackManager();
    mockPlayer = createMockYTPlayer();
    manager.setPlayer(mockPlayer);
  });

  test("FR-1: Exactly one authoritative player instance exists and is reused", () => {
    const track1 = { _id: "1", title: "Song 1", artist: "Artist 1", youtubeVideoId: "yt1" };
    manager.playTrack(track1);

    assert.strictEqual(manager.getPlayer(), mockPlayer);
    assert.strictEqual(mockPlayer.loadedVideos.length, 1);
    assert.strictEqual(mockPlayer.loadedVideos[0], "yt1");

    // Opening Now Playing or navigating must not create or assign a second player
    const samePlayer = manager.getPlayer();
    assert.strictEqual(samePlayer, mockPlayer);
    assert.strictEqual(mockPlayer.destroyCalls, 0);
  });

  test("FR-2: Repeated Play clicks on the active track toggle play/pause without creating duplicates", () => {
    const track = { _id: "track-123", title: "Starlit Reverie", artist: "Budiarti", youtubeVideoId: "vid_123" };
    
    // 1st click: starts playing
    manager.playTrack(track);
    manager.handleYTStateChange(1); // simulate YT.PlayerState.PLAYING
    assert.strictEqual(manager.getState().isPlaying, true);

    // 2nd click on same track: toggles to pause
    manager.playTrack(track);
    assert.strictEqual(mockPlayer.pauseVideoCalls, 1);
    assert.strictEqual(mockPlayer.loadedVideos.length, 1); // Not reloaded!

    // Simulate pause event from YT
    manager.handleYTStateChange(2); // YT.PlayerState.PAUSED
    assert.strictEqual(manager.getState().isPlaying, false);

    // 3rd click on same track: toggles back to play
    manager.playTrack(track);
    assert.strictEqual(mockPlayer.playVideoCalls, 1);
    assert.strictEqual(mockPlayer.loadedVideos.length, 1); // Not reloaded or duplicated!
  });

  test("FR-2 & FR-4: Switching tracks stops previous track and reuses player with loadVideoById", () => {
    const track1 = { _id: "1", title: "Track One", artist: "Artist", youtubeVideoId: "vid1" };
    const track2 = { _id: "2", title: "Track Two", artist: "Artist", youtubeVideoId: "vid2" };

    manager.playTrack(track1);
    manager.handleYTStateChange(1);
    assert.strictEqual(manager.getState().activeTrack.youtubeVideoId, "vid1");

    // Switch to track 2
    manager.playTrack(track2);
    // Previous video must have been stopped
    assert.strictEqual(mockPlayer.stopVideoCalls, 1);
    // Second video loaded in the SAME player
    assert.strictEqual(mockPlayer.loadedVideos.length, 2);
    assert.strictEqual(mockPlayer.loadedVideos[1], "vid2");
    assert.strictEqual(manager.getState().activeTrack.youtubeVideoId, "vid2");
  });

  test("FR-3: Playing a preview audio pauses YouTube immediately", () => {
    const track = { _id: "1", title: "Live Track", artist: "Artist", youtubeVideoId: "live_vid" };
    manager.playTrack(track);
    manager.handleYTStateChange(1);
    assert.strictEqual(manager.getState().isPlaying, true);

    // User starts 30-second HTML5 preview on any SongCard
    const previewAudio = createMockAudio("https://preview.mp3");
    manager.onPreviewStart(previewAudio);

    // YouTube player must have received pauseVideo()
    assert.strictEqual(mockPlayer.pauseVideoCalls, 1);
    assert.strictEqual(manager.getState().isPlaying, false);
    assert.strictEqual(manager.getState().playerState, "paused");
  });

  test("FR-3: Starting YouTube playback pauses active preview audio", () => {
    const previewAudio = createMockAudio("https://preview.mp3");
    previewAudio.play();
    manager.onPreviewStart(previewAudio);
    assert.strictEqual(previewAudio.paused, false);

    // YouTube playback resumes/starts
    manager.play();
    assert.strictEqual(mockPlayer.playVideoCalls, 1);

    // Preview audio must have been paused
    assert.strictEqual(previewAudio.paused, true);
    assert.strictEqual(previewAudio.pauseCalls >= 1, true);
  });

  test("FR-3: Switching between previews pauses previously playing preview", () => {
    const preview1 = createMockAudio("https://preview1.mp3");
    const preview2 = createMockAudio("https://preview2.mp3");

    manager.onPreviewStart(preview1);
    preview1.play();
    assert.strictEqual(preview1.paused, false);

    // User clicks preview on a different song card
    manager.onPreviewStart(preview2);
    preview2.play();

    assert.strictEqual(preview1.paused, true);
    assert.strictEqual(preview1.pauseCalls >= 1, true);
    assert.strictEqual(preview2.paused, false);
  });

  test("FR-2: Mini-player and Now Playing state synchronization via subscribers", () => {
    const track = { _id: "sync-1", title: "Sync Song", artist: "Sync Artist", youtubeVideoId: "sync_vid" };
    let miniPlayerState = null;
    let nowPlayingState = null;

    const unsubMini = manager.subscribe((state) => {
      miniPlayerState = state;
    });
    const unsubNow = manager.subscribe((state) => {
      nowPlayingState = state;
    });

    manager.playTrack(track);
    assert.strictEqual(miniPlayerState.activeTrack.title, "Sync Song");
    assert.strictEqual(nowPlayingState.activeTrack.title, "Sync Song");

    manager.handleYTStateChange(1); // PLAYING
    assert.strictEqual(miniPlayerState.isPlaying, true);
    assert.strictEqual(nowPlayingState.isPlaying, true);

    // Toggle play from MiniPlayer
    manager.togglePlay();
    assert.strictEqual(mockPlayer.pauseVideoCalls, 1);

    manager.handleYTStateChange(2); // PAUSED
    assert.strictEqual(miniPlayerState.isPlaying, false);
    assert.strictEqual(nowPlayingState.isPlaying, false);

    unsubMini();
    unsubNow();
  });

  test("FR-4: Rapid track switching stops previous tracks and only plays latest", () => {
    const trackA = { _id: "A", title: "Song A", artist: "A", youtubeVideoId: "vidA" };
    const trackB = { _id: "B", title: "Song B", artist: "B", youtubeVideoId: "vidB" };
    const trackC = { _id: "C", title: "Song C", artist: "C", youtubeVideoId: "vidC" };

    manager.playTrack(trackA);
    manager.playTrack(trackB);
    manager.playTrack(trackC);

    // Must have stopped previous tracks
    assert.strictEqual(mockPlayer.stopVideoCalls, 2);
    assert.strictEqual(mockPlayer.loadedVideos.length, 3);
    assert.strictEqual(mockPlayer.loadedVideos[2], "vidC");
    assert.strictEqual(manager.getState().activeTrack.youtubeVideoId, "vidC");
  });

  test("FR-1 & FR-4: Cleanup and destroy properly destroys player and resets state", () => {
    const track = { _id: "clean", title: "Clean Song", artist: "Clean Artist", youtubeVideoId: "clean_vid" };
    const preview = createMockAudio();
    manager.playTrack(track);
    manager.onPreviewStart(preview);

    manager.destroy();

    assert.strictEqual(mockPlayer.destroyCalls, 1);
    assert.strictEqual(manager.getPlayer(), null);
    assert.strictEqual(manager.getState().activeTrack, null);
    assert.strictEqual(manager.getState().isPlaying, false);
    assert.strictEqual(preview.paused, true);
  });

  test("Error handling: YouTube API errors update state gracefully", () => {
    const track = { _id: "err", title: "Restricted Song", artist: "Artist", youtubeVideoId: "err_vid" };
    manager.playTrack(track);

    manager.handleYTError(150); // Embed restricted
    assert.strictEqual(manager.getState().isPlaying, false);
    assert.strictEqual(manager.getState().playerState, "error");
    assert.match(manager.getState().errorMessage, /cannot be embedded/i);
  });
});

describe("Reliable Background Audio & Media Session (Phase 1 & Phase 3 PRD)", () => {
  let manager;
  let mockPlayer;
  let mockAudio;
  let actionHandlers;

  beforeEach(() => {
    actionHandlers = setupMockMediaSession();
    manager = new PlaybackManager();
    mockPlayer = createMockYTPlayer();
    mockAudio = createMockAudio();
    manager.setPlayer(mockPlayer);
    manager.initAudioElement(mockAudio);
  });

  test("Phase 1: Direct audio stream plays via HTML5 Audio and populates Media Session metadata", () => {
    const bgTrack = {
      _id: "bg-1",
      title: "Chill Stream",
      artist: "LoFi Creator",
      albumArt: "https://example.com/art.jpg",
      streamUrl: "https://example.com/stream.mp3",
      playbackProvider: "audio",
      duration: 300,
    };

    manager.playTrack(bgTrack);

    // Audio element loaded and played
    assert.strictEqual(mockAudio.src, "https://example.com/stream.mp3");
    assert.strictEqual(mockAudio.playCalls, 1);
    assert.strictEqual(manager.getState().activeProvider, "audio");
    assert.strictEqual(manager.getState().isPlaying, true);

    // Media Session metadata populated
    assert.ok(globalThis.navigator.mediaSession.metadata);
    assert.strictEqual(globalThis.navigator.mediaSession.metadata.title, "Chill Stream");
    assert.strictEqual(globalThis.navigator.mediaSession.metadata.artist, "LoFi Creator");
    assert.strictEqual(globalThis.navigator.mediaSession.playbackState, "playing");
  });

  test("Phase 1: Lock-screen media session actions (play, pause, next, previous, seekto) control playback", () => {
    const bgTrack = {
      _id: "bg-2",
      title: "Meditation",
      artist: "Ambient",
      streamUrl: "https://example.com/ambient.mp3",
      playbackProvider: "audio",
    };

    let nextTriggered = false;
    let prevTriggered = false;
    manager.setOnNext(() => { nextTriggered = true; });
    manager.setOnPrevious(() => { prevTriggered = true; });

    manager.playTrack(bgTrack);

    // Lock screen Pause action
    const pauseHandler = actionHandlers.get("pause");
    assert.ok(pauseHandler);
    pauseHandler();
    assert.strictEqual(mockAudio.pauseCalls, 1);
    assert.strictEqual(globalThis.navigator.mediaSession.playbackState, "paused");

    // Lock screen Play action
    const playHandler = actionHandlers.get("play");
    assert.ok(playHandler);
    playHandler();
    assert.strictEqual(mockAudio.playCalls, 2);
    assert.strictEqual(globalThis.navigator.mediaSession.playbackState, "playing");

    // Lock screen Next action
    const nextHandler = actionHandlers.get("nexttrack");
    assert.ok(nextHandler);
    nextHandler();
    assert.strictEqual(nextTriggered, true);

    // Lock screen Previous action
    const prevHandler = actionHandlers.get("previoustrack");
    assert.ok(prevHandler);
    prevHandler();
    assert.strictEqual(prevTriggered, true);

    // Lock screen SeekTo action
    const seekHandler = actionHandlers.get("seekto");
    assert.ok(seekHandler);
    seekHandler({ seekTime: 45 });
    assert.strictEqual(mockAudio.currentTime, 45);
    assert.strictEqual(manager.getState().currentTime, 45);
  });

  test("Phase 3: Source exclusivity between Direct Audio and YouTube engines", () => {
    const bgTrack = {
      _id: "audio-1",
      title: "Direct Stream Track",
      artist: "Audio Artist",
      streamUrl: "https://example.com/audio.mp3",
      playbackProvider: "audio",
    };
    const ytTrack = {
      _id: "yt-1",
      title: "YouTube Video Track",
      artist: "YT Artist",
      youtubeVideoId: "yt_video_123",
      playbackProvider: "youtube",
    };

    // 1. Start direct audio stream
    manager.playTrack(bgTrack);
    assert.strictEqual(manager.getState().activeProvider, "audio");
    assert.strictEqual(mockAudio.playCalls, 1);
    assert.strictEqual(mockPlayer.loadedVideos.length, 0);

    // 2. Switch to YouTube track -> must pause direct audio stream!
    manager.playTrack(ytTrack);
    assert.strictEqual(mockAudio.pauseCalls, 1);
    assert.strictEqual(manager.getState().activeProvider, "youtube");
    assert.strictEqual(mockPlayer.loadedVideos.length, 1);
    assert.strictEqual(mockPlayer.loadedVideos[0], "yt_video_123");

    // 3. Switch back to direct audio stream -> must stop YouTube video!
    manager.playTrack(bgTrack);
    assert.strictEqual(mockPlayer.stopVideoCalls, 1);
    assert.strictEqual(manager.getState().activeProvider, "audio");
    assert.strictEqual(mockAudio.playCalls, 2);
  });

  test("Phase 3: Position state updates sync with MediaSession timeline", () => {
    manager.updateProgress(120, 360);
    assert.ok(globalThis.navigator.mediaSession.positionState);
    assert.strictEqual(globalThis.navigator.mediaSession.positionState.position, 120);
    assert.strictEqual(globalThis.navigator.mediaSession.positionState.duration, 360);
  });
});
