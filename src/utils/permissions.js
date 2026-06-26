const config = require('../../config.json');
const AdminManager = require('../models/admins');

function isOwner(userId) {
  return config.owners.includes(userId);
}

function isAdmin(userId) {
  if (config.owners.includes(userId)) return true;
  return AdminManager.isAdmin(userId);
}

module.exports = { isOwner, isAdmin };
