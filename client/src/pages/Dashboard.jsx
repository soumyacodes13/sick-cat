import { useState, useEffect, useRef } from "react";
import SearchSection from "../components/SearchSection";
import MoodSection from "../components/MoodSection";
import PlaylistSection from "../components/PlaylistSection";
import SongCard from "../components/SongCard";
import CuratedCard from "../components/CuratedCard";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";
import MiniPlayer from "../components/MiniPlayer";
import NowPlayingScreen from "../components/NowPlayingScreen";
import YouTubePlayer from "../components/YouTubePlayer";
import YouTubeResults from "../components/YouTubeResults";
import SoftChat from "../components/SoftChat";
import api from "../services/api";
import playbackManager from "../services/playbackManager";

const DEFAULT_TRENDING = [
  {
    title: "Starlit Reverie",
    artist: "Budiarti",
    albumArt: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    moodTag: "Chill",
  },
  {
    title: "Midnight Confessions",
    artist: "Alexiao",
    albumArt: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    moodTag: "R&B",
  },
  {
    title: "Lost in the Echo",
    artist: "Alexiao",
    albumArt: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    moodTag: "Electronic",
  },
  {
    title: "Letters I Never Sent",
    artist: "Alexiao",
    albumArt: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    moodTag: "Acoustic",
  },
  {
    title: "Breaking the Silence",
    artist: "Alexiao",
    albumArt: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    moodTag: "Ambient",
  },
  {
    title: "Tears on the Vinyl",
    artist: "Alexiao",
    albumArt: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
    moodTag: "Soul",
  },
];

