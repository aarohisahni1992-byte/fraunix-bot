const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Shut down the bot (owner only)'),

  async execute(interaction, client) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.')], ephemeral: true });
    }

    await interaction.reply({
      embeds: [successEmbed('Shutting down... Goodbye!')]
    });

    await new Promise(r => setTimeout(r, 1000));
    process.exit(0);
  }
};
