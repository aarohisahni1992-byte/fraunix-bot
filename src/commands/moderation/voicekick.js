const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, createActionRow, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicekick')
    .setDescription('Disconnect a member from a voice channel')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to disconnect')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for disconnecting')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.')] });
    }

    if (!target.voice.channel) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in a voice channel.')] });
    }

    const confirmRow = createActionRow([
      { customId: `confirm_vkick_${target.id}`, label: 'Confirm Disconnect', style: ButtonStyle.Danger, emoji: '🔊' },
      { customId: `cancel_vkick_${target.id}`, label: 'Cancel', style: ButtonStyle.Secondary, emoji: '❌' }
    ]);

    await interaction.editReply({
      embeds: [premiumEmbed({
        color: config.colors.warning,
        title: 'Confirm Voice Kick',
        description: [
          `\`${D.tl}${D.thinH.repeat(30)}${D.tr}\``,
          `\`${D.v}  ${badge('yellow', 'VKICK')}  🔊  Voice Disconnect Requested       ${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
          `\`${D.v}  ${D.diamond} Target: ${target.user.tag.padEnd(19)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Channel: ${(target.voice.channel.name || 'None').padEnd(18)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Reason: ${reason.padEnd(19)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.padEnd(23)}${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
          `\`${D.v}  ${D.arrow} Are you sure you want to disconnect?     ${D.v}\``,
          `\`${D.bl}${D.thinH.repeat(30)}${D.br}\``
        ].join('\n')
      })],
      components: [confirmRow]
    });
  }
};
