const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, infoEmbed, embedHeader, sectionDivider, fieldList, badge, D } = require('../../utils/embed');
const { isOwner } = require('../../utils/permissions');
const AdminManager = require('../../models/admins');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auth')
    .setDescription('Manage bot admins (owner only)')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a bot admin')
        .addUserOption(opt => opt.setName('user').setDescription('User to make admin').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a bot admin')
        .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all bot admins')),

  async execute(interaction, client) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only the bot owner can manage admins.', 'Owner Only')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const user = interaction.options.getUser('user');
      if (isOwner(user.id)) {
        return interaction.editReply({ embeds: [errorEmbed('That user is already a bot owner.', 'Already Owner')] });
      }
      if (AdminManager.isAdmin(user.id)) {
        return interaction.editReply({ embeds: [errorEmbed('That user is already an admin.', 'Already Admin')] });
      }
      AdminManager.add(user.id, interaction.user.id);
      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Admin Added',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'ADMIN')}  👑  Admin added               ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} User: ${user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} ID: ${user.id.slice(0, 18).padEnd(18)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    }

    else if (sub === 'remove') {
      const user = interaction.options.getUser('user');
      if (isOwner(user.id)) {
        return interaction.editReply({ embeds: [errorEmbed('Cannot remove a bot owner. Remove them from config.json.', 'Cannot Remove')] });
      }
      if (!AdminManager.isAdmin(user.id)) {
        return interaction.editReply({ embeds: [errorEmbed('That user is not an admin.', 'Not Admin')] });
      }
      AdminManager.remove(user.id);
      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Admin Removed',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'ADMIN')}  🗑️  Admin removed             ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} User: ${user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} ID: ${user.id.slice(0, 18).padEnd(18)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    }

    else if (sub === 'list') {
      const owners = config.owners;
      const admins = AdminManager.list();

      const ownerLines = [];
      for (const id of owners) {
        const tag = (await client.users.fetch(id).catch(() => null))?.tag || id;
        ownerLines.push([tag, `\`${id}\``]);
      }

      const adminLines = [];
      for (const a of admins) {
        const tag = (await client.users.fetch(a.id).catch(() => null))?.tag || a.id;
        const date = `<t:${Math.floor(new Date(a.date).getTime() / 1000)}:R>`;
        adminLines.push([tag, `\`${a.id}\``, date]);
      }

      const embed = premiumEmbed({
        color: config.colors.primary,
        title: 'Bot Administrators',
        description: [
          embedHeader('Access Control', '👑', `${owners.length} owners • ${admins.length} admins`),
          '',
          sectionDivider('Bot Owners'),
          ownerLines.length > 0 ? fieldList(ownerLines) : `${D.dot} None`,
          '',
          sectionDivider('Bot Admins'),
          adminLines.length > 0 ? fieldList(adminLines) : `${D.dot} No admins — use \`/auth add\``
        ].join('\n'),
        footer: { text: `${D.star} Fraunix Access Control ${D.star}` }
      });

      await interaction.editReply({ embeds: [embed] });
    }
  }
};
