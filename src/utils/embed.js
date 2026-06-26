const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');
const visuals = require('./visuals');

const D = {
  tl: '╭', tr: '╮', bl: '╰', br: '╯',
  h: '─', v: '│', sep: '├', sep2: '╞',
  dot: '•', bullet: '▸', arrow: '→',
  star: '★', diamond: '◆', smallSep: '┄',
  thinH: '━', thickV: '┃',
  block: '█', half: '▓', dark: '▒', light: '░'
};

const DECO = {
  crown: '♛', shield: '🛡', bolt: '⚡', wave: '〰',
  spark: '✨', gem: '💎', fire: '🔥', zap: '⚡',
  snow: '❄', flower: '✿', heart: '♥', club: '♣',
  spade: '♠', note: '♪', doubleNote: '♫', cross: '✦',
  smallStar: '✧', target: '◎', diamond2: '◇', circle: '○',
  square: '□', triangle: '△', tab: '	'
};

const DECORATIVE_BORDERS = {
  modern: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  thick: { tl: '▛', tr: '▜', bl: '▙', br: '▟', h: '▀', v: '▌' },
  arrows: { tl: '◥', tr: '◤', bl: '◣', br: '◢', h: '◂', v: '▎' },
  dots: { tl: '⠐', tr: '⠐', bl: '⠂', br: '⠂', h: '⠤', v: '⠇' }
};

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return { r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
}

function blendColors(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const b2 = Math.round(a.b + (b.b - a.b) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
}

function colorGradientSteps(from, to, steps) {
  const result = [];
  for (let i = 0; i < steps; i++) result.push(blendColors(from, to, i / (steps - 1)));
  return result;
}

function decorate(style, text, fillChar) {
  const b = DECORATIVE_BORDERS[style] || DECORATIVE_BORDERS.rounded;
  const f = fillChar || b.h;
  const inner = ` ${text} `;
  return `\`${b.tl}${f.repeat(inner.length + 2)}${b.tr}\`\n\`${b.v} ${inner} ${b.v}\`\n\`${b.bl}${f.repeat(inner.length + 2)}${b.br}\``;
}

function premiumEmbed(opts = {}) {
  const color = opts.color || config.colors.primary;
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTimestamp(opts.timestamp || new Date());

  const branding = { text: opts.branding || `✧ Fraunix v1 — by vansh`, iconURL: opts.brandIcon };

  if (opts.title) embed.setTitle(`${opts.titleIcon || ''}${opts.title}`);
  if (opts.description) embed.setDescription(opts.description);
  if (opts.fields) embed.addFields(opts.fields.map(f => ({ name: f.name, value: f.value, inline: f.inline || false })));
  if (opts.footer) embed.setFooter({ text: `${opts.footer.text} ${D.dot} ${branding.text}`, iconURL: opts.footer.icon });
  else embed.setFooter({ text: branding.text });
  if (opts.author) embed.setAuthor(opts.author);
  if (opts.image) embed.setImage(opts.image);
  if (opts.thumbnail) embed.setThumbnail(opts.thumbnail);
  if (opts.url) embed.setURL(opts.url);

  return embed;
}

const successEmbed = (d, t) => premiumEmbed({ color: config.colors.success, title: t || 'Success', description: `${boxTop()}\n${D.v} ${badge('green', '✔')} **${t || 'Success'}**\n${D.v} ${d}\n${boxBottom()}`, footer: { text: 'Action completed' } });
const errorEmbed = (d, t) => premiumEmbed({ color: config.colors.error, title: t || 'Error', description: `${boxTop()}\n${D.v} ${badge('red', '✖')} **${t || 'Error'}**\n${D.v} ${d}\n${boxBottom()}`, footer: { text: 'Action failed' } });
const warningEmbed = (d, t) => premiumEmbed({ color: config.colors.warning, title: t || 'Warning', description: `${boxTop()}\n${D.v} ${badge('yellow', '⚠')} **${t || 'Warning'}**\n${D.v} ${d}\n${boxBottom()}`, footer: { text: 'Proceed with caution' } });
const infoEmbed = (d, t) => premiumEmbed({ color: config.colors.info, title: t || 'Info', description: `${boxTop()}\n${D.v} ${badge('blue', 'ℹ')} **${t || 'Info'}**\n${D.v} ${d}\n${boxBottom()}`, footer: { text: 'Information' } });

function badge(type, text) {
  const colors = { green: { bg: '57F287', fg: '0a2612' }, red: { bg: 'ED4245', fg: '260a0a' }, yellow: { bg: 'FEE75C', fg: '261f0a' }, blue: { bg: '5865F2', fg: '0a0d26' }, purple: { bg: '9B59B6', fg: '150a26' }, pink: { bg: 'FF6B9D', fg: '260a15' }, gray: { bg: '95A5A6', fg: '0d1313' } };
  return `\`${text}\``;
}

function boxTop(w = 36) { return `\`${D.tl}${D.thinH.repeat(w)}${D.tr}\``; }
function boxBottom(w = 36) { return `\`${D.bl}${D.thinH.repeat(w)}${D.br}\``; }

function sectionDivider(label, emoji) {
  const e = emoji || D.diamond;
  return `\n${D.smallSep}${D.smallSep}${D.smallSep} ${e} **${label}** ${D.smallSep}${D.smallSep}${D.smallSep}\n`;
}

function fieldValue(label, value) { return `**${label}** ${D.arrow} ${value}`; }
function fieldList(entries) { return entries.map(([l, v]) => `${D.dot} **${l}:** ${v}`).join('\n'); }

function statsGrid(items, cols = 2) {
  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    const row = items.slice(i, i + cols);
    const maxLabel = Math.max(...row.map(r => r[0].length));
    rows.push(row.map(r => `${r[0].padEnd(maxLabel)} ${D.v} ${r[1]}`).join('   '));
  }
  return `\`\`\`\n${rows.join('\n')}\n\`\`\``;
}

