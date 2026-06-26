const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../../data');
const BLACKLIST_PATH = path.join(DATA_DIR, 'blacklist.json');

function readBlacklist() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BLACKLIST_PATH)) fs.writeFileSync(BLACKLIST_PATH, '[]', 'utf8');
  return JSON.parse(fs.readFileSync(BLACKLIST_PATH, 'utf8'));
}

function writeBlacklist(data) {
  fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage bot blacklist (owner only)')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a user to the blacklist')
        .addUserOption(opt => opt.setName('user').setDescription('User to blacklist').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a user from the blacklist')
        .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all blacklisted users')),

  async execute(interaction, client) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only the bot owner can use this command.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';
      const blacklist = readBlacklist();
      if (blacklist.find(b => b.id === user.id)) {
        return interaction.editReply({ embeds: [errorEmbed('That user is already blacklisted.')] });
      }
      blacklist.push({ id: user.id, tag: user.tag, reason, date: new Date().toISOString() });
      writeBlacklist(blacklist);
      await interaction.editReply({ embeds: [successEmbed(`**${user.tag}** has been blacklisted.\nReason: ${reason}`)] });
    } else if (sub === 'remove') {
      const user = interaction.options.getUser('user');
      const blacklist = readBlacklist();
      const filtered = blacklist.filter(b => b.id !== user.id);
      if (filtered.length === blacklist.length) {
        return interaction.editReply({ embeds: [errorEmbed('That user is not blacklisted.')] });
      }
      writeBlacklist(filtered);
      await interaction.editReply({ embeds: [successEmbed(`**${user.tag}** has been removed from the blacklist.`)] });
    } else if (sub === 'list') {
      const blacklist = readBlacklist();
      if (blacklist.length === 0) {
        return interaction.editReply({ embeds: [require('../../utils/embed').infoEmbed('The blacklist is empty.')] });
      }
      const desc = blacklist.map(b => `**${b.tag}** (\`${b.id}\`) - ${b.reason} - <t:${Math.floor(new Date(b.date).getTime() / 1000)}:R>`).join('\n');
      await interaction.editReply({
        embeds: [require('../../utils/embed').createEmbed({
          color: config.colors.warning,
          title: '🚫 Blacklisted Users',
          description: desc,
          footer: { text: `Total: ${blacklist.length}` }
        })]
      });
    }
  }
};
