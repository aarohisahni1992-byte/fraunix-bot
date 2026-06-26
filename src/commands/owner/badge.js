const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, errorEmbed, infoEmbed, embedHeader, sectionDivider, fieldList, badge, D } = require('../../utils/embed');
const { isAdmin } = require('../../utils/permissions');
const BadgeManager = require('../../models/badges');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badge')
    .setDescription('Manage custom user badges (admin/owner only)')
    .addSubcommand(sub =>
      sub.setName('give')
        .setDescription('Give a badge to a user')
        .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
        .addStringOption(opt => opt.setName('text').setDescription('Badge text/emoji').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a badge from a user')
        .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
        .addStringOption(opt => opt.setName('text').setDescription('Badge text to remove').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List badges for a user')
        .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Clear all badges from a user')
        .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))),

  async execute(interaction, client) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('Only bot owners and admins can manage badges.', 'Access Denied')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user');

    if (sub === 'give') {
      const text = interaction.options.getString('text');
      if (text.length > 80) {
        return interaction.editReply({ embeds: [errorEmbed('Badge text must be under 80 characters.', 'Too Long')] });
      }
      if (BadgeManager.add(target.id, text, interaction.user.id)) {
        await interaction.editReply({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Badge Given',
            description: [
              `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'BADGE')}  🏅  Badge assigned            ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
              `\`${D.v}  ${D.diamond} User: ${target.tag.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.v}  ${D.diamond} Badge: ${text.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
            ].join('\n')
          })]
        });
      } else {
        await interaction.editReply({ embeds: [errorEmbed('That user already has this badge.', 'Duplicate')] });
      }
    }

    else if (sub === 'remove') {
      const text = interaction.options.getString('text');
      if (BadgeManager.remove(target.id, text)) {
        await interaction.editReply({
          embeds: [premiumEmbed({
            color: config.colors.success,
            title: 'Badge Removed',
            description: [
              `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
              `\`${D.v}  ${badge('green', 'BADGE')}  🗑️  Badge removed             ${D.v}\``,
              `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
              `\`${D.v}  ${D.diamond} User: ${target.tag.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.v}  ${D.diamond} Badge: ${text.slice(0, 14).padEnd(14)}${D.v}\``,
              `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
            ].join('\n')
          })]
        });
      } else {
        await interaction.editReply({ embeds: [errorEmbed('Badge not found on that user.', 'Not Found')] });
      }
    }

    else if (sub === 'list') {
      const badges = BadgeManager.list(target.id);
      if (badges.length === 0) {
        return interaction.editReply({ embeds: [infoEmbed(`**${target.tag}** has no custom badges.`)] });
      }
      const list = badges.map((b, i) => `${D.dot} ${b.text} ${D.smallSep} *by <@${b.givenBy}>*`).join('\n');
      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.primary,
          title: `Badges — ${target.tag}`,
          description: [
            embedHeader('Custom Badges', '🏅', `${badges.length} badges`),
            '',
            `${D.diamond} **${target.tag}** has ${badges.length} custom badge(s):`,
            '',
            sectionDivider('Badges'),
            list
          ].join('\n'),
          footer: { text: `${D.star} Fraunix Badge System ${D.star}` }
        })]
      });
    }

    else if (sub === 'clear') {
      BadgeManager.clear(target.id);
      await interaction.editReply({
        embeds: [premiumEmbed({
          color: config.colors.success,
          title: 'Badges Cleared',
          description: [
            `\`${D.tl}${D.thinH.repeat(22)}${D.tr}\``,
            `\`${D.v}  ${badge('green', 'BADGE')}  🧹  All badges cleared         ${D.v}\``,
            `\`${D.sep}${D.thinH.repeat(22)}${D.sep2}\``,
            `\`${D.v}  ${D.diamond} User: ${target.tag.slice(0, 14).padEnd(14)}${D.v}\``,
            `\`${D.bl}${D.thinH.repeat(22)}${D.br}\``
          ].join('\n')
        })]
      });
    }
  }
};
