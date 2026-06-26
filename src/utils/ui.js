const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const config = require('../../config.json');
const { D, badge, embedHeader } = require('./embed');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return { r: parseInt(c.substring(0,2),16), g: parseInt(c.substring(2,4),16), b: parseInt(c.substring(4,6),16) };
}

function rgbToHex(r, g, b) {
  return `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function blendHex(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  return rgbToHex(lerp(a.r,b.r,t), lerp(a.g,b.g,t), lerp(a.b,b.b,t));
}

class AnimatedEmbed {
  constructor(embed) {
    this.embed = embed;
    this._running = false;
  }

  async startColorCycle(message, colors, interval = 800) {
    this._running = true;
    while (this._running) {
      for (const color of colors) {
        if (!this._running) break;
        const edit = EmbedBuilder.from(this.embed).setColor(color);
        await message.edit({ embeds: [edit] }).catch(() => {});
        await sleep(interval);
      }
    }
  }

  async startPulse(message, colorA, colorB, interval = 600) {
    const steps = 10;
    this._running = true;
    while (this._running) {
      for (let i = 0; i < steps; i++) {
        if (!this._running) break;
        const t = i / steps;
        const color = blendHex(colorA, colorB, Math.sin(t * Math.PI) * 0.5 + 0.5);
        const edit = EmbedBuilder.from(this.embed).setColor(color);
        await message.edit({ embeds: [edit] }).catch(() => {});
        await sleep(interval / steps);
      }
    }
  }

  stop() { this._running = false; }
}

class LiveDashboard {
  constructor(channel, config = {}) {
    this.channel = channel;
    this.interval = config.interval || 3000;
    this.timeout = config.timeout || 30000;
    this._timer = null;
    this._timeoutTimer = null;
    this.message = null;
    this._running = false;
  }

  async start(buildEmbedFn) {
    this._running = true;
    const initial = await buildEmbedFn(0);
    this.message = await this.channel.send({ embeds: [initial] });

    let tick = 0;
    this._timer = setInterval(async () => {
      if (!this._running) return;
      tick++;
      try {
        const next = await buildEmbedFn(tick);
        await this.message.edit({ embeds: [next] });
      } catch (e) { /* ignore */ }
    }, this.interval);

    if (this.timeout > 0) {
      this._timeoutTimer = setTimeout(() => this.stop(), this.timeout);
    }
    return this.message;
  }

  async stop() {
    this._running = false;
    clearInterval(this._timer);
    clearTimeout(this._timeoutTimer);
  }
}

function buildGauge(value, max, size = 10, label = '') {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const fill = Math.round(pct * size);
  const empty = size - fill;
  const bar = D.block.repeat(fill) + D.light.repeat(empty);
  const pctStr = `${(pct * 100).toFixed(0).padStart(3)}%`;
  return `\`${bar}\` **${pctStr}** ${label}`.trim();
}

function buildWheel(pct, size = 8) {
  const segments = ['▰', '▰', '▰', '▰', '▰', '▰', '▰', '▰'];
  const fill = Math.round(pct * size);
  const chars = segments.map((c, i) => i < fill ? D.block : D.light);
  return `\`${chars.join('')}\``;
}

function buildTimeline(entries) {
  if (entries.length === 0) return '';
  const last = entries.length - 1;
  return entries.map((e, i) => {
    const connector = i === last ? `${D.bl}${D.thinH.repeat(2)}` : `${D.sep}${D.thinH.repeat(2)}`;
    return `\`${connector}\` ${e}`;
  }).join('\n');
}

function buildSparkline(values, width = 12) {
  if (values.length < 2) return D.light.repeat(width);
  const chars = ['▁','▂','▃','▄','▅','▆','▇','█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = Math.max(1, Math.floor(values.length / width));
  const sampled = [];
  for (let i = 0; i < values.length; i += step) sampled.push(values[i]);
  if (sampled.length < width) sampled.push(values[values.length - 1]);
  while (sampled.length > width) sampled.pop();

  return sampled.map(v => {
    const idx = Math.round(((v - min) / range) * (chars.length - 1));
    return chars[Math.min(idx, chars.length - 1)];
  }).join('');
}

function createSpectrumSteps(count = 12) {
  const colors = ['#FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#4B0082','#8B00FF'];
  const steps = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const c1 = colors[Math.floor(t * (colors.length - 1))];
    const c2 = colors[Math.min(Math.ceil(t * (colors.length - 1)), colors.length - 1)];
    const lt = (t * (colors.length - 1)) % 1;
    steps.push(blendHex(c1, c2, lt));
  }
  return steps;
}

function createPulseSteps(colorA, colorB, steps = 10) {
  const result = [];
  for (let i = 0; i < steps; i++) {
    const t = Math.sin((i / (steps - 1)) * Math.PI) * 0.5 + 0.5;
    result.push(blendHex(colorA, colorB, t));
  }
  return result;
}

function createSelectMenu(customId, options, placeholder = 'Select an option') {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder);

  options.forEach(opt => {
    const builder = new StringSelectMenuOptionBuilder()
      .setLabel(opt.label)
      .setValue(opt.value)
      .setDescription(opt.description || '');
    if (opt.emoji) builder.setEmoji(opt.emoji);
    if (opt.default) builder.setDefault(true);
    menu.addOptions(builder);
  });

  return menu;
}

function createButtonRow(buttons) {
  const row = new ActionRowBuilder();
  buttons.forEach(btn => {
    const b = new ButtonBuilder()
      .setCustomId(btn.customId)
      .setLabel(btn.label)
      .setStyle(btn.style || ButtonStyle.Primary)
      .setDisabled(btn.disabled || false);
    if (btn.emoji) b.setEmoji(btn.emoji);
    row.addComponents(b);
  });
  return row;
}

