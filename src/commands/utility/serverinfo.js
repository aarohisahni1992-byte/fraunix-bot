const { SlashCommandBuilder, ChannelType } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, embedHeader, sectionDivider, fieldList, progressBar, badge, D, visuals, DECO } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('View detailed server analysis with visual stats')
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const g = interaction.guild;
    const owner = await g.fetchOwner();

    const channels = g.channels.cache;
    const text = channels.filter(c => c.type === ChannelType.GuildText).size;
    const voice = channels.filter(c => c.type === ChannelType.GuildVoice).size;
    const cats = channels.filter(c => c.type === ChannelType.GuildCategory).size;
    const threads = channels.filter(c => c.type === ChannelType.PublicThread || c.type === ChannelType.PrivateThread).size;

    const totalMembers = g.memberCount;
    const bots = g.members.cache.filter(m => m.user.bot).size;
    const humans = g.members.cache.filter(m => !m.user.bot).size;
    const boostLevel = g.premiumTier;
    const boostCount = g.premiumSubscriptionCount || 0;

    const roles = g.roles.cache.size;
    const emojis = g.emojis.cache.size;
    const animEmojis = g.emojis.cache.filter(e => e.animated).size;
    const verifLevels = ['None', 'Low', 'Medium', 'High', 'Very High'];
    const humanPct = Math.round((humans / totalMembers) * 100);

    const barItems = [
      ['👤', humans],
      ['🤖', bots],
      ['💬', text],
      ['🔊', voice]
    ];

    const creationDate = `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`;
    const creationRelative = `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`;

    const embed = premiumEmbed({
      color: config.colors.primary,
      title: g.name,
      thumbnail: g.iconURL({ dynamic: true, size: 1024 }),
      description: [
        embedHeader('Server Analysis', '🏠', `Level ${boostLevel} Boost • ${boostCount} boosts`),
        '',
        `${DECO.gem} **${g.name}**${g.description ? ` — ${g.description}` : ''}`,
        '',
        sectionDivider('General', '📋'),
        fieldList([
          ['Owner', owner.user.tag],
          ['ID', `\`${g.id}\``],
          ['Created', `${creationDate} (${creationRelative})`],
          ['Verification', verifLevels[g.verificationLevel]]
        ]),
        '',
        sectionDivider('Demographics', '👥'),
        `${visuals.gauge(humans, totalMembers, 12)} **${humans.toLocaleString()}** Humans`,
        `${visuals.gauge(bots, totalMembers, 12)} **${bots.toLocaleString()}** Bots`,
        `${progressBar(humans, totalMembers, 20)} Human Ratio`,
        '',
        sectionDivider('Channel Grid', '💬'),
        fieldList([
          ['Text', `${text}`],
          ['Voice', `${voice}`],
          ['Categories', `${cats}`],
          ['Threads', `${threads}`]
        ]),
        '',
        `\`\`\`\n${visuals.renderBarChart(barItems, 18, 6)}\n\`\`\``,
        '',
        sectionDivider('Other', '📦'),
        fieldList([
          ['Roles', `${roles}`],
          ['Emojis', `${emojis} (${animEmojis} animated)`],
          ['Boost Level', `${boostLevel}`],
          ['Boosts', `${boostCount}`]
        ])
      ].join('\n'),
      footer: { text: `${DECO.crown} Requested by ${interaction.user.displayName} ${DECO.crown}` }
    });

    if (g.bannerURL()) embed.setImage(g.bannerURL({ size: 4096 }));

    await interaction.editReply({ embeds: [embed] });
  }
};
