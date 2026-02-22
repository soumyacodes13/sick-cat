import { useNavigate } from "react-router-dom";

export default function Home({ darkMode, catMode,setCatMode }) {
  const navigate = useNavigate();

  const bg   = darkMode ? "#1a1608" : "#fdf9ed";
  const text = darkMode ? "#f0e4b0" : "#5c4a1e";
  const mid  = darkMode ? "#c8a840" : "#9c8040";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Nunito, sans-serif", overflow: "hidden", position: "relative", transition: "background 0.3s" }}>

      {/* Sunflower background blobs */}
      <div style={{ position:"absolute", top:-100, left:-100, width:500, height:500, borderRadius:"50%", background:"rgba(245,200,66,0.12)", filter:"blur(60px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-80, right:-80, width:400, height:400, borderRadius:"50%", background:"rgba(232,160,32,0.1)", filter:"blur(50px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"40%", right:"5%", width:300, height:300, borderRadius:"50%", background:"rgba(101,163,13,0.06)", filter:"blur(40px)", pointerEvents:"none" }} />

      {/* Decorative sunflower emoji elements */}
      <div style={{ position:"absolute", top:120, left:"6%", fontSize:40, opacity:0.15, pointerEvents:"none", animation:"floatA 6s ease-in-out infinite" }}>{catMode ? "🐱" : "🌻"}</div>
      <div style={{ position:"absolute", top:200, right:"8%", fontSize:30, opacity:0.12, pointerEvents:"none", animation:"floatB 8s ease-in-out infinite" }}>{catMode ? "🐾" : "🌻"}</div>
      <div style={{ position:"absolute", bottom:160, left:"12%", fontSize:24, opacity:0.1, pointerEvents:"none", animation:"floatA 7s 1s ease-in-out infinite" }}>{catMode ? "😸" : "🌿"}</div>
      <div style={{ position:"absolute", bottom:220, right:"14%", fontSize:28, opacity:0.1, pointerEvents:"none", animation:"floatB 9s ease-in-out infinite" }}>{catMode ? "✨" : "🌾"}</div>
      {/* Hero content */}
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"6rem 1.5rem 4rem", position:"relative", zIndex:1 }}>

        {/* Eyebrow */}
        <div style={{ animation:"fadeUp 0.6s 0.1s ease both", opacity:0, marginBottom:24 }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background: darkMode ? "rgba(245,200,66,0.1)" : "rgba(255,255,255,0.8)",
            border:`1px solid rgba(245,200,66,0.35)`,
            color: mid, fontSize:"0.72rem", fontWeight:800,
            letterSpacing:"0.1em", textTransform:"uppercase",
            padding:"8px 18px", borderRadius:50,
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#f5c842", display:"inline-block" }} />
            - - -
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          animation:"fadeUp 0.6s 0.2s ease both", opacity:0,
          fontFamily:"Lora, serif", fontSize:"clamp(2.4rem, 6vw, 4rem)",
          fontWeight:600, color: text, lineHeight:1.2,
          maxWidth:700, marginBottom:20,
        }}>
          A sunny space for your{" "}
          <span style={{ background:"linear-gradient(135deg, #f5c842, #e8a020)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            music
          </span>
        </h1>

        {/* Subtext */}
        <p style={{ animation:"fadeUp 0.6s 0.35s ease both", opacity:0, color:mid, fontSize:"1rem", maxWidth:420, lineHeight:1.7, marginBottom:36 }}>
          Pretty mid song player
        </p>

        {/* CTAs */}
        <div style={{ animation:"fadeUp 0.6s 0.5s ease both", opacity:0, display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center", marginBottom:48 }}>
          <button onClick={() => navigate("/music")} style={{
            background:"linear-gradient(135deg, #f5c842, #e8a020)",
            color:"#5c4a1e", border:"none", fontWeight:800,
            padding:"13px 32px", borderRadius:50, fontSize:"0.92rem",
            cursor:"pointer", fontFamily:"Nunito, sans-serif",
            boxShadow:"0 6px 20px rgba(245,200,66,0.4)",
            transition:"transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.target.style.transform="translateY(-2px)"; e.target.style.boxShadow="0 10px 28px rgba(245,200,66,0.5)"; }}
            onMouseLeave={e => { e.target.style.transform=""; e.target.style.boxShadow="0 6px 20px rgba(245,200,66,0.4)"; }}
          >
            Explore Music 🎧
          </button>
          {/* <button onClick={() => navigate("/games")} style={{
            background: darkMode ? "rgba(245,200,66,0.1)" : "rgba(255,255,255,0.8)",
            border:"1.5px solid rgba(245,200,66,0.4)", color:text,
            fontWeight:800, padding:"13px 32px", borderRadius:50, fontSize:"0.92rem",
            cursor:"pointer", fontFamily:"Nunito, sans-serif",
            transition:"transform 0.2s",
          }}
            onMouseEnter={e => e.target.style.transform="translateY(-2px)"}
            onMouseLeave={e => e.target.style.transform=""}
          >
            Customize Cat 🐱
          </button> */}
          <button onClick={() => setCatMode(v => !v)} style={{
            background: darkMode ? "rgba(245,200,66,0.1)" : "rgba(255,255,255,0.8)",
            border:`1.5px solid ${catMode ? "#e8909a" : "rgba(245,200,66,0.4)"}`,
            color: catMode ? "#e8909a" : text,
            fontWeight:800, padding:"13px 32px", borderRadius:50, fontSize:"0.92rem",
            cursor:"pointer", fontFamily:"Nunito, sans-serif",
            transition:"all 0.2s",}}>
            {catMode ? "🐱 Cat Mode ON" : "🌻 Cat Mode OFF"}
          </button>
        </div>

        {/* Feature pills
        <div style={{ animation:"fadeUp 0.6s 0.65s ease both", opacity:0, display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginBottom:48 }}>
          {[
            { icon:"🌊", label:"Mood Detection" },
            { icon:"🎧", label:"Ambience Sounds" },
            { icon:"🐾", label:"Cat Companion" },
            { icon:"📊", label:"Listening Stats" },
          ].map(f => (
            <span key={f.label} style={{
              display:"flex", alignItems:"center", gap:6,
              background: darkMode ? "rgba(245,200,66,0.08)" : "rgba(255,255,255,0.7)",
              border:"1px solid rgba(245,200,66,0.25)",
              color:mid, fontSize:"0.78rem", fontWeight:700,
              padding:"7px 14px", borderRadius:50,
            }}>
              {f.icon} {f.label}
            </span>
          ))}
        </div> */}

        {/* Mood cards
        <div style={{ animation:"fadeUp 0.6s 0.8s ease both", opacity:0, display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
          {[
            { mood:"😄", label:"Happy",  bg:"#fef9c3", border:"#fde047" },
            { mood:"😌", label:"Calm",   bg:"#ecfdf5", border:"#6ee7b7" },
            { mood:"😢", label:"Sad",    bg:"#eff6ff", border:"#93c5fd" },
            { mood:"🎯", label:"Focus",  bg:"#f0fdf4", border:"#86efac" },
          ].map(m => (
            <div key={m.label} style={{
              background: darkMode ? "rgba(245,200,66,0.08)" : m.bg,
              border:`1px solid ${darkMode ? "rgba(245,200,66,0.2)" : m.border}`,
              borderRadius:18, padding:"10px 18px",
              display:"flex", alignItems:"center", gap:8,
            }}>
              <span style={{ fontSize:20 }}>{m.mood}</span>
              <span style={{ fontSize:"0.8rem", fontWeight:800, color:text }}>{m.label}</span>
            </div>
          ))}
        </div> */}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Lora:wght@400;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(2deg)} 50%{transform:translateY(-9px) rotate(-2deg)} }
      `}</style>
    </div>
  );
}
