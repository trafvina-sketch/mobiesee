const fs = require('fs');
const { execSync } = require('child_process');

const puppySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#050814"/>
    </radialGradient>

    <!-- Headphone Neon Mint Gradient -->
    <linearGradient id="mintGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>

    <!-- Headphone Purple Gradient -->
    <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>

    <!-- Puppy Fur Gradient -->
    <linearGradient id="furGrad" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>

    <!-- Ear Dark/Soft Shading -->
    <linearGradient id="earShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf2f8"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>

    <!-- Badge Gradient -->
    <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>

  <!-- Background container with rounded corners (Squircle) -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>
  
  <!-- Subtle ambient halo behind puppy -->
  <circle cx="256" cy="270" r="170" fill="#a855f7" opacity="0.16"/>
  <circle cx="256" cy="270" r="120" fill="#06b6d4" opacity="0.14"/>

  <!-- ================= PUPPY BODY ================= -->
  <!-- Chest / Body -->
  <ellipse cx="256" cy="405" rx="115" ry="90" fill="url(#furGrad)"/>
  <!-- Chest Fluff highlight -->
  <ellipse cx="256" cy="400" rx="65" ry="50" fill="#ffffff" opacity="0.9"/>

  <!-- ================= PUPPY EARS (Behind Head) ================= -->
  <!-- Left Ear -->
  <g transform="rotate(-18 165 210)">
    <ellipse cx="150" cy="230" rx="46" ry="76" fill="#f1f5f9"/>
    <!-- Left Inner Pink Ear -->
    <ellipse cx="154" cy="238" rx="26" ry="50" fill="url(#earShade)" opacity="0.75"/>
  </g>
  <!-- Right Ear -->
  <g transform="rotate(18 347 210)">
    <ellipse cx="362" cy="230" rx="46" ry="76" fill="#f1f5f9"/>
    <!-- Right Inner Pink Ear -->
    <ellipse cx="358" cy="238" rx="26" ry="50" fill="url(#earShade)" opacity="0.75"/>
  </g>

  <!-- ================= HEADPHONE ARCH (Behind head) ================= -->
  <path d="M 140 250 A 135 135 0 0 1 372 250" fill="none" stroke="url(#mintGrad)" stroke-width="26" stroke-linecap="round"/>
  <path d="M 140 250 A 135 135 0 0 1 372 250" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.4"/>

  <!-- ================= PUPPY HEAD ================= -->
  <ellipse cx="256" cy="265" rx="125" ry="110" fill="url(#furGrad)"/>

  <!-- Chubby Cheeks -->
  <circle cx="170" cy="295" r="50" fill="url(#furGrad)"/>
  <circle cx="342" cy="295" r="50" fill="url(#furGrad)"/>

  <!-- Cute Blushing Cheeks (Pastel pink/lavender) -->
  <ellipse cx="185" cy="305" rx="26" ry="16" fill="#f472b6" opacity="0.45"/>
  <ellipse cx="327" cy="305" rx="26" ry="16" fill="#f472b6" opacity="0.45"/>

  <!-- ================= SPARKLING BIG EYES ================= -->
  <!-- Left Eye -->
  <g>
    <ellipse cx="205" cy="260" rx="21" ry="26" fill="#0f172a"/>
    <ellipse cx="202" cy="254" rx="9" ry="12" fill="#ffffff"/>
    <circle cx="213" cy="272" r="5" fill="#38bdf8"/>
    <circle cx="213" cy="272" r="3.5" fill="#ffffff"/>
  </g>

  <!-- Right Eye -->
  <g>
    <ellipse cx="307" cy="260" rx="21" ry="26" fill="#0f172a"/>
    <ellipse cx="304" cy="254" rx="9" ry="12" fill="#ffffff"/>
    <circle cx="315" cy="272" r="5" fill="#38bdf8"/>
    <circle cx="315" cy="272" r="3.5" fill="#ffffff"/>
  </g>

  <!-- Cute Eyebrows -->
  <ellipse cx="202" cy="225" rx="11" ry="6" fill="#94a3b8" opacity="0.7" transform="rotate(-6 202 225)"/>
  <ellipse cx="310" cy="225" rx="11" ry="6" fill="#94a3b8" opacity="0.7" transform="rotate(6 310 225)"/>

  <!-- ================= NOSE & PLAYFUL MOUTH ================= -->
  <!-- Cute Heart/Button Nose -->
  <path d="M 245 285 C 245 281, 267 281, 267 285 C 267 292, 256 300, 256 300 C 256 300, 245 292, 245 285 Z" fill="#334155"/>
  <ellipse cx="253" cy="286" rx="4" ry="2" fill="#ffffff" opacity="0.8"/>

  <!-- Joyful Smile Line -->
  <path d="M 256 300 L 256 307 M 240 307 C 246 316, 256 316, 256 307 C 256 316, 266 316, 272 307" fill="none" stroke="#334155" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Playful Little Tongue -->
  <path d="M 250 312 C 250 324, 262 324, 262 312 Z" fill="#fb7185"/>

  <!-- ================= TECH HEADPHONES EARCUPS ================= -->
  <!-- Left Headphone Earcup -->
  <g transform="rotate(10 135 260)">
    <!-- Outer rim -->
    <rect x="110" y="215" width="46" height="85" rx="23" fill="url(#mintGrad)"/>
    <!-- Inner cushion -->
    <rect x="122" y="223" width="24" height="69" rx="12" fill="#0f172a"/>
    <!-- Glowing LED Core -->
    <circle cx="133" cy="257" r="11" fill="url(#purpleGrad)"/>
    <polygon points="131,252 138,257 131,262" fill="#ffffff"/>
  </g>

  <!-- Right Headphone Earcup -->
  <g transform="rotate(-10 377 260)">
    <!-- Outer rim -->
    <rect x="356" y="215" width="46" height="85" rx="23" fill="url(#mintGrad)"/>
    <!-- Inner cushion -->
    <rect x="366" y="223" width="24" height="69" rx="12" fill="#0f172a"/>
    <!-- Glowing LED Core -->
    <circle cx="379" cy="257" r="11" fill="url(#purpleGrad)"/>
    <polygon points="377,252 384,257 377,262" fill="#ffffff"/>
  </g>

  <!-- ================= HOLOGRAPHIC DOWNLOAD BADGE (In Paws/Chest) ================= -->
  <g>
    <!-- Badge Background Pill -->
    <rect x="186" y="380" width="140" height="48" rx="24" fill="url(#badgeGrad)"/>
    <rect x="188" y="382" width="136" height="44" rx="22" fill="#090d16" opacity="0.88"/>
    
    <!-- Download Arrow Icon -->
    <path d="M 256 391 L 256 410 M 247 403 L 256 412 L 265 403" fill="none" stroke="#34d399" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="244" y1="417" x2="268" y2="417" stroke="#c084fc" stroke-width="3.5" stroke-linecap="round"/>
  </g>

  <!-- Little puppy paws holding the badge -->
  <ellipse cx="182" cy="402" rx="18" ry="14" fill="#ffffff"/>
  <ellipse cx="330" cy="402" rx="18" ry="14" fill="#ffffff"/>

  <!-- Tiny sparkle stars -->
  <path d="M 125 155 Q 125 167 113 167 Q 125 167 125 179 Q 125 167 137 167 Q 125 167 125 155 Z" fill="#34d399"/>
  <path d="M 385 145 Q 385 155 375 155 Q 385 155 385 165 Q 385 155 395 155 Q 385 155 385 145 Z" fill="#c084fc"/>
