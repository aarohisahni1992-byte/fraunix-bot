const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload a command (owner only)')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Command to reload')
        .setRequired(true)),

  async execute(interaction, client) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const commandName = interaction.options.getString('command').toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) {
      return interaction.editReply({ embeds: [errorEmbed(`Command \`${commandName}\` not found.`)] });
    }

    const folders = ['moderation', 'utility', 'owner', 'fun'];

    for (const folder of folders) {
      const cmdPath = path.join(__dirname, `../${folder}/${commandName}.js`);
      if (fs.existsSync(cmdPath)) {
        delete require.cache[require.resolve(cmdPath)];
        try {
          const newCommand = require(cmdPath);
          client.commands.set(newCommand.data.name, newCommand);
          await interaction.editReply({
            embeds: [successEmbed(`Command \`${commandName}\` has been reloaded.`)]
          });
        } catch (error) {
          await interaction.editReply({
            embeds: [errorEmbed(`Failed to reload \`${commandName}\`: ${error.message}`)]
          });
        }
        return;
      }
    }

    await interaction.editReply({ embeds: [errorEmbed(`Could not find file for \`${commandName}\`.`)] });
  }
};
