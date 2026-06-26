const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, sectionDivider, fieldList, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout/mute a member')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g. 10m, 1h, 1d, 7d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getMember('target');
    const durationInput = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.', 'Not Found')] });
    if (target.id === interaction.user.id) return interaction.editReply({ embeds: [errorEmbed('You cannot mute yourself.', 'Invalid')] });
    if (!target.moderatable) return interaction.editReply({ embeds: [errorEmbed('I cannot mute that user.', 'Cannot Mute')] });

    const duration = ms(durationInput);
    if (!duration) return interaction.editReply({ embeds: [errorEmbed('Invalid format. Use: `10m`, `1h`, `1d`, `7d`', 'Bad Format')] });
    if (duration > ms('28d')) return interaction.editReply({ embeds: [errorEmbed('Duration cannot exceed 28 days (Discord limit).', 'Too Long')] });
    if (target.isCommunicationDisabled()) return interaction.editReply({ embeds: [errorEmbed('That user is already muted.', 'Already Muted')] });

    try {
      await target.timeout(duration, reason);

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Member Muted',
          description: [
            `\`${D.tl}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'MUTE')}  🔇  Mute Applied Successfully         ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Target: ${target.user.tag.padEnd(20)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Duration: ${durationInput.padEnd(18)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Reason: ${reason.padEnd(20)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Expires: <t:${Math.floor((Date.now() + duration) / 1000)}:R>  ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
            `\`${D.v}  ${D.arrow} User has been timed out                   ${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(30)}${D.br}\``
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
              `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
              `\`${D.v}  ${badge('yellow', 'LOG')}  🔇 Mute Action               ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
              `\`${D.v}  Target: ${target.user.tag.padEnd(14)}${D.v}\``,
              `\`${D.v}  Mod: ${interaction.user.tag.padEnd(18)}${D.v}\``,
              `\`${D.v}  Duration: ${durationInput.padEnd(14)}${D.v}\``,
              `\`${D.v}  Reason: ${reason.padEnd(16)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
            ].join('\n'),
            footer: { text: `ID: ${target.id}` }
          })]
        });
      }

      await target.user.send({
        embeds: [premiumEmbed({
          color: config.colors.warning,
          title: '⚠️ You have been muted',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  🔇 You have been muted                 ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  Server: ${interaction.guild.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  Duration: ${durationInput.padEnd(14)}${D.v}\``,
            `\`${D.v}  Reason: ${reason.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n'),
          footer: { text: 'Fraunix v1 Moderation' }
        })]
      }).catch(() => {});

    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed to mute: ${error.message}`, 'Mute Failed')] });
    }
  }
};
