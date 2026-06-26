const { ActivityType } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`\x1b[36m╔═══════════════════════════════════════════╗`);
    console.log(`\x1b[36m║     \x1b[1;32mFraunix v1 - Bot is Online!\x1b[0;36m           ║`);
    console.log(`\x1b[36m╠═══════════════════════════════════════════╣`);
    console.log(`\x1b[36m║  \x1b[0mUser: \x1b[1;33m${client.user.tag}\x1b[0;36m                    ║`);
    console.log(`\x1b[36m║  \x1b[0mID:   \x1b[1;33m${client.user.id}\x1b[0;36m                 ║`);
    console.log(`\x1b[36m║  \x1b[0mGuilds: \x1b[1;33m${client.guilds.cache.size}\x1b[0;36m                   ║`);
    console.log(`\x1b[36m║  \x1b[0mUsers: \x1b[1;33m${client.users.cache.size}\x1b[0;36m                    ║`);
    console.log(`\x1b[36m╚═══════════════════════════════════════════╝\x1b[0m`);

    const statuses = [
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: '🛡️ fraunix -v1', type: ActivityType.Playing },
      { name: '!help or @mention', type: ActivityType.Listening },
      { name: 'moderation in action', type: ActivityType.Watching }
    ];

    let index = 0;
    setInterval(() => {
      const status = statuses[index];
      client.user.setActivity(status.name, { type: status.type });
      index = (index + 1) % statuses.length;
    }, 10000);

    try {
      await client.application.commands.set(client.commandArray || []);
      console.log('\x1b[32m[✓] Slash commands registered globally\x1b[0m');
    } catch (error) {
      console.error('\x1b[31m[✗] Failed to register slash commands:\x1b[0m', error);
    }
  }
};
