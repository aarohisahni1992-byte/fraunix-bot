const GIFEncoder = require('gif-encoder-2');
const { writeFileSync } = require('fs');
const path = require('path');

const W = 600, H = 240;
const FRAMES = 48;
const FPS = 16;

const encoder = new GIFEncoder(W, H);
encoder.setDelay(1000 / FPS);
encoder.setRepeat(0);
encoder.start();

const canvas = [];
for (let y = 0; y < H; y++) canvas[y] = new Uint8Array(W * 4);

function px(x, y, r, g, b, a = 255) {
  const px = Math.round(x), py = Math.round(y);
  if (px < 0 || px >= W || py < 0 || py >= H) return;
  const i = px * 4;
  canvas[py][i] = r;
  canvas[py][i + 1] = g;
  canvas[py][i + 2] = b;
  canvas[py][i + 3] = a;
}

function fillRect(x1, y1, x2, y2, r, g, b) {
  for (let y = Math.round(y1); y <= Math.round(y2); y++)
    for (let x = Math.round(x1); x <= Math.round(x2); x++)
      px(x, y, r, g, b);
}

function drawPoly(pts, r, g, b) {
  const minX = Math.max(0, Math.min(...pts.map(p => p[0])));
  const maxX = Math.min(W - 1, Math.max(...pts.map(p => p[0])));
  const minY = Math.max(0, Math.min(...pts.map(p => p[1])));
  const maxY = Math.min(H - 1, Math.max(...pts.map(p => p[1])));
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const x1 = pts[i][0], y1 = pts[i][1], x2 = pts[j][0], y2 = pts[j][1];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        const t = (y - y1) / (y2 - y1);
        const x = x1 + t * (x2 - x1);
        if (x >= 0 && x < W) xs.push(x);
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length; i += 2) {
      for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1] || xs[i]); x++) px(x, y, r, g, b);
    }
  }
}

