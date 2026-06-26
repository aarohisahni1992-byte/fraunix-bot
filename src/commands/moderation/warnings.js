const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, embedHeader, sectionDivider, fieldList, badge, D } = require('../../utils/embed');
const WarningManager = require('../../models/warnings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View all warnings for a member')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to check')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getMember('target');
    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.', 'Not Found')] });
    }

    const warnings = await WarningManager.getWarnings(interaction.guild.id, target.id);

    if (warnings.length === 0) {
      return interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Clean Record',
          description: [
            `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'CLEAN')}  ✅  ${target.user.tag.slice(0, 15).padEnd(15)}${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
            `\`${D.v}  This user has a clean record!       ${D.v}\``,
            `\`${D.v}  No warnings on file.                  ${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
          ].join('\n'),
          footer: { text: `${D.star} Fraunix Moderation ${D.star}` }
        })]
      });
    }

    const fields = warnings.map(w => ({
      name: `Warning #${w.id}`,
      value: `**Reason:** ${w.reason}\n**Mod:** <@${w.moderatorId}>\n**Date:** ${new Date(w.date).toLocaleString()}`,
      inline: false
    }));

    const embed = premiumEmbed({
      color: config.colors.warning,
      title: `Warnings — ${target.user.tag}`,
      thumbnail: target.user.displayAvatarURL({ dynamic: true, size: 1024 }),
      description: [
        embedHeader('Warning Records', '📋', `${warnings.length} total warnings`),
        '',
        `${D.diamond} **${target.user.tag}** has **${warnings.length}** warning(s) on record.`,
        sectionDivider('Case Details')
      ].join('\n'),
      fields,
      footer: { text: `${D.star} Fraunix v1 ${D.dot} ${warnings.length} warning(s)` }
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
