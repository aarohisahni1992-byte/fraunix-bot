const config = require('../../config.json');
const { premiumEmbed, errorEmbed, embedHeader, sectionDivider, badge, D } = require('../utils/embed');
const { isAdmin } = require('../utils/permissions');

const categories = {
  moderation: { emoji: '🛡️', name: 'Moderation', desc: 'Keep your server safe and organized' },
  utility: { emoji: '🔧', name: 'Utility', desc: 'Handy tools for everyday tasks' },
  fun: { emoji: '🎮', name: 'Fun', desc: 'Lighten up with some fun commands' },
  owner: { emoji: '👑', name: 'Owner', desc: 'Bot owner exclusive controls' }
};

const commandMap = {
  kick: 'moderation', ban: 'moderation', softban: 'moderation',
  mute: 'moderation', unmute: 'moderation', warn: 'moderation',
  warnings: 'moderation', clearwarn: 'moderation', purge: 'moderation',
  slowmode: 'moderation', lock: 'moderation', unlock: 'moderation',
  nuke: 'moderation', voicekick: 'moderation', moveall: 'moderation',
  role: 'moderation', nick: 'moderation', rename: 'moderation',
  emoji: 'moderation', lockall: 'moderation', unlockall: 'moderation',
  voice: 'moderation',
  ping: 'utility', userinfo: 'utility', serverinfo: 'utility',
  avatar: 'utility', botinfo: 'utility', help: 'utility',
  invite: 'utility', uptime: 'utility', roleinfo: 'utility',
  poll: 'utility', embed: 'utility',
  '8ball': 'fun', coinflip: 'fun', dice: 'fun',
  eval: 'owner', servers: 'owner', leave: 'owner',
  shutdown: 'owner', say: 'owner', dm: 'owner',
  blacklist: 'owner', reload: 'owner', auth: 'owner',
  badge: 'owner'
};

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`[ERROR] Command ${interaction.commandName}:`, error);
        const errEmbed = errorEmbed(
          `An unexpected error occurred while executing \`/${interaction.commandName}\`.\n\`\`\`${error.message.slice(0, 200)}\`\`\``,
          'Command Error'
        );
        const errorMsg = { embeds: [errEmbed], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMsg);
        } else {
          await interaction.reply(errorMsg);
        }
      }
    }

    if (interaction.isButton()) {
      const customId = interaction.customId;
      if (customId.startsWith('confirm_')) {
        const action = customId.split('_')[1];
        const targetId = customId.split('_')[2];
        const target = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!target) {
          return interaction.update({
            embeds: [errorEmbed('Target not found.', 'Not Found')],
            components: []
          });
        }
        try {
          switch (action) {
            case 'kick':
              await target.kick('Kick confirmed via button');
              break;
            case 'ban':
              await target.ban({ reason: 'Ban confirmed via button' });
              break;
            case 'softban':
              await target.ban({ reason: 'Softban confirmed via button' });
              await interaction.guild.members.unban(target.id, 'Softban complete');
              break;
            case 'vkick':
              await target.voice.disconnect();
              break;
          }
          await interaction.update({
            embeds: [premiumEmbed({
              color: config.colors.success,
              title: 'Action Completed',
              description: `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\`\n\`${D.v}  ✅  **${action.toUpperCase()}** executed       ${D.v}\`\n\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\`\n\`${D.v}  Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\`\n\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
            })],
            components: []
          });
        } catch (err) {
          await interaction.update({
            embeds: [errorEmbed(`Failed to ${action} ${target.user.tag}: ${err.message}`, `${action} Failed`)],
            components: []
          });
        }
      }

      if (customId.startsWith('cancel_')) {
        await interaction.update({
          embeds: [premiumEmbed({
            color: config.colors.warning,
            title: 'Action Cancelled',
            description: [
              `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
              `\`${D.v}  ⚠️  Action was cancelled          ${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
            ].join('\n')
          })],
          components: []
        });
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'help_category') {
        const value = interaction.values[0];

        if (value === 'owner' && !isAdmin(interaction.user.id)) {
          return interaction.update({
            embeds: [errorEmbed('Owner commands are restricted.', 'Access Denied')],
            components: []
          });
        }

        const cat = categories[value];
        const cmds = client.commands.filter(c => commandMap[c.data.name] === value);
        const catList = cmds.size > 0
          ? cmds.map(c => `${D.dot} \`/${c.data.name}\``).join('\n')
          : `${D.dot} No commands available`;

        const embed = premiumEmbed({
          color: config.colors.primary,
          title: `${cat.emoji} ${cat.name} — ${cmds.size} Commands`,
          description: [
            embedHeader(`${cat.name}`, cat.emoji),
            '',
            `${D.smallSep} ${cat.emoji} **${cat.name}** — ${cat.desc}`,
            '',
            sectionDivider('Available Commands'),
            catList,
            '',
            `${badge('blue', 'TIP')} Use \`/help <command>\` for detailed info`
          ].join('\n'),
          footer: { text: `${D.smallSep} ${cat.emoji} ${cat.name}` }
        });

        await interaction.update({ embeds: [embed] });
      }
    }
  }
};
