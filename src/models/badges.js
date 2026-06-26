const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const FILE_PATH = path.join(DATA_DIR, 'badges.json');

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

class BadgeManager {
  static add(userId, badgeText, givenBy) {
    const data = read();
    if (!data[userId]) data[userId] = [];
    if (data[userId].some(b => b.text === badgeText)) return false;
    data[userId].push({ text: badgeText, givenBy, date: new Date().toISOString() });
    write(data);
    return true;
  }

  static remove(userId, badgeText) {
    const data = read();
    if (!data[userId]) return false;
    const idx = data[userId].findIndex(b => b.text === badgeText);
    if (idx === -1) return false;
    data[userId].splice(idx, 1);
    if (data[userId].length === 0) delete data[userId];
    write(data);
    return true;
  }

  static list(userId) {
    const data = read();
    return data[userId] || [];
  }

  static all() {
    return read();
  }

  static clear(userId) {
    const data = read();
    delete data[userId];
    write(data);
  }
}

module.exports = BadgeManager;
