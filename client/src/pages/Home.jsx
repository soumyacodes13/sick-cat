import { useNavigate } from "react-router-dom";

export default function Home({ darkMode }) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen font-nunito overflow-hidden relative transition-colors duration-300 ${darkMode ? "bg-[#1a160e]" : "bg-cream"}`}>

      {/* ── Background blobs (position absolute, no scroll lag) ── */}
      <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-peach/20 blur-3xl pointer-events-none" />
      <div className="absolute top-[200px] right-[-100px] w-[400px] h-[400px] rounded-full bg-rose/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[30%] w-[350px] h-[350px] rounded-full bg-sage/15 blur-3xl pointer-events-none" />

      {/* ── Decorative floating elements ── */}
      <div className="absolute top-32 left-[8%] text-4xl opacity-20 select-none pointer-events-none animate-bounce" style={{ animationDuration: "6s" }}>🎵</div>
      <div className="absolute top-48 right-[10%] text-3xl opacity-15 select-none pointer-events-none animate-bounce" style={{ animationDuration: "8s", animationDelay: "1s" }}>🎶</div>
      <div className="absolute bottom-32 left-[15%] text-2xl opacity-15 select-none pointer-events-none animate-bounce" style={{ animationDuration: "7s", animationDelay: "2s" }}>🍃</div>
      <div className="absolute bottom-48 right-[12%] text-3xl opacity-10 select-none pointer-events-none animate-bounce" style={{ animationDuration: "9s", animationDelay: "0.5s" }}>☁️</div>

      {/* ── Hero content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-6 pt-24 pb-16">

        {/* Eyebrow tag */}
        <div className="animate-[fadeUp_0.6s_0.1s_ease_both] opacity-0 mb-6">
          <span className="inline-flex items-center gap-2 bg-white/80 border border-sand/30 text-muted text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-peach inline-block" />
            Your cozy music corner
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-[fadeUp_0.6s_0.2s_ease_both] opacity-0 font-lora text-5xl md:text-6xl lg:text-7xl font-semibold text-bark leading-tight max-w-3xl mb-6">
          A cozy space for your{" "}
          <span className="bg-gradient-to-r from-peach via-rose to-[#b8a8d8] bg-clip-text text-transparent">
            music & memories
          </span>
        </h1>

        {/* Subtext */}
        <p className="animate-[fadeUp_0.6s_0.35s_ease_both] opacity-0 text-muted text-lg max-w-md leading-relaxed mb-10">
          Discover songs by mood. Build playlists. Let your cat companion vibe along with you.
        </p>

        {/* CTA buttons */}
        <div className="animate-[fadeUp_0.6s_0.5s_ease_both] opacity-0 flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate("/music")}
            className="bg-gradient-to-r from-peach to-rose text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-peach/30 hover:shadow-peach/50 hover:-translate-y-0.5 transition-all duration-200 text-sm"
          >
            Explore Music 🎧
          </button>
          <button
            onClick={() => navigate("/games")}
            className="bg-white/80 border border-sand/40 text-bark font-bold px-8 py-3.5 rounded-full hover:bg-white hover:-translate-y-0.5 transition-all duration-200 text-sm shadow-sm"
          >
            Customize Cat 🐱
          </button>
        </div>

        {/* Feature pills */}
        <div className="animate-[fadeUp_0.6s_0.65s_ease_both] opacity-0 flex gap-3 flex-wrap justify-center mt-12">
          {[
            { icon: "🌊", label: "Mood Detection" },
            { icon: "🎧", label: "Ambience Sounds" },
            { icon: "🐾", label: "Cat Companion" },
            { icon: "📊", label: "Listening Stats" },
          ].map(f => (
            <span
              key={f.label}
              className="flex items-center gap-1.5 bg-white/70 border border-sand/25 text-muted text-xs font-semibold px-3.5 py-1.5 rounded-full"
            >
              {f.icon} {f.label}
            </span>
          ))}
        </div>

        {/* Cards preview strip */}
        <div className="animate-[fadeUp_0.6s_0.8s_ease_both] opacity-0 mt-16 flex gap-4 flex-wrap justify-center max-w-2xl">
          {[
            { mood: "😄", label: "Happy", color: "bg-amber-50 border-amber-200" },
            { mood: "😌", label: "Calm",  color: "bg-cyan-50  border-cyan-200"  },
            { mood: "😢", label: "Sad",   color: "bg-indigo-50 border-indigo-200" },
            { mood: "🎯", label: "Focus", color: "bg-emerald-50 border-emerald-200" },
          ].map(m => (
            <div key={m.label} className={`${m.color} border rounded-2xl px-5 py-3 flex items-center gap-2 shadow-sm`}>
              <span className="text-xl">{m.mood}</span>
              <span className="text-xs font-bold text-bark">{m.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Fade-in keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