export default function Dashboard({ platform = "spotify" }) {
  // Navigation tabs: 'discover' (Screen A), 'library' (Screen C), 'search', 'mood', 'profile'
  const [activeNav, setActiveNav] = useState("discover");

  // Filter chips in Screen A (Discover)
  const [discoverFilter, setDiscoverFilter] = useState("all");

  // Filter chips in Screen C (My Music / Library)
  const [libraryFilter, setLibraryFilter] = useState("all");

  // Data states
  const [playlist, setPlaylist] = useState([]);
  const [publicPlaylist, setPublicPlaylist] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState(DEFAULT_TRENDING);
  const [playlistLoading, setPlaylistLoading] = useState(false);

  // Playback states synchronized with centralized playbackManager
  const [playbackState, setPlaybackState] = useState(() => playbackManager.getState());
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [candidateSong, setCandidateSong] = useState(null);
  const searchRequestIdRef = useRef(0);

  const activeTrack = playbackState.activeTrack || DEFAULT_TRENDING[0];
  const isPlaying = playbackState.isPlaying;

  const fetchPlaylist = async () => {
    try {
      setPlaylistLoading(true);
      const res = await api.get("/songs");
      setPlaylist(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setPlaylistLoading(false);
    }
  };

  const fetchPublicPlaylist = async () => {
    try {
      const res = await api.get("/songs/public");
      setPublicPlaylist(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlaylist();
    fetchPublicPlaylist();

    // Initialize default active track if empty
    if (!playbackManager.activeTrack) {
      playbackManager.activeTrack = DEFAULT_TRENDING[0];
      playbackManager.notify();
    }

    // Subscribe to playback engine
    const unsubscribe = playbackManager.subscribe((state) => {
      setPlaybackState(state);
    });

    // Auto-advance to next song on completion
    playbackManager.setOnTrackEnded(() => {
      handleNextTrack();
    });

    // Fetch initial trending songs from search
    api.get("/songs/search?q=indie chill")
      .then(res => {
        if (res.data?.length > 0) {
          setTrendingSongs(res.data);
        }
      })
      .catch(() => {});

    return unsubscribe;
  }, []);

  const saveSong = async (song) => {
    try {
      await api.post("/songs", {
        title: song.title,
        artist: song.artist,
        albumArt: song.albumArt,
        previewUrl: song.previewUrl,
        moodTag: song.moodTag || "",
        youtubeVideoId: song.youtubeVideoId || null,
        youtubeVideoTitle: song.youtubeVideoTitle || null,
        youtubeChannelTitle: song.youtubeChannelTitle || null,
        playbackProvider: song.playbackProvider || "youtube",
      });
      fetchPlaylist();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving song");
    }
  };

  const deleteSong = async (id) => {
    try {
      await api.delete(`/songs/${id}`);
      setPlaylist(prev => prev.filter(s => s._id !== id));
      if (activeTrack?._id === id) {
        playbackManager.destroy();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaySong = async (song) => {
    const currentTrack = playbackManager.activeTrack;
    const isSameTrack = currentTrack && (
      (song._id && currentTrack._id && song._id === currentTrack._id) ||
      (song.title === currentTrack.title && song.artist === currentTrack.artist)
    );

    if (isSameTrack) {
      // Toggle play/pause without creating duplicate players or restarting track
      playbackManager.togglePlay();
      return;
    }

    if (song.youtubeVideoId) {
      playbackManager.playTrack(song);
      return;
    }

    // Match via YouTube Data API with race condition protection
    const currentReq = ++searchRequestIdRef.current;
    try {
      const query = `${song.title || ""} ${song.artist || ""}`.trim();
      const res = await api.get(`/songs/youtube-search?q=${encodeURIComponent(query)}`);
      if (currentReq !== searchRequestIdRef.current) return; // Stale request, discard

      const match = res.data?.[0];
      if (match) {
        const fullTrack = {
          ...song,
          youtubeVideoId: match.videoId,
          youtubeVideoTitle: match.title,
          youtubeChannelTitle: match.channelTitle,
        };
        playbackManager.playTrack(fullTrack);

        if (song._id) {
          api.put(`/songs/${song._id}`, {
            youtubeVideoId: match.videoId,
            youtubeVideoTitle: match.title,
            youtubeChannelTitle: match.channelTitle,
          }).then(() => fetchPlaylist()).catch(e => console.error(e));
        }
      } else {
        playbackManager.playTrack({ ...song, youtubeVideoId: null });
      }
    } catch (err) {
      if (currentReq !== searchRequestIdRef.current) return;
      console.error("Match error:", err);
      playbackManager.playTrack({ ...song, youtubeVideoId: null });
    }
  };

  const handleSelectCandidate = (candidate) => {
    if (!candidateSong) return;
    const fullTrack = {
      ...candidateSong,
      youtubeVideoId: candidate.videoId,
      youtubeVideoTitle: candidate.title,
      youtubeChannelTitle: candidate.channelTitle,
    };
    playbackManager.playTrack(fullTrack);
    setCandidateSong(null);

    if (candidateSong._id) {
      api.put(`/songs/${candidateSong._id}`, {
        youtubeVideoId: candidate.videoId,
        youtubeVideoTitle: candidate.title,
        youtubeChannelTitle: candidate.channelTitle,
      }).then(() => fetchPlaylist()).catch(e => console.error(e));
    }
  };

  const handleNextTrack = () => {
    const list = playlist.length > 0 ? playlist : trendingSongs;
    const current = playbackManager.activeTrack;
    const currentIndex = list.findIndex(s => s.title === current?.title);
    const nextSong = list[(currentIndex + 1) % list.length];
    if (nextSong) handlePlaySong(nextSong);
  };

  const handlePreviousTrack = () => {
    const list = playlist.length > 0 ? playlist : trendingSongs;
    const current = playbackManager.activeTrack;
    const currentIndex = list.findIndex(s => s.title === current?.title);
    const prevIndex = currentIndex <= 0 ? list.length - 1 : currentIndex - 1;
    const prevSong = list[prevIndex];
    if (prevSong) handlePlaySong(prevSong);
  };

  // Filtered playlist for Screen C
  const displayLibrarySongs = libraryFilter === "community"
    ? publicPlaylist
    : playlist;

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", color: "var(--text)",
      paddingBottom: 160, position: "relative",
    }}>
      {/* Background ambient mesh gradient */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "60vh",
        background: "radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.16) 0%, rgba(236, 72, 153, 0.1) 32%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Main Container - Mobile-first width (max-w-md on mobile, expands smoothly on desktop) */}
      <div style={{
        maxWidth: 500, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1,
      }}>

        {/* ══════════════════════════════════════════════════
            SCREEN A: HOME / DISCOVER
           ══════════════════════════════════════════════════ */}
        {activeNav === "discover" && (
          <div className="animate-fade-in" style={{ paddingTop: 10 }}>
            {/* Top Bar Header */}
            <TopHeader
              onSearchClick={() => setActiveNav("search")}
              onHeartClick={() => setActiveNav("library")}
            />

            {/* Personalized Greeting */}
            <div style={{ margin: "16px 0 20px" }}>
              <h1 style={{
                margin: 0, fontSize: "clamp(1.75rem, 5vw, 2.1rem)",
                fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em",
              }}>
                Hi, Samantha
              </h1>
            </div>

            {/* Filter Pill Chips */}
            <div style={{
              display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10,
              marginBottom: 24, scrollbarWidth: "none",
            }}>
              {[
                { id: "all", label: "All" },
                { id: "new-release", label: "New Release" },
                { id: "trending", label: "Trending" },
                { id: "top-chart", label: "Top Chart" },
              ].map(chip => {
                const isActive = discoverFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setDiscoverFilter(chip.id)}
                    style={{
                      padding: "8px 20px", borderRadius: 9999, border: "none",
                      background: isActive ? "#d2f83d" : "rgba(255, 255, 255, 0.07)",
                      color: isActive ? "#000000" : "#948ea1",
                      fontWeight: isActive ? 800 : 600, fontSize: "0.82rem",
                      cursor: "pointer", whiteSpace: "nowrap",
                      boxShadow: isActive ? "0 4px 14px rgba(210, 248, 61, 0.35)" : "none",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Curated & Trending Section */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                margin: "0 0 14px", fontSize: "1.08rem", fontWeight: 800,
                color: "#ffffff", letterSpacing: "-0.01em",
              }}>
                Curated & trending
              </h2>
              <CuratedCard
                featuredSong={trendingSongs[0]}
                onPlay={handlePlaySong}
              />
            </div>

            {/* Top Daily Playlists / Trending List */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 14,
              }}>
                <h2 style={{
                  margin: 0, fontSize: "1.08rem", fontWeight: 800,
                  color: "#ffffff", letterSpacing: "-0.01em",
                }}>
                  Top daily playlists
                </h2>
                <button
                  onClick={() => setActiveNav("library")}
                  style={{
                    background: "none", border: "none", color: "#948ea1",
                    fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  See all
                </button>
              </div>

              <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                {trendingSongs.map((song, i) => (
                  <SongCard
                    key={i}
                    song={song}
                    onSave={saveSong}
                    platform={platform}
                    onPlay={handlePlaySong}
                    activeTrack={activeTrack}
                    isPlayingTrack={isPlaying}
                    onChooseVersion={(s) => setCandidateSong(s)}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SCREEN C: MY MUSIC / LIBRARY
           ══════════════════════════════════════════════════ */}
        {activeNav === "library" && (
          <div className="animate-fade-in" style={{ paddingTop: 10 }}>
            {/* Top Bar Header */}
            <TopHeader
              title="My Music"
              showBack
              onBack={() => setActiveNav("discover")}
              onOptionsClick={() => {}}
            />

            {/* Library Filter Pills */}
            <div style={{
              display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10,
              margin: "14px 0 24px", scrollbarWidth: "none",
            }}>
              {[
                { id: "all", label: "All" },
                { id: "playlists", label: "Playlists" },
                { id: "liked", label: "Liked Songs" },
                { id: "community", label: "Community" },
              ].map(chip => {
                const isActive = libraryFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setLibraryFilter(chip.id)}
                    style={{
                      padding: "8px 20px", borderRadius: 9999, border: "none",
                      background: isActive ? "#d2f83d" : "rgba(255, 255, 255, 0.07)",
                      color: isActive ? "#000000" : "#948ea1",
                      fontWeight: isActive ? 800 : 600, fontSize: "0.82rem",
                      cursor: "pointer", whiteSpace: "nowrap",
                      boxShadow: isActive ? "0 4px 14px rgba(210, 248, 61, 0.35)" : "none",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Library Song List */}
            <PlaylistSection
              playlist={displayLibrarySongs}
              onDelete={deleteSong}
              loading={playlistLoading}
              platform={platform}
              onPlay={handlePlaySong}
              activeTrack={activeTrack}
              isPlayingTrack={isPlaying}
              onChooseVersion={(s) => setCandidateSong(s)}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SEARCH VIEW
           ══════════════════════════════════════════════════ */}
        {activeNav === "search" && (
          <div className="animate-fade-in" style={{ paddingTop: 10 }}>
            <TopHeader
              title="Search"
              showBack
              onBack={() => setActiveNav("discover")}
            />
            <div style={{ marginTop: 14 }}>
              <SearchSection
                onSave={saveSong}
                platform={platform}
                onPlay={handlePlaySong}
                activeTrack={activeTrack}
                isPlayingTrack={isPlaying}
                onChooseVersion={(s) => setCandidateSong(s)}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            MOOD DISCOVERY VIEW
           ══════════════════════════════════════════════════ */}
        {activeNav === "mood" && (
          <div className="animate-fade-in" style={{ paddingTop: 10 }}>
            <TopHeader
              title="Mood Discovery"
              showBack
              onBack={() => setActiveNav("discover")}
            />
            <div style={{ marginTop: 14 }}>
              <MoodSection
                onSave={saveSong}
                platform={platform}
                onPlay={handlePlaySong}
                activeTrack={activeTrack}
                isPlayingTrack={isPlaying}
                onChooseVersion={(s) => setCandidateSong(s)}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            PROFILE / ACCOUNT VIEW
           ══════════════════════════════════════════════════ */}
        {activeNav === "profile" && (
          <div className="animate-fade-in" style={{ paddingTop: 10 }}>
            <TopHeader
              title="Profile"
              showBack
              onBack={() => setActiveNav("discover")}
            />
            <div style={{
              background: "rgba(255, 255, 255, 0.05)", borderRadius: 24,
              padding: "24px", marginTop: 20, textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                alt=""
                style={{ width: 72, height: 72, borderRadius: "50%", margin: "0 auto 14px", objectFit: "cover" }}
              />
              <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800 }}>Samantha</h3>
              <p style={{ margin: "0 0 20px", fontSize: "0.8rem", color: "#948ea1" }}>Music Enthusiast</p>

              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("guestId");
                    window.location.href = "/login";
                  }}
                  style={{
                    padding: "8px 20px", borderRadius: 9999, border: "1px solid rgba(244, 63, 94, 0.3)",
                    background: "rgba(244, 63, 94, 0.12)", color: "#f43f5e",
                    fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          SINGLE AUTHORITATIVE YOUTUBE PLAYER INSTANCE
          (Never duplicated; transitions seamlessly between PiP and expanded)
         ══════════════════════════════════════════════════ */}
      {activeTrack && (
        <YouTubePlayer
          track={activeTrack}
          isExpanded={showNowPlaying}
          showVideo={showVideo}
          onToggleVideo={() => setShowVideo(v => !v)}
          onExpand={() => {
            setShowNowPlaying(true);
            setShowVideo(true);
          }}
          onClose={() => {
            playbackManager.destroy();
          }}
          onFindAlternative={(s) => setCandidateSong(s)}
        />
      )}

      {/* ══════════════════════════════════════════════════
          FLOATING MINI PLAYER (Screen C bottom pill)
         ══════════════════════════════════════════════════ */}
      {activeTrack && (
        <MiniPlayer
          track={activeTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => playbackManager.togglePlay()}
          onNext={handleNextTrack}
          onExpand={() => setShowNowPlaying(true)}
        />
      )}

      {/* ══════════════════════════════════════════════════
          SCREEN B: EXPANDED NOW PLAYING MODAL
         ══════════════════════════════════════════════════ */}
      {showNowPlaying && activeTrack && (
        <NowPlayingScreen
          track={activeTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => playbackManager.togglePlay()}
          onPrevious={handlePreviousTrack}
          onNext={handleNextTrack}
          onClose={() => setShowNowPlaying(false)}
          onChooseVersion={(s) => setCandidateSong(s)}
          showVideo={showVideo}
          onToggleVideo={() => setShowVideo(v => !v)}
          currentTime={playbackState.currentTime}
          duration={playbackState.duration}
          onSeek={(seconds) => playbackManager.seekTo(seconds)}
        />
      )}

      {/* ══════════════════════════════════════════════════
          CANDIDATE VERSION SELECTOR MODAL
         ══════════════════════════════════════════════════ */}
      {candidateSong && (
        <YouTubeResults
          song={candidateSong}
          onSelect={handleSelectCandidate}
          onClose={() => setCandidateSong(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════
          FLOATING CAPSULE BOTTOM NAVIGATION
         ══════════════════════════════════════════════════ */}
      <BottomNav
        activeTab={activeNav}
        onChangeTab={(tab) => {
          setActiveNav(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}