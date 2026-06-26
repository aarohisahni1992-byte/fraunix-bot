const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const { colorGradientSteps, D, animatedColor, blendColors, boxTop, boxBottom } = require('./embed');
const visuals = require('./visuals');

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function animatedEmbed(message, steps, interval = 800) {
  const msg = await message.channel.send({ embeds: [steps[0]] });
  for (let i = 1; i < steps.length; i++) { await sleep(interval); await msg.edit({ embeds: [steps[i]] }); }
  return msg;
}

async function rainbowCycle(message, duration = 5000, step = 200) {
  const rainbow = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'];
  const base = message.embeds?.[0] ? EmbedBuilder.from(message.embeds[0]) : new EmbedBuilder().setDescription('​');
  const steps = Math.floor(duration / step);
  for (let i = 0; i < steps; i++) {
    await message.edit({ embeds: [EmbedBuilder.from(base).setColor(rainbow[i % rainbow.length])] });
    await sleep(step);
  }
  await message.edit({ embeds: [EmbedBuilder.from(base).setColor(config.colors.primary)] });
  return message;
}

async function glowPulse(channel, embed, pulses = 5, interval = 350) {
  const colors = colorGradientSteps(config.colors.primary, '#FFFFFF', pulses);
  const colorBack = colorGradientSteps('#FFFFFF', config.colors.primary, pulses);
  const allColors = [...colors, ...colorBack];
  const msg = await channel.send({ embeds: [embed.setColor(allColors[0])] });
  for (let i = 1; i < allColors.length; i++) {
    await sleep(interval);
    await msg.edit({ embeds: [embed.setColor(allColors[i])] });
  }
  await msg.edit({ embeds: [embed.setColor(config.colors.primary)] });
  return msg;
}

async function morphingAnimation(channel, states, interval = 600) {
  if (!states.length) return null;
  const msg = await channel.send({ embeds: [states[0].embed] });
  for (let i = 1; i < states.length; i++) {
    const prevColor = states[i - 1].color || config.colors.primary;
    const nextColor = states[i].color || config.colors.primary;
    const fadeSteps = 5;
    for (let f = 1; f <= fadeSteps; f++) {
      const t = f / fadeSteps;
      const midColor = blendColors(prevColor, nextColor, t);
      await sleep(interval / fadeSteps);
      const mid = EmbedBuilder.from(i === states.length - 1 ? states[i].embed : states[i - 1].embed).setColor(midColor);
      await msg.edit({ embeds: [mid] });
    }
    await msg.edit({ embeds: [states[i].embed] });
  }
  return msg;
}

async function liveClock(channel, label, duration = 30000) {
  const start = Date.now();
  const end = start + duration;
  const msg = await channel.send({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`⏱ ${label}`)
      .setDescription(visuals.renderLoadingBar(0) + '\n' + visuals.renderPulse(30, 0))
      .setFooter({ text: 'Fraunix v1' })]
  });
  let frame = 0;
  while (Date.now() < end) {
    const elapsed = Date.now() - start;
    const pct = Math.min((elapsed / duration) * 100, 100);
    await sleep(200);
    frame++;
    await msg.edit({
      embeds: [new EmbedBuilder()
        .setColor(blendColors(config.colors.success, config.colors.primary, pct / 100))
        .setTitle(`⏱ ${label}`)
        .setDescription(
          `\`${visuals.renderWave(30, 4, frame)}\`\n` +
          `${visuals.renderLoadingBar(pct)}\n` +
          `${D.dot} **Elapsed:** ${((elapsed) / 1000).toFixed(1)}s / ${(duration / 1000).toFixed(0)}s\n` +
          `${D.dot} **Status:** ${pct < 100 ? 'Running...' : 'Complete!'}`
        )
        .setFooter({ text: 'Fraunix v1' })]
    });
  }
  await msg.edit({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle(`✅ ${label} — Complete`)
      .setDescription(`\`${D.tl}${D.thinH.repeat(24)}${D.tr}\`\n\`${D.v}  ⏱  Timer finished                ${D.v}\`\n\`${D.bl}${D.thinH.repeat(24)}${D.br}\``)
      .setFooter({ text: 'Fraunix v1' })]
  });
  return msg;
}

