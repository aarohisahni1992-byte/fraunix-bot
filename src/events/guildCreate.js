const config = require('../../config.json');
const { premiumEmbed, embedHeader, sectionDivider, fieldList, badge, D, DECO } = require('../utils/embed');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    const sysChannel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has('SendMessages'));
    if (!sysChannel) return;

    const owner = await guild.fetchOwner().catch(() => null);
    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    const embed = premiumEmbed({
      color: config.colors.success,
      title: '🌟 Fraunix v1 has arrived!',
      thumbnail: client.user.displayAvatarURL({ dynamic: true, size: 1024 }),
      description: [
        `\`${D.tl}${D.thinH.repeat(30)}${D.tr}\``,
        `\`${D.v}  ${badge('green', 'ONLINE')}  ${DECO.bolt}  Fraunix v1  ${DECO.bolt}            ${D.v}\``,
        `\`${D.v}  ${DECO.shield || '🛡'}  Precision Moderation for Modern     ${D.v}\``,
        `\`${D.v}  ${DECO.shield || '🛡'}  Communities                         ${D.v}\``,
        `\`${D.bl}${D.thinH.repeat(30)}${D.br}\``,
        '',
        `${DECO.spark} Thank you for inviting **Fraunix v1** to **${guild.name}**!`,
        '',
        sectionDivider('Quick Setup'),
        fieldList([
          ['Slash Commands', 'Type `/` to see all commands'],
          ['Prefix', `\`!<command>\` or \`@Fraunix v1 <command>\``],
          ['Help', 'Run \`/help\` for the command center']
        ]),
        '',
        sectionDivider('Network Stats'),
        fieldList([
          ['Servers', `${totalGuilds}`],
          ['Users', `${totalUsers.toLocaleString()}`],
          ['Commands', `${client.commands.size}`]
        ]),
        '',
        `${badge('blue', 'TIP')} Use \`/help\` to explore all features!`
      ].join('\n'),
      footer: { text: `${DECO.crown} Fraunix v1 — Engineered for excellence ${DECO.crown}` }
    });

    await sysChannel.send({ embeds: [embed] }).catch(() => {});
  }
};
