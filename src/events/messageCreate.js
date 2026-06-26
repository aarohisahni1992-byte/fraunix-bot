const config = require('../../config.json');
const { handlePrefixMessage } = require('../utils/PrefixContext');
const fs = require('fs');
const path = require('path');

const BLACKLIST_PATH = path.join(__dirname, '../../data/blacklist.json');

function isBlacklisted(userId) {
  if (!fs.existsSync(BLACKLIST_PATH)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(BLACKLIST_PATH, 'utf8'));
    return data.some(b => b.id === userId);
  } catch {
    return false;
  }
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (isBlacklisted(message.author.id)) return;

    const handled = await handlePrefixMessage(message, client);
    if (handled) return;
  }
};
