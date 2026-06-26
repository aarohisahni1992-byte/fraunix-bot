const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moveall')
    .setDescription('Move all members from one voice channel to another')
    .addChannelOption(option =>
      option.setName('from')
        .setDescription('Source voice channel')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice))
    .addChannelOption(option =>
      option.setName('to')
        .setDescription('Target voice channel')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const fromChannel = interaction.options.getChannel('from');
    const toChannel = interaction.options.getChannel('to');

    if (fromChannel.id === toChannel.id) {
      return interaction.editReply({ embeds: [errorEmbed('Source and target channels must be different.')] });
    }

    const members = fromChannel.members;
    if (members.size === 0) {
      return interaction.editReply({ embeds: [errorEmbed('There are no members in the source voice channel.')] });
    }

    let moved = 0;
    let failed = 0;

    for (const [, member] of members) {
      try {
        await member.voice.setChannel(toChannel);
        moved++;
      } catch {
        failed++;
      }
    }

    await interaction.editReply({
      embeds: [premiumEmbed({
        color: config.colors.success,
        title: 'Members Moved',
        description: [
          `\`${D.tl}${D.thinH.repeat(26)}${D.tr}\``,
          `\`${D.v}  ${badge('green', 'MOVE')}  🚚  Voice channel move           ${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(26)}${D.sep2}\``,
          `\`${D.v}  ${D.diamond} From: ${fromChannel.name.slice(0, 18).padEnd(18)}${D.v}\``,
          `\`${D.v}  ${D.diamond} To: ${toChannel.name.slice(0, 20).padEnd(20)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Moved: ${String(moved).padEnd(19)}${D.v}\``,
          failed > 0 ? `\`${D.v}  ${D.diamond} Failed: ${String(failed).padEnd(18)}${D.v}\`` : '',
          `\`${D.bl}${D.thinH.repeat(26)}${D.br}\``
        ].filter(Boolean).join('\n')
      })]
    });
  }
};
