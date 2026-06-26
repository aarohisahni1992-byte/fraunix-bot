const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');
const WarningManager = require('../../models/warnings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarn')
    .setDescription('Clear warnings for a member')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to clear warnings for')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('warning_id')
        .setDescription('Specific warning ID to remove (leave blank for all)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getMember('target');
    const warningId = interaction.options.getInteger('warning_id');

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.')] });
    }

    if (warningId) {
      const removed = await WarningManager.removeWarning(interaction.guild.id, target.id, warningId);
      if (!removed) {
        return interaction.editReply({ embeds: [errorEmbed(`Warning #${warningId} not found for ${target.user.tag}.`)] });
      }
      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Warning Removed',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'CLEAR')}  🗑️  Warning removed             ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Warning #: ${String(warningId).padEnd(13)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    } else {
      await WarningManager.clearWarnings(interaction.guild.id, target.id);
      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'All Warnings Cleared',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'CLEAR')}  🗑️  All warnings cleared        ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    }
  }
};
