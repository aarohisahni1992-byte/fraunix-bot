const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { createEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice')
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('Number of sides (default: 6)')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(100))
    .addIntegerOption(option =>
      option.setName('rolls')
        .setDescription('Number of rolls (default: 1, max: 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)),

  async execute(interaction, client) {
    const sides = interaction.options.getInteger('sides') || 6;
    const rolls = interaction.options.getInteger('rolls') || 1;

    const results = [];
    for (let i = 0; i < rolls; i++) {
      results.push(Math.floor(Math.random() * sides) + 1);
    }

    const total = results.reduce((a, b) => a + b, 0);

    const embed = createEmbed({
      color: config.colors.primary,
      title: '🎲 Dice Roll',
      fields: [
        { name: 'Sides', value: `d${sides}`, inline: true },
        { name: 'Rolls', value: `${rolls}`, inline: true },
        { name: 'Results', value: results.map((r, i) => `Roll #${i + 1}: **${r}**`).join('\n'), inline: false },
        { name: 'Total', value: `**${total}**`, inline: true }
      ],
      footer: { text: 'Fraunix v1' }
    });

    await interaction.reply({ embeds: [embed] });
  }
};
