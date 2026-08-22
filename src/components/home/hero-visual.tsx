export function HeroVisual() {
  return (
    <svg
      viewBox="0 0 560 460"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Abstract illustration of global travel and opportunity"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="560" height="460" fill="#E8E8E8" />
      <rect x="48" y="56" width="180" height="220" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.85" />
      <rect x="320" y="120" width="200" height="260" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.65" />
      <path
        d="M40 340c80-20 140 20 230 8 90-12 150-50 250-18"
        fill="none"
        stroke="#000000"
        strokeDasharray="6 8"
        strokeWidth="1.2"
        opacity="0.25"
      />
      <circle cx="392" cy="188" r="96" fill="#FFFFFF" />
      <circle cx="392" cy="188" r="96" fill="none" stroke="#000000" strokeWidth="1" opacity="0.15" />
      <ellipse cx="392" cy="188" rx="38" ry="96" fill="none" stroke="#000000" strokeWidth="1" opacity="0.2" />
      <path d="M296 188h192" stroke="#000000" strokeWidth="1" opacity="0.2" />
      <circle cx="120" cy="128" r="6" fill="#000000" opacity="0.7" />
      <path
        d="M128 124c42-18 110-22 168 12"
        fill="none"
        stroke="#000000"
        strokeWidth="1.4"
        opacity="0.35"
      />
      <g transform="translate(290 96)">
        <path d="M0 10 L38 4 L44 10 L28 16 L22 22 L14 18 Z" fill="#000000" opacity="0.75" />
      </g>
      <g fill="#000000" opacity="0.82">
        <rect x="56" y="268" width="22" height="92" />
        <rect x="84" y="228" width="28" height="132" />
        <rect x="120" y="248" width="18" height="112" />
        <rect x="146" y="210" width="36" height="150" />
        <path d="M154 168h20l8 42H146Z" />
        <rect x="192" y="256" width="24" height="104" />
        <rect x="226" y="236" width="16" height="124" />
        <rect x="250" y="272" width="30" height="88" />
      </g>
      <g fill="#525252" opacity="0.75">
        <rect x="430" y="292" width="18" height="68" />
        <rect x="454" y="260" width="26" height="100" />
        <path d="M462 228h10v32h-10Z" />
        <rect x="488" y="300" width="14" height="60" />
      </g>
    </svg>
  );
}
