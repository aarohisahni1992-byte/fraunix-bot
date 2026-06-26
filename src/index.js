const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const examplePath = path.join(__dirname, '../config.example.json');
  const sourcePath = fs.existsSync(configPath) ? configPath : examplePath;
  if (!fs.existsSync(sourcePath)) {
    console.error('[!] No config.json or config.example.json found');
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  if (process.env.BOT_TOKEN) cfg.token = process.env.BOT_TOKEN;
  if (process.env.CLIENT_ID) cfg.clientId = process.env.CLIENT_ID;
  if (process.env.GUILD_ID) cfg.guildId = process.env.GUILD_ID;
  if (process.env.OWNER_ID) cfg.owners = process.env.OWNER_ID.split(',').map(s => s.trim());
  if (process.env.BOT_PREFIX) cfg.prefix = process.env.BOT_PREFIX;
  if (process.env.BOT_BIO) cfg.bio = process.env.BOT_BIO;
  return cfg;
}

const config = loadConfig();
if (!fs.existsSync(path.join(__dirname, '../config.json'))) {
  fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(config, null, 2), 'utf8');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

client.commands = new Collection();
client.commandArray = [];

const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');

commandHandler(client);
eventHandler(client);

process.on('unhandledRejection', (error) => {
  console.error('\x1b[31m[!] Unhandled Promise Rejection:\x1b[0m', error);
});

process.on('uncaughtException', (error) => {
  console.error('\x1b[31m[!] Uncaught Exception:\x1b[0m', error);
});

client.login(config.token).catch(err => {
  console.error('\x1b[31m[✗] Login failed:\x1b[0m', err.message);
  process.exit(1);
});

module.exports = client;
