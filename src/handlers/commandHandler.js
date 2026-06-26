const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
  client.commands = new Collection();
  client.commandArray = [];

  const commandFolders = ['moderation', 'utility', 'owner', 'fun'];

  for (const folder of commandFolders) {
    const commandsPath = path.join(__dirname, `../commands/${folder}`);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
        console.log(`\x1b[32m[✓] Loaded command: ${command.data.name}\x1b[0m`);
      } else {
        console.log(`\x1b[33m[!] Command ${file} missing "data" or "execute"\x1b[0m`);
      }
    }
  }
};
