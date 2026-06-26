const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, embedHeader, sectionDivider, fieldList, badge, D } = require('../../utils/embed');
const WarningManager = require('../../models/warnings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a member')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.', 'Not Found')] });
    if (target.id === interaction.user.id) return interaction.editReply({ embeds: [errorEmbed('You cannot warn yourself.', 'Invalid')] });

    try {
      const warning = await WarningManager.addWarning(interaction.guild.id, target.id, interaction.user.id, reason);
      const total = (await WarningManager.getWarnings(interaction.guild.id, target.id)).length;

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.warning,
          title: 'Warning Issued',
          description: [
            `\`${D.tl}${D.thinH.repeat(26)}${D.tr}\``,
            `\`${D.v}  ${badge('yellow', 'WARN')}  📋  Warning #${String(warning.id).padEnd(4)} recorded   ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(26)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Target: ${target.user.tag.slice(0, 18).padEnd(18)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Reason: ${reason.slice(0, 18).padEnd(18)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Total: ${String(total).padEnd(20)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(26)}${D.br}\``
          ].join('\n')
        })]
      });

      const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
      if (logChannel) {
        await logChannel.send({
          embeds: [premiumEmbed({
            color: config.colors.warning,
            title: 'Moderation Log',
            description: [
              `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
              `\`${D.v}  ${badge('yellow', 'LOG')}  📋 Warn Action              ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
              `\`${D.v}  Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.v}  Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
              `\`${D.v}  Warning #${String(warning.id).padEnd(12)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
            ].join('\n'),
            fields: [{ name: 'Reason', value: reason, inline: false }],
            footer: { text: `Total warnings: ${total}` }
          })]
        });
      }

      await target.user.send({
        embeds: [premiumEmbed({
          color: config.colors.warning,
          title: '⚠️ You have been warned',
          description: [
            `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
            `\`${D.v}  📋 Warning of misconduct         ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
            `\`${D.v}  Server: ${interaction.guild.name.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  Warning #${String(warning.id).padEnd(13)}${D.v}\``,
            `\`${D.v}  Total: ${String(total).padEnd(16)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
          ].join('\n'),
          fields: [{ name: 'Reason', value: reason, inline: false }],
          footer: { text: 'Fraunix v1 Moderation' }
        })]
      }).catch(() => {});

    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed to warn user: ${error.message}`, 'Warn Failed')] });
    }
  }
};
