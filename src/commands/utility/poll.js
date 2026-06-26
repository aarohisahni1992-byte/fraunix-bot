const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config.json');
const { premiumEmbed, embedHeader, sectionDivider, badge, D } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The poll question')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('option1')
        .setDescription('Option 1')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('option2')
        .setDescription('Option 2')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('option3')
        .setDescription('Option 3')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option4')
        .setDescription('Option 4')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option5')
        .setDescription('Option 5')
        .setRequired(false)),

  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const options = [];

    for (let i = 1; i <= 5; i++) {
      const opt = interaction.options.getString(`option${i}`);
      if (opt) options.push(opt);
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const optionLines = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');

    const embed = premiumEmbed({
      color: config.colors.primary,
      title: '📊 Poll',
      description: [
        `\`${D.tl}${D.thinH.repeat(28)}${D.tr}\``,
        `\`${D.v}  ${badge('blue', 'POLL')}  📊  ${question.padEnd(20)}${D.v}\``,
        `\`${D.sep}${D.thinH.repeat(28)}${D.sep2}\``,
        `\`${D.v}  ${D.diamond} Options:                            ${D.v}\``,
        optionLines.split('\n').map(line => `\`${D.v}     ${line.padEnd(28)}${D.v}\``).join('\n'),
        `\`${D.bl}${D.thinH.repeat(28)}${D.br}\``
      ].join('\n'),
      footer: { text: `Poll by ${interaction.user.tag} • React to vote!` }
    });

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]);
    }
  }
};
