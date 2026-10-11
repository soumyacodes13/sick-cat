# Product Requirements Document (PRD)
## Sick Cat — Free Full-Length Music Playback

**Product:** Sick Cat  
**Website:** https://sick-cat.vercel.app/music  
**Repository:** https://github.com/soumyacodes13/sick-cat  
**Document version:** 1.0  
**Status:** Proposed  
**Priority:** High  
**Primary platform:** Web — desktop and mobile browsers

---

## 1. Executive Summary

Sick Cat currently allows users to discover songs, explore mood-based recommendations, and save songs to a shared playlist. Song discovery uses the iTunes Search API, and the returned `previewUrl` is used for playback.

The limitation is that iTunes provides short preview clips rather than reliable full-length playback.

This feature will introduce **free, full-length playback using the official YouTube embedded player**, without requiring users to subscribe to YouTube Premium for standard eligible embedded videos.

The existing iTunes integration will remain responsible for song metadata and discovery. Sick Cat will identify a matching YouTube video and play it inside the website using YouTube's official player.

The implementation must preserve the current application's design, authentication, mood-based discovery, shared playlist, and existing song-saving behavior.

### Product decision

- **Primary playback provider:** YouTube embedded player.
- **Existing discovery provider:** iTunes Search API.
- **Optional secondary provider:** Spotify links or embeds, subject to Spotify's playback limitations and developer policies.
- **No direct audio extraction:** Sick Cat will not download, extract, proxy, or independently stream YouTube audio.

## 2. Problem Statement

### Current behavior

The backend in `routes/songRoutes.js` calls the iTunes Search API through `/search` and `/mood` endpoints. It returns fields including:

- `title`
- `artist`
- `albumArt`
- `previewUrl`

The frontend's `client/src/components/SongCard.jsx` renders a hidden HTML audio element and uses `previewUrl` for its play/pause button.

The `models/Song.js` Mongoose schema stores the song metadata and preview URL. The saved playlist is served by the existing song routes.

### Problems

1. Users cannot reliably listen to complete songs inside Sick Cat.
2. The current play button is tied to the iTunes preview URL.
3. A song's metadata does not identify a corresponding YouTube video.
4. Saved songs need a persistent playback source so they remain playable after refresh.
5. Unavailable, restricted, or non-embeddable videos need graceful fallback behavior.

### Desired outcome

Users can search for a song, select a matching YouTube result, and listen to the available full-length video from Sick Cat without needing a paid music subscription.

Playback availability is subject to the selected video's restrictions, regional availability, embedding permissions, and YouTube's own playback behavior.

## 3. Goals and Non-Goals

### Goals

- Provide full-length playback when a suitable YouTube video is available.
- Retain iTunes-based search and mood recommendations.
- Preserve the existing shared playlist and save/delete workflows.
- Make it clear which provider is playing the song.
- Avoid requiring YouTube Premium or Spotify Premium for the primary experience.
- Support desktop and mobile browsers.
- Handle unavailable or restricted videos without breaking the page.
- Minimize additional infrastructure and recurring costs.

### Non-goals

- Building a proprietary music-streaming service.
- Downloading or hosting copyrighted music files.
- Extracting audio from YouTube videos.
- Bypassing advertisements, geographic restrictions, or embedding restrictions.
- Guaranteeing that every song has an embeddable full-length version.
- Implementing Spotify OAuth or the Spotify Web Playback SDK in the initial release.
- Replacing the current mood recommendation logic.
- Rebuilding the existing application architecture.

## 4. Target Users and User Stories

### Primary user stories

**US-01: Search and play a song**

As a user, I want to search for a song and play its full-length version so that I can listen without being limited to a short preview.

**US-02: Play a mood recommendation**

As a user, I want songs suggested for my mood to be playable through YouTube so that mood-based discovery remains useful.

**US-03: Save a playable song**

As a user, I want to save a song with its playback source so that I can return to it later.

**US-04: Resume a saved song**

As a user, I want saved songs to retain their selected playback source after refreshing the page.

**US-05: Handle unavailable playback**