function progressBar(current, total, size = 12, color = 'primary') {
  const pct = Math.min(Math.max(current / total, 0), 1);
  const filled = Math.round(pct * size);
  const empty = size - filled;
  const bar = D.block.repeat(filled) + D.light.repeat(empty);
  const pctStr = `${(pct * 100).toFixed(1)}%`.padStart(6);
  return `${bar} ${pctStr} \`${current}/${total}\``;
}

function dashboardGauge(value, max, label, thresholds = [60, 80, 95]) {
  const pct = (value / max) * 100;
  const fill = Math.round((pct / 100) * 10);
  const gauge = D.block.repeat(fill) + D.light.repeat(10 - fill);
  return `${gauge} **${value}** ${label}`;
}

function statusBadge(online) {
  if (online === true) return '🟢 **Online**';
  if (online === false) return '🔴 **Offline**';
  if (online === 'idle') return '🟡 **Idle**';
  if (online === 'dnd') return '⛔ **DND**';
  return '⚫ **Unknown**';
}

function moderationLogEmbed(action, moderator, target, reason, duration) {
  return premiumEmbed({
    color: config.colors.primary,
    title: 'Moderation Log',
    description: `${boxTop(30)}\n${D.v} ${badge('blue', 'LOG')} Case Recorded\n${boxBottom(30)}`,
    fields: [
      { name: `${D.diamond} Action`, value: `\`${action}\``, inline: true },
      { name: `${D.star} Moderator`, value: `${moderator}`, inline: true },
      { name: `${D.dot} Target`, value: `${target.tag} (\`${target.id}\`)`, inline: true },
      { name: `${D.arrow} Reason`, value: reason || 'No reason provided', inline: false }
    ].concat(duration ? [{ name: '⏱ Duration', value: duration, inline: true }] : []),
    footer: { text: `Case logged ${D.dot} ${new Date().toLocaleString()}` }
  });
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [d > 0 && `${d}d`, h > 0 && `${h}h`, m > 0 && `${m}m`, `${s}s`].filter(Boolean).join(' ');
}

function embedHeader(title, icon, subtitle) {
  const i = icon || D.star;
  const lines = [`\`${D.tl}${D.thinH.repeat(30)}${D.tr}\``, `\`${D.v}  ${i}  ${title.padEnd(24)} ${D.v}\``];
  if (subtitle) lines.push(`\`${D.v}  ${D.smallSep} ${subtitle.padEnd(22)} ${D.v}\``);
  lines.push(`\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``);
  return lines.join('\n');
}

function createActionRow(buttons) {
  const row = new ActionRowBuilder();
  buttons.forEach(btn => row.addComponents(new ButtonBuilder().setCustomId(btn.customId).setLabel(btn.label).setStyle(btn.style || ButtonStyle.Primary).setEmoji(btn.emoji || null).setDisabled(btn.disabled || false)));
  return row;
}

function createEmbed(opts = {}) { return premiumEmbed(opts); }

function animatedProgressBar(current, total, size = 10) {
  const filled = Math.round((current / total) * size);
  const empty = size - filled;
  const bar = D.block.repeat(filled) + D.light.repeat(empty);
  const pct = ((current / total) * 100).toFixed(0);
  return `${bar} **${pct}%** \`${current}/${total}\``;
}

function pageIndicator(current, total) {
  const dots = [];
  for (let i = 1; i <= total; i++) dots.push(i === current ? `${D.star}` : `${D.smallSep}`);
  return dots.join(' ');
}

function createPaginationRow(currentPage, totalPages, prefix) {
  const row = new ActionRowBuilder();
  row.addComponents(
    new ButtonBuilder().setCustomId(`${prefix}_prev`).setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(currentPage <= 1),
    new ButtonBuilder().setCustomId(`${prefix}_page`).setLabel(`${currentPage}/${totalPages}`).setStyle(ButtonStyle.Primary).setDisabled(true),
    new ButtonBuilder().setCustomId(`${prefix}_next`).setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= totalPages)
  );
  return row;
}

