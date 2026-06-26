const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, embedHeader, sectionDivider, fieldList, badge, D, DECO } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');

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
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Explore the Fraunix command universe')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Browse by category')
        .setRequired(false)
        .addChoices(
          { name: '🛡️ Moderation', value: 'moderation' },
          { name: '🔧 Utility', value: 'utility' },
          { name: '🎮 Fun', value: 'fun' }
        ))
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Get command details')
        .setRequired(false)),

  async execute(interaction, client) {
    await interaction.deferReply();

    const cmdFilter = interaction.options.getString('command');
    const catFilter = interaction.options.getString('category');
    const isAdminOrOwner = isAdmin(interaction.user.id);

    if (cmdFilter) {
      const cmd = client.commands.get(cmdFilter.toLowerCase());
      if (!cmd) {
        const { errorEmbed } = require('../../utils/embed');
        return interaction.editReply({ embeds: [errorEmbed(`Command \`${cmdFilter}\` not found.`, 'Unknown Command')] });
      }

      const cmdCat = commandMap[cmd.data.name];
      if (cmdCat === 'owner' && !isAdminOrOwner) {
        return interaction.editReply({ embeds: [errorEmbed(`Command \`${cmdFilter}\` not found.`, 'Unknown Command')] });
      }

      const options = cmd.data.options || [];
      const usage = [];
      for (const opt of options) {
        if (opt.type === 1) {
          for (const sub of opt.options || []) usage.push(`${D.dot} ${opt.name} ${sub.name}${sub.required ? ' *' : ''}`);
        } else {
          usage.push(`${D.dot} ${opt.name}${opt.required ? ' *' : ''}`);
        }
      }

      const embed = premiumEmbed({
        color: config.colors.primary,
        title: `\`/${cmd.data.name}\``,
        description: [
          embedHeader('Command Details', '📖'),
          '',
          `${D.diamond} ${cmd.data.description}`,
          '',
          sectionDivider('Usage'),
          `\`/${cmd.data.name} ${options.length ? '<options>' : ''}\``,
          '',
          sectionDivider('Options'),
          usage.length > 0 ? fieldList(usage.map(o => [o, ''])) : `${D.dot} No options`,
          '',
          sectionDivider('Info'),
          fieldList([
            ['Category', `${categories[cmdCat]?.emoji || '📁'} ${cmdCat || 'Other'}`],
            ['Prefix', `\`!${cmd.data.name}\``],
            ['Aliases', 'None']
          ])
        ].join('\n'),
        footer: { text: `${DECO.spark} Use /help to browse all commands` }
      });

      return interaction.editReply({ embeds: [embed] });
    }

    if (catFilter) {
      const cat = categories[catFilter];
      let cmds = client.commands.filter(c => commandMap[c.data.name] === catFilter);
      if (catFilter === 'owner') cmds = client.commands.filter(() => false);

      const cmdList = cmds.size > 0
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
          cmdList,
          '',
          `${badge('blue', 'TIP')} Use \`/help <command>\` for detailed info`
        ].join('\n'),
        footer: { text: `${DECO.smallStar || '✧'} ${cat.emoji} ${cat.name}` }
      });

      return interaction.editReply({ embeds: [embed] });
    }

    const visibleCats = isAdminOrOwner
      ? Object.entries(categories)
      : Object.entries(categories).filter(([key]) => key !== 'owner');

    const catFields = visibleCats.map(([key, cat]) => {
      const count = client.commands.filter(c => commandMap[c.data.name] === key).size;
      return {
        name: `${cat.emoji} ${cat.name}`,
        value: fieldList([['Commands', `${count}`], ['Description', cat.desc], ['Usage', `/help ${key}`]]),
        inline: false
      };
    });

    const selectOptions = [
      { label: '🛡️ Moderation', value: 'moderation', description: 'Server moderation tools' },
      { label: '🔧 Utility', value: 'utility', description: 'Everyday utilities' },
      { label: '🎮 Fun', value: 'fun', description: 'Entertainment commands' }
    ];
    if (isAdminOrOwner) {
      selectOptions.push({ label: '👑 Owner', value: 'owner', description: 'Bot owner commands' });
    }

    const totalVisible = visibleCats.reduce((acc, [key]) => acc + client.commands.filter(c => commandMap[c.data.name] === key).size, 0);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('Jump to a category...')
      .addOptions(selectOptions);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    const embed = premiumEmbed({
      color: config.colors.primary,
      title: 'Fraunix Command Universe',
      thumbnail: client.user.displayAvatarURL({ size: 1024 }),
      description: [
        embedHeader('Command Universe', '⚡', `${totalVisible} commands • ${visibleCats.length} galaxies`),
        '',
        `${D.diamond} Welcome to the **Fraunix** command interface.`,
        `${D.diamond} Explore, learn, and command with ${DECO.fire || '🔥'} precision.`,
        '',
        sectionDivider('Quick Start'),
        `${DECO.bolt} \`/help moderation\` — View moderation tools`,
        `${DECO.bolt} \`/help <command>\` — Specific command help`,
        `${DECO.bolt} \`!<command>\` or \`@Fraunix\` — Prefix usage`,
        '',
        sectionDivider('Galaxies')
      ].join('\n'),
      fields: catFields,
      footer: { text: `${DECO.gem || '💎'} Fraunix v1 — Precision Moderation ${DECO.gem || '💎'}` }
    });

    await interaction.editReply({ embeds: [embed], components: [selectRow] });
  }
};
