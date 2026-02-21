import SongCard from "./SongCard";

export default function PlaylistSection({ playlist, onDelete, loading, platform }) {
  if (loading) return (
    <div>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 64, borderRadius: 14, background: "rgba(255,255,255,0.5)", marginBottom: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
    </div>
  );

  if (!playlist.length) return (
    <div style={{ textAlign: "center", padding: "32px 16px", color: "#c4a882" }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🎵</div>
      <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>No songs yet.<br />Add some vibes above!</p>
    </div>
  );

  return (
    <ul style={{ padding: 0, margin: 0 }}>
      {playlist.map(s => (
        <SongCard key={s._id} song={s} onDelete={onDelete} platform={platform} />
      ))}
    </ul>
  );
}
