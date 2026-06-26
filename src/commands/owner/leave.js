const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Make the bot leave a server (owner only)')
    .addStringOption(option =>
      option.setName('server_id')
        .setDescription('Server ID to leave')
        .setRequired(false)),

  async execute(interaction, client) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    let serverId = interaction.options.getString('server_id');

    if (!serverId) {
      serverId = interaction.guildId;
    }

    const guild = client.guilds.cache.get(serverId);
    if (!guild) {
      return interaction.editReply({ embeds: [errorEmbed('I am not in a server with that ID.')] });
    }

    await guild.leave();

    await interaction.editReply({
      embeds: [successEmbed(`Left server **${guild.name}** (\`${guild.id}\`)`)]
    });
  }
};
