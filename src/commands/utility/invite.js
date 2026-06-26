const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, embedHeader, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get invite links for Fraunix'),

  async execute(interaction, client) {
    const embed = premiumEmbed({
      color: config.colors.primary,
      title: 'Invite Fraunix',
      thumbnail: client.user.displayAvatarURL({ size: 1024 }),
      description: [
        embedHeader('Invite & Support', '📨'),
        '',
        `${D.diamond} Ready to bring **Fraunix v1** to your server?`,
        `${D.diamond} Click below to invite or get help.`,
        '',
        `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
        `\`${D.v}  ${badge('blue', 'INVITE')}  Full permissions setup      ${D.v}\``,
        `\`${D.v}  ${badge('purple', 'SUPPORT')}  Join the community          ${D.v}\``,
        `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
      ].join('\n'),
      footer: { text: `${D.star} Fraunix v1 — Precision Moderation ${D.star}` }
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Invite Bot')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot+applications.commands`)
        .setEmoji('📨'),
      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/jHDvdPrwT')
        .setEmoji('❓')
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
