import SongCard from "./SongCard";

export default function PlaylistSection({
  playlist,
  onDelete,
  loading,
  platform,
  onPlay,
  activeTrack,
  isPlayingTrack,
  onChooseVersion,
}) {
  if (loading) return (
    <div>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            height: 64, borderRadius: 16, background: "rgba(255, 255, 255, 0.04)",
            marginBottom: 8, animation: "pulseGlow 1.4s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );

  if (!playlist.length) return (
    <div style={{ textAlign: "center", padding: "48px 16px", color: "#948ea1" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🎶</div>
      <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>Your library is quiet</p>
      <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#6b6577" }}>Search for songs or moods to save them to your music library.</p>
    </div>
  );

  return (
    <ul style={{ padding: 0, margin: 0 }}>
      {playlist.map(s => (
        <SongCard
          key={s._id}
          song={s}
          onDelete={onDelete}
          platform={platform}
          onPlay={onPlay}
          activeTrack={activeTrack}
          isPlayingTrack={isPlayingTrack}
          onChooseVersion={onChooseVersion}
        />
      ))}
    </ul>
  );
}
