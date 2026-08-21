const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Premium Dedicated Terminal SVG Logo
const svgTerminalLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient (Dark Ubuntu Aubergine) -->
    <linearGradient id="termBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#300a24" />
      <stop offset="50%" stop-color="#24061a" />
      <stop offset="100%" stop-color="#15030f" />
    </linearGradient>

    <!-- Top Bar Gradient -->
    <linearGradient id="barBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4a153b" />
      <stop offset="100%" stop-color="#2d0821" />
    </linearGradient>

    <!-- Neon Orange Prompt Gradient -->
    <linearGradient id="promptOrange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff7b47" />
      <stop offset="100%" stop-color="#e95420" />
    </linearGradient>

    <!-- Cursor Green Glow Gradient -->
    <linearGradient id="cursorGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5af78e" />
      <stop offset="100%" stop-color="#28c840" />
    </linearGradient>

    <!-- Inner Border Glow -->
    <linearGradient id="termBorderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#77216f" />
      <stop offset="100%" stop-color="#5e2750" />
    </linearGradient>

    <!-- Shadow Filter -->
    <filter id="termDropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <!-- Glow Filter for Symbols -->
    <filter id="symbolGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base Squircle Container -->
  <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#termBg)" filter="url(#termDropShadow)" />
  
  <!-- Outer Stroke / Border -->
  <rect x="32" y="32" width="448" height="448" rx="96" fill="none" stroke="url(#termBorderGlow)" stroke-width="8" />

  <!-- Top Titlebar Area -->
  <path d="M 32 128 L 32 128 A 96 96 0 0 1 128 32 L 384 32 A 96 96 0 0 1 480 128 L 480 128 L 32 128 Z" fill="url(#barBg)" />
  <line x1="32" y1="128" x2="480" y2="128" stroke="#5e2750" stroke-width="4" />

  <!-- Window Control Dots -->
  <!-- Close Dot (Ubuntu Orange/Red) -->
  <circle cx="88" cy="80" r="16" fill="#e95420" />
  <!-- Minimize Dot (Ubuntu Plum) -->
  <circle cx="136" cy="80" r="16" fill="#77216f" />
  <!-- Maximize Dot (Ubuntu Purple) -->
  <circle cx="184" cy="80" r="16" fill="#5e2750" />

  <!-- Command Prompt Symbols in Center -->
  <g filter="url(#symbolGlow)">
    <!-- Prompt Chevron '>' -->
    <path d="M 120 200 L 220 290 L 120 380" fill="none" stroke="url(#promptOrange)" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Underscore / Block Cursor '_' -->
    <line x1="260" y1="380" x2="380" y2="380" stroke="url(#cursorGreen)" stroke-width="40" stroke-linecap="round" />
  </g>
</svg>
`;

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + count * entrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // number of images

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(entrySize);
    const w = item.size >= 256 ? 0 : item.size;
    const h = item.size >= 256 ? 0 : item.size;
    entry.writeUInt8(w, 0); // width
    entry.writeUInt8(h, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(item.buffer.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset

    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(b => b.buffer)]);
}

function createIcns(icnsBlocks) {
  const chunks = [];
  let totalDataLength = 0;

  for (const block of icnsBlocks) {
    const blockHeader = Buffer.alloc(8);
    blockHeader.write(block.type, 0, 4, 'ascii');
    blockHeader.writeUInt32BE(8 + block.buffer.length, 4);
    chunks.push(blockHeader, block.buffer);
    totalDataLength += 8 + block.buffer.length;
  }

  const fileHeader = Buffer.alloc(8);
  fileHeader.write('icns', 0, 4, 'ascii');
  fileHeader.writeUInt32BE(8 + totalDataLength, 4);

  return Buffer.concat([fileHeader, ...chunks]);
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1024,
    height: 1024,
    webPreferences: {
      offscreen: true
    }
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head><style>body { margin: 0; padding: 0; background: transparent; }</style></head>
      <body>
        <div id="container">${svgTerminalLogo}</div>
      </body>
    </html>
  `;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
  const pngResults = [];

  const assetsDir = path.join(__dirname, '../assets');
  const buildDir = path.join(__dirname, '../build');

  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

  // Save SVG
  fs.writeFileSync(path.join(assetsDir, 'terminal-icon.svg'), svgTerminalLogo.trim());
  fs.writeFileSync(path.join(buildDir, 'terminal-icon.svg'), svgTerminalLogo.trim());

  for (const size of sizes) {
    const script = `
      (function() {
        const svg = document.querySelector('svg');
        const canvas = document.createElement('canvas');
        canvas.width = ${size};
        canvas.height = ${size};
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const svgStr = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        return new Promise(resolve => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, ${size}, ${size});
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
          };
          img.src = url;
        });
      })();
    `;

    const dataUrl = await win.webContents.executeJavaScript(script);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    pngResults.push({ size, buffer });
  }

  // Primary PNGs
  const png512 = pngResults.find(p => p.size === 512).buffer;
  const png1024 = pngResults.find(p => p.size === 1024).buffer;

  fs.writeFileSync(path.join(assetsDir, 'terminal-icon.png'), png512);
  fs.writeFileSync(path.join(buildDir, 'terminal-icon.png'), png512);
  fs.writeFileSync(path.join(assetsDir, 'terminal-icon-1024.png'), png1024);

  // 1. Windows ICO
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoPngs = pngResults.filter(p => icoSizes.includes(p.size));
  const icoBuffer = createIco(icoPngs);
  fs.writeFileSync(path.join(assetsDir, 'terminal-icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(buildDir, 'terminal-icon.ico'), icoBuffer);

  // 2. macOS ICNS
  const icnsMap = [
    { type: 'icp4', size: 16 },
    { type: 'icp5', size: 32 },
    { type: 'icp6', size: 64 },
    { type: 'ic07', size: 128 },
    { type: 'ic08', size: 256 },
    { type: 'ic09', size: 512 },
    { type: 'ic10', size: 1024 }
  ];
  const icnsBlocks = icnsMap.map(m => ({
    type: m.type,
    buffer: pngResults.find(p => p.size === m.size).buffer
  }));
  const icnsBuffer = createIcns(icnsBlocks);
  fs.writeFileSync(path.join(assetsDir, 'terminal-icon.icns'), icnsBuffer);
  fs.writeFileSync(path.join(buildDir, 'terminal-icon.icns'), icnsBuffer);

  console.log('Successfully generated terminal icon assets (ICO, PNG, SVG, ICNS)!');
  app.quit();
});