As a user, I want to know when a video cannot be played and receive an alternative rather than seeing a broken player.

**US-06: Use Sick Cat on mobile**

As a user, I want the player and controls to work on a mobile browser, including when autoplay is blocked.

## 5. Proposed User Experience

### 5.1 Song discovery

The existing search and mood sections remain unchanged in their primary behavior.

Each result displays:

- Album artwork.
- Song title.
- Artist name.
- Existing mood tag, when applicable.
- A **Play** action.
- A **Save** action.
- An optional **Open on YouTube** action.

The current preview play button will be replaced or adapted to launch the selected YouTube playback.

### 5.2 Playback experience

When the user clicks Play:

1. Sick Cat checks whether the song already has a selected YouTube video ID.
2. If a video ID exists, the application loads it in the embedded player.
3. If no video ID exists, the application starts a YouTube matching flow.
4. The user can select the correct result when multiple versions are available.
5. Once selected, the official YouTube player displays the video and controls.
6. The player remains available while the user navigates the relevant music sections, according to the existing dashboard layout.

The user must explicitly initiate playback. The application must not rely on autoplay to begin audio.

### 5.3 Video selection

Search matching must prioritize:

1. Exact song title and artist match.
2. Official artist or record-label uploads when identifiable.
3. Official music videos or official audio uploads.
4. Other suitable results with a matching title and artist.

The system must not automatically select an unrelated song merely because its title is similar.

If multiple plausible results exist, show a small selection list with the video title, channel, and thumbnail where available.

### 5.4 Player states

The UI must support these states:

- `idle` — no song selected.
- `searching` — finding a YouTube match.
- `ready` — video selected and ready to load.
- `playing` — playback is active.
- `paused` — playback is paused.
- `buffering` — the player is buffering.
- `unavailable` — the video cannot be played.
- `error` — a playback or integration error occurred.

A failed video must not leave the UI permanently showing an active Play state.

### 5.5 Fallback behavior

If YouTube playback cannot be used:

- Show a clear message explaining that the selected video is unavailable.
- Offer another matching YouTube result when possible.
- Offer an **Open on YouTube** link.
- Keep song metadata and save functionality usable.
- Do not silently fall back to the short preview while presenting it as full-length playback.

The existing iTunes preview can remain available as an explicitly labeled optional preview if desired.

## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Preserve existing iTunes song search | P0 |
| FR-02 | Preserve existing mood-based recommendations | P0 |
| FR-03 | Add YouTube video matching for songs | P0 |
| FR-04 | Play selected videos through the official YouTube player | P0 |
| FR-05 | Save the selected YouTube video ID with a song | P0 |
| FR-06 | Restore saved songs with their playback source | P0 |
| FR-07 | Display loading, playing, paused, and error states | P0 |
| FR-08 | Allow users to choose among ambiguous video matches | P1 |
| FR-09 | Provide an external YouTube fallback link | P0 |
| FR-10 | Preserve authenticated save/delete behavior | P0 |
| FR-11 | Ensure only one Sick Cat song player is actively playing at a time where technically feasible | P1 |
| FR-12 | Make the player responsive on desktop and mobile | P0 |
| FR-13 | Retain existing platform search links where useful | P2 |
| FR-14 | Track non-sensitive playback failures for debugging | P2 |

## 7. Technical Design

### 7.1 Existing architecture

The repository currently uses:

- Node.js and Express for the backend.
- React and Vite for the frontend.
- MongoDB and Mongoose for saved songs.
- An existing API service used by the frontend.
- iTunes Search API for song discovery.

The initial implementation should extend these components rather than introduce another backend or database.

### 7.2 YouTube integration approach

Use the official YouTube IFrame Player API to embed and control the selected video.

Official documentation:

- YouTube IFrame Player API: https://developers.google.com/youtube/iframe_api_reference
- Embedded player parameters: https://developers.google.com/youtube/player_parameters

The embedded player must retain YouTube's required functionality, branding, controls, and applicable playback restrictions. It must not be disguised as an audio-only player or modified to circumvent YouTube requirements.

