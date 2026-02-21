import { useState } from "react";
import CatMascot from "./CatMascot";

const CAT_COLORS = [
  { label: "Caramel", value: "#c4956a", emoji: "🟤" },
  { label: "Ivory", value: "#e8d5b7", emoji: "🟡" },
  { label: "Midnight", value: "#4a4a6a", emoji: "🟣" },
  { label: "Ginger", value: "#e07a3a", emoji: "🟠" },
  { label: "Sage", value: "#7a9e7e", emoji: "🟢" },
  { label: "Dusty Rose", value: "#c4808a", emoji: "🌸" },
  { label: "Storm", value: "#8a9ab0", emoji: "🔵" },
  { label: "Midnight Black", value: "#2d2d3a", emoji: "⚫" },
];

const ACCESSORIES = [
  { label: "None", value: "none", emoji: "❌" },
  { label: "Scarf", value: "scarf", emoji: "🧣" },
  { label: "Headphones", value: "headphones", emoji: "🎧" },
  { label: "Bow Tie", value: "bowtie", emoji: "🎀" },
];

const UNLOCKABLE_ANIMATIONS = [
  { label: "Happy Jump", key: "happy", cost: 0, unlocked: true },
  { label: "Dance Mode", key: "dancing", cost: 0, unlocked: true },
  { label: "Deep Sleep", key: "sleeping", cost: 50, unlocked: false },
  { label: "Super Stretch", key: "stretching", cost: 100, unlocked: false },
  { label: "Sitting Guard", key: "sitting", cost: 150, unlocked: false },
];

export default function CatCustomizer({ catColor, setCatColor, accessory, setAccessory, catHappiness = 10 }) {
  const [previewState, setPreviewState] = useState("idle");
  const [unlocked, setUnlocked] = useState({ happy: true, dancing: true });
  const [points] = useState(420);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,248,240,0.95) 0%, rgba(255,240,250,0.95) 100%)",
      borderRadius: 24, padding: "28px",
      border: "1px solid rgba(196,165,140,0.3)",
      maxWidth: 520, margin: "0 auto",
    }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#7c6a5e", marginBottom: 4, fontFamily: "Nunito, sans-serif" }}>
        🐾 Cat Customizer
      </h2>
      <p style={{ fontSize: "0.8rem", color: "#b8a090", marginBottom: 24 }}>Personalize your companion!</p>

      {/* Preview */}
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        background: "rgba(255,255,255,0.6)", borderRadius: 20, padding: "30px",
        marginBottom: 24, border: "1px solid rgba(196,165,140,0.2)",
        position: "relative", minHeight: 140,
      }}>
        <CatMascot catState={previewState} catColor={catColor} accessory={accessory} visible />
        <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: "0.7rem", color: "#c4a882" }}>
          Preview mode
        </div>
      </div>

      {/* Test animations */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: "0.72rem", color: "#a08c7a", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Test Animation
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["idle", "happy", "dancing", "sleeping", "sad", "stretching", "sitting", "yawning"].map(state => (
            <button key={state} onClick={() => setPreviewState(state)} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: "0.75rem", cursor: "pointer",
              border: `1.5px solid ${previewState === state ? "#c4956a" : "rgba(196,165,140,0.3)"}`,
              background: previewState === state ? "rgba(196,149,106,0.15)" : "rgba(255,255,255,0.5)",
              color: previewState === state ? "#c4956a" : "#9c8070",
              fontWeight: previewState === state ? 700 : 400,
              transition: "all 0.2s",
            }}>
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Cat color */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: "0.72rem", color: "#a08c7a", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Coat Color
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CAT_COLORS.map(c => (
            <button key={c.value} onClick={() => setCatColor(c.value)} title={c.label} style={{
              width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
              background: c.value,
              boxShadow: catColor === c.value
                ? `0 0 0 3px white, 0 0 0 5px ${c.value}`
                : "0 2px 6px rgba(0,0,0,0.12)",
              transition: "all 0.2s",
              transform: catColor === c.value ? "scale(1.15)" : "scale(1)",
            }} />
          ))}
        </div>
        <p style={{ fontSize: "0.7rem", color: "#c4a882", marginTop: 6 }}>
          {CAT_COLORS.find(c => c.value === catColor)?.label}
        </p>
      </div>

      {/* Accessories */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: "0.72rem", color: "#a08c7a", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Accessories
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ACCESSORIES.map(a => (
            <button key={a.value} onClick={() => setAccessory(a.value)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: "0.8rem", cursor: "pointer",
              border: `1.5px solid ${accessory === a.value ? "#c4956a" : "rgba(196,165,140,0.3)"}`,
              background: accessory === a.value ? "rgba(196,149,106,0.15)" : "rgba(255,255,255,0.5)",
              color: accessory === a.value ? "#c4956a" : "#9c8070",
              fontWeight: accessory === a.value ? 700 : 400,
              transition: "all 0.2s",
            }}>
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unlockable animations */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontSize: "0.72rem", color: "#a08c7a", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            🏆 Unlock Animations
          </p>
          <span style={{ fontSize: "0.75rem", color: "#c4956a", fontWeight: 700 }}>
            🐾 {points} pts
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {UNLOCKABLE_ANIMATIONS.filter(a => a.cost > 0).map(anim => (
            <div key={anim.key} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,255,255,0.5)", borderRadius: 12, padding: "8px 12px",
              border: "1px solid rgba(196,165,140,0.2)",
            }}>
              <div>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#7c6a5e" }}>{anim.label}</span>
                <p style={{ fontSize: "0.7rem", color: "#b8a090", margin: 0 }}>
                  {unlocked[anim.key] ? "✅ Unlocked!" : `🐾 ${anim.cost} pts to unlock`}
                </p>
              </div>
              {!unlocked[anim.key] && (
                <button
                  onClick={() => {
                    if (points >= anim.cost) setUnlocked(u => ({ ...u, [anim.key]: true }));
                  }}
                  style={{
                    padding: "5px 12px", borderRadius: 20,
                    border: "1px solid rgba(196,149,106,0.5)",
                    background: points >= anim.cost ? "rgba(196,149,106,0.15)" : "rgba(0,0,0,0.05)",
                    color: points >= anim.cost ? "#c4956a" : "#c4b8b0",
                    fontSize: "0.75rem", cursor: points >= anim.cost ? "pointer" : "not-allowed",
                    fontWeight: 600,
                  }}
                >
                  Unlock
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
