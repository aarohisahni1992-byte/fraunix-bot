const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a previously locked channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Target channel (defaults to current)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unlocking')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
      return interaction.editReply({ embeds: [errorEmbed('That channel is not a text channel.', 'Invalid Channel')] });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Channel Unlocked',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'UNLOCK')}  🔓  Channel unlocked          ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Channel: ${channel.name.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Reason: ${reason.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 18).padEnd(18)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });

      await channel.send({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: '🔓 Channel Unlocked',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  🔓  This channel has been unlocked    ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  Moderator: ${interaction.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  Reason: ${reason.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });

    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed to unlock: ${error.message}`, 'Unlock Failed')] });
    }
  }
};
