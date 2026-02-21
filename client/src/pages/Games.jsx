import CatCustomizer from "../components/CatCustomizer";

export default function Games({ catMode, catColor, setCatColor, accessory, setAccessory, catHappiness, darkMode }) {
  return (
    <>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        body { background: var(--bg); font-family: 'Nunito', sans-serif; }
      `}</style>

      <div className={`min-h-screen pt-28 px-5 md:px-12 pb-20 ${darkMode ? "bg-[#1a160e]" : "bg-cream"}`}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          <div className="text-center mb-10">
            {/* <p className="text-xs text-sand font-bold uppercase tracking-widest mb-2">🐾 Games & Customization</p> */}
            <h1 className="font-nunito text-4xl font-black text-bark mb-2">Make it yours ✨</h1>
            <p className="text-muted text-sm">Customize your companion</p>
          </div>

          {/* Cat mode off banner */}
          {!catMode && (
            <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <span className="text-2xl">🐱</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Cat Mode is off</p>
                <p className="text-xs text-amber-600">Turn on Cat Mode from the Music page to see your companion here.</p>
              </div>
            </div>
          )}

          {/* Customizer — only shown when cat mode is on */}
          {catMode ? (
            <CatCustomizer
              catColor={catColor}   setCatColor={setCatColor}
              accessory={accessory} setAccessory={setAccessory}
              catHappiness={catHappiness}
            />
          ) : (
            /* Greyed out placeholder */
            <div className="rounded-3xl border border-sand/20 bg-parchment/40 p-10 text-center opacity-50 select-none mb-6">
              <div className="text-6xl mb-4 grayscale">🐱</div>
              <p className="text-sm font-bold text-muted">Cat customizer hidden</p>
              <p className="text-xs text-sand mt-1">Enable Cat Mode to customize your companion</p>
            </div>
          )}

          {/* Games grid */}
          <div className="mt-7 grid grid-cols-2 gap-4">
            {[
              // { emoji: "🎵", title: "Name That Tune",  desc: "Guess the song from a snippet" },
              // { emoji: "🧩", title: "Mood Puzzle",      desc: "Match songs to moods" },
              // { emoji: "🎤", title: "Lyric Fill-in",    desc: "Complete the lyrics" },
              // { emoji: "🃏", title: "Album Art Quiz",   desc: "Guess the album from art" },
            ].map(game => (
              <div key={game.title} className="bg-parchment/60 border border-sand/25 rounded-2xl p-5 text-center opacity-75">
                <div className="text-3xl mb-2">{game.emoji}</div>
                <h3 className="text-sm font-black text-bark mb-1">{game.title}</h3>
                <p className="text-xs text-muted mb-3">{game.desc}</p>
                <span className="text-xs px-3 py-1 rounded-full bg-sand/15 text-sand border border-sand/25 font-bold">
                  Coming soon 🌸
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
