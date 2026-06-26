const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const FILE_PATH = path.join(DATA_DIR, 'warnings.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, '{}', 'utf8');
  }
}

function readData() {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeData(data) {
  ensureDataDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

class WarningManager {
  static async addWarning(guildId, userId, moderatorId, reason) {
    const data = readData();
    const key = `${guildId}_${userId}`;
    if (!data[key]) data[key] = [];
    const warning = {
      id: data[key].length + 1,
      moderatorId,
      reason: reason || 'No reason provided',
      date: new Date().toISOString()
    };
    data[key].push(warning);
    writeData(data);
    return warning;
  }

  static async getWarnings(guildId, userId) {
    const data = readData();
    const key = `${guildId}_${userId}`;
    return data[key] || [];
  }

  static async clearWarnings(guildId, userId) {
    const data = readData();
    const key = `${guildId}_${userId}`;
    delete data[key];
    writeData(data);
    return true;
  }

  static async removeWarning(guildId, userId, warningId) {
    const data = readData();
    const key = `${guildId}_${userId}`;
    if (!data[key]) return false;
    const filtered = data[key].filter(w => w.id !== warningId);
    if (filtered.length === data[key].length) return false;
    data[key] = filtered;
    writeData(data);
    return true;
  }

  static async getTotalWarnings(guildId) {
    const data = readData();
    let total = 0;
    for (const [key, warnings] of Object.entries(data)) {
      if (key.startsWith(`${guildId}_`)) {
        total += warnings.length;
      }
    }
    return total;
  }
}

module.exports = WarningManager;
