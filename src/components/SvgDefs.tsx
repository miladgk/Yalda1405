export function SvgDefs() {
  return (
    <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
      <defs>
        <radialGradient id="pomRubyShell" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#df294b" />
          <stop offset="48%" stopColor="#9e142d" />
          <stop offset="100%" stopColor="#400715" />
        </radialGradient>

        <radialGradient id="pomInnerChamber" cx="46%" cy="44%" r="60%">
          <stop offset="0%" stopColor="#7c0c22" />
          <stop offset="68%" stopColor="#480614" />
          <stop offset="100%" stopColor="#2a030c" />
        </radialGradient>

        <linearGradient id="pomGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff0cc" />
          <stop offset="48%" stopColor="#dfb16b" />
          <stop offset="100%" stopColor="#b57d34" />
        </linearGradient>

        <linearGradient id="pomPith" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff5df" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#edd09a" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#c9954c" stopOpacity="0.72" />
        </linearGradient>

        <linearGradient id="goldGuilloche" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dfb16b" stopOpacity="0" />
          <stop offset="18%" stopColor="#dfb16b" stopOpacity="0.38" />
          <stop offset="50%" stopColor="#fae3bb" stopOpacity="0.8" />
          <stop offset="82%" stopColor="#dfb16b" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#dfb16b" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="rubyGuilloche" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2645" stopOpacity="0" />
          <stop offset="25%" stopColor="#dc2645" stopOpacity="0.32" />
          <stop offset="50%" stopColor="#ff8da4" stopOpacity="0.56" />
          <stop offset="75%" stopColor="#dc2645" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#dc2645" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="guillochePulseAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2645" stopOpacity="0.45" />
          <stop offset="48%" stopColor="#dfb16b" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#dfb16b" stopOpacity="0" />
        </radialGradient>

        {/* Botanical-Architectural Pomegranate Emblem */}
        <symbol id="iconPomegranateMN" viewBox="0 0 80 80">
          <circle cx="40" cy="49.5" r="23.5" fill="url(#pomRubyShell)" stroke="url(#pomGold)" strokeWidth="1.65" />
          <path d="M21 44 A20 20 0 0 1 36 29.5" fill="none" stroke="#fff4dd" strokeOpacity="0.34" strokeWidth="1.1" strokeLinecap="round" />
          <path
            d="M27.2 29.6 L24.2 15.8 C29.4 19.8 34.4 22.8 40 24.1 C45.6 22.8 50.6 19.8 55.8 15.8 L52.8 29.6"
            fill="none"
            stroke="url(#pomGold)"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M35.5 23.2 L40 12.6 L44.5 23.2" fill="none" stroke="url(#pomGold)" strokeWidth="1.35" strokeLinejoin="round" strokeOpacity="0.88" />
          <path d="M26 29.4 Q40 32.4 54 29.4" fill="none" stroke="url(#pomGold)" strokeWidth="1.15" strokeOpacity="0.72" />
          <ellipse cx="40" cy="50" rx="17.8" ry="17.2" fill="url(#pomInnerChamber)" stroke="url(#pomPith)" strokeWidth="0.95" strokeOpacity="0.65" />
          <path
            d="M22.6 46.5 L28 45.2 M57.4 46.5 L52 45.2 M40 32.8 L40 41.8 M31.8 61.5 L28.2 64.5 M48.2 61.5 L51.8 64.5"
            fill="none"
            stroke="url(#pomPith)"
            strokeWidth="0.75"
            strokeOpacity="0.45"
            strokeLinecap="round"
          />
          <path
            d="M27.4 44.8 C28.2 39.2 31.4 36.2 33.4 36.4 C35.6 36.6 38.4 40.6 40 42.3 C41.6 40.6 44.4 36.6 46.6 36.4 C48.6 36.2 51.8 39.2 52.6 44.8"
            fill="none"
            stroke="url(#pomPith)"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M31.6 61.4 C31.3 56.2 31.4 51.2 32.1 46.6 C36.9 51.6 43.1 56.4 47.9 61.1 C48.6 56.2 48.7 51.2 48.4 46.4"
            fill="none"
            stroke="url(#pomPith)"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="35.3,54.8 38.1,57.5 35.3,60.3 32.5,57.5" fill="#ff5478" stroke="#ffd8e2" strokeWidth="0.45" />
          <polygon points="39.8,59.0 42.2,61.3 39.8,63.7 37.4,61.3" fill="#ff849f" opacity="0.92" />
          <polygon points="27.2,52.6 29.6,55.0 27.2,57.4 24.8,55.0" fill="#e62d52" stroke="#ffb8c8" strokeWidth="0.4" />
          <polygon points="28.6,47.8 30.5,49.7 28.6,51.6 26.7,49.7" fill="#ff9eb4" opacity="0.82" />
          <polygon points="44.7,47.6 47.5,50.3 44.7,53.1 41.9,50.3" fill="#ff5c7e" stroke="#fae3bb" strokeWidth="0.45" />
          <polygon points="40.3,44.4 42.6,46.7 40.3,49.0 38.0,46.7" fill="#ffd9e2" opacity="0.92" />
          <polygon points="52.8,52.4 55.1,54.8 52.8,57.2 50.5,54.8" fill="#e62d52" stroke="#ffb8c8" strokeWidth="0.4" />
          <polygon points="51.4,47.4 53.3,49.3 51.4,51.2 49.5,49.3" fill="#fae3bb" opacity="0.82" />
          <polygon points="34.2,39.4 36.2,41.4 34.2,43.4 32.2,41.4" fill="#ff7392" opacity="0.88" />
          <polygon points="45.8,39.4 47.8,41.4 45.8,43.4 43.8,41.4" fill="#ff8ba5" opacity="0.88" />
          <circle cx="35.3" cy="56.8" r="0.7" fill="#ffffff" opacity="0.8" />
          <circle cx="44.7" cy="49.6" r="0.7" fill="#ffffff" opacity="0.8" />
        </symbol>

      </defs>
    </svg>
  );
}
