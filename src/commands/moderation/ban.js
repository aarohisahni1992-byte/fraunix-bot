const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, createActionRow, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('delete_messages')
        .setDescription('Delete recent messages (in days)')
        .setRequired(false)
        .addChoices(
          { name: "Don't delete any", value: 0 },
          { name: 'Previous 24 hours', value: 1 },
          { name: 'Previous 3 days', value: 3 },
          { name: 'Previous 7 days', value: 7 }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_messages') || 0;

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.', 'Target Not Found')] });
    }
    if (target.id === interaction.user.id) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot ban yourself.', 'Invalid Target')] });
    }
    if (target.id === client.user.id) {
      return interaction.editReply({ embeds: [errorEmbed('I cannot ban myself.', 'Invalid Target')] });
    }
    if (!target.bannable) {
      return interaction.editReply({ embeds: [errorEmbed('That user has a higher role than me.', 'Cannot Ban')] });
    }
    if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot ban someone with an equal or higher role.', 'Hierarchy Error')] });
    }

    const deleteText = deleteDays > 0 ? `Last ${deleteDays} day(s)` : 'None';

    const embed = premiumEmbed({
      color: config.colors.error,
      title: 'Confirm Ban',
      description: [
        `\`${D.tl}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.tr}\``,
        `\`${D.v}  ${badge('red', 'BAN')}  🔨  Member Ban Requested           ${D.v}\``,
        `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
        `\`${D.v}  ${D.diamond} Target: ${target.user.tag.padEnd(19)}${D.v}\``,
        `\`${D.v}  ${D.diamond} Reason: ${reason.padEnd(19)}${D.v}\``,
        `\`${D.v}  ${D.diamond} Delete: ${deleteText.padEnd(19)}${D.v}\``,
        `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.padEnd(22)}${D.v}\``,
        `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
        `\`${D.v}  ${D.arrow} This action cannot be undone easily.  ${D.v}\``,
        `\`${D.v}  ${D.arrow} Are you sure you want to proceed?    ${D.v}\``,
        `\`${D.bl}${D.thinH.repeat(30)}${D.br}\``
      ].join('\n')
    });

    const confirmRow = createActionRow([
      { customId: `confirm_ban_${target.id}`, label: 'Confirm Ban', style: ButtonStyle.Danger, emoji: '🔨' },
      { customId: `cancel_ban_${target.id}`, label: 'Cancel', style: ButtonStyle.Secondary, emoji: '❌' }
    ]);

    await interaction.editReply({ embeds: [embed], components: [confirmRow] });
  }
};
