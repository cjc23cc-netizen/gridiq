import sharp from 'sharp';

// SVG source — the GridIQ shield logo
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Dark background square with rounded corners -->
  <rect width="512" height="512" rx="96" fill="#0F1E16"/>

  <!-- Outer glow ring suggestion via subtle border -->
  <rect x="4" y="4" width="504" height="504" rx="93" fill="none" stroke="#10B981" stroke-width="8" opacity="0.4"/>

  <!-- Shield body -->
  <path d="M256 68L120 124v148c0 98 88 162 136 178 48-16 136-80 136-178V124L256 68z"
        fill="#0D1F15" stroke="#10B981" stroke-width="8" stroke-linejoin="round"/>

  <!-- Subtle field grid lines inside shield -->
  <line x1="176" y1="370" x2="176" y2="200" stroke="#10B981" stroke-width="2" opacity="0.15"/>
  <line x1="256" y1="395" x2="256" y2="175" stroke="#10B981" stroke-width="2" opacity="0.15"/>
  <line x1="336" y1="370" x2="336" y2="200" stroke="#10B981" stroke-width="2" opacity="0.15"/>

  <!-- Bar chart columns — rising left to right -->
  <rect x="148" y="270" width="56" height="112" rx="10" fill="#10B981" opacity="0.65"/>
  <rect x="228" y="220" width="56" height="162" rx="10" fill="#10B981" opacity="0.8"/>
  <rect x="308" y="160" width="56" height="222" rx="10" fill="#10B981"/>

  <!-- Trend line connecting tops of bars -->
  <polyline points="176,268 256,218 336,158"
            stroke="#FBBF24" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- Gold dots at each data point -->
  <circle cx="176" cy="268" r="18" fill="#FBBF24"/>
  <circle cx="256" cy="218" r="18" fill="#FBBF24"/>
  <circle cx="336" cy="158" r="22" fill="#FBBF24"/>

  <!-- Glint highlight on top dot -->
  <circle cx="344" cy="148" r="8" fill="white" opacity="0.65"/>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf).resize(192, 192).png().toFile('client/public/icon-192.png');
console.log('icon-192.png generated');

await sharp(buf).resize(512, 512).png().toFile('client/public/icon-512.png');
console.log('icon-512.png generated');

// Also generate apple-touch-icon (180x180)
await sharp(buf).resize(180, 180).png().toFile('client/public/apple-touch-icon.png');
console.log('apple-touch-icon.png generated');
