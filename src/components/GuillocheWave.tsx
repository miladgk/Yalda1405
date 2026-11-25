import { useId } from 'react';

interface GuillocheWaveProps {
  className?: string;
}

export function GuillocheWave({ className = 'block h-3.5 w-full pointer-events-none' }: GuillocheWaveProps) {
  const uid = useId().replace(/:/g, '');
  const goldId = `gw-gold-${uid}`;
  const rubyId = `gw-ruby-${uid}`;
  const auraId = `gw-aura-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 600 22"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dfb16b" stopOpacity="0" />
          <stop offset="18%" stopColor="#dfb16b" stopOpacity="0.38" />
          <stop offset="50%" stopColor="#fae3bb" stopOpacity="0.8" />
          <stop offset="82%" stopColor="#dfb16b" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#dfb16b" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={rubyId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2645" stopOpacity="0" />
          <stop offset="25%" stopColor="#dc2645" stopOpacity="0.32" />
          <stop offset="50%" stopColor="#ff8da4" stopOpacity="0.56" />
          <stop offset="75%" stopColor="#dc2645" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#dc2645" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={auraId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2645" stopOpacity="0.45" />
          <stop offset="48%" stopColor="#dfb16b" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#dfb16b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle central ambient aura */}
      <ellipse
        cx="300"
        cy="11"
        rx="92"
        ry="7.5"
        fill={`url(#${auraId})`}
        className="guilloche-aura-pulse"
      />

      {/* Ruby and Gold Counter-Harmonic Waves with lub-dub vertical heartbeat */}
      <g className="guilloche-wave-beat">
        <path
          d="M0,11 C95,11 165,9.4 225,11.6 C248,12.4 256,16.5 270,13.5 C284,10.5 292,5.5 306,11 C320,16.5 330,13.2 346,8.8 C362,4.8 378,11.8 410,11.4 C465,10.8 525,11 600,11"
          fill="none"
          stroke={`url(#${rubyId})`}
          strokeWidth="0.82"
        />
        <path
          d="M0,11 C110,11 180,12.6 232,10.4 C249,9.6 259,5.8 273,9.2 C287,12.6 297,16.8 311,11.4 C325,6.2 336,8.8 352,13.6 C366,17.2 384,10.4 420,10.8 C475,11.4 535,11 600,11"
          fill="none"
          stroke={`url(#${goldId})`}
          strokeWidth="0.65"
          opacity="0.58"
        />
        <path
          d="M0,11 L212,11 C228,11 237,14.8 246,14.8 C253,14.8 258,5.6 266,5.6 C273,5.6 277,13.4 284,13.4 C291,13.4 295,5.6 302,5.6 C309,5.6 314,15.2 322,15.2 C329,15.2 334,6 341,6 C348,6 358,15.2 365,15.2 C372,15.2 377,6.4 384,6.4 C392,6.4 398,11 416,11 L600,11"
          fill="none"
          stroke={`url(#${goldId})`}
          strokeWidth="1.0"
          strokeLinecap="round"
        />
      </g>

      {/* Luminous traveling pulse signals radiating outward from the center */}
      <path
        d="M302,11 L295,5.6 L284,13.4 L273,5.6 L258,5.6 L246,14.8 L212,11 L0,11"
        fill="none"
        stroke="#fff3d6"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="guilloche-signal-left"
      />
      <path
        d="M302,11 L309,5.6 L322,15.2 L334,6 L348,6 L365,15.2 L384,6.4 L416,11 L600,11"
        fill="none"
        stroke="#fff3d6"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="guilloche-signal-right"
      />

      {/* Central Heartbeat Diamond Core */}
      <g className="guilloche-core-beat">
        <circle cx="300" cy="11" r="4.5" fill="#dc2645" fillOpacity="0.28" />
        <polygon points="300,8.6 302.6,11 300,13.4 297.4,11" fill="#fff2d2" />
      </g>
    </svg>
  );
}
