import { useState, useRef } from "react";
import api from "../services/api";

const MOOD_KEYWORDS = {
  happy: ["happy", "great", "amazing", "joyful", "excited", "good", "wonderful", "fantastic", "cheerful", "yay", "love"],
  calm: ["calm", "peaceful", "relaxed", "chill", "quiet", "serene", "okay", "fine", "mellow"],
  sad: ["sad", "down", "lonely", "miss", "cry", "upset", "depressed", "blue", "hurt", "heartbreak", "tired"],
  chaotic: ["anxious", "stressed", "overwhelmed", "chaos", "wild", "crazy", "energy", "hyper", "angry", "mad"],
  focus: ["focus", "study", "work", "concentrate", "productive", "grind", "hustle", "thinking"],
};

function detectMood(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [mood, words] of Object.entries(MOOD_KEYWORDS)) {
    scores[mood] = words.filter(w => lower.includes(w)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : null;
}

const MOOD_RESPONSES = {
  happy: ["Yay! Let me find you some uplifting bangers 🎉", "Happy vibes incoming! 🌟"],
  calm: ["Soft and peaceful tunes coming up 🍃", "Something gentle for your mood 🌸"],
  sad: ["I've got you 🤍 Here's something for your feelings...", "Music that understands 💙"],
  chaotic: ["Let's match that energy! ⚡", "Something to match the chaos 🌪️"],
  focus: ["Time to lock in 🎯 Here's your focus playlist...", "Deep work mode activated 🧠"],
};

const MOOD_EMOJI = { happy: "😄", calm: "😌", chaotic: "🌪️", sad: "😢", focus: "🎯" };

export default function SoftChat({ onSave, onMoodDetected, platform }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectedMood, setDetectedMood] = useState(null);
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;

    const mood = detectMood(text);
    setDetectedMood(mood);
    if (mood && onMoodDetected) onMoodDetected(mood);

    const responses = MOOD_RESPONSES[mood] || ["Let me find something for you... 🎵"];
    setResponse(responses[Math.floor(Math.random() * responses.length)]);

    setLoading(true);
    setSongs([]);

    try {
      if (mood) {
        const res = await api.get(`/songs/mood?mood=${mood}`);
        setSongs(res.data.slice(0, 3));
      } else {
        // Generic search from their text
        const words = text.split(" ").filter(w => w.length > 3);
        const term = words[0] || text;
        const res = await api.get(`/songs/search?q=${encodeURIComponent(term)}`);
        setSongs(res.data.slice(0, 3));
        setResponse(`Here's what I found for "${term}" 🎵`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const reset = () => {
    setInput(""); setResponse(null); setSongs([]); setDetectedMood(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,248,240,0.9) 0%, rgba(255,240,250,0.9) 100%)",
      borderRadius: 20, padding: "22px 24px",
      border: "1px solid rgba(196,165,140,0.35)",
      boxShadow: "0 4px 24px rgba(180,140,120,0.1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>💬</span>
        <div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#7c6a5e", margin: 0 }}>
            How are you feeling today?
          </h3>
          <p style={{ fontSize: "0.72rem", color: "#b8a090", margin: "2px 0 0" }}>
            Tell me, and I'll find songs that match your vibe
          </p>
        </div>
      </div>

      {!response ? (
        <div style={{ display: "flex", gap: 8 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="e.g. I'm feeling a bit tired but cozy..."
            rows={2}
            style={{
              flex: 1, resize: "none", borderRadius: 14,
              border: "1.5px solid rgba(196,165,140,0.4)",
              background: "rgba(255,255,255,0.7)",
              padding: "10px 14px", fontSize: "0.85rem",
              color: "#7c6a5e", outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#c4956a"}
            onBlur={e => e.target.style.borderColor = "rgba(196,165,140,0.4)"}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            style={{
              padding: "0 18px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #c4956a, #e8a87c)",
              color: "white", fontWeight: 700, fontSize: "0.8rem",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              opacity: input.trim() && !loading ? 1 : 0.5,
              boxShadow: "0 4px 12px rgba(196,149,106,0.3)",
              transition: "all 0.2s",
              alignSelf: "stretch",
            }}
          >
            {loading ? "🔮" : "✨"}
          </button>
        </div>
      ) : (
        <div>
          {/* Cat response message */}
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "rgba(255,255,255,0.6)", borderRadius: 14, padding: "12px 14px",
            marginBottom: 14, border: "1px solid rgba(196,165,140,0.2)"
          }}>
            <span style={{ fontSize: 22 }}>😺</span>
            <div>
              {detectedMood && (
                <span style={{
                  display: "inline-block", fontSize: "0.7rem", fontWeight: 700,
                  background: "rgba(196,149,106,0.15)", color: "#c4956a",
                  padding: "2px 8px", borderRadius: 20, marginBottom: 4,
                }}>
                  {MOOD_EMOJI[detectedMood]} {detectedMood} vibes detected
                </span>
              )}
              <p style={{ fontSize: "0.85rem", color: "#7c6a5e", margin: 0 }}>{response}</p>
            </div>
          </div>

          {/* Song suggestions */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "12px", color: "#c4956a", fontSize: "0.85rem" }}>
              Finding your songs... 🎵
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {songs.map((song, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: "8px 12px",
                  border: "1px solid rgba(196,165,140,0.2)",
                }}>
                  {song.albumArt && (
                    <img src={song.albumArt} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#7c6a5e", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {song.title}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "#b8a090", margin: 0 }}>{song.artist}</p>
                  </div>
                  <button
                    onClick={() => onSave && onSave({ ...song, moodTag: detectedMood || "" })}
                    style={{
                      fontSize: "0.72rem", padding: "4px 10px", borderRadius: 20,
                      border: "1px solid rgba(196,149,106,0.5)",
                      background: "rgba(196,149,106,0.1)", color: "#c4956a",
                      cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    }}
                  >
                    + Save
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={reset}
            style={{
              marginTop: 12, fontSize: "0.75rem", color: "#b8a090",
              background: "none", border: "none", cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Ask again
          </button>
        </div>
      )}
    </div>
  );
}
