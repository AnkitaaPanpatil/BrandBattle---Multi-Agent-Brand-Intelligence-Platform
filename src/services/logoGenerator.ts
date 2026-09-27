export interface LogoGeneratorOptions {
  brandName: string;
  archetype?: string;
  style?: 'geometric' | 'abstract' | 'emblem' | 'radical';
  colors?: { name: string; hex: string }[] | string[];
  monogram?: string;
  symbolDescription?: string;
  themeName?: string;
  background?: 'dark' | 'light' | 'transparent';
  seed?: number;
}

export interface GeneratedLogoResult {
  svg: string;
  dataUrl: string;
  brandName: string;
  archetype: string;
  style: string;
  monogram: string;
  primaryColor: string;
  accentColor: string;
  promptDescription: string;
}

/**
 * Escapes XML/SVG special characters to prevent parser errors (like & -> &amp;)
 */
export function escapeXml(unsafe: string | undefined | null): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Sanitizes any raw SVG string by repairing bare ampersands and fixing uppercase &AMP;
 */
export function sanitizeSvgMarkup(svg: string): string {
  if (!svg) return '';
  let fixed = svg.replace(/&AMP;/g, '&amp;');
  fixed = fixed.replace(/&(?!amp;|lt;|gt;|apos;|quot;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
  return fixed;
}

/**
 * Sanitizes an SVG Data URL (whether base64 or charset=utf-8) so it never causes XML parse errors
 */
export function sanitizeSvgDataUrl(dataUrl: string): string {
  if (!dataUrl) return '';
  if (dataUrl.startsWith('data:image/svg+xml;base64,')) {
    try {
      const b64 = dataUrl.slice('data:image/svg+xml;base64,'.length);
      const decoded = decodeURIComponent(escape(atob(b64)));
      const sanitized = sanitizeSvgMarkup(decoded);
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(sanitized)))}`;
    } catch {
      return dataUrl;
    }
  } else if (dataUrl.startsWith('data:image/svg+xml')) {
    try {
      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx !== -1) {
        const prefix = dataUrl.slice(0, commaIdx + 1);
        const encoded = dataUrl.slice(commaIdx + 1);
        const decoded = decodeURIComponent(encoded);
        const sanitized = sanitizeSvgMarkup(decoded);
        return `${prefix}${encodeURIComponent(sanitized)}`;
      }
    } catch {
      return dataUrl;
    }
  }
  return dataUrl;
}

/**
 * Extracts 2-3 clean monogram letters from a brand name
 */
export function extractMonogram(name: string): string {
  if (!name) return 'BB';
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return clean.toUpperCase() || 'BB';
}

/**
 * Deterministically generates high-craft SVG vector logos matching brand archetypes
 */
export function generateVectorLogoSvg(options: LogoGeneratorOptions): GeneratedLogoResult {
  const {
    brandName,
    archetype = 'The Functional Anchor',
    style = 'geometric',
    colors = ['#0a0e17', '#10b981', '#f59e0b', '#f1f5f9'],
    monogram = extractMonogram(brandName),
    symbolDescription,
    themeName = 'Modern Intelligence',
    background = 'dark',
    seed = 1,
  } = options;

  const safeBrandName = escapeXml(brandName);
  const safeArchetypeUpper = escapeXml((archetype || '').toUpperCase());
  const safeThemeNameUpper = escapeXml((themeName || '').toUpperCase());
  const safeMonogram = escapeXml(monogram);

  // Resolve hex colors
  const colorList: string[] = colors.map((c) => (typeof c === 'string' ? c : c.hex));
  const bgDark = colorList[0] || '#070a10';
  const primaryColor = colorList[1] || '#10b981';
  const accentColor = colorList[2] || '#f59e0b';
  const lightColor = colorList[3] || '#f8fafc';

  const isAbstract = style === 'abstract';
  const isRebel = !isAbstract && (archetype.toLowerCase().includes('rebel') || archetype.toLowerCase().includes('provocative') || style === 'radical');
  const isMuse = !isAbstract && (archetype.toLowerCase().includes('muse') || archetype.toLowerCase().includes('evocative') || style === 'emblem');
  const isAnchor = !isAbstract && !isRebel && !isMuse;

  // Background styling
  const isLight = background === 'light';
  const isTransparent = background === 'transparent';

  let bgFill = bgDark;
  let bgBorder = 'rgba(255, 255, 255, 0.12)';
  if (isLight) {
    bgFill = '#ffffff';
    bgBorder = 'rgba(0, 0, 0, 0.08)';
  } else if (isTransparent) {
    bgFill = 'none';
    bgBorder = 'none';
  }

  const specTextColor = isLight ? '#475569' : lightColor;
  const heroTextColor = isLight ? '#0f172a' : '#ffffff';
  const badgeBg = isLight ? '#f1f5f9' : bgDark;
  const badgeTextColor = isLight ? '#0f172a' : lightColor;
  const diamondGateFill = isLight ? '#f8fafc' : isTransparent ? 'none' : bgDark;

  // Archetype-specific symbol geometry
  let glyphSvg = '';
  let promptDescription = '';

  if (isAbstract) {
    promptDescription = `Minimalist Monogram: Pure optical architectural typography emblem with precision concentric circles and geometric alignment grid for ${safeBrandName}.`;
    glyphSvg = `
      <!-- Minimalist Monogram Optical Emblem -->
      <g transform="translate(256, 230)">
        <circle r="135" fill="none" stroke="${primaryColor}" stroke-width="1.5" opacity="0.3" stroke-dasharray="6 6" />
        <circle r="105" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.4" />
        <circle r="80" fill="url(#anchorGrad1)" opacity="0.15" />
        <line x1="-150" y1="0" x2="150" y2="0" stroke="${primaryColor}" stroke-width="1" opacity="0.2" />
        <line x1="0" y1="-150" x2="0" y2="150" stroke="${primaryColor}" stroke-width="1" opacity="0.2" />
        <rect x="-56" y="-56" width="112" height="112" rx="28" fill="${badgeBg}" stroke="${primaryColor}" stroke-width="3" transform="rotate(45)" filter="url(#subtleGlow)" />
        <text x="0" y="16" text-anchor="middle" font-family="'Space Grotesk', -apple-system, sans-serif" font-weight="900" font-size="44" fill="${heroTextColor}" letter-spacing="4">${safeMonogram}</text>
      </g>
    `;
  } else if (isAnchor) {
    promptDescription = `The Functional Anchor: Architectural isometric precision hexagon with converging interlocking vector facets, symbolizing structural defensibility and utility for ${brandName}.`;
    // Geometric Hexagon & Interlocking Core
    glyphSvg = `
      <!-- Functional Anchor Isometric Glyph -->
      <g transform="translate(256, 230)">
        <!-- Outer Alignment Ring -->
        <circle r="140" fill="none" stroke="${primaryColor}" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.3" />
        
        <!-- Precision Construction Grid Lines -->
        <line x1="-155" y1="0" x2="155" y2="0" stroke="${primaryColor}" stroke-width="1" opacity="0.15" />
        <line x1="0" y1="-155" x2="0" y2="155" stroke="${primaryColor}" stroke-width="1" opacity="0.15" />
        <polygon points="0,-130 112,-65 112,65 0,130 -112,65 -112,-65" fill="none" stroke="${primaryColor}" stroke-width="3" opacity="0.4" />
        
        <!-- Isometric Facet 1 (Top) -->
        <polygon points="0,-115 100,-58 0,0 -100,-58" fill="url(#anchorGrad1)" filter="url(#subtleGlow)" />
        
        <!-- Isometric Facet 2 (Right) -->
        <polygon points="0,0 100,-58 100,58 0,115" fill="url(#anchorGrad2)" />
        
        <!-- Isometric Facet 3 (Left) -->
        <polygon points="-100,-58 0,0 0,115 -100,58" fill="url(#anchorGrad3)" />
        
        <!-- Inner Core Diamond Gate -->
        <polygon points="0,-48 42,0 0,48 -42,0" fill="${diamondGateFill}" stroke="${accentColor}" stroke-width="2.5" />
        
        <!-- Central Optical Node -->
        <circle cx="0" cy="0" r="14" fill="url(#accentGlow)" />
        <circle cx="0" cy="0" r="6" fill="#ffffff" />
      </g>
    `;
  } else if (isMuse) {
    promptDescription = `The Evocative Muse: Radiant sacred geometry with dual interlocking botanical/lunar arcs forming an infinity loop, evoking craft, soul, and emotional resonance for ${brandName}.`;
    // Radiant Organic Infinity & Golden Ratio Spiral
    glyphSvg = `
      <!-- Evocative Muse Lyrical Glyph -->
      <g transform="translate(256, 230)">
        <!-- Aura Rays -->
        <g opacity="0.25">
          ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
            .map(
              (deg) =>
                `<line x1="0" y1="0" x2="${Math.cos((deg * Math.PI) / 180) * 145}" y2="${
                  Math.sin((deg * Math.PI) / 180) * 145
                }" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="3 6" />`
            )
            .join('\n')}
        </g>
        
        <!-- Outer Halo -->
        <circle r="130" fill="none" stroke="url(#museGrad1)" stroke-width="3" opacity="0.5" />
        <circle r="110" fill="none" stroke="${primaryColor}" stroke-width="1" opacity="0.3" />
        
        <!-- Organic Infinity / Leaf Curve 1 -->
        <path d="M -75,-60 C -120,20 -40,110 30,95 C 95,80 120,0 70,-65 C 20,-130 -40,-120 -75,-60 Z"
              fill="url(#museGrad1)" opacity="0.85" filter="url(#subtleGlow)" />
              
        <!-- Organic Infinity / Leaf Curve 2 (Counter-Flow) -->
        <path d="M 75,-60 C 120,20 40,110 -30,95 C -95,80 -120,0 -70,-65 C -20,-130 40,-120 75,-60 Z"
              fill="url(#museGrad2)" opacity="0.75" />
              
        <!-- Celestial Star Apex -->
        <path d="M 0,-40 Q 0,0 40,0 Q 0,0 0,40 Q 0,0 -40,0 Q 0,0 0,-40 Z" fill="url(#accentGlow)" />
        <circle cx="0" cy="0" r="7" fill="#ffffff" />
      </g>
    `;
  } else {
    promptDescription = `The Provocative Rebel: Kinetic high-voltage angular prism with radical asymmetric cutouts, projecting defiant energy, counter-culture defiance, and unapologetic power for ${brandName}.`;
    // Provocative Rebel Shard & Slash Matrix
    glyphSvg = `
      <!-- Provocative Rebel Angular Shards -->
      <g transform="translate(256, 230)">
        <!-- Kinetic Angular Grid Backdrop -->
        <polygon points="-130,-120 140,-90 120,130 -140,100" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.2" stroke-dasharray="4 8" />
        
        <!-- Radial Blast Lines -->
        <line x1="-140" y1="-140" x2="140" y2="140" stroke="${primaryColor}" stroke-width="1" opacity="0.15" />
        <line x1="140" y1="-140" x2="-140" y2="140" stroke="${accentColor}" stroke-width="1" opacity="0.15" />
        
        <!-- Main Radical Shard (Upper Angular Bolt) -->
        <polygon points="-25,-140 100,-75 25,-15 110,-5 -40,120 5,20 -80,10 -15,-65"
                 fill="url(#rebelGrad1)" filter="url(#subtleGlow)" />
                 
        <!-- Secondary Counter Shard -->
        <polygon points="-110,-60 -45,-30 -85,65 -130,20"
                 fill="url(#rebelGrad2)" opacity="0.75" />
                 
        <!-- Kinetic Slash Line Cutout -->
        <line x1="-120" y1="90" x2="120" y2="-90" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" />
        
        <!-- High-Voltage Energy Spark -->
        <polygon points="0,-18 14,-3 25,-8 12,8 18,22 3,12 -12,20 -5,5 -20,-2 -7,-12" fill="#ffffff" />
      </g>
    `;
  }

  // Compose Full SVG with explicit width/height dimensions for reliable canvas rendering
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Gradients -->
    <linearGradient id="anchorGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.5" />
    </linearGradient>
    <linearGradient id="anchorGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.6" />
    </linearGradient>
    <linearGradient id="anchorGrad3" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.3" />
    </linearGradient>
    
    <linearGradient id="museGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${accentColor}" />
    </linearGradient>
    <linearGradient id="museGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.4" />
    </linearGradient>
    
    <linearGradient id="rebelGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="50%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <linearGradient id="rebelGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.4" />
    </linearGradient>
    
    <radialGradient id="accentGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="1" />
      <stop offset="60%" stop-color="${primaryColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
    </radialGradient>

    <!-- Filters -->
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  ${
    bgFill !== 'none'
      ? `<rect width="512" height="512" rx="48" fill="${bgFill}" />
         <rect width="512" height="512" rx="48" fill="none" stroke="${bgBorder}" stroke-width="2" />`
      : ''
  }

  <!-- Geometric Spec Markers -->
  <g opacity="${isLight ? '0.7' : '0.4'}">
    <text x="36" y="44" font-family="monospace" font-size="11" fill="${specTextColor}" letter-spacing="2">SPEC ID: 0${seed}</text>
    <text x="476" y="44" text-anchor="end" font-family="monospace" font-size="11" fill="${accentColor}" letter-spacing="1.5">${safeArchetypeUpper}</text>
    <line x1="36" y1="56" x2="476" y2="56" stroke="${specTextColor}" stroke-width="0.75" opacity="${isLight ? '0.3' : '0.2'}" />
  </g>

  <!-- Central Visual Mark / Glyph -->
  ${glyphSvg}

  <!-- Typography & Monogram Identification -->
  <g transform="translate(256, 420)">
    <!-- Monogram Initials Badge -->
    <rect x="-42" y="-30" width="84" height="26" rx="6" fill="${badgeBg}" stroke="${primaryColor}" stroke-width="1.5" opacity="0.9" />
    <text x="0" y="-12" text-anchor="middle" font-family="'Space Grotesk', -apple-system, sans-serif" font-weight="800" font-size="15" fill="${badgeTextColor}" letter-spacing="4">${safeMonogram}</text>
    
    <!-- Hero Brand Name -->
    <text x="0" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="800" font-size="20" fill="${heroTextColor}" letter-spacing="1">${safeBrandName}</text>
    
    <!-- Subtitle Theme Tag -->
    <text x="0" y="46" text-anchor="middle" font-family="monospace" font-size="10" fill="${accentColor}" letter-spacing="2">${safeThemeNameUpper}</text>
  </g>
</svg>`;

  const cleanSvg = sanitizeSvgMarkup(svg);

  // Base64 Data URL for robust cross-browser <img> src injection
  let dataUrl = '';
  try {
    dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(cleanSvg)))}`;
  } catch {
    dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
  }

  return {
    svg: cleanSvg,
    dataUrl,
    brandName,
    archetype,
    style,
    monogram,
    primaryColor,
    accentColor,
    promptDescription,
  };
}

/**
 * Downloads an SVG string as a file
 */
export function downloadSvgFile(svgContent: string, filename: string) {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Renders an SVG string into a crisp PNG Data URL using Canvas at high resolution (1024x1024)
 * Uses multi-tier loading (Base64 data URI -> Blob URL -> Direct Canvas Fallback)
 */
export async function convertSvgToPngDataUrl(
  svgString: string,
  width: number = 1024,
  height: number = 1024
): Promise<string> {
  // 1. Sanitize and normalize SVG markup with explicit dimensions & namespace
  let normalizedSvg = svgString.trim();
  if (!normalizedSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    normalizedSvg = normalizedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  // Replace relative width/height with explicit pixel dimensions
  normalizedSvg = normalizedSvg.replace(/width="100%"/g, 'width="512"').replace(/height="100%"/g, 'height="512"');
  if (!normalizedSvg.includes('width=') || !normalizedSvg.includes('height=')) {
    normalizedSvg = normalizedSvg.replace('<svg', '<svg width="512" height="512"');
  }

  // Generate Base64 Data URI
  let base64DataUri = '';
  try {
    base64DataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(normalizedSvg)))}`;
  } catch {
    base64DataUri = `data:image/svg+xml;utf8,${encodeURIComponent(normalizedSvg)}`;
  }

  // Attempt 1: Render Image from Data URI
  try {
    const pngFromDataUri = await renderImageSourceToPng(base64DataUri, width, height);
    return pngFromDataUri;
  } catch (err1) {
    // Attempt 2: Render Image from Blob URL
    try {
      const svgBlob = new Blob([normalizedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);
      try {
        const pngFromBlob = await renderImageSourceToPng(blobUrl, width, height);
        URL.revokeObjectURL(blobUrl);
        return pngFromBlob;
      } catch (err2) {
        URL.revokeObjectURL(blobUrl);
        throw err2;
      }
    } catch (err2) {
      // Attempt 3: Direct Canvas Fallback Generation (Never fails)
      return renderDirectCanvasFallback(width, height);
    }
  }
}

/**
 * Helper to load an image source and export as PNG canvas data URL
 */
function renderImageSourceToPng(src: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      reject(new Error('Image render timed out'));
    }, 4000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const pngDataUrl = canvas.toDataURL('image/png');
        resolve(pngDataUrl);
      } catch (renderErr) {
        reject(renderErr);
      }
    };

    img.onerror = (e) => {
      clearTimeout(timeout);
      reject(new Error('Failed to render SVG onto Image surface'));
    };

    img.src = src;
  });
}

/**
 * High-res fallback canvas renderer if browser SVG image rendering is blocked
 */
function renderDirectCanvasFallback(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#070a10');
  bgGrad.addColorStop(1, '#0c1017');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // Glowing center geometry
  const centerGrad = ctx.createRadialGradient(width / 2, height / 2 - 40, 20, width / 2, height / 2 - 40, 260);
  centerGrad.addColorStop(0, '#06b6d4');
  centerGrad.addColorStop(0.5, '#10b981');
  centerGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 - 40, 260, 0, Math.PI * 2);
  ctx.fill();

  // Geometric Hexagon Mark
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  const radius = 160;
  const centerX = width / 2;
  const centerY = height / 2 - 40;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  return canvas.toDataURL('image/png');
}
