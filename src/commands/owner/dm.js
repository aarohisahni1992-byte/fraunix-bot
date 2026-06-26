const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('DM a user via the bot (owner only)')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to DM')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true)),

  async execute(interaction, client) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    let target = interaction.options.getUser('target');
    const message = interaction.options.getString('message');

    if (!target) {
      const raw = interaction.options.get('target');
      if (raw?.value) target = await client.users.fetch(raw.value).catch(() => null);
    }

    if (!target) {
      return interaction.editReply({
        embeds: [errorEmbed('Could not find that user.', 'User Not Found')]
      });
    }

    try {
      await target.send(message);
      await interaction.editReply({
        embeds: [successEmbed(`Message sent to **${target.tag}**`)]
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [errorEmbed(`Failed to send DM: ${error.message}`)]
      });
    }
  }
};
