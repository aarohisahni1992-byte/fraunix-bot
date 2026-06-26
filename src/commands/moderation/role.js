const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage roles for members')
    .addSubcommand(sub =>
      sub.setName('give')
        .setDescription('Give a role to a member')
        .addUserOption(opt => opt.setName('target').setDescription('Member').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to give').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('take')
        .setDescription('Remove a role from a member')
        .addUserOption(opt => opt.setName('target').setDescription('Member').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('all')
        .setDescription('Give a role to all members')
        .addRoleOption(opt => opt.setName('role').setDescription('Role to give').setRequired(true))
        .addBooleanOption(opt => opt.setName('bots').setDescription('Include bots').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('removeall')
        .setDescription('Remove a role from all members')
        .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();

    if (sub === 'give') {
      const target = interaction.options.getMember('target');
      const role = interaction.options.getRole('role');

      if (!target) return interaction.editReply({ embeds: [errorEmbed('Member not found.')] });
      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.editReply({ embeds: [errorEmbed('That role is higher than your highest role.')] });
      }
      if (target.roles.cache.has(role.id)) {
        return interaction.editReply({ embeds: [errorEmbed(`${target.user.tag} already has that role.`)] });
      }

      await target.roles.add(role, `Role given by ${interaction.user.tag}`);
      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Role Given',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'ROLE')}  🎭  Role assignment             ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Role: ${role.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    }

    else if (sub === 'take') {
      const target = interaction.options.getMember('target');
      const role = interaction.options.getRole('role');

      if (!target) return interaction.editReply({ embeds: [errorEmbed('Member not found.')] });
      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.editReply({ embeds: [errorEmbed('That role is higher than your highest role.')] });
      }
      if (!target.roles.cache.has(role.id)) {
        return interaction.editReply({ embeds: [errorEmbed(`${target.user.tag} does not have that role.`)] });
      }

      await target.roles.remove(role, `Role removed by ${interaction.user.tag}`);
      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Role Removed',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'ROLE')}  🎭  Role removal               ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Target: ${target.user.tag.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Role: ${role.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    }

    else if (sub === 'all') {
      const role = interaction.options.getRole('role');
      const includeBots = interaction.options.getBoolean('bots') || false;

      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.editReply({ embeds: [errorEmbed('That role is higher than your highest role.')] });
      }

      const members = interaction.guild.members.cache.filter(m => {
        if (m.user.bot && !includeBots) return false;
        return !m.roles.cache.has(role.id) && m.manageable;
      });

      if (members.size === 0) {
        return interaction.editReply({ embeds: [errorEmbed('No eligible members found.')] });
      }

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.info,
          title: 'Adding Roles...',
          description: [
            `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
            `\`${D.v}  ${badge('blue', 'ROLE')}  🎭  Bulk role add in progress   ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Role: ${role.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Target: ${members.size} members            ${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
          ].join('\n')
        })]
      });

      let added = 0;
      for (const [, member] of members) {
        try {
          await member.roles.add(role, `Bulk role add by ${interaction.user.tag}`);
          added++;
        } catch {}
      }

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Bulk Role Add Complete',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'ROLE')}  🎭  Bulk add complete          ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Role: ${role.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Added: ${String(added).padEnd(18)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Total: ${String(members.size).padEnd(18)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    }

    else if (sub === 'removeall') {
      const role = interaction.options.getRole('role');

      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.editReply({ embeds: [errorEmbed('That role is higher than your highest role.')] });
      }

      const members = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id) && m.manageable);

      if (members.size === 0) {
        return interaction.editReply({ embeds: [errorEmbed('No members have that role.')] });
      }

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.info,
          title: 'Removing Roles...',
          description: [
            `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
            `\`${D.v}  ${badge('blue', 'ROLE')}  🎭  Bulk role remove in progress${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Role: ${role.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Target: ${members.size} members            ${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
          ].join('\n')
        })]
      });

      let removed = 0;
      for (const [, member] of members) {
        try {
          await member.roles.remove(role, `Bulk role remove by ${interaction.user.tag}`);
          removed++;
        } catch {}
      }

      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Bulk Role Remove Complete',
          description: [
            `\`${D.tl}${D.thinH.repeat(24)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'ROLE')}  🎭  Bulk remove complete       ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(24)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} Role: ${role.name.slice(0, 16).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Removed: ${String(removed).padEnd(16)}${D.v}\``,
            `\`${D.v}  ${D.diamond} Total: ${String(members.size).padEnd(18)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(24)}${D.br}\``
          ].join('\n')
        })]
      });
    }
  }
};
