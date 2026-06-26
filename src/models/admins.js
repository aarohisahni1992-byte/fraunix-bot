const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const FILE_PATH = path.join(DATA_DIR, 'admins.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '[]', 'utf8');
}

function read() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function write(data) {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

class AdminManager {
  static add(userId, addedBy) {
    const list = read();
    if (list.some(a => a.id === userId)) return false;
    list.push({ id: userId, addedBy, date: new Date().toISOString() });
    write(list);
    return true;
  }

  static remove(userId) {
    const list = read();
    const idx = list.findIndex(a => a.id === userId);
    if (idx === -1) return false;
    list.splice(idx, 1);
    write(list);
    return true;
  }

  static isAdmin(userId) {
    const list = read();
    return list.some(a => a.id === userId);
  }

  static list() {
    return read();
  }
}

module.exports = AdminManager;
