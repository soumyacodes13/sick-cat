# Task: Redesign Sick Cat UI to Match the Provided Music App Reference

## Objective

Redesign the existing Sick Cat music application to closely match the attached reference image. Use the image as the primary visual specification, not merely as inspiration.

The target is a premium, dark, mobile-first music streaming interface with deep black/plum backgrounds, pink and violet gradients, rounded album artwork, compact song lists, pill-shaped filters, and a polished playback experience.

**Remove the cat theme completely.** The finished application should feel like a standalone music product with its own neutral music identity.

## 1. Inspect Before Implementing

Before changing code:

- Inspect the current React/Vite frontend, routing, existing components, styling system, and responsive layouts.
- Identify the current dashboard, song cards, music library, search, mood discovery, navigation, and player components.
- Reuse existing functionality and components where practical.
- Determine how the supplied reference maps to the current application's screens.
- Avoid unnecessary dependencies, backend changes, or architectural refactoring.

Do not stop after producing a design plan. Implement the UI changes.

## 2. Match the Reference Image

Reproduce the reference's visual language as closely as possible.

### Color and atmosphere
- Use a near-black background with subtle deep-plum tones.
- Use pink, magenta, violet, and occasional warm peach gradients as accents.
- Create soft ambient gradients behind featured artwork and the expanded player.
- Maintain strong contrast and a premium, low-clutter appearance.
- Avoid excessive glassmorphism, bright solid-color panels, or generic dashboard styling.

### Shapes and typography
- Use consistent rounded album artwork and softly rounded cards.
- Use pill-shaped filter chips and compact, unobtrusive controls.
- Use a clean sans-serif typeface with clear hierarchy.
- Keep secondary text muted but readable.
- Match the reference's compact spacing and restrained iconography.

### Screen A: Home / Discover
Implement a home screen following the first phone in the reference:

- Compact top bar with app identity, search, and relevant existing actions.
- Personalized greeting or a concise music-focused heading.
- Horizontally arranged filter chips, such as All, New Releases, Trending, and Top.
- A featured discovery card with prominent artwork, a gradient background, and a play action.
- A trending or curated music section with compact artwork thumbnails and song metadata.
- A daily playlists or recommended music section using the existing application's available data.
- Fixed bottom navigation on mobile, with clear active-state styling.

Use real data already available in the application. Do not invent playlists, listening history, user names, or recommendations that the backend does not support.

### Screen B: Now Playing
Implement an expanded player following the second phone:

- Large centered album artwork.
- A background gradient derived visually from the artwork where practical; a tasteful fallback is acceptable.
- Song title and artist information with clear typography.
- A progress bar and timestamps when playback duration and progress are available.
- Minimal previous, play/pause, and next controls where supported.
- Additional controls only when the existing application supports them.
- A compact, polished layout with generous space around the artwork.

Preserve the actual playback implementation. Do not fake playback progress or add nonfunctional controls.

### Screen C: Music Library
Implement a library screen following the third phone:

- Compact header and library title.
- Horizontally scrollable filter chips for available library categories.
- Song rows with rounded thumbnails, titles, artist names, and unobtrusive play actions.
- Consistent row heights and spacing.
- A compact floating or bottom playback bar when a song is active.
- Clear selected and active states.

Use existing saved songs and playlist functionality. Do not build a new backend library system.

## 3. Responsive Behavior

The reference is mobile-first, but the existing web application must also work well on desktop.

- On mobile, use a compact top bar, horizontally scrollable chips, a two-dimensional card layout where appropriate, and fixed bottom navigation.
- On desktop, adapt the same visual system to the available width using a restrained sidebar or suitable navigation layout.
- Keep song lists readable and artwork proportions consistent.
- Prevent content from being obscured by fixed navigation or the player.
- Support narrow screens without horizontal page overflow.
- Keep controls comfortably tappable.

Do not simply stretch the mobile design across desktop.

## 4. Player Presentation and YouTube Compliance

The player should feel integrated into the music app, not like a large embedded video page.

- Use a compact persistent player and an expanded now-playing screen.
- Keep playback state synchronized with the actual player.
- Preserve YouTube branding, required controls, and minimum player dimensions wherever applicable.
- Do not conceal, crop, or cover an active YouTube player to simulate unsupported audio-only playback.
- Ensure compact/expanded transitions do not unnecessarily stop playback.
- Keep loading, unavailable-video, and playback-error states visually consistent with the design.

## 5. Remove Cat Branding

Remove cat-specific visual and behavioral elements, including:

- Cat mascot and illustrations.
- Cat-themed animations, expressions, happiness or inactivity states.
- Cat-related labels, messages, and controls.
- Cat-specific layout space and styling.

Inspect references before deleting shared components. Remove obsolete files and styles only when they are no longer used.

Replace cat branding with a simple, neutral music identity. Do not introduce a new mascot.

## 6. Preserve Existing Functionality

This is a frontend UI redesign, not a product rewrite.

Preserve existing:
- Authentication and account behavior.
- Song search and results.
- Mood-based music discovery.
- Saved songs and existing playlists.
- Current YouTube and iTunes integrations.
- Existing playback and player state management.
- Existing API contracts and data models.

Do not implement new recommendation algorithms, Spotify OAuth, backend endpoints, database migrations, or unrelated features.

## 7. Implementation Quality

- Follow the project's existing conventions and styling approach.
- Extract reusable UI components where this genuinely reduces duplication.
- Use consistent spacing, typography, radii, and colors.
- Handle loading, empty, error, and missing-artwork states.
- Maintain keyboard accessibility, visible focus states, and semantic controls.
- Avoid hardcoded fake content and nonfunctional buttons.
- Avoid adding dependencies unless clearly necessary.

## 8. Visual Validation

Do not consider the task complete merely because the application builds.

1. Run the application and inspect the actual rendered UI.
2. Compare the home, expanded player, and library screens against the supplied reference image.
3. Test both mobile and desktop viewport sizes.
4. Fix obvious differences in proportions, spacing, artwork sizing, typography, gradients, navigation, and card density.
5. Check for overflow, clipped controls, overlapping fixed elements, and broken existing functionality.
6. Run the available lint, build, and relevant tests.

If browser-based visual inspection is available, use screenshots and iterate until the result is as close to the reference as practical.

## Acceptance Criteria

- The three primary screens clearly follow the reference image's visual system.
- The mobile layout is the priority and feels like a coherent music application.
- Desktop remains polished and functional.
- Cat-specific branding and behavior are removed.
- Existing music functionality continues to work.
- No fake functionality or unsupported audio-only playback behavior is introduced.
- Build and available checks pass.

## Final Report

Summarize:
1. Screens and components changed.
2. Cat-specific elements removed.
3. Existing functionality preserved.
4. Build, lint, and test results.
5. Any remaining visual differences or limitations.

Keep the implementation focused on this redesign.