/**
 * Generates high-fidelity 1200x630 Open Graph preview card SVGs
 * for social media platforms (Twitter, LinkedIn, Slack, Discord, Facebook, WhatsApp).
 */

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface OgImageOptions {
  brandName: string;
  oneLinePitch: string;
  archetype?: string;
  themeName?: string;
  colors?: string[];
  arbitrationVerdict?: string;
}

export function generateOgCardSvg(options: OgImageOptions): string {
  const brandName = escapeXml(options.brandName || 'Brand Strategy Dossier');
  const rawPitch = options.oneLinePitch || 'AI-crafted brand strategy arbitrated by Growth VC, Creative Director, and Brutal Skeptic.';
  const archetype = escapeXml(options.archetype || 'STRATEGIC IDENTITY');
  const theme = escapeXml(options.themeName || 'Modern Kinetic');
  const primaryColor = options.colors?.[0] || '#06b6d4';
  const accentColor = options.colors?.[1] || '#fbbf24';
  const altColor = options.colors?.[2] || '#10b981';

  // Truncate pitch nicely before escaping to never slice through an entity
  const cleanPitch = rawPitch.length > 170 ? rawPitch.slice(0, 167) + '...' : rawPitch;

  // Split pitch into two lines if needed
  let rawLine1 = cleanPitch;
  let rawLine2 = '';
  if (cleanPitch.length > 80) {
    const spaceIndex = cleanPitch.lastIndexOf(' ', 80);
    if (spaceIndex !== -1) {
      rawLine1 = cleanPitch.slice(0, spaceIndex);
      rawLine2 = cleanPitch.slice(spaceIndex + 1);
    }
  }

  const line1 = escapeXml(rawLine1);
  const line2 = escapeXml(rawLine2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#05070c"/>
      <stop offset="50%" stop-color="#0a0e17"/>
      <stop offset="100%" stop-color="#070a12"/>
    </linearGradient>

    <!-- Radial Glows -->
    <radialGradient id="glowPrimary" cx="80%" cy="20%" r="55%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="${primaryColor}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glowAccent" cx="15%" cy="85%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="${accentColor}" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Grid Pattern -->
    <pattern id="cardGrid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1f293d" stroke-width="0.75" stroke-opacity="0.35"/>
      <circle cx="48" cy="48" r="1.5" fill="#38bdf8" fill-opacity="0.2"/>
    </pattern>

    <!-- Card Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#818cf8" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#cardGrid)"/>
  <rect width="1200" height="630" fill="url(#glowPrimary)"/>
  <rect width="1200" height="630" fill="url(#glowAccent)"/>

  <!-- Outer Framing Border with Glow -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="url(#borderGrad)" stroke-width="2"/>
  <rect x="25" y="25" width="1150" height="580" rx="27" fill="#0c121d" fill-opacity="0.55"/>

  <!-- Header Bar -->
  <g transform="translate(68, 70)">
    <!-- Platform Monogram Icon -->
    <rect x="0" y="0" width="46" height="46" rx="12" fill="url(#borderGrad)"/>
    <text x="23" y="30" text-anchor="middle" font-family="'Space Grotesk', -apple-system, sans-serif" font-weight="900" font-size="20" fill="#080c14">BB</text>

    <!-- App Title & Tag -->
    <text x="62" y="22" font-family="'Space Grotesk', -apple-system, sans-serif" font-weight="800" font-size="20" fill="#ffffff" letter-spacing="1">BrandBattle</text>
    <text x="62" y="39" font-family="'JetBrains Mono', monospace" font-size="11" fill="#94a3b8" letter-spacing="1.5">MULTI-AGENT BRAND ARBITRATION STUDIO</text>

    <!-- Verified Badge -->
    <g transform="translate(850, 4)">
      <rect x="0" y="0" width="168" height="34" rx="17" fill="#062d27" stroke="#10b981" stroke-width="1.2"/>
      <circle cx="18" cy="17" r="4.5" fill="#10b981"/>
      <text x="32" y="22" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#34d399" letter-spacing="1">VERIFIED DOSSIER</text>
    </g>
  </g>

  <!-- Horizontal Divider -->
  <line x1="68" y1="140" x2="1132" y2="140" stroke="#1e293b" stroke-width="1.2"/>

  <!-- Brand Identity Main Showcase -->
  <g transform="translate(68, 200)">
    <!-- Archetype Chip -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="${Math.max(archetype.length * 9.5 + 28, 160)}" height="28" rx="14" fill="#172233" stroke="${primaryColor}" stroke-width="1"/>
      <text x="14" y="18" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="${primaryColor}" letter-spacing="1">${archetype.toUpperCase()}</text>
    </g>

    <!-- Hero Brand Name -->
    <text x="0" y="85" font-family="'Space Grotesk', -apple-system, sans-serif" font-weight="900" font-size="64" fill="#ffffff" letter-spacing="-1">
      ${brandName}
    </text>

    <!-- Quote One-Line Pitch -->
    <text x="0" y="150" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="500" font-size="24" fill="#e2e8f0" letter-spacing="-0.2">
      "${line1}"
    </text>
    ${
      line2
        ? `<text x="0" y="186" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="500" font-size="24" fill="#cbd5e1" letter-spacing="-0.2">
      ${line2}"
    </text>`
        : ''
    }
  </g>

  <!-- Bottom Details & Intelligence Agents Bar -->
  <g transform="translate(68, 485)">
    <!-- Decorative Box Background -->
    <rect x="0" y="0" width="1064" height="68" rx="16" fill="#080d16" stroke="#1a2538" stroke-width="1.2"/>

    <!-- Agent Badges Left -->
    <g transform="translate(24, 20)">
      <text x="0" y="18" font-family="'JetBrains Mono', monospace" font-size="11" fill="#64748b" letter-spacing="1">AGENTS ARBITRATED:</text>
      
      <!-- Growth VC Pill -->
      <g transform="translate(135, 0)">
        <rect x="0" y="0" width="104" height="26" rx="6" fill="#062e21" stroke="#059669" stroke-width="0.8"/>
        <text x="10" y="17" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#34d399">Growth VC</text>
      </g>

      <!-- Creative Pill -->
      <g transform="translate(248, 0)">
        <rect x="0" y="0" width="124" height="26" rx="6" fill="#26123d" stroke="#8b5cf6" stroke-width="0.8"/>
        <text x="10" y="17" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#c084fc">Creative Director</text>
      </g>

      <!-- Skeptic Pill -->
      <g transform="translate(381, 0)">
        <rect x="0" y="0" width="110" height="26" rx="6" fill="#331c0a" stroke="#d97706" stroke-width="0.8"/>
        <text x="10" y="17" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#fbbf24">Brutal Skeptic</text>
      </g>
    </g>

    <!-- Color Swatches Right -->
    <g transform="translate(860, 24)">
      <text x="0" y="15" font-family="'JetBrains Mono', monospace" font-size="11" fill="#64748b" letter-spacing="1">PALETTE:</text>
      <circle cx="75" cy="11" r="10" fill="${primaryColor}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="102" cy="11" r="10" fill="${accentColor}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="129" cy="11" r="10" fill="${altColor}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="156" cy="11" r="10" fill="#07090e" stroke="#334155" stroke-width="1.5"/>
    </g>
  </g>
</svg>`;
}