async function countUp(channel, target, label, interval = 50) {
  const start = Date.now();
  const msg = await channel.send({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`🔢 ${label}`)
      .setDescription(`\`\`\`\n  ${' '.repeat(10)}0\n\`\`\``)
      .setFooter({ text: 'Fraunix v1' })]
  });
  let current = 0;
  const startTime = Date.now();
  const duration = target * interval;
  while (current < target) {
    const elapsed = Date.now() - startTime;
    current = Math.min(Math.floor(elapsed / interval), target);
    const pct = (current / target) * 100;
    await sleep(Math.max(10, interval));
    const colors = colorGradientSteps(config.colors.primary, config.colors.success, 10);
    const colorIdx = Math.min(Math.floor((current / target) * 9), 9);
    const digitStr = String(current).padStart(10);
    const bar = visuals.renderLoadingBar(pct, 15);
    await msg.edit({
      embeds: [new EmbedBuilder()
        .setColor(colors[colorIdx] || config.colors.success)
        .setTitle(`🔢 ${label}`)
        .setDescription(
          `\`\`\`\n  ${DECO.wave} COUNTING ${digitStr}\n\`\`\`\n` +
          `${bar}\n` +
          `${D.dot} **Progress:** ${current.toLocaleString()} / ${target.toLocaleString()}`
        )
        .setFooter({ text: 'Fraunix v1' })]
    });
  }
  await msg.edit({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle(`✅ ${label} — Complete!`)
      .setDescription(
        `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\`\n` +
        `\`${D.v}  ${D.star} Count reached: ${String(target).padEnd(8)}${D.v}\`\n` +
        `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
      )
      .setFooter({ text: 'Fraunix v1' })]
  });
  return msg;
}

async function typingEffect(channel, text, delay = 40) {
  const msg = await channel.send('​');
  let displayed = '';
  const cursors = ['▌', '▐', '█', '░'];
  for (let i = 0; i < text.length; i++) {
    displayed += text[i];
    await msg.edit(`${displayed}${cursors[i % cursors.length]}`);
    await sleep(delay);
  }
  await msg.edit(displayed + '█');
  await sleep(300);
  await msg.edit(displayed);
  return msg;
}

async function waveLoading(channel, message, duration = 3000) {
  const msg = await channel.send({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.primary)
      .setDescription(`\`\`\`\n${visuals.renderWave(35, 5, 0)}\n\`\`\`\n${D.dot} ${message || 'Loading...'}`)
      .setFooter({ text: 'Fraunix v1' })]
  });
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    await sleep(100);
    await msg.edit({
      embeds: [new EmbedBuilder()
        .setColor(blendColors(config.colors.primary, config.colors.success, i / steps))
        .setDescription(`\`\`\`\n${visuals.renderWave(35, 5, i)}\n\`\`\`\n${D.dot} ${message || 'Loading...'}`)
        .setFooter({ text: 'Fraunix v1' })]
    });
  }
  await sleep(200);
  return msg;
}

async function matrixRain(channel, message, duration = 3000) {
  const msg = await channel.send({
    embeds: [new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🌀 Initializing...')
      .setDescription(`\`\`\`\n${visuals.renderMatrix(30, 10, 0)}\n\`\`\``)
      .setFooter({ text: 'Fraunix v1' })]
  });
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    await sleep(100);
    await msg.edit({
      embeds: [new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🌀 Processing...')
        .setDescription(`\`\`\`\n${visuals.renderMatrix(30, 10, i)}\n\`\`\`\n${D.dot} ${message || 'Processing...'}`)
        .setFooter({ text: 'Fraunix v1' })]
    });
  }
  await msg.edit({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('✅ Complete')
      .setDescription(`${boxTop(24)}\n${D.v}  🌀  Processing finished        ${D.v}\n${boxBottom(24)}`)
      .setFooter({ text: 'Fraunix v1' })]
  });
  return msg;
}

async function pulseEmbed(message, embedBuilder, pulses = 3) {
  const colors = [config.colors.primary, config.colors.success, config.colors.warning, config.colors.error, config.colors.primary];
  let msg;
  for (let i = 0; i < pulses; i++) {
    const embed = embedBuilder.setColor(colors[i % colors.length]);
    if (i === 0) msg = await message.channel.send({ embeds: [embed] });
    else await msg.edit({ embeds: [embed] });
    await sleep(400);
  }
  return msg;
}

async function countdownEmbed(channel, seconds, title) {
  const msg = await channel.send({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle(title || '⏳ Countdown')
      .setDescription(visuals.renderLoadingBar(100) + `\n**${seconds}s**`)
      .setFooter({ text: 'Fraunix v1' })]
  });
  for (let i = seconds - 1; i > 0; i--) {
    await sleep(1000);
    const bar = visuals.renderLoadingBar((i / seconds) * 100, 20);
    const colors = colorGradientSteps(config.colors.warning, config.colors.error, seconds);
    await msg.edit({
      embeds: [new EmbedBuilder()
        .setColor(colors[seconds - i] || config.colors.error)
        .setTitle(title || '⏳ Countdown')
        .setDescription(`${visuals.renderPulse(25, seconds - i)}\n${bar}\n**${i}s**`)
        .setFooter({ text: 'Fraunix v1' })]
    });
  }
  await sleep(1000);
  await msg.edit({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('🚀 Action Completed!')
      .setDescription(`${boxTop(24)}\n${D.v}  🚀  Countdown finished            ${D.v}\n${boxBottom(24)}`)
      .setFooter({ text: 'Fraunix v1' })]
  });
  return msg;
}