### 7.3 Finding YouTube videos

The preferred automated approach is to use the YouTube Data API `search.list` endpoint from the backend.

Official documentation: https://developers.google.com/youtube/v3/docs/search/list

The frontend sends a search request to Sick Cat's backend. The backend queries YouTube and returns a limited list of candidate videos.

Suggested search query:

`<song title> <artist name> official audio`

Alternative query attempts can be used when the initial results are weak.

The backend should request only the fields required to display and select results, such as:

- Video ID.
- Video title.
- Channel title.
- Thumbnail URL.

The API key must remain on the backend and must never be exposed in frontend source code or API responses.

**Cost and quota:** YouTube Data API usage is subject to quota limits and applicable Google Cloud settings. The implementation must handle quota exhaustion and API errors. If the project should avoid API-key setup entirely, a manual YouTube search-and-select flow can be used as an interim alternative, but it will be less automated.

### 7.4 Frontend changes

#### `client/src/components/SongCard.jsx`

Current responsibility:

- Render song metadata.
- Play the iTunes preview using an HTML audio element.
- Expose save/delete and platform actions.

Required changes:

- Replace the primary Play action with the YouTube playback flow.
- Remove reliance on the hidden audio element for primary full-length playback.
- Keep preview playback separate and optional.
- Add an action to choose or change the associated YouTube video.
- Show appropriate playback status and error feedback.

#### New component: `client/src/components/YouTubePlayer.jsx`

Responsibilities:

- Load the official YouTube IFrame API safely.
- Create and destroy the player instance correctly.
- Accept a validated YouTube video ID.
- Expose play, pause, and player-state events to the parent.
- Report loading and playback errors.
- Clean up event listeners and player instances on unmount.
- Avoid creating duplicate player instances during React re-renders.

#### New component: `client/src/components/YouTubeResults.jsx`

Responsibilities:

- Render candidate video matches.
- Display the title, channel, and thumbnail.
- Let the user select a result.
- Provide loading, empty-result, and error states.

This component may be omitted in the first iteration if a suitable match can be selected automatically with a reliable fallback.

#### `client/src/pages/Dashboard.jsx`

Required changes:

- Manage the selected song and selected video ID.
- Coordinate player state with the existing dashboard.
- Preserve mood, playlist, chat, and cat behavior.
- Ensure playback state updates correctly when a song changes.
- Ensure the cat's listening state is not incorrectly determined solely from hidden HTML audio events, because YouTube playback occurs inside an iframe.

### 7.5 Backend changes

#### `routes/songRoutes.js`

Preserve existing `/search`, `/mood`, `/public`, save, list, and delete endpoints.

Add a YouTube matching endpoint, for example:

`GET /api/songs/youtube-search?q=<song-and-artist>`

Expected behavior:

1. Validate and normalize the search query.
2. Reject empty or excessively long queries.
3. Query the YouTube Data API.
4. Return a small, bounded list of video candidates.
5. Handle quota limits, timeouts, and provider errors.
6. Never return the API key to the client.

If the route is mounted under a different API prefix, use the project's existing routing conventions rather than hardcoding a new prefix.

The endpoint may be public if that matches the current discovery routes, but it must be rate-limited to reduce abuse of the YouTube API quota.

#### Save endpoint

The existing `POST /api/songs` route currently accepts song metadata and `previewUrl`.

Extend it to accept the selected YouTube video ID and provider information. Validate these values before saving.

The existing authentication middleware must remain in place.

### 7.6 Data model changes

Update `models/Song.js` with fields similar to the following:

```js
youtubeVideoId: {
  type: String,
  default: null
},
playbackProvider: {
  type: String,
  enum: ["youtube", "preview"],
  default: "youtube"
},
youtubeVideoTitle: {
  type: String,
  default: null
},
youtubeChannelTitle: {
  type: String,
  default: null
}
```

Keep the existing fields:

- `title`
- `artist`
- `albumArt`
- `previewUrl`
- `moodTag`
- `user`
- timestamps

