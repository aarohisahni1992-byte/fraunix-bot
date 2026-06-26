const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { successEmbed, errorEmbed, createEmbed } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Execute JavaScript code (owner only)')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Code to execute')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('silent')
        .setDescription('Hide output')
        .setRequired(false)),

  async execute(interaction, client) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const code = interaction.options.getString('code');
    const silent = interaction.options.getBoolean('silent') || false;

    try {
      let result = eval(code);
      if (result instanceof Promise) result = await result;

      const resultStr = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      const cleaned = resultStr.replace(new RegExp(config.token, 'g'), '***');

      if (cleaned.length > 1990) {
        const chunks = [];
        for (let i = 0; i < cleaned.length; i += 1990) {
          chunks.push(cleaned.substring(i, i + 1990));
        }
        await interaction.editReply({
          embeds: [createEmbed({
            color: config.colors.success,
            title: '✅ Eval Success',
            description: `\`\`\`js\n${chunks[0]}\n\`\`\``
          })]
        });
        for (let i = 1; i < chunks.length; i++) {
          await interaction.followUp({
            embeds: [createEmbed({
              color: config.colors.info,
              description: `\`\`\`js\n${chunks[i]}\n\`\`\``
            })],
            ephemeral: silent
          });
        }
      } else {
        await interaction.editReply({
          embeds: [createEmbed({
            color: config.colors.success,
            title: '✅ Eval Success',
            description: `\`\`\`js\n${cleaned}\n\`\`\``
          })]
        });
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [createEmbed({
          color: config.colors.error,
          title: '❌ Eval Error',
          description: `\`\`\`js\n${error.message}\n\`\`\``
        })]
      });
    }
  }
};
