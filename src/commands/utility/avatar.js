const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config.json');
const { createEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get the avatar of')
        .setRequired(false)),

  async execute(interaction, client) {
    await interaction.deferReply();

    const target = interaction.options.getUser('target') || interaction.user;
    const avatarURL = target.displayAvatarURL({ dynamic: true, size: 4096 });
    const staticAvatar = target.displayAvatarURL({ size: 4096 });
    const isAnimated = avatarURL.includes('.gif');

    const embed = createEmbed({
      color: config.colors.primary,
      title: `${config.emojis.user} ${target.tag}'s Avatar`,
      image: avatarURL,
      footer: { text: `Fraunix v1 • Requested by ${interaction.user.tag}` }
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('PNG')
        .setStyle(ButtonStyle.Link)
        .setURL(staticAvatar.replace('.gif', '.png').replace('?size=4096', '?size=4096')),
      new ButtonBuilder()
        .setLabel('JPEG')
        .setStyle(ButtonStyle.Link)
        .setURL(staticAvatar.replace('.gif', '.jpg').replace('?size=4096', '?size=4096')),
      new ButtonBuilder()
        .setLabel('WEBP')
        .setStyle(ButtonStyle.Link)
        .setURL(staticAvatar.replace('.gif', '.webp').replace('?size=4096', '?size=4096'))
    );

    if (isAnimated) {
      row.addComponents(
        new ButtonBuilder()
          .setLabel('GIF')
          .setStyle(ButtonStyle.Link)
          .setURL(avatarURL)
      );
    }

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};
