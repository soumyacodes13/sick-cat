import { useState } from "react";
import api from "../services/api";
import SongCard from "./SongCard";

const MOODS = [
  { key:"happy", label:"Happy", emoji:"😄", color:"#f59e0b" },
  { key:"calm",  label:"Calm",  emoji:"😌", color:"#22d3ee" },
  { key:"chaotic",label:"Chaotic",emoji:"🌪️",color:"#f43f5e" },
  { key:"sad",   label:"Sad",   emoji:"😢", color:"#818cf8" },
  { key:"focus", label:"Focus", emoji:"🎯", color:"#34d399" },
];

export default function MoodSection({ onSave, platform }) {
  const [moodSongs, setMoodSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState(null);

  const handleMood = async (mood) => {
    try { setLoading(true); setActiveMood(mood.key);
      const res = await api.get(`/songs/mood?mood=${mood.key}`);
      setMoodSongs(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div>
      <p style={{ fontSize:"0.82rem", color:"#b8a090", marginBottom:14 }}>How are you feeling right now?</p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {MOODS.map(mood => {
          const isActive = activeMood === mood.key;
          return (
            <button key={mood.key} onClick={() => handleMood(mood)} disabled={loading} style={{
              padding:"7px 16px", borderRadius:50, fontSize:"0.82rem", cursor:loading?"not-allowed":"pointer",
              border:`1.5px solid ${isActive ? mood.color : "rgba(196,165,140,0.3)"}`,
              background: isActive ? `${mood.color}18` : "rgba(255,255,255,0.7)",
              color: isActive ? mood.color : "#b8a090", fontWeight: isActive?800:600,
              transition:"all 0.2s", boxShadow: isActive ? `0 0 14px ${mood.color}33` : "none",
              fontFamily:"Nunito,sans-serif",
            }}>
              {mood.emoji} {mood.label}
            </button>
          );
        })}
      </div>

      {loading && [1,2,3].map(i => (
        <div key={i} style={{ height:64, borderRadius:14, background:"rgba(255,255,255,0.5)", marginBottom:8, animation:"pulse 1.4s ease-in-out infinite" }} />
      ))}
      {!activeMood && <div style={{ textAlign:"center", padding:"28px 0", color:"#c4a882" }}><div style={{ fontSize:36, marginBottom:8 }}>🌊</div><p style={{ fontSize:"0.82rem" }}>Pick a mood to discover songs</p></div>}
      {!loading && activeMood && moodSongs.length===0 && <p style={{ color:"#c4a882", textAlign:"center", padding:"20px 0" }}>No songs found.</p>}

      <ul style={{ padding:0, margin:0 }}>
        {moodSongs.map((song, i) => <SongCard key={i} song={{ ...song, moodTag:activeMood }} onSave={onSave} platform={platform} />)}
      </ul>
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
    </div>
  );
}
