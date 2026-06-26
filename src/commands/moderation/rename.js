const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Rename a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to rename')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement))
    .addStringOption(option =>
      option.setName('name')
        .setDescription('New channel name')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const channel = interaction.options.getChannel('channel');
    const name = interaction.options.getString('name');

    try {
      const oldName = channel.name;
      await channel.setName(name, `Renamed by ${interaction.user.tag}`);

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Channel Renamed',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'RENAME')}  ✏️  Channel renamed            ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Old: #${oldName.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} New: #${name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed to rename channel: ${error.message}`)] });
    }
  }
};
