const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, createActionRow, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban and immediately unban a member (clears messages)')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to softban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the softban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.', 'Not Found')] });
    }
    if (target.id === interaction.user.id) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot softban yourself.', 'Invalid')] });
    }
    if (!target.bannable) {
      return interaction.editReply({ embeds: [errorEmbed('I cannot softban that user.', 'Cannot Softban')] });
    }
    if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot softban someone with a higher or equal role.', 'Hierarchy Error')] });
    }

    const confirmRow = createActionRow([
      { customId: `confirm_softban_${target.id}`, label: 'Confirm Softban', style: ButtonStyle.Danger, emoji: '🔨' },
      { customId: `cancel_softban_${target.id}`, label: 'Cancel', style: ButtonStyle.Secondary, emoji: '❌' }
    ]);

    await interaction.editReply({
      embeds: [premiumEmbed({
        color: config.colors.error,
        title: 'Confirm Softban',
        description: [
          `\`${D.tl}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.thinH}${D.tr}\``,
          `\`${D.v}  ${badge('red', 'SOFTBAN')}  🔨  Softban Requested                ${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
          `\`${D.v}  ${D.diamond} Target: ${target.user.tag.padEnd(19)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Reason: ${reason.padEnd(19)}${D.v}\``,
          `\`${D.v}  ${D.diamond} Mod: ${interaction.user.tag.padEnd(23)}${D.v}\``,
          `\`${D.sep}${D.thinH.repeat(30)}${D.sep2}\``,
          `\`${D.v}  ${D.arrow} Ban + immediate unban (clears msgs)    ${D.v}\``,
          `\`${D.v}  ${D.arrow} Are you sure you want to proceed?      ${D.v}\``,
          `\`${D.bl}${D.thinH.repeat(30)}${D.br}\``
        ].join('\n')
      })],
      components: [confirmRow]
    });
  }
};
