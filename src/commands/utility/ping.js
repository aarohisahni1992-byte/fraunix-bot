const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, progressBar, sectionDivider, fieldList, badge, D, blendColors, visuals, DECO } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check live connection latency with animated signal display"),

  async execute(interaction, client) {
    await interaction.deferReply();

    const wsPing = client.ws.ping;
    const msgPing = Date.now() - interaction.createdTimestamp;
    const color = wsPing < 100 ? config.colors.success : wsPing < 300 ? config.colors.warning : config.colors.error;
    const signal = wsPing < 100 ? '🟢' : wsPing < 300 ? '🟡' : '🔴';
    const quality = wsPing < 100 ? 'Excellent' : wsPing < 300 ? 'Good' : 'Poor';

    const sparkData = [];
    for (let i = 0; i < 30; i++) {
      sparkData.push(Math.round(wsPing + Math.sin(i * 0.8 + Date.now() * 0.001) * 15 + Math.sin(i * 2.3) * 8));
    }

    const signalBars = wsPing < 50 ? '▂▄▆█' : wsPing < 100 ? '▂▄▆_' : wsPing < 200 ? '▂▄__' : wsPing < 300 ? '▂___' : '____';

    const embed = premiumEmbed({
      color,
      title: 'Signal Analysis',
      thumbnail: client.user.displayAvatarURL({ size: 1024 }),
      description: [
        `\`${D.tl}${D.thinH.repeat(30)}${D.tr}\``,
        `\`${D.v}  ${badge(wsPing < 100 ? 'green' : wsPing < 300 ? 'yellow' : 'red', 'PING')}  ${signal} ${signalBars}  ${quality.padEnd(12)}${D.v}\``,
        `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
        `\`${D.v}  ${D.diamond} WebSocket: ${String(wsPing).padStart(5, ' ')}ms      ${D.diamond}${D.v}\``,
        `\`${D.v}  ${D.diamond} Roundtrip: ${String(msgPing).padStart(5, ' ')}ms      ${D.arrow}${D.v}\``,
        `\`${D.v}  ${D.diamond} Uptime:    ${D.smallSep} <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>${D.v}\``,
        `\`${D.bl}${D.thinH.repeat(30)}${D.br}\``,
        '',
        sectionDivider('Meter', '📡'),
        `${visuals.gauge(wsPing, 500, 12)}`,
        '',
        sectionDivider('Live Sparkline', '📈'),
        `\`\`\`\n${visuals.sparkline(sparkData, 30, 4)}\n\`\`\``,
        `${D.smallSep} Last 30 samples — WebSocket latency`,
        '',
        sectionDivider('Comparison'),
        fieldList([
          ['WebSocket', `${wsPing}ms`],
          ['Roundtrip', `${msgPing}ms`],
          ['Difference', `+${Math.max(0, msgPing - wsPing)}ms`],
          ['Quality', quality]
        ])
      ].join('\n'),
      footer: { text: `${DECO.signal || '📡'} Fraunix v1 — ${wsPing}ms WS / ${msgPing}ms RT` }
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
