const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, createActionRow, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.', 'Target Not Found')] });
    }
    if (target.id === interaction.user.id) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot kick yourself.', 'Invalid Target')] });
    }
    if (target.id === client.user.id) {
      return interaction.editReply({ embeds: [errorEmbed('I cannot kick myself.', 'Invalid Target')] });
    }
    if (!target.kickable) {
      return interaction.editReply({ embeds: [errorEmbed('That user has a higher role than me.', 'Cannot Kick')] });
    }
    if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot kick someone with an equal or higher role.', 'Hierarchy Error')] });
    }

    const confirmRow = createActionRow([
      { customId: `confirm_kick_${target.id}`, label: 'Confirm Kick', style: ButtonStyle.Danger, emoji: '👢' },
      { customId: `cancel_kick_${target.id}`, label: 'Cancel', style: ButtonStyle.Secondary, emoji: '❌' }
    ]);

    await interaction.editReply({
      embeds: [premiumEmbed({
        color: config.colors.warning,
        title: 'Confirm Kick',
        description: [
          `\`${D.tl}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.tr}\``,
          `\`${D.v}  ${badge('yellow', 'KICK')}  👢  Member Kick Requested          ${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
          `\`${D.v}  ${D.diamond} Target: ${target.user.tag.padEnd(19)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Reason: ${reason.padEnd(19)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.padEnd(23)}${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
          `\`${D.v}  ${D.arrow} Are you sure you want to kick?          ${D.v}\``,
          `\`${D.bl}${D.thinH.repeat(30)}${D.br}\``
        ].join('\n')
      })],
      components: [confirmRow]
    });
  }
};