The video ID is the canonical playback reference. Do not store an extracted stream URL.

The `playbackProvider` field may be omitted if the first release always prefers YouTube and uses the preview only through a separate action.

#### Existing saved songs

Existing MongoDB documents will not contain `youtubeVideoId`. They must continue to load successfully.

For a legacy song:

1. Attempt to find a YouTube match when the user chooses Play.
2. Let the user select a result if matching is ambiguous.
3. Persist the selected ID when the user saves or updates the song.
4. Keep the old preview URL intact for optional preview playback.

A database migration is not required if the new fields are optional.

### 7.7 API response examples

**YouTube search response**

```json
{
  "results": [
    {
      "videoId": "VALIDATED_VIDEO_ID",
      "title": "Example Song - Official Audio",
      "channelTitle": "Example Artist",
      "thumbnailUrl": "https://example.com/thumbnail.jpg"
    }
  ]
}
```

The example is illustrative; production results must come from the provider.

**Saved song additions**

```json
{
  "title": "Example Song",
  "artist": "Example Artist",
  "albumArt": "https://example.com/cover.jpg",
  "previewUrl": null,
  "youtubeVideoId": "VALIDATED_VIDEO_ID",
  "playbackProvider": "youtube"
}
```

Existing fields and authentication behavior must remain compatible with current clients.

### 7.8 Playback implementation rules

- Use a trusted YouTube video ID, not an arbitrary iframe URL supplied by a user.
- Validate the ID format on both frontend and backend.
- Construct the embed URL from the validated ID.
- Use the official player API for playback events and controls.
- Do not automatically play audio on page load.
- Do not remove or hide required YouTube player controls to evade restrictions.
- Do not proxy or download media.
- Treat a successful search result as a candidate, not proof that embedding will work.
- Use actual player events and errors to update the UI.

## 8. Non-Functional Requirements

### Performance

- Existing song search should remain responsive.
- YouTube search should return a bounded result set.
- Avoid loading the YouTube player on every song card.
- Load the player only when playback is requested or the selected song needs it.
- Avoid duplicate API calls when the same song is selected repeatedly.
- Consider short-lived caching of search results to reduce quota usage, subject to YouTube API policies.

### Reliability

- A YouTube API failure must not crash the dashboard.
- A player initialization failure must be recoverable.
- Changing songs must cleanly update the active player.
- Legacy saved songs must continue to render.
- Saving a song must not depend on YouTube playback being currently active.

### Security

- Store the YouTube API key in a backend environment variable.
- Never commit provider secrets to Git.
- Apply input validation and request rate limiting.
- Restrict returned API fields to the minimum necessary.
- Avoid logging access tokens, secrets, or unnecessary user data.
- Preserve existing authentication and authorization behavior for saved songs.

### Accessibility

- All playback actions must be keyboard accessible.
- Buttons must have meaningful accessible labels.
- Player status and errors should be communicated in text.
- The embedded player must meet YouTube's viewport requirements and remain usable on small screens.

### Privacy

- Loading an embedded third-party player can involve requests to YouTube and its associated services.
- The implementation should document third-party embedding in the site's privacy information where applicable.
- If the product later adopts a click-to-load consent or privacy-enhanced approach, evaluate that separately without delaying the core playback feature.

## 9. Error Handling

| Scenario | Expected behavior |
|---|---|
| No YouTube matches | Show “No matching videos found” and offer an external search link |
| YouTube API quota exceeded | Show a temporary unavailability message and offer manual YouTube search |
| Invalid video ID | Reject the ID and do not create the player |
| Video cannot be embedded | Show an unavailable message and allow another selection |
| Network timeout | Show retry action |
| Player fails to initialize | Show an error and external YouTube link |
| Legacy saved song has no video ID | Search for a match when Play is clicked |
| Song save request fails | Preserve the user's selection and show an error |
| User changes songs during playback | Stop or replace the previous selected video |
| Mobile browser blocks autoplay | Require an explicit user interaction |

## 10. Acceptance Criteria

The feature is complete when all P0 criteria pass.

### Discovery

