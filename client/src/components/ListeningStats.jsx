export default function ListeningStats({ playlist, catHappiness, catMode }) {
  const MOOD_EMOJI = { happy: "😄", calm: "😌", chaotic: "🌪️", sad: "😢", focus: "🎯" };
  const MOOD_COLOR = { happy: "#fbbf24", calm: "#22d3ee", chaotic: "#f43f5e", sad: "#818cf8", focus: "#34d399" };

  const moodCounts = {};
  (playlist || []).forEach(s => {
    if (s.moodTag) moodCounts[s.moodTag] = (moodCounts[s.moodTag] || 0) + 1;
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const hasSongs = playlist && playlist.length > 0;
  const happinessColor = catHappiness > 70 ? "#4ade80" : catHappiness > 40 ? "#fbbf24" : "#f87171";

  const cardStyle = {
    background: "var(--card)", borderRadius: 16, padding: "16px",
    border: "1px solid var(--border)",
    boxShadow: "0 2px 12px rgba(180,140,110,0.08)",
  };

  return (
    <div style={cardStyle}>
      <p style={{ fontSize: "0.7rem", color: "var(--text-mid)", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
        📊 Your Stats
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Song count — always shown */}
        {hasSongs ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-mid)" }}>🎵 Total saved</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text)" }}>{playlist.length} tracks</span>
            </div>

            {topMood && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-mid)" }}>🎭 Fav mood</span>
                <span style={{
                  fontSize: "0.75rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                  background: `${MOOD_COLOR[topMood[0]] || "#c4a882"}22`,
                  color: MOOD_COLOR[topMood[0]] || "#7c6a5e",
                  border: `1px solid ${MOOD_COLOR[topMood[0]] || "#c4a882"}55`,
                }}>
                  {MOOD_EMOJI[topMood[0]] || "🎵"} {topMood[0]}
                </span>
              </div>
            )}

            {Object.entries(moodCounts).length > 0 && (
              <div>
                {Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([mood, count]) => (
                  <div key={mood} style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>{MOOD_EMOJI[mood]} {mood}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(196,165,140,0.2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 4,
                        width: `${(count / playlist.length) * 100}%`,
                        background: MOOD_COLOR[mood] || "#c4a882",
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: "0.78rem", color: "#c4a882", textAlign: "center", padding: "4px 0" }}>
            Add songs to see your stats 🎵
          </p>
        )}

        {/* Cat happiness — only when cat mode is on */}
        {catMode && (
          <>
            <div style={{ height: 1, background: "rgba(196,165,140,0.15)" }} />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-mid)" }}>🐾 Cat happiness</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: happinessColor }}>{catHappiness}%</span>
              </div>
              <div style={{ height: 7, background: "rgba(196,165,140,0.2)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${catHappiness}%`,
                  background: `linear-gradient(90deg, ${happinessColor}, ${happinessColor}99)`,
                  transition: "width 0.8s ease",
                }} />
              </div>
              <p style={{ fontSize: "0.68rem", color: "#c4a882", marginTop: 4 }}>
                {catHappiness > 80 ? "Purring with joy 😻" : catHappiness > 50 ? "Content and cozy 😸" : "Needs more music 😿"}
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
