const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Manage voice channels')
    .addSubcommand(sub =>
      sub.setName('limit')
        .setDescription('Set user limit on a voice channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
        .addIntegerOption(opt => opt.setName('limit').setDescription('User limit (0 = unlimited)').setRequired(true).setMinValue(0).setMaxValue(99)))
    .addSubcommand(sub =>
      sub.setName('name')
        .setDescription('Rename a voice channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
        .addStringOption(opt => opt.setName('name').setDescription('New name').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('kickall')
        .setDescription('Disconnect all members from a voice channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true).addChannelTypes(ChannelType.GuildVoice)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');

    if (sub === 'limit') {
      const limit = interaction.options.getInteger('limit');
      try {
        await channel.setUserLimit(limit, `Set by ${interaction.user.tag}`);
        await interaction.editReply({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Voice Limit Updated',
            description: [
              `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'VOICE')}  🔊  User limit set             ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
              `\`${D.v}  ${D.diamond} Channel: ${channel.name.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.v}  ${D.diamond} Limit: ${limit === 0 ? 'Unlimited'.padEnd(16) : String(limit).padEnd(16)}${D.v}\``,
              `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
            ].join('\n')
          })]
        });
      } catch (error) {
        await interaction.editReply({ embeds: [errorEmbed(`Failed to set limit: ${error.message}`)] });
      }
    }

    else if (sub === 'name') {
      const name = interaction.options.getString('name');
      try {
        const oldName = channel.name;
        await channel.setName(name, `Renamed by ${interaction.user.tag}`);
        await interaction.editReply({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Voice Channel Renamed',
            description: [
              `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'VOICE')}  🔊  Voice channel renamed       ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
              `\`${D.v}  ${D.diamond} Old: ${oldName.slice(0, 16).padEnd(16)}${D.v}\``,
              `\`${D.v}  ${D.diamond} New: ${name.slice(0, 16).padEnd(16)}${D.v}\``,
              `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
            ].join('\n')
          })]
        });
      } catch (error) {
        await interaction.editReply({ embeds: [errorEmbed(`Failed to rename: ${error.message}`)] });
      }
    }

    else if (sub === 'kickall') {
      const members = channel.members;
      if (members.size === 0) {
        return interaction.editReply({ embeds: [errorEmbed('No members in that voice channel.')] });
      }

      let kicked = 0;
      for (const [, member] of members) {
        try {
          await member.voice.disconnect(`Mass disconnect by ${interaction.user.tag}`);
          kicked++;
        } catch {}
      }

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Voice Channel Cleared',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'VOICE')}  🔊  Members disconnected        ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Channel: ${channel.name.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Disconnected: ${String(kicked).padEnd(12)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Total: ${String(members.size).padEnd(18)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    }
  }
};
