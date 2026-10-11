# PRD: Single Playback Engine & Audio Overlap Fixes

**Project:** Sick Cat  
**Repository:** `soumyacodes13/sick-cat`  
**Branch:** `feat/youtube-playback`  
**Priority:** P0 — Playback correctness  
**Scope:** Frontend playback lifecycle and audio coordination

## 1. Problem Statement

Multiple audio sources can play simultaneously, causing the same song to overlap with itself or preview audio to continue while a YouTube track is playing.

The current implementation has several contributing issues:

- The Dashboard mounts a background `YouTubePlayer`, while the Now Playing screen can mount another player for the same track.
- Each `YouTubePlayer` instance initializes its own YouTube player with autoplay enabled.
- Song previews pause other HTML audio elements but do not stop YouTube playback.
- Mini-player and Now Playing controls update React state without reliably controlling the actual YouTube player.

## 2. Objective

Guarantee that **only one audio source is actively playing at any time** across the application.

This includes:
- YouTube playback.
- Song preview audio.
- Mini-player controls.
- Expanded Now Playing controls.
- Track changes and screen transitions.

## 3. Functional Requirements

### FR-1: Single YouTube Player Instance

- Ensure only one active `YouTubePlayer` instance exists across Dashboard and Now Playing.
- The Now Playing screen must control or display the existing player instead of mounting a second independent player.
- Keep the player mounted across screen transitions where necessary to preserve playback.
- Destroy or release player resources correctly when the playback session ends or the component genuinely unmounts.
- Changing screens must never create a second player that autoplays the same track.

### FR-2: Centralized Playback State and Commands

- Maintain one authoritative playback state for the active track and its playback status.
- Route play, pause, resume, and track-change actions through the actual YouTube player API.
- Mini-player and Now Playing controls must operate on the same player instance.
- Synchronize UI state with actual YouTube player events, including playing, paused, ended, and errors.
- Repeatedly clicking Play on an already-playing track must not start another playback instance.
- Clicking the active track should toggle its playback state rather than create a duplicate player.

### FR-3: Coordinate Preview Audio with YouTube

- Starting a song preview must pause any currently playing YouTube track.
- Starting YouTube playback must pause all active song previews.
- Starting a different preview must pause any previously playing preview.
- Switching playback sources must not leave the previous source playing in the background.
- Preserve the existing preview functionality and preview controls.

### FR-4: Safe Track Changes and Cleanup

- On track changes, stop or pause the previous playback before starting the new track.
- Prevent stale asynchronous player initialization callbacks from restarting an old track.
- Handle rapid track switching and repeated Play clicks without overlapping playback.
- Ensure component cleanup removes event listeners and destroys obsolete player instances.
- Avoid unnecessary player destruction and recreation when only the UI screen changes.

### FR-5: Autoplay and Initialization

- Do not let multiple player instances autoplay independently.
- Autoplay must be coordinated by the single playback controller.
- Player initialization must not accidentally start playback for a stale track or after the user has paused.
- Preserve intended playback behavior when a user explicitly starts a track.

## 4. Implementation Scope

Inspect and modify only the files necessary to fix the playback lifecycle, expected to include:

- `client/src/pages/Dashboard.jsx`
- `client/src/components/YouTubePlayer.jsx`
- `client/src/components/SongCard.jsx`
- `client/src/components/YouTubeResults.jsx`
- `NowPlayingScreen` and related playback-state code, wherever defined.

A small shared playback controller or context is acceptable if required to ensure a single source of truth.

**Do not** introduce a new music service, rewrite the backend, redesign the interface, change recommendation logic, or perform unrelated refactoring.

## 5. Acceptance Criteria

1. Playing a YouTube track and opening Now Playing does not create a second player or duplicate audio.
2. Clicking Play repeatedly on the same track never causes overlapping playback.
3. Playing a different track stops the previous track before the new one starts.
4. Playing a preview while YouTube is active pauses YouTube first.
5. Starting YouTube playback while a preview is active pauses the preview first.
6. Mini-player and Now Playing Play/Pause controls always reflect and control the actual playback state.
7. Navigating between Dashboard and Now Playing does not interrupt playback unnecessarily or duplicate it.
8. Rapid track changes do not allow an obsolete track to resume.
9. Closing or unmounting playback components does not leave audio playing unexpectedly.
10. Existing search, playlist, queue, and preview functionality continues to work.

## 6. Required Tests

Add or update tests for:

- One player instance when opening Now Playing.
- Repeated Play clicks on the active track.
- Switching between two YouTube tracks.
- Preview-to-YouTube and YouTube-to-preview transitions.
- Mini-player and Now Playing state synchronization.
- Rapid track changes during player initialization.
- Cleanup and unmount behavior.
- YouTube API errors and failed initialization, where practical.

Use mocked YouTube IFrame API and audio elements for deterministic tests. Verify player creation, `playVideo()`, `pauseVideo()`, `stopVideo()`, and `destroy()` calls as appropriate.

## 7. Verification

- Run the relevant frontend tests and lint/type checks available in the repository.
- Build the frontend successfully.
- Manually verify the acceptance criteria in the application if browser testing is available.
- Report any tests that could not be run; do not claim manual reproduction or verification without performing it.

## 8. Completion Report

Provide:
- Root cause addressed.
- Files changed and why.
- Playback lifecycle design implemented.
- Tests added and their results.
- Any remaining edge cases or limitations.

**Definition of Done:** At most one audio source can play at a time, the application has one authoritative YouTube player, and all playback controls operate on the real player state without regressions.