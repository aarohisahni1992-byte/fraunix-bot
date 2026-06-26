const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, embedHeader, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete bulk messages in a channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Only delete messages from this user')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const amount = interaction.options.getInteger('amount');
    const target = interaction.options.getUser('target');

    try {
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      let toDelete = target ? messages.filter(m => m.author.id === target.id) : messages;

      if (toDelete.size === 0) {
        return interaction.editReply({ embeds: [errorEmbed('No messages found to delete.', 'Nothing to Purge')] });
      }

      const deleted = await interaction.channel.bulkDelete(toDelete, true);

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Channel Purged',
          description: [
            `\`${D.tl}${D.thinH.repeat(26)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'PURGE')}  🧹  ${String(deleted.size).padStart(3)} messages deleted    ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(26)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Channel: ${interaction.channel.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 20).padEnd(20)}${D.v}\``,
            target ? `\`${D.v}  ${D.diamond} Filter: ${target.tag.slice(0, 18).padEnd(18)}${D.v}\`` : '',
            `\`${D.bl}${D.thinH.repeat(26)}${D.br}\``
          ].filter(Boolean).join('\n')
        })]
      });
    } catch (error) {
      if (error.code === 10008) {
        return interaction.editReply({ embeds: [errorEmbed('Messages older than 14 days cannot be bulk deleted.', 'Age Limit')] });
      }
      await interaction.editReply({ embeds: [errorEmbed(`Failed to purge: ${error.message}`, 'Purge Failed')] });
    }
  }
};
