const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Premium Git Nexus SVG Logo
const svgLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0969da" />
      <stop offset="50%" stop-color="#1f6feb" />
      <stop offset="100%" stop-color="#8957e5" />
    </linearGradient>

    <!-- Subtle Inner Glow -->
    <linearGradient id="innerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
    </linearGradient>

    <!-- Node Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Shadow -->
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Base Icon Squircle with Drop Shadow -->
  <rect x="32" y="32" width="448" height="448" rx="100" fill="url(#bgGrad)" filter="url(#dropShadow)" />
  
  <!-- Subtle Bevel / Highlight Border -->
  <rect x="32" y="32" width="448" height="448" rx="100" fill="none" stroke="url(#innerGlow)" stroke-width="6" />

  <!-- Git Branch Network -->
  <g filter="url(#glow)">
    <!-- Main Trunk Line -->
    <line x1="140" y1="130" x2="140" y2="380" stroke="#ffffff" stroke-width="32" stroke-linecap="round" />

    <!-- Branch Spline Path -->
    <path d="M 140 280 C 140 200, 360 260, 360 160" fill="none" stroke="#ffffff" stroke-width="32" stroke-linecap="round" />

    <!-- Rebase / Merge Curve Path -->
    <path d="M 360 220 C 360 300, 140 320, 140 380" fill="none" stroke="#58a6ff" stroke-width="20" stroke-dasharray="8 12" stroke-linecap="round" opacity="0.85" />
    
    <!-- Nodes (Commit Points) -->
    <!-- Trunk Top Node -->
    <circle cx="140" cy="140" r="42" fill="#ffffff" />
    <circle cx="140" cy="140" r="22" fill="#1f6feb" />

    <!-- Trunk Bottom Node -->
    <circle cx="140" cy="380" r="42" fill="#ffffff" />
    <circle cx="140" cy="380" r="22" fill="#1f6feb" />

    <!-- Branch Head Node -->
    <circle cx="360" cy="140" r="42" fill="#ffffff" />
    <circle cx="360" cy="140" r="22" fill="#8957e5" />
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
        <div id="container">${svgLogo}</div>
      </body>
    </html>
  `;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  // Sizes for cross platform
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
  const pngResults = [];

  const assetsDir = path.join(__dirname, '../assets');
  const buildDir = path.join(__dirname, '../build');
  const linuxIconsDir = path.join(buildDir, 'icons');

  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
  if (!fs.existsSync(linuxIconsDir)) fs.mkdirSync(linuxIconsDir, { recursive: true });

  // Save SVG
  fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgLogo.trim());
  fs.writeFileSync(path.join(buildDir, 'icon.svg'), svgLogo.trim());

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

    // Linux icons format: e.g. build/icons/256x256.png
    fs.writeFileSync(path.join(linuxIconsDir, `${size}x${size}.png`), buffer);
  }

  // Primary PNGs
  const png512 = pngResults.find(p => p.size === 512).buffer;
  const png1024 = pngResults.find(p => p.size === 1024).buffer;
  const png256 = pngResults.find(p => p.size === 256).buffer;

  fs.writeFileSync(path.join(assetsDir, 'icon.png'), png512);
  fs.writeFileSync(path.join(buildDir, 'icon.png'), png512);
  fs.writeFileSync(path.join(assetsDir, 'icon-1024.png'), png1024);

  // 1. Windows ICO (16, 24, 32, 48, 64, 128, 256)
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoPngs = pngResults.filter(p => icoSizes.includes(p.size));
  const icoBuffer = createIco(icoPngs);
  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);

  // 2. macOS ICNS (icp4=16, icp5=32, icp6=64, ic07=128, ic08=256, ic09=512, ic10=1024)
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
  fs.writeFileSync(path.join(assetsDir, 'icon.icns'), icnsBuffer);
  fs.writeFileSync(path.join(buildDir, 'icon.icns'), icnsBuffer);

  console.log('Successfully generated all icon assets for Windows, macOS, and Linux!');
  app.quit();
});
