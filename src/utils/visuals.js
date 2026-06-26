const D = {
  block: '█', half: '▓', dark: '▒', light: '░',
  dot: '•', star: '★', smallSep: '┄',
  tl: '╭', tr: '╮', bl: '╰', br: '╯',
  thinH: '━', v: '│', sep: '├', sep2: '╞',
  diamond: '◆', arrow: '→'
};

function createCanvas(w, h, fill = ' ') {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function drawChar(canvas, x, y, char) {
  if (y >= 0 && y < canvas.length && x >= 0 && x < canvas[0].length) canvas[y][x] = char;
}

function drawRect(canvas, x1, y1, x2, y2, char) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      drawChar(canvas, x, y, char);
}

function drawLine(canvas, x1, y1, x2, y2, char) {
  const dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1);
  let sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
  let err = dx + dy, e2;
  let x = x1, y = y1;
  while (true) {
    drawChar(canvas, x, y, char);
    if (x === x2 && y === y2) break;
    e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

function fillCircle(canvas, cx, cy, r, char) {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r)
        drawChar(canvas, x, y, char);
}

function renderRadar(labels, values, maxVal, w = 25, h = 11) {
  const c = createCanvas(w, h, ' ');
  const cx = Math.floor(w / 2), cy = Math.floor(h * 0.55);
  const rings = [0.25, 0.5, 0.75, 1.0];
  const ringChars = ['.', '·', '•', 'o'];

  for (let ri = 0; ri < rings.length; ri++) {
    const r = Math.floor(cy * rings[ri]);
    if (r < 1) continue;
    for (let a = 0; a < 360; a += 5) {
      const rad = a * Math.PI / 180;
      const x = Math.round(cx + Math.cos(rad) * r);
      const y = Math.round(cy + Math.sin(rad) * r);
      drawChar(c, x, y, ringChars[ri]);
    }
  }

  for (let a = 0; a < 360; a += 45) {
    const rad = a * Math.PI / 180;
    const x = Math.round(cx + Math.cos(rad) * cy);
    const y = Math.round(cy + Math.sin(rad) * cy);
    drawLine(c, cx, cy, x, y, '┄');
  }

  drawChar(c, cx, cy, '⊕');

  const steps = Math.min(labels.length, values.length);
  for (let i = 0; i < steps; i++) {
    const angle = (i * 2 * Math.PI / steps) - Math.PI / 2;
    const pct = Math.min(values[i] / maxVal, 1);
    const r = Math.max(1, Math.floor(cy * pct));
    const x = Math.round(cx + Math.cos(angle) * r);
    const y = Math.round(cy + Math.sin(angle) * r);
    drawLine(c, cx, cy, x, y, '▓');
    drawChar(c, x, y, '◆');
  }

  return c;
}

function radarToString(canvas, labels) {
  const lines = canvas.map(row => row.join(''));
  const sideW = 12;
  for (let i = 0; i < Math.min(labels.length, 8); i++) {
    const label = labels[i].padEnd(sideW).slice(0, sideW);
    const pos = Math.floor((i / Math.min(labels.length, 8)) * lines.length);
    if (lines[pos]) lines[pos] = label + ' ' + lines[pos];
  }
  return '```\n' + lines.map(l => l.padEnd(canvas[0].length + sideW + 1)).join('\n') + '\n```';
}

function renderBarChart(items, width = 20, height = 8) {
  const c = createCanvas(width + 2, height + 2, ' ');
  const maxVal = Math.max(...items.map(i => i[1]), 1);

  for (let i = 0; i < items.length; i++) {
    const barH = Math.max(1, Math.floor((items[i][1] / maxVal) * height));
    const x = Math.floor((i + 0.5) * (width / items.length));
    for (let y = height - barH; y < height; y++) {
      const gradient = barH > 6 ? ['░', '▒', '▓', '█'][Math.min(Math.floor((y - (height - barH)) / 2), 3)] : '█';
      drawChar(c, x, y, gradient);
    }
    drawChar(c, x, height + 1, items[i][0][0] || ' ');
  }

  const lines = c.map(row => row.join(''));
  return '```\n' + lines.join('\n') + '\n```';
}

function renderMatrix(cols = 30, rows = 12, frame = 0) {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌ';
  const c = createCanvas(cols, rows, ' ');
  for (let x = 0; x < cols; x++) {
    const drop = (frame + x * 3) % (rows + 5);
    for (let i = 0; i < 4; i++) {
      const y = drop - i;
      if (y >= 0 && y < rows) {
        drawChar(c, x, y, i === 0 ? '█' : chars[(frame + x * 7 + y * 13) % chars.length]);
      }
    }
  }
  return c.map(row => row.join('')).join('\n');
}

function renderWave(w = 40, h = 6, t = 0) {
  const c = createCanvas(w, h, ' ');
  for (let x = 0; x < w; x++) {
    const y = Math.round(h / 2 + Math.sin((x + t) * 0.5) * (h / 2 - 1) * 0.6);
    const char = Math.abs(Math.sin((x + t) * 0.3)) > 0.7 ? '█' : '▓';
    if (y >= 0 && y < h) drawChar(c, x, y, char);
    if (y - 1 >= 0) drawChar(c, x, y - 1, '░');
  }
  return c.map(row => row.join('')).join('\n');
}

