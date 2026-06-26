const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Clone and delete a channel (clears all messages)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Target channel (defaults to current)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
      return interaction.editReply({ embeds: [errorEmbed('That channel is not a text channel.', 'Invalid Channel')] });
    }

    await interaction.editReply({
      embeds: [premiumEmbed({
        color: config.colors.warning,
        title: '⚠️ Channel Nuke Initiated',
        description: [
          `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
          `\`${D.v}  ${badge('yellow', 'NUKE')}  💣  CHANNEL DESTROY            ${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
          `\`${D.v}  ${D.arrow} Target: ${channel.name.slice(0, 16).padEnd(16)}${D.v}\``,
          `\`${D.v}  ${D.arrow} The channel will be destroyed in       ${D.v}\``,
          `\`${D.v}  ${D.arrow} 5 seconds...                           ${D.v}\``,
          `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
        ].join('\n')
      })]
    });

    await new Promise(r => setTimeout(r, 5000));

    try {
      const newChannel = await channel.clone({ reason: `Nuked by ${interaction.user.tag}` });
      await channel.delete(`Nuked by ${interaction.user.tag}`);

      await newChannel.send({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: '💣 Channel Nuked',
          description: [
            `\`${D.tl}${D.thinH.repeat(26)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'NUKE')}  💥  Channel was destroyed       ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(26)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} New: ${newChannel.name.slice(0, 18).padEnd(18)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 20).padEnd(20)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(26)}${D.br}\``,
            '',
            `${D.arrow} A fresh channel has been created.`
          ].join('\n')
        })]
      });
    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed to nuke: ${error.message}`, 'Nuke Failed')] });
    }
  }
};
