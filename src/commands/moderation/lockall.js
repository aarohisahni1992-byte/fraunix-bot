const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockall')
    .setDescription('Lock all text channels in the server')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for locking')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const reason = interaction.options.getString('reason') || 'No reason provided';
    const channels = interaction.guild.channels.cache.filter(c =>
      c.type === ChannelType.GuildText && c.permissionsFor(interaction.guild.roles.everyone).has(PermissionFlagsBits.SendMessages)
    );

    if (channels.size === 0) {
      return interaction.editReply({ embeds: [errorEmbed('No text channels to lock.')] });
    }

    let locked = 0;
    for (const [, channel] of channels) {
      try {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
        locked++;
      } catch {}
    }

    await interaction.editReply({
      embeds: [premiumEmbed({
        color: config.colors.success,
        title: 'Server Locked',
        description: [
          `\`${D.tl}${D.thinH.repeat(26)}${D.tr}\``,
          `\`${D.v}  ${badge('green', 'LOCKALL')}  🔒  Server-wide lockdown          ${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(26)}${D.sep2}\``,
          `\`${D.v}  ${D.diamond} Locked: ${String(locked).padEnd(19)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Total: ${String(channels.size).padEnd(20)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Reason: ${reason.slice(0, 18).padEnd(18)}${D.v}\``,
          `\`${D.bl}${D.thinH.repeat(26)}${D.br}\``
        ].join('\n')
      })]
    });
  }
};