</svg>
`;

const puppyForegroundSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Headphone Neon Mint Gradient -->
    <linearGradient id="fgMintGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>

    <!-- Headphone Purple Gradient -->
    <linearGradient id="fgPurpleGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>

    <!-- Puppy Fur Gradient -->
    <linearGradient id="fgFurGrad" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>

    <!-- Ear Dark/Soft Shading -->
    <linearGradient id="fgEarShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf2f8"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>

    <!-- Badge Gradient -->
    <linearGradient id="fgBadgeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>

  <!-- Scale slightly to fit safely inside the 72dp safe zone of 108dp canvas -->
  <g transform="translate(46, 46) scale(0.82)">
    <!-- Ambient glow behind puppy -->
    <circle cx="256" cy="270" r="140" fill="#a855f7" opacity="0.2"/>
    <circle cx="256" cy="270" r="100" fill="#06b6d4" opacity="0.18"/>

    <!-- Chest / Body -->
    <ellipse cx="256" cy="405" rx="115" ry="90" fill="url(#fgFurGrad)"/>
    <ellipse cx="256" cy="400" rx="65" ry="50" fill="#ffffff" opacity="0.9"/>

    <!-- Ears -->
    <g transform="rotate(-18 165 210)">
      <ellipse cx="150" cy="230" rx="46" ry="76" fill="#f1f5f9"/>
      <ellipse cx="154" cy="238" rx="26" ry="50" fill="url(#fgEarShade)" opacity="0.75"/>
    </g>
    <g transform="rotate(18 347 210)">
      <ellipse cx="362" cy="230" rx="46" ry="76" fill="#f1f5f9"/>
      <ellipse cx="358" cy="238" rx="26" ry="50" fill="url(#fgEarShade)" opacity="0.75"/>
    </g>

    <!-- Headband -->
    <path d="M 140 250 A 135 135 0 0 1 372 250" fill="none" stroke="url(#fgMintGrad)" stroke-width="26" stroke-linecap="round"/>
    <path d="M 140 250 A 135 135 0 0 1 372 250" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.4"/>

    <!-- Head -->
    <ellipse cx="256" cy="265" rx="125" ry="110" fill="url(#fgFurGrad)"/>
    <circle cx="170" cy="295" r="50" fill="url(#fgFurGrad)"/>
    <circle cx="342" cy="295" r="50" fill="url(#fgFurGrad)"/>

    <!-- Cheeks -->
    <ellipse cx="185" cy="305" rx="26" ry="16" fill="#f472b6" opacity="0.45"/>
    <ellipse cx="327" cy="305" rx="26" ry="16" fill="#f472b6" opacity="0.45"/>

    <!-- Eyes -->
    <ellipse cx="205" cy="260" rx="21" ry="26" fill="#0f172a"/>
    <ellipse cx="202" cy="254" rx="9" ry="12" fill="#ffffff"/>
    <circle cx="213" cy="272" r="5" fill="#38bdf8"/>
    <circle cx="213" cy="272" r="3.5" fill="#ffffff"/>

    <ellipse cx="307" cy="260" rx="21" ry="26" fill="#0f172a"/>
    <ellipse cx="304" cy="254" rx="9" ry="12" fill="#ffffff"/>
    <circle cx="315" cy="272" r="5" fill="#38bdf8"/>
    <circle cx="315" cy="272" r="3.5" fill="#ffffff"/>

    <!-- Eyebrows -->
    <ellipse cx="202" cy="225" rx="11" ry="6" fill="#94a3b8" opacity="0.7" transform="rotate(-6 202 225)"/>
    <ellipse cx="310" cy="225" rx="11" ry="6" fill="#94a3b8" opacity="0.7" transform="rotate(6 310 225)"/>

    <!-- Nose & Smile -->
    <path d="M 245 285 C 245 281, 267 281, 267 285 C 267 292, 256 300, 256 300 C 256 300, 245 292, 245 285 Z" fill="#334155"/>
    <ellipse cx="253" cy="286" rx="4" ry="2" fill="#ffffff" opacity="0.8"/>
    <path d="M 256 300 L 256 307 M 240 307 C 246 316, 256 316, 256 307 C 256 316, 266 316, 272 307" fill="none" stroke="#334155" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 250 312 C 250 324, 262 324, 262 312 Z" fill="#fb7185"/>

    <!-- Earcups -->
    <g transform="rotate(10 135 260)">
      <rect x="110" y="215" width="46" height="85" rx="23" fill="url(#fgMintGrad)"/>
      <rect x="122" y="223" width="24" height="69" rx="12" fill="#0f172a"/>
      <circle cx="133" cy="257" r="11" fill="url(#fgPurpleGrad)"/>
      <polygon points="131,252 138,257 131,262" fill="#ffffff"/>
    </g>
    <g transform="rotate(-10 377 260)">
      <rect x="356" y="215" width="46" height="85" rx="23" fill="url(#fgMintGrad)"/>
      <rect x="366" y="223" width="24" height="69" rx="12" fill="#0f172a"/>
      <circle cx="379" cy="257" r="11" fill="url(#fgPurpleGrad)"/>
      <polygon points="377,252 384,257 377,262" fill="#ffffff"/>
    </g>

    <!-- Download Badge -->
    <rect x="186" y="380" width="140" height="48" rx="24" fill="url(#fgBadgeGrad)"/>
    <rect x="188" y="382" width="136" height="44" rx="22" fill="#090d16" opacity="0.88"/>
    <path d="M 256 391 L 256 410 M 247 403 L 256 412 L 265 403" fill="none" stroke="#34d399" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="244" y1="417" x2="268" y2="417" stroke="#c084fc" stroke-width="3.5" stroke-linecap="round"/>

    <!-- Paws -->
    <ellipse cx="182" cy="402" rx="18" ry="14" fill="#ffffff"/>
    <ellipse cx="330" cy="402" rx="18" ry="14" fill="#ffffff"/>

    <!-- Sparkles -->
    <path d="M 125 155 Q 125 167 113 167 Q 125 167 125 179 Q 125 167 137 167 Q 125 167 125 155 Z" fill="#34d399"/>
    <path d="M 385 145 Q 385 155 375 155 Q 385 155 385 165 Q 385 155 395 155 Q 385 155 385 145 Z" fill="#c084fc"/>
  </g>
</svg>
`;

