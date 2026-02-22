import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const PLATFORM_OPTIONS = [
  { value: "spotify",    label: "Spotify",     emoji: "🟢" },
  { value: "youtube",    label: "YouTube",     emoji: "🔴" },
  { value: "applemusic", label: "Apple Music", emoji: "🎵" },
];

function Toggle({ on, onToggle, label, icon, darkMode }) {
  const bg  = darkMode ? (on ? "#e8a87c" : "#3a3520") : (on ? "#e8a87c" : "#e8e0d8");
  const knob = darkMode ? "#1a1a14" : "#fff";
  return (
    <button
      onClick={onToggle}
      title={label}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "none", cursor: "pointer",
        padding: "4px 2px", fontFamily: "Nunito, sans-serif",
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
      <div style={{
        width: 36, height: 20, borderRadius: 20, background: bg,
        position: "relative", transition: "background 0.25s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 3, left: on ? 18 : 3,
          width: 14, height: 14, borderRadius: "50%", background: knob,
          transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
      </div>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: darkMode ? "#c4a882" : "#9c8070", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </button>
  );
}

export default function Navbar({ platform, setPlatform, darkMode, setDarkMode, catMode, setCatMode, showPlayer, setShowPlayer, isHome }) {
  const [isOpen,   setIsOpen]   = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem("token");
  const dropRef   = useRef(null);

  const isGuest = !localStorage.getItem("token") || !!localStorage.getItem("guestId");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guestId");
    navigate("/login");
    setIsOpen(false);
  };
  const isActive = (path) => location.pathname === path;
  const cur = PLATFORM_OPTIONS.find(p => p.value === platform) || PLATFORM_OPTIONS[0];

  const navBg     = darkMode ? "rgba(26,22,14,0.97)"  : "rgba(253,246,237,0.95)";
  const navBorder = darkMode ? "rgba(80,70,40,0.4)"   : "rgba(196,165,140,0.18)";
  const logoColor = darkMode ? "#e8c9a0"               : "#7c6a5e";
  const linkColor = darkMode ? "#b8a090"               : "#b8a090";
  const linkActive= darkMode ? "#e8a87c"               : "#c4956a";
  const btnBg     = darkMode ? "#2a2416"               : "#fff";
  const btnBorder = darkMode ? "rgba(120,100,60,0.5)"  : "rgba(196,165,140,0.4)";
  const btnColor  = darkMode ? "#c4a882"               : "#b8a090";

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const navBtn = (extra = {}) => ({
    padding: "7px 16px", borderRadius: 50, fontSize: "0.8rem", fontWeight: 700,
    cursor: "pointer", border: `1.5px solid ${btnBorder}`,
    background: btnBg, color: btnColor,
    fontFamily: "Nunito, sans-serif", transition: "all 0.2s",
    display: "inline-flex", alignItems: "center", whiteSpace: "nowrap",
    textDecoration: "none", ...extra,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap');
        .nav-link-cozy {
          font-size: 0.85rem; font-weight: 700; text-decoration: none;
          transition: color 0.2s; position: relative; padding-bottom: 2px;
          font-family: 'Nunito', sans-serif;
        }
        .nav-link-cozy::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #e8a87c, #e8909a); border-radius: 2px;
          transform: scaleX(0); transition: transform 0.2s;
        }
        .nav-link-cozy.active::after { transform: scaleX(1); }
        .pdrop {
          position: absolute; top: calc(100% + 8px); right: 0;
          border-radius: 14px; padding: 6px; min-width: 160px; z-index: 100;
          box-shadow: 0 8px 28px rgba(0,0,0,0.15);
        }
        .popt {
          display: flex; align-items: center; gap: 8px; padding: 8px 12px;
          border-radius: 10px; cursor: pointer; font-size: 0.82rem; font-weight: 700;
          font-family: 'Nunito', sans-serif; transition: background 0.15s;
          border: none; width: 100%; text-align: left;
        }
        @media(min-width:768px){ .md-show{display:flex!important} .mob-only{display:none!important} }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, zIndex: 50, width: "100%",
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navBg, backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${navBorder}`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <Link to="/" style={{ fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:"1.1rem", color:logoColor, textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:20 }}>🐱</span>
          Meow<span style={{ color:"#e8909a" }}>sic</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display:"none", gap:28, alignItems:"center" }} className="md-show">
          {[{to:"/",label:"Home"},{to:"/music",label:"Music"},{to:"/games",label:"Games"}].map(l => (
            <Link key={l.to} to={l.to} className={`nav-link-cozy ${isActive(l.to)?"active":""}`}
              style={{ color: isActive(l.to) ? linkActive : linkColor }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right controls */}
        <div style={{ display:"none", alignItems:"center", gap:10 }} className="md-show">

          {/* Dark mode — always visible */}
          <Toggle on={darkMode} onToggle={() => setDarkMode(v=>!v)} label="Dark" icon="🌙" darkMode={darkMode} />

          {/* Cat mode + Player toggle — hidden on home */}
          {!isHome && token && (
            <>
              <Toggle on={catMode}    onToggle={() => setCatMode(v=>!v)}    label="Cat"    icon="🐱" darkMode={darkMode} />
              <Toggle on={showPlayer} onToggle={() => setShowPlayer(v=>!v)} label="Player" icon="🎵" darkMode={darkMode} />
            </>
          )}

          {/* Platform picker */}
          {token && (
            <div ref={dropRef} style={{ position:"relative" }}>
              <button style={navBtn()} onClick={() => setDropOpen(v=>!v)}>
                {cur.emoji} {cur.label} <span style={{ fontSize:9, opacity:0.5, marginLeft:3 }}>▼</span>
              </button>
              {dropOpen && (
                <div className="pdrop" style={{ background: darkMode?"#1e1a0e":"#fff", border:`1px solid ${btnBorder}` }}>
                  <p style={{ fontSize:"0.65rem", color:"#c4a882", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", padding:"4px 12px 6px", margin:0 }}>
                    Open songs in
                  </p>
                  {PLATFORM_OPTIONS.map(opt => (
                    <button key={opt.value} className="popt"
                      style={{ background: platform===opt.value ? (darkMode?"rgba(232,168,124,0.15)":"rgba(232,168,124,0.12)") : "transparent",
                               color: platform===opt.value ? "#c4956a" : (darkMode?"#b8a090":"#9c8070") }}
                      onClick={() => { setPlatform(opt.value); setDropOpen(false); }}>
                      {opt.emoji} {opt.label}
                      {platform===opt.value && <span style={{ marginLeft:"auto" }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isGuest && (
            <button onClick={handleLogout} style={navBtn()}>Logout</button>
          )}
          {isGuest && (
            <Link to="/login" style={navBtn()}>Login</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setIsOpen(true)} className="mob-only"
          style={{ background:"none", border:"none", fontSize:22, color:linkColor, cursor:"pointer" }}>
          ☰
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div style={{
          position:"fixed", inset:0, zIndex:100,
          background: darkMode?"rgba(26,22,14,0.98)":"rgba(253,246,237,0.97)",
          backdropFilter:"blur(16px)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:22,
        }}>
          {[{to:"/",label:"Home"},{to:"/music",label:"Music"},{to:"/games",label:"Games"}].map(l => (
            <Link key={l.to} to={l.to} onClick={() => setIsOpen(false)}
              style={{ fontSize:"1.3rem", fontWeight:800, color:logoColor, textDecoration:"none", fontFamily:"Nunito,sans-serif" }}>
              {l.label}
            </Link>
          ))}

          {/* Toggles in mobile */}
          <div style={{ display:"flex", flexDirection:"column", gap:14, alignItems:"flex-start" }}>
            <Toggle on={darkMode} onToggle={() => setDarkMode(v=>!v)} label="Dark Mode" icon="🌙" darkMode={darkMode} />
            {!isHome && token && (
              <>
                <Toggle on={catMode}    onToggle={() => setCatMode(v=>!v)}    label="Cat Mode"    icon="🐱" darkMode={darkMode} />
                <Toggle on={showPlayer} onToggle={() => setShowPlayer(v=>!v)} label="Music Player" icon="🎵" darkMode={darkMode} />
              </>
            )}
          </div>

          {/* Platform */}
          {token && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
              {PLATFORM_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setPlatform(opt.value)}
                  style={{
                    padding:"6px 14px", borderRadius:20, fontSize:"0.8rem", cursor:"pointer",
                    border:`1.5px solid ${platform===opt.value?"#e8a87c":btnBorder}`,
                    background: platform===opt.value?(darkMode?"rgba(232,168,124,0.15)":"rgba(232,168,124,0.1)"):"transparent",
                    color: platform===opt.value?"#c4956a":btnColor,
                    fontWeight:700, fontFamily:"Nunito,sans-serif",
                  }}>
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          )}

          {!isGuest
            ? <button onClick={handleLogout} style={navBtn()}>Logout</button>
            : <Link to="/login" onClick={() => setIsOpen(false)} style={navBtn()}>Login</Link>
          }
          <button onClick={() => setIsOpen(false)}
            style={{ position:"absolute", top:20, right:24, background:"none", border:"none", fontSize:24, color:linkColor, cursor:"pointer" }}>
            ✕
          </button>
        </div>
      )}
    </>
  );
}