async function loadingEmbed(channel, text) {
  const frames = ['▰▱▱▱▱▱▱▱▱▱', '▰▰▱▱▱▱▱▱▱▱', '▰▰▰▱▱▱▱▱▱▱', '▰▰▰▰▱▱▱▱▱▱', '▰▰▰▰▰▱▱▱▱▱', '▰▰▰▰▰▰▱▱▱▱', '▰▰▰▰▰▰▰▱▱▱', '▰▰▰▰▰▰▰▰▱▱', '▰▰▰▰▰▰▰▰▰▱', '▰▰▰▰▰▰▰▰▰▰'];
  const colorFrames = colorGradientSteps(config.colors.primary, config.colors.success, frames.length);
  const msg = await channel.send({
    embeds: [new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle('⏳ Processing')
      .setDescription(`\`${frames[0]}\` ${text || 'Loading...'}\n${visuals.renderWave(25, 4, 0)}`)
      .setFooter({ text: 'Fraunix v1' })]
  });
  for (let i = 1; i < frames.length; i++) {
    await sleep(300);
    await msg.edit({
      embeds: [new EmbedBuilder()
        .setColor(colorFrames[i])
        .setTitle('⏳ Processing')
        .setDescription(`\`${frames[i]}\` ${text || 'Loading...'}\n${visuals.renderWave(25, 4, i * 2)}`)
        .setFooter({ text: 'Fraunix v1' })]
    });
  }
  await sleep(200);
  return msg;
}

async function pageFlip(channel, pages, prefix, timeout = 60000) {
  if (!pages.length) return null;
  let current = 0;
  const buildRow = (page) => {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder();
    row.addComponents(
      new ButtonBuilder().setCustomId(`${prefix}_prev`).setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(current <= 0),
      new ButtonBuilder().setCustomId(`${prefix}_page`).setLabel(`${current + 1}/${pages.length}`).setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId(`${prefix}_next`).setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(current >= pages.length - 1)
    );
    return row;
  };
  const msg = await channel.send({ embeds: [pages[current]], components: [buildRow(current)] });
  const filter = i => i.customId.startsWith(prefix) && i.user.id === channel.client.user.id;
  const collector = msg.createMessageComponentCollector({ filter, time: timeout });
  collector.on('collect', async (interaction) => {
    if (interaction.customId === `${prefix}_prev` && current > 0) current--;
    else if (interaction.customId === `${prefix}_next` && current < pages.length - 1) current++;
    else return;
    await interaction.update({ embeds: [pages[current]], components: [buildRow(current)] });
  });
  collector.on('end', async () => {
    const disabled = buildRow(current);
    disabled.components.forEach(c => c.setDisabled(true));
    await msg.edit({ components: [disabled] }).catch(() => {});
  });
  return msg;
}

async function bounceAnimation(channel, lines, interval = 300) {
  const msg = await channel.send('​');
  const bChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  for (let i = 0; i < lines.length; i++) {
    for (let b = 0; b < 6; b++) {
      await msg.edit(`${lines[i]} ${bChars[(i * 6 + b) % bChars.length]}`);
      await sleep(interval / 6);
    }
  }
  await msg.edit(lines[lines.length - 1]);
  await sleep(200);
  return msg;
}

async function typingAnimation(channel, text, duration = 2000) {
  await channel.sendTyping();
  await sleep(duration);
}

async function fadeTransition(channel, fromEmbed, toEmbed, steps = 6, interval = 300) {
  const fromC = fromEmbed.data.color ? `#${fromEmbed.data.color.toString(16).padStart(6, '0')}` : config.colors.primary;
  const toC = toEmbed.data.color ? `#${toEmbed.data.color.toString(16).padStart(6, '0')}` : config.colors.success;
  const colors = colorGradientSteps(fromC, toC, steps);
  const msg = await channel.send({ embeds: [fromEmbed] });
  for (let i = 0; i < steps; i++) {
    await sleep(interval);
    await msg.edit({ embeds: [EmbedBuilder.from(i < steps - 1 ? fromEmbed : toEmbed).setColor(colors[i])] });
  }
  return msg;
}

async function typingProgress(channel, steps, interval = 600) {
  const frames = ['░', '▒', '▓', '█'];
  let msg;
  for (let i = 0; i < steps.length; i++) {
    const frame = frames[i % frames.length];
    const content = steps[i];
    const e = new EmbedBuilder().setColor(config.colors.info).setDescription(`${frame} **${content}**`).setFooter({ text: 'Fraunix v1' });
    if (!msg) msg = await channel.send({ embeds: [e] });
    else await msg.edit({ embeds: [e] });
    await sleep(interval);
  }
  return msg;
}

const DECO = { wave: '〰' };

module.exports = {
  animatedEmbed, rainbowCycle, glowPulse, morphingAnimation, liveClock, countUp,
  typingEffect, waveLoading, matrixRain, pulseEmbed, countdownEmbed, loadingEmbed,
  pageFlip, bounceAnimation, typingAnimation, fadeTransition, typingProgress, sleep
};
