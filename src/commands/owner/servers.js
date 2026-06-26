const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('List all servers the bot is in (owner only)'),

  async execute(interaction, client) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount);

    const fields = guilds.map(g => ({
      name: g.name,
      value: `**ID:** \`${g.id}\`\n**Members:** ${g.memberCount}\n**Owner:** <@${g.ownerId}>`,
      inline: true
    }));

    const chunks = [];
    for (let i = 0; i < fields.length; i += 10) {
      chunks.push(fields.slice(i, i + 10));
    }

    await interaction.editReply({
      embeds: [createEmbed({
        color: config.colors.primary,
        title: `🏠 Servers (${guilds.size})`,
        description: `Total members across all servers: ${guilds.reduce((a, g) => a + g.memberCount, 0)}`,
        fields: chunks[0] || [],
        footer: { text: 'Fraunix v1 • Owner only' }
      })]
    });

    for (let i = 1; i < chunks.length; i++) {
      await interaction.followUp({
        embeds: [createEmbed({
          color: config.colors.primary,
          fields: chunks[i]
        })],
        ephemeral: true
      });
    }
  }
};
