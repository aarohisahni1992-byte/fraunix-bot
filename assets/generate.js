const GIFEncoder = require('gif-encoder-2');
const { createWriteStream } = require('fs');
const path = require('path');

const SIZE = 512;
const FRAMES = 60;
const FPS = 20;

const encoder = new GIFEncoder(SIZE, SIZE);
encoder.setDelay(1000 / FPS);
encoder.setRepeat(0);
encoder.start();

const canvas = [];
for (let y = 0; y < SIZE; y++) {
  canvas[y] = new Uint8Array(SIZE * 4);
}

function setPixel(x, y, r, g, b, a = 255) {
  const px = Math.round(x), py = Math.round(y);
  if (px < 0 || px >= SIZE || py < 0 || py >= SIZE) return;
  const i = px * 4;
  canvas[py][i] = r;
  canvas[py][i + 1] = g;
  canvas[py][i + 2] = b;
  canvas[py][i + 3] = a;
}

function fillCircle(cx, cy, radius, r, g, b) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) setPixel(x, y, r, g, b);
    }
  }
}

function fillRect(x1, y1, x2, y2, r, g, b) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      setPixel(x, y, r, g, b);
}

function drawPolygon(points, r, g, b) {
  const minX = Math.max(0, Math.min(...points.map(p => p[0])));
  const maxX = Math.min(SIZE - 1, Math.max(...points.map(p => p[0])));
  const minY = Math.max(0, Math.min(...points.map(p => p[1])));
  const maxY = Math.min(SIZE - 1, Math.max(...points.map(p => p[1])));

  for (let y = minY; y <= maxY; y++) {
    const intersections = [];
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const x1 = points[i][0], y1 = points[i][1];
      const x2 = points[j][0], y2 = points[j][1];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        const t = (y - y1) / (y2 - y1);
        const x = x1 + t * (x2 - x1);
        if (x >= 0 && x < SIZE) intersections.push(x);
      }
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length; i += 2) {
      const xStart = Math.round(intersections[i]);
      const xEnd = Math.round(intersections[i + 1] || xStart);
      for (let x = xStart; x <= xEnd; x++) setPixel(x, y, r, g, b);
    }
  }
}

function drawStar(cx, cy, outerR, innerR, points, r, g, b) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const rad = i % 2 === 0 ? outerR : innerR;
    pts.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
  }
  drawPolygon(pts, r, g, b);
}

function drawText(x, y, size, r, g, b) {
  // Simple "F" using filled rectangles
  // Vertical bar
  fillRect(x - size * 0.08, y - size * 0.45, x + size * 0.08, y + size * 0.45, r, g, b);
  // Top bar
  fillRect(x - size * 0.08, y - size * 0.45, x + size * 0.4, y - size * 0.28, r, g, b);
  // Middle bar
  fillRect(x - size * 0.08, y - size * 0.12, x + size * 0.3, y + size * 0.05, r, g, b);
}

function drawFrame(time, pulse) {
  const cx = SIZE / 2, cy = SIZE / 2;

  // Clear to dark bg
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      setPixel(x, y, 15, 15, 35);

  // Background circle
  fillCircle(cx, cy, 240, 26, 26, 62);

  // Shield
  const shieldScale = 1 + pulse * 0.03;
  const sx = cx, sy = cy - 20;
  const sw = 130 * shieldScale;
  const sh = 140 * shieldScale;

  const shieldPts = [
    [sx, sy - sh * 0.35],
    [sx + sw, sy - sh * 0.2],
    [sx + sw, sy + sh * 0.15],
    [sx + sw * 0.7, sy + sh * 0.45],
    [sx, sy + sh * 0.6],
    [sx - sw * 0.7, sy + sh * 0.45],
    [sx - sw, sy + sh * 0.15],
    [sx - sw, sy - sh * 0.2],
  ];
  drawPolygon(shieldPts, 88, 101, 242);

  // Shield border
  const borderPts = [
    [sx, sy - sh * 0.3],
    [sx + sw * 0.95, sy - sh * 0.18],
    [sx + sw * 0.95, sy + sh * 0.13],
    [sx + sw * 0.65, sy + sh * 0.42],
    [sx, sy + sh * 0.55],
    [sx - sw * 0.65, sy + sh * 0.42],
    [sx - sw * 0.95, sy + sh * 0.13],
    [sx - sw * 0.95, sy - sh * 0.18],
  ];
  drawPolygon(borderPts, 110, 120, 255);

  // Inner shield fill
  const innerPts = [
    [sx, sy - sh * 0.25],
    [sx + sw * 0.85, sy - sh * 0.14],
    [sx + sw * 0.85, sy + sh * 0.1],
    [sx + sw * 0.55, sy + sh * 0.38],
    [sx, sy + sh * 0.5],
    [sx - sw * 0.55, sy + sh * 0.38],
    [sx - sw * 0.85, sy + sh * 0.1],
    [sx - sw * 0.85, sy - sh * 0.14],
  ];
  drawPolygon(innerPts, 70, 80, 200);

  // Star (with rotation)
  const starPulse = 1 + pulse * 0.15;
  drawStar(sx, sy - 30, 42 * starPulse, 18 * starPulse, 5, 87, 242, 135);

  // "F" text below
  drawText(sx, cy + 100, 80, 255, 255, 255);

  // Outer ring (partial, animated)
  const rot = time * 0.1;
  const ringLen = Math.PI * 1.5;
  for (let a = rot; a < rot + ringLen; a += 0.02) {
    const rx = cx + Math.cos(a) * 228;
    const ry = cy + Math.sin(a) * 228;
    setPixel(Math.round(rx), Math.round(ry), 87, 242, 135);
  }
}

for (let frame = 0; frame < FRAMES; frame++) {
  const t = frame / FRAMES;
  const pulse = Math.sin(t * Math.PI * 2);
  drawFrame(frame, pulse);

  const pixels = new Uint8Array(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    const row = canvas[y];
    const rowOffset = y * SIZE * 4;
    for (let x = 0; x < SIZE; x++) {
      const srcIdx = x * 4;
      const dstIdx = rowOffset + srcIdx;
      pixels[dstIdx] = row[srcIdx];
      pixels[dstIdx + 1] = row[srcIdx + 1];
      pixels[dstIdx + 2] = row[srcIdx + 2];
      pixels[dstIdx + 3] = row[srcIdx + 3];
    }
  }
  encoder.addFrame(pixels);
}

encoder.finish();

const buffer = encoder.out.getData();
const outPath = path.join(__dirname, 'fraunix_logo.gif');
require('fs').writeFileSync(outPath, buffer);
console.log(`GIF saved to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB, ${FRAMES} frames)`);