- [ ] Existing iTunes search returns the same essential song metadata.
- [ ] Existing mood recommendations continue to work.
- [ ] Search results can initiate the YouTube matching flow.

### Playback

- [ ] Selecting a valid YouTube result loads the official embedded player.
- [ ] The user can start, pause, and resume playback using supported controls.
- [ ] Playback is not artificially stopped after 30 seconds by Sick Cat.
- [ ] No audio stream is extracted or hosted by Sick Cat.
- [ ] An unavailable video produces a recoverable error state.
- [ ] A user can open the selected song on YouTube as a fallback.

### Persistence

- [ ] New songs can be saved with their selected YouTube video ID.
- [ ] Saved songs retain the ID after refresh.
- [ ] Legacy saved songs without a video ID continue to display and can initiate matching.
- [ ] Existing save/delete authentication behavior remains unchanged.

### User interface

- [ ] The player is usable on desktop and mobile.
- [ ] The existing cozy visual style is preserved.
- [ ] The UI does not show “playing” after a pause, end, or playback error.
- [ ] The player does not create duplicate instances after React re-renders.
- [ ] Existing mood, playlist, and dashboard features remain functional.

### Security and provider requirements

- [ ] The YouTube API key is never exposed to frontend code.
- [ ] Invalid video IDs and invalid search requests are rejected.
- [ ] API failures and quota errors are handled.
- [ ] YouTube's player requirements and applicable developer policies are respected.

## 11. Testing Strategy

### Unit tests

Test:

- Search-query validation.
- YouTube result normalization.
- Video ID validation.
- Legacy song behavior when `youtubeVideoId` is absent.
- Player-state transitions.
- Error-state rendering.
- Save payload validation.

### Backend integration tests

Test:

- YouTube search success.
- Empty search queries.
- YouTube API timeout.
- YouTube API quota failure.
- Invalid provider responses.
- Saving a song with a video ID.
- Saving a legacy-style song without a video ID.
- Existing authentication requirements.
- Existing search, mood, playlist, and delete routes.

Provider API calls should be mocked in automated tests so tests do not consume quota or depend on live network availability.

### Frontend integration tests

Test:

- Search result → YouTube matching → player load.
- User selection between multiple matches.
- Play/pause state updates.
- Song switching.
- Player initialization failure.
- Unavailable-video fallback.
- Save and reload of a playable song.
- Mobile layout and controls.

### Manual testing

Verify at least:

- One known official music video.
- One official audio upload.
- A song with multiple possible matches.
- A video that is unavailable or not embeddable.
- A legacy saved song without a YouTube ID.
- Playback on a desktop browser and a mobile browser.

Do not make tests depend on one specific commercial video remaining available forever.

## 12. Implementation Plan

### Phase 1 — Backend and data model

- Extend `models/Song.js`.
- Add YouTube search endpoint.
- Add environment configuration for the YouTube API key.
- Add validation, bounded results, error handling, and rate limiting.
- Preserve all existing endpoints.

**Deliverable:** The backend returns candidate YouTube videos and accepts a selected video ID when saving a song.

### Phase 2 — Player component

- Create `YouTubePlayer.jsx`.
- Integrate the official IFrame Player API.
- Implement player lifecycle and state events.
- Implement video-ID validation and recoverable errors.

**Deliverable:** A standalone player can load and play a selected video.

### Phase 3 — Search and mood integration

- Update `SongCard.jsx`.
- Update the search and mood flows.
- Add result selection when needed.
- Connect playback state to `Dashboard.jsx`.
- Preserve the existing design and other dashboard behavior.

**Deliverable:** Search and mood results can play through YouTube.

### Phase 4 — Persistence and compatibility

- Save the selected video ID.
- Restore saved songs.
- Handle existing documents without a video ID.
- Preserve preview playback as a separate optional feature.

**Deliverable:** Saved songs remain playable after reload.

### Phase 5 — Validation and rollout

- Run existing tests.
- Add new backend and frontend tests.
- Test unavailable videos and API quota exhaustion.
- Verify the deployed environment variables.
- Deploy to a preview environment before production.