function createSelectMenu(customId, placeholder, options) {
  const { StringSelectMenuBuilder } = require('discord.js');
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .addOptions(options.map(o => ({ label: o.label, value: o.value, description: o.description, emoji: o.emoji })));
  return new ActionRowBuilder().addComponents(menu);
}

function liveDashboard(title, fields, color) {
  const lines = [`${boxTop(34)}`, `${D.v}  ${DECO.spark}  ${title.padEnd(28)} ${D.v}`, `${boxBottom(34)}`, ''];
  fields.forEach(([k, v]) => lines.push(`${D.dot} **${k}:** ${v}`));
  return lines.join('\n');
}

function morphColor(baseColor, intensity = 0.5) {
  const colors = [config.colors.primary, config.colors.success, config.colors.secondary || '#9B59B6', config.colors.pink || '#FF6B9D', config.colors.accent || '#00D4AA'];
  const idx = Math.floor(intensity * colors.length) % colors.length;
  const nextIdx = (idx + 1) % colors.length;
  return blendColors(colors[idx], colors[nextIdx], intensity * colors.length - idx);
}

let _morphTime = 0;
function animatedColor() {
  _morphTime += 0.03;
  return morphColor(config.colors.primary, Math.sin(_morphTime) * 0.5 + 0.5);
}

module.exports = {
  premiumEmbed, createEmbed, successEmbed, errorEmbed, warningEmbed, infoEmbed,
  moderationLogEmbed, confirmEmbed: (action, target, reason, extra) => {
    const lines = [`${boxTop(30)}`, `${D.v}  ${badge('red', 'CONFIRM')} **${action}**`, `${boxBottom(30)}`, '', `${D.diamond} **Target:** ${target}`, `${D.diamond} **Reason:** ${reason}`];
    if (extra) lines.push(`${D.diamond} ${extra}`);
    lines.push('', `${D.arrow} This action **cannot** be undone easily. Proceed?`);
    return premiumEmbed({ color: config.colors.error, title: `Confirm ${action}`, description: lines.join('\n') });
  },
  borderedDescription: (t) => `${boxTop()}\n${D.v} ${t}\n${boxBottom()}`,
  sectionDivider, fieldValue, fieldList, statsGrid,
  makeTable: (headers, rows) => {
    const cw = headers.map((h, i) => Math.max(h.length, rows.reduce((m, r) => Math.max(m, String(r[i] || '').length), 0)));
    const hl = headers.map((h, i) => h.padEnd(cw[i])).join(' │ ');
    const sl = cw.map(w => D.h.repeat(w)).join('─┼─');
    const dl = rows.map(r => r.map((c, i) => String(c || '').padEnd(cw[i])).join(' │ '));
    return `\`\`\`\n${hl}\n${sl}\n${dl.join('\n')}\n\`\`\``;
  },
  createActionRow, animatedProgressBar, progressBar, dashboardGauge, statusBadge,
  badge, boxTop, boxBottom, headerBar: (l, i) => `\n\`\`\`${D.tl}${D.thinH}${D.thinH}${D.thinH} ${i || D.star} ${l} ${D.thinH}${D.thinH}${D.thinH}${D.tr}\`\`\``,
  footerBar: () => `\n\`\`\`${D.bl}${D.thinH.repeat(36)}${D.br}\`\`\``,
  embedHeader, pageIndicator, createPaginationRow,
  colorGradientSteps, blendColors, formatUptime, D, DECO, DECORATIVE_BORDERS,
  decorate, liveDashboard, animatedColor, morphColor, createSelectMenu, visuals
};
