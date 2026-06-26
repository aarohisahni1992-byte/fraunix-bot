const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, embedHeader, sectionDivider, fieldList, progressBar, formatUptime, badge, D, visuals, DECO } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('View live uptime with animated progress display'),

  async execute(interaction, client) {
    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const startedAt = Date.now() - process.uptime() * 1000;

    const embed = premiumEmbed({
      color: config.colors.success,
      title: 'Runtime Observatory',
      thumbnail: client.user.displayAvatarURL({ size: 1024 }),
      description: [
        embedHeader('Runtime', '⏱', `${badge('green', 'LIVE')} System active`),
        '',
        `${DECO.spark} Online for **${formatUptime(totalSeconds)}**`,
        `${DECO.spark} Since <t:${Math.floor(startedAt / 1000)}:F> (<t:${Math.floor(startedAt / 1000)}:R>)`,
        '',
        sectionDivider('Time Lattice', '⏲'),
        `\`\`\`\n${visuals.renderHeartbeat(35, Math.floor(Date.now() / 1000))}\n\`\`\``,
        '',
        sectionDivider('Breakdown'),
        `\`\`\`\n${D.v} ${'Days'.padEnd(10)} ${D.v} ${String(days).padStart(8)}\n${D.v} ${'Hours'.padEnd(10)} ${D.v} ${String(hours).padStart(8)}\n${D.v} ${'Minutes'.padEnd(10)} ${D.v} ${String(minutes).padStart(8)}\n${D.v} ${'Seconds'.padEnd(10)} ${D.v} ${String(seconds).padStart(8)}\n\`\`\``,
        '',
        sectionDivider('Day Progress'),
        `${progressBar(totalSeconds % 86400, 86400, 20)} Daily cycle`,
        '',
        sectionDivider('Lifecycle'),
        fieldList([
          ['Started', new Date(startedAt).toLocaleString()],
          ['Total Runtime', formatUptime(totalSeconds)],
          ['Restarts', 'Unknown'],
          ['Session', `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`]
        ])
      ].join('\n'),
      footer: { text: `${DECO.spark} Fraunix v1 — ${formatUptime(totalSeconds)} and counting ${DECO.spark}` }
    });

    await interaction.reply({ embeds: [embed] });
  }
};