**Deliverable:** A tested release with a documented fallback path.

## 13. Rollout and Monitoring

Roll out the feature without removing the existing iTunes preview capability immediately.

Initially:

1. Keep the current song discovery endpoints unchanged.
2. Enable YouTube playback on search results.
3. Test with existing saved playlists.
4. Monitor non-sensitive error categories, such as API quota errors, player initialization errors, and unavailable-video events.
5. Fix regressions before making YouTube the default action everywhere.

Suggested success metrics:

- Percentage of Play actions that reach a ready player state.
- Percentage of playback attempts that enter the playing state.
- YouTube matching failure rate.
- Average time from clicking Play to player readiness.
- Percentage of saved songs with a selected video ID.
- Regression rate for existing discovery and playlist functionality.

Do not collect more personal listening data than is necessary for product reliability.

## 14. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Video has embedding disabled | Playback fails | Detect the player error and offer alternatives |
| Incorrect video match | Wrong song plays | Show candidate selection when matching is ambiguous |
| YouTube API quota exhausted | New automatic matches fail | Cache appropriately, rate-limit, and provide manual search fallback |
| API key exposed | Quota abuse and security risk | Keep the key exclusively on the backend |
| Existing saved songs lack IDs | Playback needs additional work | Resolve video matches on demand |
| React player lifecycle issues | Duplicate players or stale state | Use a dedicated component with cleanup |
| Mobile autoplay restrictions | Playback does not start automatically | Start playback only after explicit interaction |
| Provider policy changes | Feature behavior may change | Recheck official documentation before significant releases |

## 15. Dependencies and Configuration

The implementation may require:

- A Google Cloud project.
- YouTube Data API v3 enabled, if automatic video search is used.
- A restricted YouTube API key stored in the backend environment.
- An allowed API quota for expected traffic.
- No new database service.
- No Spotify credentials for the initial release.

Use an environment variable such as:

`YOUTUBE_API_KEY=...`

The actual secret must be configured in the deployment environment and local development environment, not committed to the repository.

If API-key setup is not possible, implement manual YouTube search-and-select as the first milestone and add automated matching later.

## 16. Spotify: Future Option

Spotify should not be the primary solution for this requirement.

Spotify's developer policy states that streaming music recordings through its platform is restricted to Premium subscribers. The Web Playback SDK also requires a Premium account, and its use is subject to additional developer terms. Official documentation:

- https://developer.spotify.com/policy
- https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

Spotify links or permitted embeds may still be offered as optional external listening choices, but the UI must not promise free, full-length playback through Spotify for all users.

The first release should focus on YouTube and avoid the additional authentication and playback complexity of Spotify integration.

## 17. Definition of Done

The implementation is ready for release when:

1. Users can discover songs through the existing iTunes integration.
2. Users can find and select matching YouTube videos.
3. Users can play eligible full-length videos through the official embedded player.
4. Saved songs retain their selected YouTube video IDs.
5. Legacy saved songs continue to work.
6. API keys remain secure.
7. Playback errors and unavailable videos have usable fallbacks.
8. Existing dashboard, mood, playlist, and authentication behavior passes regression testing.
9. The feature works on supported desktop and mobile browsers.
10. The release is verified in the deployed environment.

## 18. Open Decisions

The recommended defaults are included below.

| Decision | Recommended default |
|---|---|
| Primary playback provider | YouTube |
| Discovery provider | Existing iTunes Search API |
| Automated matching | YouTube Data API v3 |
| Manual fallback | Search and select on YouTube |
| Player placement | Reuse the existing music result/dashboard experience |
| Saved playback reference | YouTube video ID |
| Legacy saved songs | Resolve on first Play action |
| Spotify integration | Defer |
| iTunes preview | Retain as an explicitly labeled optional preview |
| Release strategy | Incremental rollout with regression tests |

**Final product recommendation:** Implement YouTube embedded playback first. It is the simplest approach that aligns with Sick Cat's requirement for free full-length listening while preserving the existing app architecture and song-discovery experience.