function starPts(cx, cy, outer, inner, count) {
  const pts = [];
  for (let i = 0; i < count * 2; i++) {
    const a = (i * Math.PI) / count - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function drawFrame(time, pulse) {
  // Clear
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      px(x, y, 15, 15, 35);

  // Grid
  for (let x = 0; x < W; x += 50)
    for (let y = 0; y < H; y++)
      px(x, y, 88, 101, 242, 10);

  for (let y = 0; y < H; y += 40)
    for (let x = 0; x < W; x++)
      px(x, y, 88, 101, 242, 10);

  // Accent lines (top & bottom)
  const glow = 0.5 + Math.sin(time * 0.1) * 0.3;
  for (let x = 0; x < W; x++) {
    const t = x / W;
    const alpha = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
    px(x, 1, 88, 101, 242, Math.round(255 * alpha * glow));
    px(x, 239, 87, 242, 135, Math.round(255 * alpha * glow));
    px(x, 2, 88, 101, 242, Math.round(200 * alpha * glow * 0.5));
    px(x, 238, 87, 242, 135, Math.round(200 * alpha * glow * 0.5));
  }

  // Shield icon
  const bounce = Math.sin(time * 0.12) * 2;
  const sx = 55, sy = 65 + bounce;
  const shield = [
    [sx, sy], [sx + 45, sy + 12], [sx + 45, sy + 42],
    [sx + 30, sy + 60], [sx, sy + 70],
    [sx - 30, sy + 60], [sx - 45, sy + 42], [sx - 45, sy + 12]
  ];
  drawPoly(shield, 88, 101, 242);

  const innerShield = [
    [sx, sy + 5], [sx + 38, sy + 15], [sx + 38, sy + 38],
    [sx + 25, sy + 55], [sx, sy + 63],
    [sx - 25, sy + 55], [sx - 38, sy + 38], [sx - 38, sy + 15]
  ];
  drawPoly(innerShield, 70, 81, 200);

  // Star
  const starScale = 1 + pulse * 0.1;
  drawPoly(starPts(sx, sy + 25, 16 * starScale, 7 * starScale, 5), 87, 242, 135);

  // FRAUNIX text
  const textY = 70;
  // F
  fillRect(143, textY - 18, 148, textY + 18, 255, 255, 255);
  fillRect(143, textY - 18, 165, textY - 8, 255, 255, 255);
  fillRect(143, textY - 2, 160, textY + 6, 255, 255, 255);

  // R
  const rx = 173;
  fillRect(rx, textY - 18, rx + 5, textY + 18, 255, 255, 255);
  fillRect(rx, textY - 18, rx + 16, textY - 8, 255, 255, 255);
  fillRect(rx + 11, textY - 18, rx + 16, textY + 2, 255, 255, 255);
  fillRect(rx, textY - 2, rx + 16, textY + 6, 255, 255, 255);
  for (let a = 0; a < 180; a++) {
    const rad = a * Math.PI / 180;
    px(rx + 16 + Math.cos(rad) * 8, textY + 10 + Math.sin(rad) * 8, 255, 255, 255);
  }
  // A
  const ax = 203;
  fillRect(ax + 7, textY - 18, ax + 12, textY + 18, 255, 255, 255);
  for (let a = 210; a < 330; a++) {
    const rad = a * Math.PI / 180;
    px(ax + 10 + Math.cos(rad) * 11, textY - 7 + Math.sin(rad) * 11, 255, 255, 255);
  }
  // U
  const ux = 234;
  fillRect(ux, textY - 18, ux + 5, textY + 5, 255, 255, 255);
  fillRect(ux + 10, textY - 18, ux + 15, textY + 5, 255, 255, 255);
  for (let a = 0; a < 180; a++) {
    const rad = a * Math.PI / 180;
    px(ux + 5 + Math.cos(rad) * 5, textY + 5 + Math.sin(rad) * 5, 255, 255, 255);
  }
  // N
  const nx = 263;
  fillRect(nx, textY - 18, nx + 5, textY + 18, 255, 255, 255);
  fillRect(nx + 5, textY - 18, nx + 10, textY + 18, 255, 255, 255);
  fillRect(nx + 10, textY - 18, nx + 15, textY + 18, 255, 255, 255);
  // I
  fillRect(290, textY - 18, 295, textY + 18, 255, 255, 255);
  // X
  const xx = 310;
  for (let i = -13; i <= 13; i++) {
    px(xx + i, textY + i, 255, 255, 255);
    px(xx + i, textY - i, 255, 255, 255);
  }

  // v1.0 badge
  const badgeAlpha = 0.6 + Math.sin(time * 0.15) * 0.2;
  for (let x = 348; x < 395; x++)
    for (let y = 52; y < 72; y++)
      px(x, y, 88, 101, 242, Math.round(200 * badgeAlpha));

  // Badge text
  const badgeY = 62;
  fillRect(358, badgeY - 4, 360, badgeY + 4, 255, 255, 255);
  // v
  for (let i = -4; i <= 4; i++) px(365 + i, badgeY + Math.abs(i) / 2, 255, 255, 255);
  // 1
  fillRect(372, badgeY - 4, 374, badgeY + 4, 255, 255, 255);
  // .
  px(377, badgeY + 2, 255, 255, 255);
  // 0
  for (let a = 0; a < 360; a++) {
    const rad = a * Math.PI / 180;
    px(383 + Math.cos(rad) * 3, badgeY + Math.sin(rad) * 3, 255, 255, 255);
  }

  // Tagline
  const tagY = 100;
  const tagText = "Precision Moderation for Modern Communities";
  let tx = 142;
  for (const ch of tagText) {
    if (ch === ' ') { tx += 5; continue; }
    fillRect(tx, tagY, tx + 1, tagY + 1, 160, 160, 200);
    tx += 4;
  }

  // Feature pills (colored rectangles)
  const pillY = 128;
  const pills = [
    [145, 180, 88, 101, 242],
    [195, 240, 87, 242, 135],
    [250, 300, 254, 231, 92]
  ];
  for (const [x1, x2, r, g, b] of pills) {
    for (let x = x1; x <= x2; x++)
      for (let y = pillY; y <= pillY + 18; y++)
        px(x, y, r, g, b, 40);
    for (let x = x1; x <= x2; x++)
      for (let y = pillY; y <= pillY + 18; y++)
        px(x, y, r, g, b);
    for (let x = x1; x <= x2; x++)
      for (let y = pillY; y <= pillY + 18; y++)
        px(x, y, r, g, b, 100);
  }

  // Right circles
  const cAlpha = 0.1 + Math.sin(time * 0.08) * 0.05;
  for (let a = 0; a < 360; a += 5) {
    for (const [cr, cx2, cy2] of [[30, 510, 75], [50, 520, 80], [70, 530, 85]]) {
      const rad = (a + time * 2) * Math.PI / 180;
      px(cx2 + Math.cos(rad) * cr, cy2 + Math.sin(rad) * cr, 88, 101, 242, Math.round(255 * cAlpha));
    }
  }

  // Bottom dots
  for (let i = 0; i < 5; i++) {
    const da = 0.3 + Math.sin(time * 0.2 + i * 0.8) * 0.3;
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        px(285 + i * 14 + dx, 195 + dy, i % 2 === 0 ? 88 : 87, i % 2 === 0 ? 101 : 242, i % 2 === 0 ? 242 : 135, Math.round(255 * da));
  }
}

for (let frame = 0; frame < FRAMES; frame++) {
  const t = frame / FRAMES;
  drawFrame(frame, Math.sin(t * Math.PI * 2));

  const pixels = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    const row = canvas[y];
    const off = y * W * 4;
    for (let x = 0; x < W; x++) {
      const si = x * 4;
      pixels[off + si] = row[si];
      pixels[off + si + 1] = row[si + 1];
      pixels[off + si + 2] = row[si + 2];
      pixels[off + si + 3] = row[si + 3];
    }
  }
  encoder.addFrame(pixels);
}

encoder.finish();
const buf = encoder.out.getData();
const outPath = path.join(__dirname, 'fraunix_banner.gif');
writeFileSync(outPath, buf);
console.log(`Banner GIF saved: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
