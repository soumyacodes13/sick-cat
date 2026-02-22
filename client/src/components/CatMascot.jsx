import { useEffect, useRef, useState, useCallback } from "react";

// States: idle | happy | sad | dancing | sleeping | sitting | stretching | yawning
// Click states: poke | surprised | annoyed | playful | heart

const CLICK_SEQUENCES = [
  { state: "poke",      bubble: "Hey! 👋",         duration: 1800 },
  { state: "surprised", bubble: "Whoa! 😲",         duration: 1600 },
  { state: "playful",   bubble: "Hehe~ 😸",         duration: 2000 },
  { state: "annoyed",   bubble: "Mrrow! 😾",        duration: 2200 },
  { state: "heart",     bubble: "♡ purr ♡",        duration: 2000 },
  { state: "poke",      bubble: "Again?! 😤",       duration: 1800 },
  { state: "dizzy",     bubble: "...dizzy 😵",      duration: 2400 },
];

export default function CatMascot({
  catState = "idle",
  catColor = "#c4956a",
  accessory = "none",
  visible = true,
  happiness = 70,
  onWake,
}) {
  const [animTick, setAnimTick] = useState(0);
  const [bubble, setBubble] = useState(null);
  const [clickState, setClickState] = useState(null); // overrides catState temporarily
  const [clickCount, setClickCount] = useState(0);
  const [shakeX, setShakeX] = useState(0);
  const tickRef = useRef(null);
  const bubbleTimer = useRef(null);
  const clickTimer = useRef(null);

  useEffect(() => {
    if (!visible) return;
    tickRef.current = setInterval(() => setAnimTick(t => t + 1), 80);
    return () => clearInterval(tickRef.current);
  }, [visible]);

  // Speech bubble on app state changes (only when not in click state)
  useEffect(() => {
    if (clickState) return;
    if (catState === "happy")   { setBubble("Meow! 🎵"); clearTimeout(bubbleTimer.current); bubbleTimer.current = setTimeout(() => setBubble(null), 2500); }
    else if (catState === "sad")    { setBubble("...mrrr 😿"); clearTimeout(bubbleTimer.current); bubbleTimer.current = setTimeout(() => setBubble(null), 2500); }
    else if (catState === "dancing"){ setBubble("Purrr~ 🎶"); clearTimeout(bubbleTimer.current); bubbleTimer.current = setTimeout(() => setBubble(null), 2000); }
    else setBubble(null);
  }, [catState, clickState]);

  const handleClick = useCallback(() => {
    const seq = CLICK_SEQUENCES[clickCount % CLICK_SEQUENCES.length];
    setClickCount(c => c + 1);
    onWake?.();
    setClickState(seq.state);
    setBubble(seq.bubble);

    // Shake on annoyed/poke
    if (seq.state === "annoyed" || seq.state === "poke") {
      let s = 0;
      const shakeInterval = setInterval(() => {
        setShakeX(Math.sin(s++ * 1.8) * 6);
        if (s > 8) { clearInterval(shakeInterval); setShakeX(0); }
      }, 40);
    }

    clearTimeout(clickTimer.current);
    clearTimeout(bubbleTimer.current);
    clickTimer.current = setTimeout(() => {
      setClickState(null);
      setBubble(null);
    }, seq.duration);
    bubbleTimer.current = setTimeout(() => setBubble(null), seq.duration - 200);
  }, [clickCount]);

  if (!visible) return null;

  // Resolve active state (click overrides app state)
  const activeState = clickState || catState;
  const t = animTick;
  const shade = darken(catColor, 0.18);
  const light = lighten(catColor, 0.22);

  // ── Animation math ──
  const bodyBob   = activeState === "dancing"  ? Math.sin(t * 0.4) * 5
                  : activeState === "playful"  ? Math.sin(t * 0.6) * 7 : 0;
  const headTilt  = activeState === "dancing"  ? Math.sin(t * 0.3) * 8
                  : activeState === "happy"    ? Math.sin(t * 0.5) * 4
                  : activeState === "playful"  ? Math.sin(t * 0.4) * 10
                  : activeState === "dizzy"    ? Math.sin(t * 0.2) * 15
                  : activeState === "annoyed"  ? -8 : 0;
  const jumpY     = activeState === "happy"    ? Math.abs(Math.sin(t * 0.3)) * -14
                  : activeState === "surprised"? Math.abs(Math.sin(t * 0.8)) * -10
                  : activeState === "heart"    ? Math.sin(t * 0.2) * -3 : 0;
  const sleepScale= activeState === "sleeping" ? 0.88 : 1;
  const stretchX  = activeState === "stretching"? 1 + Math.sin(t * 0.08) * 0.12 : 1;
  const pokeSquish= activeState === "poke"     ? 1 + Math.abs(Math.sin(t * 0.5)) * 0.08 : 1; // body squish
  const tailWag   = activeState === "dancing"  ? Math.sin(t * 0.5) * 25
                  : activeState === "happy"    ? Math.sin(t * 0.35) * 18
                  : activeState === "playful"  ? Math.sin(t * 0.6) * 30
                  : activeState === "sleeping" ? 0
                  : activeState === "annoyed"  ? Math.sin(t * 0.8) * 20
                  : Math.sin(t * 0.15) * 8;

  const eyeOpen   = activeState === "sleeping"  ? 0.1
                  : activeState === "sad"        ? 0.55
                  : activeState === "dizzy"      ? 0.4
                  : activeState === "surprised"  ? 1.3  // wide eyes
                  : 1;
  const pupilSize = activeState === "surprised" ? 6
                  : activeState === "heart"      ? 0    // replaced by hearts
                  : activeState === "dizzy"      ? 3 : 4;
  const pupilY    = activeState === "sad" || activeState === "annoyed" ? 2 : -1;

  const mouthHappy = activeState === "happy" || activeState === "dancing" || activeState === "playful" || activeState === "heart";
  const mouthSad   = activeState === "sad" || activeState === "annoyed";
  const mouthOpen  = activeState === "surprised" || activeState === "dizzy";
  const yawnMouth  = activeState === "yawning" ? Math.abs(Math.sin(t * 0.12)) * 12 : 0;

  const totalY = jumpY + bodyBob + shakeX * 0.3;
  const totalX = shakeX;

  return (
    <div
      style={{ position: "relative", display: "inline-block", userSelect: "none", cursor: "pointer" }}
      onClick={handleClick}
      title="Click me!"
    >
      {/* Speech bubble */}
      {bubble && (
        <div style={{
          position: "absolute", top: -48, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.97)", borderRadius: 12, padding: "5px 13px",
          fontSize: 13, fontWeight: 700, color: "#7c6a5e",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          whiteSpace: "nowrap", zIndex: 10,
          animation: "bubblePop 0.25s ease",
          pointerEvents: "none",
        }}>
          {bubble}
          <div style={{
            position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
            borderTop: "6px solid rgba(255,255,255,0.97)",
          }} />
        </div>
      )}

      <svg
        width="90" height="100"
        viewBox="0 0 90 110"
        style={{
          transform: `translate(${totalX}px, ${totalY}px) rotate(${headTilt * 0.25}deg) scaleX(${stretchX}) scale(${sleepScale})`,
          transition: activeState === "sleeping" ? "transform 1s ease" : "transform 0.08s ease",
          overflow: "visible",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))",
        }}
      >
        {/* Tail */}
        <path
          d={`M 45 90 Q ${55 + tailWag} 105 ${40 + tailWag * 0.5} 108`}
          fill="none" stroke={shade} strokeWidth="7" strokeLinecap="round"
        />

        {/* Body */}
        <ellipse
          cx="45" cy="82"
          rx={26 * pokeSquish} ry={activeState === "sleeping" ? 18 : 22 / pokeSquish}
          fill={catColor}
        />

        {/* Sleeping curl */}
        {activeState === "sleeping" && (
          <path d="M 22 84 Q 45 70 68 84" fill="none" stroke={shade} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        )}

        {/* Paws */}
        <ellipse cx="32" cy="100" rx="9" ry="6" fill={shade} />
        <ellipse cx="58" cy="100" rx="9" ry="6" fill={shade} />

        {/* Front paws raised on surprised/heart */}
        {(activeState === "surprised" || activeState === "heart") && (
          <>
            <ellipse cx="26" cy="85" rx="8" ry="6" fill={shade} transform="rotate(-30 26 85)" />
            <ellipse cx="64" cy="85" rx="8" ry="6" fill={shade} transform="rotate(30 64 85)" />
          </>
        )}

        {/* Head */}
        <g transform={`rotate(${headTilt}, 45, 52)`}>
          <ellipse cx="45" cy="50" rx="22" ry="22" fill={catColor} />

          {/* Ears — flattened when annoyed */}
          {activeState === "annoyed" ? (
            <>
              <polygon points="26,38 22,26 36,34" fill={catColor} />
              <polygon points="64,38 68,26 54,34" fill={catColor} />
              <polygon points="27,37 24,28 35,33" fill="#f4a0b0" opacity="0.7" />
              <polygon points="63,37 66,28 55,33" fill="#f4a0b0" opacity="0.7" />
            </>
          ) : (
            <>
              <polygon points="26,35 20,18 36,30" fill={catColor} />
              <polygon points="64,35 70,18 54,30" fill={catColor} />
              <polygon points="28,33 23,20 35,30" fill="#f4a0b0" opacity="0.7" />
              <polygon points="62,33 67,20 55,30" fill="#f4a0b0" opacity="0.7" />
            </>
          )}

          {/* Eyes */}
          {activeState === "sleeping" ? (
            <>
              <path d="M 31 53 Q 37 49 43 53" fill="none" stroke="#3d2c1e" strokeWidth="2" strokeLinecap="round" />
              <path d="M 47 53 Q 53 49 59 53" fill="none" stroke="#3d2c1e" strokeWidth="2" strokeLinecap="round" />
              <text x="63" y="38" fontSize="10" fill="#b8a99a" fontWeight="bold" opacity={0.5 + Math.sin(t * 0.1) * 0.5}>z</text>
              <text x="70" y="30" fontSize="8"  fill="#b8a99a" fontWeight="bold" opacity={0.5 + Math.cos(t * 0.1) * 0.5}>z</text>
            </>
          ) : activeState === "heart" ? (
            // Heart eyes
            <>
              <text x="29" y="58" fontSize="14" textAnchor="middle">♥</text>
              <text x="61" y="58" fontSize="14" textAnchor="middle">♥</text>
            </>
          ) : activeState === "dizzy" ? (
            // X eyes
            <>
              <text x="29" y="57" fontSize="12" textAnchor="middle" fill="#9c8070" fontWeight="bold">×</text>
              <text x="61" y="57" fontSize="12" textAnchor="middle" fill="#9c8070" fontWeight="bold">×</text>
            </>
          ) : (
            <>
              <ellipse cx="37" cy="53" rx="8" ry={8 * eyeOpen} fill="white" />
              <ellipse cx="53" cy="53" rx="8" ry={8 * eyeOpen} fill="white" />
              <ellipse cx="37" cy={53 + pupilY} rx={pupilSize} ry={Math.min(pupilSize + 1, 6)} fill="#3d2c1e" />
              <ellipse cx="53" cy={53 + pupilY} rx={pupilSize} ry={Math.min(pupilSize + 1, 6)} fill="#3d2c1e" />
              <circle cx="39" cy={51 + pupilY} r="1.5" fill="white" />
              <circle cx="55" cy={51 + pupilY} r="1.5" fill="white" />
            </>
          )}

          {/* Nose */}
          <polygon points="45,59 42,62 48,62" fill="#f48fb1" />

          {/* Mouth */}
          {yawnMouth > 0 && <ellipse cx="45" cy={65 + yawnMouth * 0.4} rx="7" ry={3 + yawnMouth * 0.5} fill="#3d2c1e" />}
          {mouthOpen && !yawnMouth && <ellipse cx="45" cy="66" rx="5" ry="4" fill="#3d2c1e" />}
          {!yawnMouth && !mouthOpen && mouthHappy && <path d="M 40 64 Q 45 70 50 64" fill="none" stroke="#3d2c1e" strokeWidth="2" strokeLinecap="round" />}
          {!yawnMouth && !mouthOpen && mouthSad   && <path d="M 40 68 Q 45 63 50 68" fill="none" stroke="#3d2c1e" strokeWidth="2" strokeLinecap="round" />}
          {!yawnMouth && !mouthOpen && !mouthHappy && !mouthSad && <path d="M 41 65 Q 45 67 49 65" fill="none" stroke="#3d2c1e" strokeWidth="1.5" strokeLinecap="round" />}

          {/* Whiskers */}
          <line x1="22" y1="60" x2="40" y2="62" stroke={shade} strokeWidth="1.2" opacity="0.6" />
          <line x1="22" y1="64" x2="40" y2="64" stroke={shade} strokeWidth="1.2" opacity="0.6" />
          <line x1="50" y1="62" x2="68" y2="60" stroke={shade} strokeWidth="1.2" opacity="0.6" />
          <line x1="50" y1="64" x2="68" y2="64" stroke={shade} strokeWidth="1.2" opacity="0.6" />

          {/* Blush */}
          {(mouthHappy || activeState === "heart") && (
            <>
              <ellipse cx="30" cy="60" rx="7" ry="5" fill="#f48fb1" opacity="0.3" />
              <ellipse cx="60" cy="60" rx="7" ry="5" fill="#f48fb1" opacity="0.3" />
            </>
          )}

          {/* Sweat drop on annoyed */}
          {activeState === "annoyed" && (
            <ellipse cx="66" cy="36" rx="3" ry="5" fill="#93c5fd" opacity="0.8" />
          )}

          {/* Stars on dizzy */}
          {activeState === "dizzy" && (
            <>
              <text x="18" y="38" fontSize="10" opacity={0.5 + Math.sin(t * 0.3) * 0.5}>⭐</text>
              <text x="65" y="34" fontSize="9"  opacity={0.5 + Math.cos(t * 0.3) * 0.5}>✨</text>
            </>
          )}

          {/* Accessories */}
          {accessory === "headphones" && (
            <g>
              <path d="M 24 50 Q 24 28 45 28 Q 66 28 66 50" fill="none" stroke="#7c5cfc" strokeWidth="5" strokeLinecap="round" />
              <rect x="19" y="48" width="10" height="14" rx="5" fill="#7c5cfc" />
              <rect x="61" y="48" width="10" height="14" rx="5" fill="#7c5cfc" />
            </g>
          )}
          {accessory === "scarf" && (
            <g>
              <rect x="24" y="68" width="42" height="12" rx="6" fill="#e57373" />
              <rect x="38" y="72" width="16" height="20" rx="4" fill="#ef9a9a" />
              <line x1="30" y1="70" x2="60" y2="70" stroke="#c62828" strokeWidth="1.5" opacity="0.4" />
              <line x1="30" y1="74" x2="60" y2="74" stroke="#c62828" strokeWidth="1.5" opacity="0.4" />
            </g>
          )}
          {accessory === "bowtie" && (
            <g>
              <polygon points="38,72 45,76 38,80" fill="#7c5cfc" />
              <polygon points="52,72 45,76 52,80" fill="#7c5cfc" />
              <circle cx="45" cy="76" r="3" fill="#5b3fd4" />
            </g>
          )}
        </g>

        {/* Sitting paws */}
        {activeState === "sitting" && (
          <>
            <ellipse cx="36" cy="98" rx="9" ry="7" fill={light} />
            <ellipse cx="54" cy="98" rx="9" ry="7" fill={light} />
          </>
        )}

        {/* Sparkles on happy/heart */}
        {(activeState === "happy" || activeState === "heart") && (
          <>
            <text x="72" y="45" fontSize="12" opacity={0.5 + Math.sin(t * 0.4) * 0.5}>✨</text>
            <text x="5"  y="55" fontSize="10" opacity={0.5 + Math.cos(t * 0.4) * 0.5}>⭐</text>
          </>
        )}

        {/* Music notes on dancing */}
        {activeState === "dancing" && (
          <>
            <text x="72" y={40 + Math.sin(t * 0.3) * 4} fontSize="11" opacity="0.7">♪</text>
            <text x="6"  y={50 + Math.cos(t * 0.3) * 4} fontSize="10" opacity="0.6">♫</text>
          </>
        )}
      </svg>

      <style>{`
        @keyframes bubblePop {
          from { transform: translateX(-50%) scale(0.4); opacity: 0; }
          to   { transform: translateX(-50%) scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function darken(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `rgb(${r},${g},${b})`;
}

function lighten(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `rgb(${r},${g},${b})`;
}
