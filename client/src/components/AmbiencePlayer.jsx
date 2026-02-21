import { useState, useRef, useEffect } from "react";

const SOUNDS = [
  {
    key: "rain",
    label: "Rain",
    emoji: "🌧️",
    color: "#60a5fa",
    // Procedural rain via AudioContext
  },
  {
    key: "fireplace",
    label: "Fireplace",
    emoji: "🔥",
    color: "#fb923c",
  },
  {
    key: "cafe",
    label: "Café",
    emoji: "☕",
    color: "#a78b71",
  },
];

// Generate procedural audio using Web Audio API
function createRainNode(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Heavy low-pass for rain
  const lpf = ctx.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 800;

  // Slight tremolo for variation
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.18;

  source.connect(lpf);
  lpf.connect(gainNode);
  return { source, output: gainNode };
}

function createFireplaceNode(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lpf = ctx.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 300;

  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.value = 80;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.22;

  source.connect(hpf);
  hpf.connect(lpf);
  lpf.connect(gainNode);
  return { source, output: gainNode };
}

function createCafeNode(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Pink noise approximation via multiple bandpass
  const filters = [200, 500, 1200, 3000].map(freq => {
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = 0.5;
    return f;
  });

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.08;

  source.connect(filters[0]);
  for (let i = 0; i < filters.length - 1; i++) filters[i].connect(filters[i + 1]);
  filters[filters.length - 1].connect(gainNode);

  return { source, output: gainNode };
}

export default function AmbiencePlayer() {
  const [active, setActive] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const ctxRef = useRef(null);
  const nodesRef = useRef({});
  const masterGainRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  };

  const stopAll = () => {
    Object.values(nodesRef.current).forEach(node => {
      try { node.source.stop(); } catch (e) {}
    });
    nodesRef.current = {};
  };

  const toggle = (key) => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    if (active === key) {
      stopAll();
      setActive(null);
      return;
    }

    stopAll();
    setActive(key);

    let node;
    if (key === "rain") node = createRainNode(ctx);
    else if (key === "fireplace") node = createFireplaceNode(ctx);
    else node = createCafeNode(ctx);

    node.output.connect(masterGainRef.current);
    node.source.start();
    nodesRef.current[key] = node;
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => stopAll();
  }, []);

  return (
    <div style={{
      background: "var(--card)", borderRadius: 16,
      padding: "14px 16px", border: "1px solid var(--border)",
      backdropFilter: "blur(8px)",
    }}>
      <p style={{ fontSize: "0.7rem", color: "var(--text-mid)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
        🎧 Ambience
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {SOUNDS.map(s => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            style={{
              padding: "6px 12px", borderRadius: 20, fontSize: "0.78rem", cursor: "pointer",
              border: `1.5px solid ${active === s.key ? s.color : "rgba(196,165,140,0.3)"}`,
              background: active === s.key ? `${s.color}22` : "rgba(255,255,255,0.5)",
              color: active === s.key ? s.color : "#9c8070",
              fontWeight: active === s.key ? 700 : 400,
              transition: "all 0.2s",
              boxShadow: active === s.key ? `0 0 12px ${s.color}44` : "none",
            }}
          >
            {s.emoji} {s.label}
            {active === s.key && (
              <span style={{ marginLeft: 4, fontSize: 10 }}>
                {["▪","▫","▪"][Math.floor(Date.now() / 500) % 3]}
              </span>
            )}
          </button>
        ))}
      </div>
      {active && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#a08c7a" }}>🔈</span>
          <input
            type="range" min="0" max="1" step="0.05"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: SOUNDS.find(s => s.key === active)?.color, height: 3 }}
          />
          <span style={{ fontSize: 11, color: "#a08c7a" }}>🔊</span>
        </div>
      )}
    </div>
  );
}
