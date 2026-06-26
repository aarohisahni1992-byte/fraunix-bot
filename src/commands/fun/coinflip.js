const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { createEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin'),

  async execute(interaction, client) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '🪙';

    const embed = createEmbed({
      color: config.colors.primary,
      title: `${emoji} Coin Flip`,
      description: `The coin landed on **${result}**!`,
      footer: { text: 'Fraunix v1' }
    });

    await interaction.reply({ embeds: [embed] });
  }
};
