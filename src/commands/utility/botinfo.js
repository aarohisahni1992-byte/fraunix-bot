const { SlashCommandBuilder, version } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, embedHeader, sectionDivider, fieldList, progressBar, formatUptime, badge, D, blendColors, animatedColor, visuals, DECO } = require('../../utils/embed');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('View live Fraunix system dashboard with animated radar'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const totalChannels = client.guilds.cache.reduce((a, g) => a + g.channels.cache.size, 0);
    const totalCommands = client.commands.size;
    const uptimeSec = process.uptime();
    const cpu = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const mem = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1);
    const ping = Math.round(client.ws.ping);

    const radarLabels = ['Servers', 'Commands', 'Users', 'Channels', 'Uptime', 'Memory'];
    const radarValues = [
      Math.min(totalGuilds * 10, 100),
      Math.min(totalCommands * 8, 100),
      Math.min(totalUsers / 1000, 100),
      Math.min(totalChannels / 10, 100),
      Math.min(uptimeSec / 864, 100),
      Math.min(Math.round((cpu / Math.max(mem, 1)) * 100), 100)
    ];

    const canvas = visuals.renderRadar(radarLabels, radarValues, 100, 27, 13);
    const radarStr = visuals.radarToString(canvas, radarLabels);

    const sparkData = [];
    for (let i = 0; i < 20; i++) {
      sparkData.push(Math.round(ping + Math.sin(i * 1.5) * 20 + Math.random() * 10));
    }

    const embed = premiumEmbed({
      color: config.colors.primary,
      title: 'Live System Radar',
      thumbnail: client.user.displayAvatarURL({ dynamic: true, size: 1024 }),
      description: [
        embedHeader('System Radar', '⚙️', `${badge('green', 'LIVE')} Real-time diagnostics`),
        '',
        `${D.diamond} **${client.user.tag}** ${DECO.spark} ${config.bio}`,
        '',
        `_ _${radarStr}`,
        '',
        sectionDivider('Telemetry', '📊'),
        fieldList([
          ['Servers', `${totalGuilds}`],
          ['Users', `${totalUsers.toLocaleString()}`],
          ['Channels', `${totalChannels}`],
          ['Commands', `${totalCommands}`]
        ]),
        '',
        sectionDivider('Performance', '⚡'),
        `${visuals.gauge(ping, 300, 10)} **${ping}ms** Latency`,
        `${progressBar(Math.round(cpu), Math.round(mem), 15)} RAM`,
        `${D.dot} **Uptime:** ${formatUptime(uptimeSec)}`,
        '',
        sectionDivider('Sparkline', '📈'),
        `\`\`\`\n${visuals.sparkline(sparkData, 25, 4)}\n\`\`\``,
        `${D.smallSep} Latency (last 20 samples)`,
        '',
        sectionDivider('Versions', '📦'),
        fieldList([
          ['Library', `discord.js v${version}`],
          ['Node.js', process.version],
          ['Platform', process.platform]
        ])
      ].join('\n'),
      footer: { text: `${DECO.spark} Fraunix v1 — Engineered for excellence ${DECO.spark}` }
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
