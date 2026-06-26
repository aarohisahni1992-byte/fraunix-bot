const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode in a channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode duration in seconds (0 to disable)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Target channel (defaults to current)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!channel.isTextBased()) {
      return interaction.editReply({ embeds: [errorEmbed('That channel is not a text channel.', 'Invalid Channel')] });
    }

    try {
      await channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);
      const durationText = seconds === 0 ? 'disabled' : `${seconds}s`;
      const emoji = seconds === 0 ? '✅' : '🐢';

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Slowmode Updated',
          description: [
            `\`${D.tl}${D.thinH.repeat(26)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'SLOWMODE')}  ${emoji}  Slowmode ${durationText.padEnd(6)}   ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(26)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Channel: ${channel.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Setting: ${durationText.padEnd(18)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 20).padEnd(20)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(26)}${D.br}\``
          ].join('\n')
        })]
      });
    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed to set slowmode: ${error.message}`, 'Slowmode Failed')] });
    }
  }
};