// Save temporary SVGs
fs.writeFileSync('temp_puppy.svg', puppySvg);
fs.writeFileSync('temp_puppy_fg.svg', puppyForegroundSvg);

// Save SVG to drawable for high-resolution vector reference
fs.writeFileSync('app/src/main/res/drawable/ic_puppy_mascot.svg', puppySvg);

// Generate master full-res PNG
execSync('convert -background none temp_puppy.svg -resize 512x512 PNG32:app/src/main/res/drawable/ic_dola_puppy.png');
execSync('convert -background none temp_puppy_fg.svg -resize 512x512 PNG32:app/src/main/res/drawable/ic_launcher_foreground.png');

// Density specs for Mipmap
const densities = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 }
];

for (const d of densities) {
  const dir = `app/src/main/res/mipmap-${d.name}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Remove old webp if any
  try { fs.unlinkSync(`${dir}/ic_launcher.webp`); } catch(e) {}
  try { fs.unlinkSync(`${dir}/ic_launcher_round.webp`); } catch(e) {}

  // Square Launcher Icon
  execSync(`convert temp_puppy.svg -resize ${d.size}x${d.size}! PNG32:${dir}/ic_launcher.png`);

  // Round Launcher Icon (Masked circle)
  const radius = d.size / 2;
  execSync(`convert temp_puppy.svg -resize ${d.size}x${d.size}! \\( -size ${d.size}x${d.size} xc:none -fill white -draw "circle ${radius},${radius} ${radius},0" \\) -alpha set -compose DstIn -composite PNG32:${dir}/ic_launcher_round.png`);
  
  // Foreground for adaptive
  execSync(`convert temp_puppy_fg.svg -resize ${d.size}x${d.size}! PNG32:${dir}/ic_launcher_foreground.png`);
  
  console.log(`Generated icons for mipmap-${d.name} (${d.size}x${d.size})`);
}

// Clean up temp
fs.unlinkSync('temp_puppy.svg');
fs.unlinkSync('temp_puppy_fg.svg');

console.log('ALL ICONS GENERATED SUCCESSFULLY!');