function createLinkRow(links) {
  const row = new ActionRowBuilder();
  links.forEach(link => {
    row.addComponents(
      new ButtonBuilder()
        .setLabel(link.label)
        .setStyle(ButtonStyle.Link)
        .setURL(link.url)
        .setEmoji(link.emoji || null)
    );
  });
  return row;
}

function buildStatCard(icon, label, value, color) {
  const c = color || config.colors.primary;
  return {
    color: c,
    name: `${icon} ${label}`,
    value: value.length > 1024 ? value.slice(0, 1021) + '...' : value,
    inline: true
  };
}

function buildInfoRow(icon, label, value) {
  return `${icon} **${label}** ${D.arrow} ${value}`;
}

function buildMetric(icon, label, value, gauge) {
  const g = gauge ? `\n${gauge}` : '';
  return `${icon} **${label}:** ${value}${g}`;
}

function buildHeader(title, icon, subtitle) {
  return embedHeader(title, icon, subtitle);
}

function buildDivider(char) {
  const c = char || D.smallSep;
  return `${c}${c}${c}${c}${c}${c}${c}${c}${c}${c}${c}${c}${c}${c}${c}`;
}

function buildColumn(title, items) {
  const header = `**${title}**`;
  const lines = items.map(([k, v]) => `${D.dot} ${k}: ${v}`);
  return [header, ...lines].join('\n');
}

function buildSideBySide(leftTitle, leftItems, rightTitle, rightItems) {
  const maxLen = Math.max(
    ...leftItems.map(([k]) => k.length),
    ...rightItems.map(([k]) => k.length)
  );
  const left = leftItems.map(([k, v]) => `${k.padEnd(maxLen)} ${D.v} ${v}`);
  const right = rightItems.map(([k, v]) => `${k.padEnd(maxLen)} ${D.v} ${v}`);
  const sep = `${D.thinH.repeat(maxLen + 4)} ${D.v} ${D.thinH.repeat(20)}`;
  return [
    `\`\`\`${D.tl}${D.thinH.repeat(maxLen + 4)}${D.tr}   ${D.tl}${D.thinH.repeat(20)}${D.tr}\``,
    `\`${D.v} ${leftTitle.padEnd(maxLen + 2)}${D.v}   ${D.v} ${rightTitle.padEnd(18)}${D.v}\``,
    `\`${D.sep}${D.thinH.repeat(maxLen + 4)}${D.sep2}   ${D.sep}${D.thinH.repeat(20)}${D.sep2}\``,
    ...left.map((l, i) => `\`${D.v} ${l}${D.v}   ${D.v} ${right[i] || ''.padEnd(20)}${D.v}\``),
    `\`${D.bl}${D.thinH.repeat(maxLen + 4)}${D.br}   ${D.bl}${D.thinH.repeat(20)}${D.br}\``
  ].join('\n');
}

function buildMosaic(panels) {
  return panels.map((p, i) => {
    return `\`${D.tl}${D.thinH.repeat(18)}${i < panels.length - 1 ? D.tr : D.tr}\`\n` +
           `\`${D.v} ${p.label.padEnd(18)}${D.v}\`\n` +
           `\`${D.v} ${String(p.value).padEnd(18)}${D.v}\`\n` +
           `\`${D.bl}${D.thinH.repeat(18)}${i < panels.length - 1 ? D.br : D.br}\``;
  }).join(' ');
}

function buildStatusDot(status) {
  const dots = {
    online: '🟢', idle: '🟡', dnd: '🔴', offline: '⚫',
    yes: '✅', no: '❌', warn: '⚠️', info: 'ℹ️',
    loading: '⏳', done: '✅', error: '❌'
  };
  return dots[status] || '⚪';
}

function buildAnimatedLoader(step, text, frames) {
  const f = frames || ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  return `${f[step % f.length]} ${text}`;
}

function buildStageIndicator(current, total, labels) {
  const stages = [];
  for (let i = 0; i < total; i++) {
    if (i < current) stages.push(`✅ ${labels[i] || ''}`);
    else if (i === current) stages.push(`⏳ **${labels[i] || ''}**`);
    else stages.push(`⬜ ${labels[i] || ''}`);
  }
  return stages.join('\n');
}

function buildCountdownBar(remaining, total, size = 15) {
  const pct = remaining / total;
  const fill = Math.round((1 - pct) * size);
  const empty = size - fill;
  return `${D.block.repeat(fill)}${D.light.repeat(empty)} ${remaining}s`;
}

function buildMiniTable(headers, rows) {
  const colW = headers.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i] || '').length)));
  const sep = colW.map(w => D.h.repeat(w)).join('─┼─');
  const hdr = headers.map((h, i) => h.padEnd(colW[i])).join(' │ ');
  const data = rows.map(r => r.map((c, i) => String(c || '').padEnd(colW[i])).join(' │ '));
  return `\`\`\`\n${hdr}\n${sep}\n${data.join('\n')}\n\`\`\``;
}

module.exports = {
  sleep,
  AnimatedEmbed,
  LiveDashboard,
  buildGauge,
  buildWheel,
  buildTimeline,
  buildSparkline,
  createSpectrumSteps,
  createPulseSteps,
  createSelectMenu,
  createButtonRow,
  createLinkRow,
  buildStatCard,
  buildInfoRow,
  buildMetric,
  buildHeader,
  buildDivider,
  buildColumn,
  buildSideBySide,
  buildMosaic,
  buildStatusDot,
  buildAnimatedLoader,
  buildStageIndicator,
  buildCountdownBar,
  buildMiniTable,
  blendHex,
  hexToRgb,
  rgbToHex
};
