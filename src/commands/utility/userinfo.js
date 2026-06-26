const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, embedHeader, sectionDivider, fieldList, badge, D } = require('../../utils/embed');
const { isOwner, isAdmin } = require('../../utils/permissions');
const BadgeManager = require('../../models/badges');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View detailed profile information about a user')
    .setDMPermission(false)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to inspect')
        .setRequired(false)),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getMember('target') || interaction.member;
    const user = target.user;

    const roles = target.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position);

    const flags = await user.fetchFlags().catch(() => null);
    const flagList = flags ? flags.toArray() : [];
    const flagMap = {
      Staff: '<:discordstaff:1>', Partner: '🤝', Hypesquad: '🏆',
      BugHunterLevel1: '🐛', BugHunterLevel2: '🐞',
      HypeSquadOnlineHouse1: '🟤', HypeSquadOnlineHouse2: '🟣',
      HypeSquadOnlineHouse3: '🟡', PremiumEarlySupporter: '⭐',
      VerifiedDeveloper: '🤖', CertifiedModerator: '🛡️',
      ActiveDeveloper: '💻'
    };

    const roleBadges = [];
    if (isOwner(user.id)) roleBadges.push('👑 **Bot Owner**');
    else if (isAdmin(user.id)) roleBadges.push('🛡️ **Bot Admin**');
    if (user.id === interaction.guild.ownerId) roleBadges.push('🏠 **Server Owner**');

    const discordBadges = flagList.length > 0 ? flagList.map(f => flagMap[f] || f).join(' ') : '';
    const customBadges = BadgeManager.list(user.id);

    const allBadges = [];
    if (roleBadges.length > 0) allBadges.push(`**__Roles__**\n${roleBadges.join('\n')}`);
    if (discordBadges) allBadges.push(`**__Discord__**\n${discordBadges}`);
    if (customBadges.length > 0) allBadges.push(`**__Custom__**\n${customBadges.map(b => b.text).join('\n')}`);

    const joined = `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`;
    const created = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
    const joinedDate = `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>`;

    const embed = premiumEmbed({
      color: target.displayColor || config.colors.primary,
      title: `${user.displayName}`,
      thumbnail: user.displayAvatarURL({ dynamic: true, size: 1024 }),
      description: [
        embedHeader('User Profile', '👤'),
        '',
        `${D.diamond} **${user.tag}** ${user.bot ? badge('gray', 'BOT') : badge('green', 'USER')}`,
        '',
        sectionDivider('Profile', '📋'),
        fieldList([
          ['ID', `\`${user.id}\``],
          ['Nickname', target.nickname || 'None'],
          ['Bot', user.bot ? 'Yes' : 'No'],
          ['Color', target.displayHexColor]
        ]),
        '',
        sectionDivider('Timelines', '⏱'),
        fieldList([
          ['Joined Server', joined],
          ['Joined Discord', created],
          ['Since', joinedDate]
        ]),
        '',
        sectionDivider('Badges'),
        allBadges.length > 0 ? allBadges.join('\n\n') : 'None'
      ].join('\n'),
      fields: roles.size > 0 ? [{
        name: `🎖️ Roles (${roles.size})`,
        value: roles.map(r => r.toString()).join(' ').slice(0, 1024),
        inline: false
      }] : [],
      footer: { text: `${D.star} Fraunix Profile System ${D.star}` }
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
