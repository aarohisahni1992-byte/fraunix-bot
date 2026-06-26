const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, embedHeader, sectionDivider, fieldList, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('View details about a server role')
    .setDMPermission(false)
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to inspect')
        .setRequired(true)),

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');

    const permissions = role.permissions.toArray().map(p =>
      p.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    );

    const permStr = permissions.length > 0
      ? permissions.slice(0, 20).join(', ') + (permissions.length > 20 ? ` *+${permissions.length - 20} more*` : '')
      : 'None';

    const embed = premiumEmbed({
      color: role.color || config.colors.primary,
      title: role.name,
      description: [
        embedHeader('Role Inspector', '🎖️'),
        '',
        `${D.diamond} ${role.name} ${role.mentionable ? '(Mentionable)' : ''} ${role.hoist ? '(Displayed separately)' : ''}`,
        '',
        sectionDivider('Details'),
        fieldList([
          ['ID', `\`${role.id}\``],
          ['Color', role.hexColor],
          ['Position', `${role.rawPosition}`],
          ['Members', `${role.members.size}`],
          ['Mentionable', role.mentionable ? 'Yes' : 'No'],
          ['Hoisted', role.hoist ? 'Yes' : 'No'],
          ['Created', `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`]
        ]),
        '',
        sectionDivider(`Permissions (${permissions.length})`),
        permissions.length > 0 ? permStr : 'No permissions'
      ].join('\n'),
      footer: { text: `${D.star} Fraunix Role Inspector ${D.star}` }
    });

    await interaction.reply({ embeds: [embed] });
  }
};
