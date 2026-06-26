const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, infoEmbed, embedHeader, sectionDivider, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Manage server emojis')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add an emoji to the server')
        .addStringOption(opt => opt.setName('name').setDescription('Emoji name').setRequired(true))
        .addStringOption(opt => opt.setName('url').setDescription('Emoji image URL').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove an emoji from the server')
        .addStringOption(opt => opt.setName('emoji').setDescription('Emoji name or ID').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all server emojis'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const name = interaction.options.getString('name');
      const url = interaction.options.getString('url');
      try {
        const emoji = await interaction.guild.emojis.create({ attachment: url, name });
        await interaction.editReply({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Emoji Added',
            description: [
              `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'EMOJI')}  😀  Emoji created            ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
              `\`${D.v}  ${D.diamond} Emoji: ${emoji} :${name}:      ${D.v}\``,
              `\`${D.v}  ${D.diamond} Name: ${name.padEnd(16)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
            ].join('\n')
          })]
        });
      } catch (error) {
        await interaction.editReply({ embeds: [errorEmbed(`Failed: ${error.message}`, 'Add Failed')] });
      }
    }

    else if (sub === 'remove') {
      const input = interaction.options.getString('emoji');
      const emoji = interaction.guild.emojis.cache.find(e => e.name === input || e.id === input || e.toString() === input);
      if (!emoji) {
        return interaction.editReply({ embeds: [errorEmbed('Emoji not found.', 'Not Found')] });
      }
      try {
        await emoji.delete(`Removed by ${interaction.user.tag}`);
        await interaction.editReply({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Emoji Removed',
            description: [
              `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'EMOJI')}  🗑️  Emoji removed             ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
              `\`${D.v}  ${D.diamond} Name: :${emoji.name}: ${' '.repeat(12)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
            ].join('\n')
          })]
        });
      } catch (error) {
        await interaction.editReply({ embeds: [errorEmbed(`Failed: ${error.message}`, 'Remove Failed')] });
      }
    }

    else if (sub === 'list') {
      const emojis = interaction.guild.emojis.cache;
      if (emojis.size === 0) {
        return interaction.editReply({ embeds: [infoEmbed('This server has no custom emojis.')] });
      }

      const normal = emojis.filter(e => !e.animated).map(e => `${e} \`:${e.name}:\``).join('\n') || 'None';
      const animated = emojis.filter(e => e.animated).map(e => `${e} \`:${e.name}:\``).join('\n') || 'None';

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.primary,
          title: `Server Emojis (${emojis.size})`,
          description: [
            embedHeader('Emoji Manager', '😀', `${emojis.size} total`),
            '',
            sectionDivider('Static'),
            normal,
            '',
            sectionDivider('Animated'),
            animated
          ].join('\n'),
          footer: { text: `${D.star} Fraunix Emoji Manager ${D.star}` }
        })]
      });
    }
  }
};
