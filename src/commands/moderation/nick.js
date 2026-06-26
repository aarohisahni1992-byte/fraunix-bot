const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change a member\'s nickname')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('New nickname (leave blank to reset)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getMember('target');
    const nickname = interaction.options.getString('nickname');

    if (!target) return interaction.editReply({ embeds: [errorEmbed('Member not found.')] });

    if (!target.manageable) {
      return interaction.editReply({ embeds: [errorEmbed('I cannot change that member\'s nickname.')] });
    }

    try {
      await target.setNickname(nickname || null, `Nickname changed by ${interaction.user.tag}`);

      if (nickname) {
        await interaction.editReply({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Nickname Changed',
            description: [
              `\`${D.tl}${D.thinH.repeat(26)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'NICK')}  ✏️  Nickname updated            ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(26)}${D.sep2}\``,
              `\`${D.v}  ${D.diamond} Target: ${target.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
              `\`${D.v}  ${D.diamond} New: ${nickname.slice(0, 20).padEnd(20)}${D.v}\``,
              `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 20).padEnd(20)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(26)}${D.br}\``
            ].join('\n')
          })]
        });
      } else {
        await interaction.editReply({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Nickname Reset',
            description: [
              `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'NICK')}  ✏️  Nickname reset             ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
              `\`${D.v}  ${D.diamond} Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
            ].join('\n')
          })]
        });
      }
    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed to change nickname: ${error.message}`)] });
    }
  }
};