function renderPulse(w = 30, t = 0) {
  const c = createCanvas(w, 5, ' ');
  for (let x = 0; x < w; x++) {
    const v = Math.sin((x - t) * 0.4) * Math.exp(-Math.pow((x - w / 2) / 8, 2));
    const y = Math.round(2 + v * 2);
    if (y >= 0 && y < 5) {
      drawChar(c, x, y, '█');
      if (y > 0) drawChar(c, x, y - 1, '▓');
    }
  }
  return c.map(row => row.join('')).join('\n');
}

function renderSpinner(frame = 0) {
  const frames = ['◜', '◝', '◞', '◟', '◠', '◡'];
  return frames[frame % frames.length];
}

function renderHeartbeat(w = 30, t = 0) {
  const c = createCanvas(w, 5, ' ');
  const cx = Math.floor(w / 2);
  for (let x = 0; x < w; x++) {
    const dist = Math.abs(x - cx);
    let y;
    if (dist < 3) {
      const spike = (t % 20 < 10) ? 4 - dist : 2;
      y = spike;
    } else {
      y = 2 + Math.floor(Math.sin((x - t) * 0.3) * 0.5);
    }
    if (y >= 0 && y < 5) drawChar(c, x, y, '█');
  }
  return c.map(row => row.join('')).join('\n');
}

function renderLoadingBar(pct, width = 20) {
  const filled = Math.round((pct / 100) * width);
  const bar = D.block.repeat(filled) + D.light.repeat(width - filled);
  const pctStr = `${Math.round(pct)}%`.padStart(4);
  return `\`${bar} ${pctStr}\``;
}

const spinnerFrames = ['▖', '▘', '▝', '▗'];
const waveFrames2 = ['𓃉', '𓃊', '𓃋', '𓃌', '𓃍', '𓃎', '𓃏', '𓃐'];
const bounceFrames = ['⣀', '⣠', '⣤', '⣦', '⣶', '⣷', '⣿', '⣷', '⣶', '⣦', '⣤', '⣠'];

function hexToAnsi(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
  if (gray < 10 || (Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(b - r) < 10)) return '▢';
  const bright = gray > 128;
  return bright ? '▣' : '▤';
}

function colorBlock(hex) {
  return hexToAnsi(hex);
}

function gradientText(text, fromColor, toColor) {
  const from = { r: parseInt(fromColor.slice(1, 3), 16), g: parseInt(fromColor.slice(3, 5), 16), b: parseInt(fromColor.slice(5, 7), 16) };
  const to = { r: parseInt(toColor.slice(1, 3), 16), g: parseInt(toColor.slice(3, 5), 16), b: parseInt(toColor.slice(5, 7), 16) };
  const result = [];
  for (let i = 0; i < text.length; i++) {
    const t = text.length > 1 ? i / (text.length - 1) : 0;
    const r = Math.round(from.r + (to.r - from.r) * t);
    const g = Math.round(from.g + (to.g - from.g) * t);
    const b = Math.round(from.b + (to.b - from.b) * t);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    result.push(`${colorBlock(hex)}`);
  }
  return result.join('');
}

function sparkline(data, w = 15, h = 4) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const c = createCanvas(w, h, ' ');
  for (let i = 0; i < w; i++) {
    const idx = Math.floor((i / w) * data.length);
    const val = data[idx] || 0;
    const y = h - 1 - Math.floor(((val - min) / range) * (h - 1));
    if (y >= 0 && y < h) {
      drawChar(c, i, y, '█');
      if (y > 0) drawChar(c, i, y - 1, '▓');
      if (i > 0 && i < w - 1) {
        if (y + 1 < h && c[y + 1][i] === ' ') drawChar(c, i, y + 1, '▄');
      }
    }
  }
  return c.map(row => row.join('')).join('\n');
}

function particles(w = 30, h = 10, frame = 0) {
  const c = createCanvas(w, h, ' ');
  const pChars = ['✦', '✧', '·', '•', '☆', '॰'];
  for (let i = 0; i < 15; i++) {
    const x = (frame * 2 + i * 17) % w;
    const y = (frame + i * 7 + Math.floor(Math.sin((frame + i) * 0.1) * 3)) % h;
    drawChar(c, x, y, pChars[(frame + i) % pChars.length]);
  }
  return c.map(row => row.join('')).join('\n');
}

function gauge(value, max, width = 15) {
  const pct = Math.min(value / max, 1);
  const filled = Math.round(pct * width);
  const chars = [];
  for (let i = 0; i < width; i++) {
    if (i < filled) {
      const p = i / width;
      chars.push(p < 0.33 ? '🟢' : p < 0.66 ? '🟡' : '🔴');
    } else {
      chars.push('⚪');
    }
  }
  return chars.join('');
}

module.exports = {
  createCanvas,
  drawChar,
  drawRect,
  drawLine,
  fillCircle,
  renderRadar,
  radarToString,
  renderBarChart,
  renderMatrix,
  renderWave,
  renderPulse,
  renderSpinner,
  renderHeartbeat,
  renderLoadingBar,
  gradientText,
  colorBlock,
  sparkline,
  particles,
  gauge,
  spinnerFrames,
  waveFrames2,
  bounceFrames
};
