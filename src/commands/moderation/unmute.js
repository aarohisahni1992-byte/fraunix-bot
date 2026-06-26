const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, sectionDivider, fieldList, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove a timeout/mute from a member')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to unmute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the unmute')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.')] });
    }

    if (!target.isCommunicationDisabled()) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not muted.')] });
    }

    try {
      await target.timeout(null, reason);

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Member Unmuted',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'UNMUTE')}  🔉  Mute removed               ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Reason: ${reason.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });

      const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
      if (logChannel) {
        await logChannel.send({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Moderation Log',
            description: [
              `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'LOG')}  🔉 Unmute Action             ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
              `\`${D.v}  Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.v}  Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
              `\`${D.v}  Reason: ${reason.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
            ].join('\n'),
            footer: { text: `ID: ${target.id}` }
          })]
        });
      }

      await target.user.send({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: '🔉 You have been unmuted',
          description: [
            `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
            `\`${D.v}  🔉 You have been unmuted               ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
            `\`${D.v}  Server: ${interaction.guild.name.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  Reason: ${reason.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
          ].join('\n'),
          footer: { text: 'Fraunix v1 Moderation' }
        })]
      }).catch(() => {});

    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed to unmute user: ${error.message}`)] });
    }
  }
};
