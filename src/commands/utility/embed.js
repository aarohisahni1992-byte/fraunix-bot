const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { createEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create a custom embed')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Embed title')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Embed description')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Color (hex, e.g. #5865F2)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer text')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Image URL')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('thumbnail')
        .setDescription('Thumbnail URL')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color') || config.colors.primary;
    const footer = interaction.options.getString('footer');
    const image = interaction.options.getString('image');
    const thumbnail = interaction.options.getString('thumbnail');

    const embed = createEmbed({
      color: color.startsWith('#') ? color : `#${color}`,
      title,
      description,
      footer: footer ? { text: footer } : undefined,
      image: image || undefined,
      thumbnail: thumbnail || undefined
    });

    await interaction.reply({ embeds: [embed] });
  }
};
