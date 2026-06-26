const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const FILE_PATH = path.join(DATA_DIR, 'authorized.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '{}', 'utf8');
}

function read() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function write(data) {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

class AuthorizedManager {
  static addUser(guildId, userId, addedBy) {
    const data = read();
    if (!data[guildId]) data[guildId] = {};
    if (data[guildId][userId]) return false;
    data[guildId][userId] = { addedBy, date: new Date().toISOString() };
    write(data);
    return true;
  }

  static removeUser(guildId, userId) {
    const data = read();
    if (!data[guildId] || !data[guildId][userId]) return false;
    delete data[guildId][userId];
    write(data);
    return true;
  }

  static isAuthorized(guildId, userId) {
    const data = read();
    return !!(data[guildId] && data[guildId][userId]);
  }

  static listUsers(guildId) {
    const data = read();
    if (!data[guildId]) return [];
    return Object.entries(data[guildId]).map(([id, info]) => ({
      id,
      addedBy: info.addedBy,
      date: info.date
    }));
  }
}

module.exports = AuthorizedManager;
