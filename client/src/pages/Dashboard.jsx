import { useState, useEffect, useRef } from "react";
import SearchSection from "../components/SearchSection";
import MoodSection from "../components/MoodSection";
import PlaylistSection from "../components/PlaylistSection";
import CatMascot from "../components/CatMascot";
import AmbiencePlayer from "../components/AmbiencePlayer";
import ListeningStats from "../components/ListeningStats";
import SoftChat from "../components/SoftChat";
import api from "../services/api";

const COZY_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

  :root {
    --cream: #fdf6ed;
    --warm-card: #fffaf3;
    --border-soft: rgba(196,165,140,0.25);
    --text-dark: #6b5344;
    --text-mid: #9c8070;
    --text-light: #c4a882;
    --shadow-cozy: 0 2px 12px rgba(180,140,110,0.09);
    --radius-card: 22px;
  }

  body { background: var(--bg); font-family: 'Nunito', sans-serif; color: var(--text); }

  .cozy-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow);
    transition: background 0.3s, border-color 0.3s;
  }

  .tab-cozy {
    padding: 9px 20px; border-radius: 50px;
    font-size: 0.82rem; font-weight: 700;
    cursor: pointer; border: 1.5px solid transparent;
    font-family: 'Nunito', sans-serif; transition: background 0.2s, color 0.2s;
  }
  .tab-cozy.active {
    background: linear-gradient(135deg, #e8a87c, #e8909a);
    color: white; box-shadow: 0 3px 10px rgba(232,168,124,0.35);
  }
  .tab-cozy.inactive {
    background: #fff; color: var(--text-mid); border-color: var(--border);
  }
  .tab-cozy.inactive:hover { background: #fdf6ed; color: var(--text); }

  .cozy-bg { min-height: 100vh; background: var(--bg); }

  .cat-toggle {
    padding: 8px 16px; border-radius: 50px; font-size: 0.8rem; font-weight: 700;
    cursor: pointer; border: 1.5px solid var(--border);
    background: #fff; color: var(--text-mid);
    font-family: 'Nunito', sans-serif; transition: border-color 0.2s, color 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .cat-toggle.on { border-color: #e8a87c; color: #c4956a; background: var(--card); }

  .cat-panel {
    background: var(--card);
    border: 1.5px solid rgba(232,168,124,0.3);
    border-radius: 20px; padding: 16px;
    box-shadow: 0 2px 12px rgba(180,140,110,0.08);
  }

  .lora { font-family: 'Lora', serif; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(196,165,140,0.4); border-radius: 4px; }

  @keyframes fadeCozy { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .fi  { animation: fadeCozy 0.4s ease both; }
  .fi1 { animation: fadeCozy 0.4s 0.07s ease both; }
  .fi2 { animation: fadeCozy 0.4s 0.14s ease both; }
  .fi3 { animation: fadeCozy 0.4s 0.21s ease both; }
  .fi4 { animation: fadeCozy 0.4s 0.28s ease both; }

  @media(min-width:1024px) { .main-grid { grid-template-columns: 1fr 280px 300px !important; } }
`;

function useCatState(playlist, isPlaying, chatMood, lastAction, inactiveSecs, ambiencePlaying, forceAwake) {
  if (forceAwake) return "happy";
  if (inactiveSecs > 60) return "sleeping";
  if (inactiveSecs > 30) return "yawning";
  if (ambiencePlaying) return "sitting";
  if (chatMood === "sad") return "sitting";
  if (isPlaying) return "dancing";
  if (lastAction === "add") return "happy";
  if (lastAction === "delete") return "sad";
  if (playlist.length === 0) return "sleeping";
  return "idle";
}

export default function Dashboard({ catMode, setCatMode, catColor, setCatColor, accessory, setAccessory, onHappinessChange, platform, darkMode, showPlayer, setShowPlayer }) {
  const [playlist, setPlaylist] = useState([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [ambiencePlaying, setAmbiencePlaying] = useState(false);
  const [forceAwake, setForceAwake] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [chatMood, setChatMood] = useState(null);
  const [inactiveSecs, setInactiveSecs] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const actionTimerRef = useRef(null);

  const catState = useCatState(playlist, isPlaying, chatMood, lastAction, inactiveSecs, ambiencePlaying, forceAwake);
  const catHappiness = Math.min(100, Math.max(10,
    playlist.length * 7 + (isPlaying ? 22 : 0) + (chatMood === "sad" ? -10 : chatMood ? 12 : 0)
  ));
  useEffect(() => { onHappinessChange?.(catHappiness); }, [catHappiness]);

  // Inactivity: only track when cat mode is on, use passive scroll-safe listeners
  useEffect(() => {
    if (!catMode) return;
    const reset = () => { lastActivityRef.current = Date.now(); };
    // Use click + keydown only — NOT mousemove (fires hundreds of times per scroll)
    window.addEventListener("click", reset, { passive: true });
    window.addEventListener("keydown", reset, { passive: true });
    // Check every 30s — not every 5s
    const iv = setInterval(() => {
      setInactiveSecs(Math.floor((Date.now() - lastActivityRef.current) / 1000));
    }, 30000);
    return () => {
      window.removeEventListener("click", reset);
      window.removeEventListener("keydown", reset);
      clearInterval(iv);
    };
  }, [catMode]);
  // Hide chat function
  useEffect(() => {
    if (!catMode && activeTab === "chat") setActiveTab("search");
  }, [catMode]);
  // Audio play detection — only when cat mode is on
  useEffect(() => {
    if (!catMode) return;
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    document.addEventListener("play",  onPlay,  true);
    document.addEventListener("pause", onPause, true);
    document.addEventListener("ended", onPause, true);
    return () => {
      document.removeEventListener("play",  onPlay,  true);
      document.removeEventListener("pause", onPause, true);
      document.removeEventListener("ended", onPause, true);
    };
  }, [catMode]);

  const triggerAction = (action) => {
    setLastAction(action);
    clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => setLastAction(null), 3000);
  };

  const fetchPlaylist = async () => {
    try { setPlaylistLoading(true); const r = await api.get("/songs"); setPlaylist(r.data); }
    catch (e) { console.error(e); } finally { setPlaylistLoading(false); }
  };

  useEffect(() => { fetchPlaylist(); }, []);

  const saveSong = async (song) => {
    try {
      await api.post("/songs", { title: song.title, artist: song.artist, albumArt: song.albumArt, previewUrl: song.previewUrl, moodTag: song.moodTag || "" });
      triggerAction("add"); fetchPlaylist();
    } catch (err) { alert(err.response?.data?.message || "Error saving song"); }
  };

  const deleteSong = async (id) => {
    try {
      await api.delete(`/songs/${id}`);
      triggerAction("delete");
      setPlaylist(prev => prev.filter(s => s._id !== id)); // remove locally
    } catch (e) { console.error(e); }
  };

const TABS = [
  { key: "chat",   label: "Chat",   icon: "💬" },
  { key: "search", label: "Search", icon: "🔍" },
  // { key: "mood",   label: "Mood",   icon: "🌊" },
].filter(tab => tab.key !== "chat" || catMode);

  const CAT_COLORS_QUICK = ["#c4956a","#e8d5b7","#4a4a6a","#e07a3a","#c4808a","#8a9ab0"];
  const STATE_LABEL = {
    dancing:"Vibing 🎶", happy:"Excited! ✨", sad:"Sad... 😢",
    sleeping:"Asleep 💤", sitting:"By your side 🤍",
    stretching:"Stretching 🙆", yawning:"Sleepy... 😪", idle:"Chilling 😸"
  };

  return (
    <>
      <style>{COZY_STYLES}</style>
      <div className="cozy-bg">
        <div className="relative z-10 pt-28 px-5 md:px-12 pb-16">

          {/* HEADER */}
          <div className="fi" style={{ marginBottom:28, display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontSize:"0.7rem", color:"var(--text-light)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>
                🎵
                {/* Your cozy corner */}
              </p>
              <h1 className="lora" style={{ fontSize:"clamp(1.7rem,4vw,2.5rem)", fontWeight:600, color:"var(--text)", lineHeight:1.15, margin:0 }}>
                Welcome back 🌙
              </h1>
              <p style={{ color:"var(--text-mid)", fontSize:"0.88rem", marginTop:4 }}>
                {/* What's the vibe today? */}
              </p>
            </div>
            <button onClick={() => setCatMode(v => !v)} className={`cat-toggle ${catMode ? "on" : ""}`}>
              <span style={{ fontSize:18 }}>🐱</span>
              Cat Mode {catMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* MAIN GRID */}
          <div className="main-grid" style={{ display:"grid", gap:20, gridTemplateColumns:"1fr" }}>

            {/* LEFT: Chat / Search / Mood */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div className="fi1" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`tab-cozy ${activeTab === tab.key ? "active" : "inactive"}`}>
                    <span style={{ marginRight:5 }}>{tab.icon}</span>{tab.label}
                  </button>
                ))}
              </div>

              <div className="cozy-card fi2" style={{ padding:"24px 26px", minHeight:380 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                  <div style={{ width:4, height:18, borderRadius:3, background:"linear-gradient(to bottom, #f5c842, #e8a020)", flexShrink:0 }} />
                  <span style={{ fontSize:"0.7rem", fontWeight:800, color:"var(--text-mid)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                    {TABS.find(t => t.key === activeTab)?.label}
                  </span>
                </div>
                {activeTab === "chat"   && <SoftChat onSave={saveSong} onMoodDetected={setChatMood} platform={platform} />}
                {activeTab === "search" && <SearchSection onSave={saveSong} platform={platform} />}
                {/* {activeTab === "mood"   && <MoodSection onSave={saveSong} platform={platform} />} */}
              </div>

              
              {/* Music Player bar - toggleable */}
              {showPlayer && (
                <div className="fi3" style={{
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 16, padding: "14px 18px",
                  boxShadow: "var(--shadow)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 18 }}>🎵</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
                      Now Playing
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 600, margin: 0 }}>
                      {playlist.length > 0 ? "Play a song from your playlist ▶" : "Add songs to start listening"}
                    </p>
                  </div>
                  <button onClick={() => setShowPlayer(false)} style={{ background: "none", border: "none", color: "var(--text-light)", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              )}

              <div className="fi3"><AmbiencePlayer onPlayingChange={setAmbiencePlaying} /></div>
            </div>

            {/* MIDDLE: Cat + Stats */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {catMode && (
                <div className="cat-panel fi2">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <p style={{ fontSize:"0.68rem", color:"#a08c7a", fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>
                      🐾 Your Companion
                    </p>
                    <span style={{ fontSize:"0.7rem", background:"rgba(232,168,124,0.15)", color:"#c4956a", padding:"2px 8px", borderRadius:20, border:"1px solid rgba(232,168,124,0.3)", fontWeight:700 }}>
                      {STATE_LABEL[catState] || "Chilling 😸"}
                    </span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", padding:"14px 0 8px" }}>
                    <CatMascot catState={catState} catColor={catColor} accessory={accessory} visible happiness={catHappiness} onWake={() => { lastActivityRef.current = Date.now(); setInactiveSecs(0); setForceAwake(true); setTimeout(() => setForceAwake(false), 2000);}} />
                  </div>
                  {/* <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:8 }}>
                    {CAT_COLORS_QUICK.map(c => (
                      <button key={c} onClick={() => setCatColor(c)} style={{
                        width:22, height:22, borderRadius:"50%", background:c, cursor:"pointer",
                        border: catColor === c ? "2.5px solid #7c6a5e" : "2px solid rgba(255,255,255,0.8)",
                        transform: catColor === c ? "scale(1.25)" : "scale(1)",
                        transition:"transform 0.2s",
                      }} />
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:8, flexWrap:"wrap" }}>
                    {[["none","—"],["scarf","🧣"],["headphones","🎧"],["bowtie","🎀"]].map(([val, lbl]) => (
                      <button key={val} onClick={() => setAccessory(val)} style={{
                        padding:"3px 10px", borderRadius:20, fontSize:"0.72rem", cursor:"pointer",
                        border:`1px solid ${accessory === val ? "#c4956a" : "rgba(196,165,140,0.3)"}`,
                        background: accessory === val ? "rgba(196,149,106,0.15)" : "#fff",
                        color: accessory === val ? "#c4956a" : "#b0988a",
                        fontWeight: accessory === val ? 700 : 400,
                      }}>
                        {lbl}
                      </button>
                    ))}
                  </div> */}
                </div>
              )}

              <div className="fi3">
                <ListeningStats playlist={playlist} catHappiness={catHappiness} catMode={catMode} />
              </div>

              {/* <div className="fi4" style={{ background:"#fff", borderRadius:16, padding:"14px 16px", border:"1px solid rgba(196,165,140,0.2)", textAlign:"center" }}>
                <p className="lora" style={{ fontSize:"0.78rem", fontStyle:"italic", color:"var(--text-mid)", lineHeight:1.65, margin:0 }}>
                  "Music gives a soul to the universe,<br />wings to the mind."
                </p>
                <p style={{ fontSize:"0.66rem", color:"var(--text-light)", marginTop:5 }}>— Plato</p>
              </div> */}
            </div>

            {/* RIGHT: Shared Playlist */}
            <div className="cozy-card fi2" style={{
              padding:"20px", alignSelf:"flex-start",
              position:"sticky", top:"6.5rem",
              maxHeight:"calc(100vh - 9rem)", overflowY:"auto",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div>
                  <h2 style={{ fontSize:"1rem", fontWeight:800, color:"var(--text)", margin:0 }}>Playlist</h2>
                  <p style={{ fontSize:"0.7rem", color:"var(--text-light)", margin:"2px 0 0" }}>
                    {playlist.length} song{playlist.length !== 1 ? "s" : ""} ·
                  </p>
                </div>
                <span style={{ fontSize:22 }}>🎧</span>
              </div>
              <div style={{ height:1, background:"var(--border)", marginBottom:14 }} />
              <PlaylistSection playlist={playlist} onDelete={deleteSong} loading={playlistLoading} platform={platform} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}