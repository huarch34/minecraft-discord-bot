const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Whitelist yönetimi (Yönetici)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ekle')
        .setDescription('Oyuncuyu whitelist\'e ekle')
        .addStringOption(option =>
          option.setName('oyuncu')
            .setDescription('Minecraft kullanıcı adı')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('cikar')
        .setDescription('Oyuncuyu whitelist\'ten çıkar')
        .addStringOption(option =>
          option.setName('oyuncu')
            .setDescription('Minecraft kullanıcı adı')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('liste')
        .setDescription('Whitelist\'teki oyuncuları göster'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('ac')
        .setDescription('Whitelist\'i aktifleştir'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('kapat')
        .setDescription('Whitelist\'i deaktif et')),
  
  async execute(interaction, { executeRconCommand }) {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();
    const oyuncu = interaction.options.getString('oyuncu');
    
    if (subcommand === 'ekle') {
      await executeRconCommand(`whitelist add ${oyuncu}`);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Whitelist Güncellendi')
        .setDescription(`**${oyuncu}** whitelist'e eklendi.`)
        .setFooter({
          text: '💻 Developed by Huarch | github.com/Huarch',
          iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
        })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
    else if (subcommand === 'cikar') {
      await executeRconCommand(`whitelist remove ${oyuncu}`);
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ Whitelist Güncellendi')
        .setDescription(`**${oyuncu}** whitelist'ten çıkarıldı.`)
        .setFooter({
          text: '💻 Developed by Huarch | github.com/Huarch',
          iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
        })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
    else if (subcommand === 'liste') {
      const response = await executeRconCommand('whitelist list');
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📋 Whitelist Oyuncuları')
        .setDescription(response || 'Whitelist boş.')
        .setFooter({
          text: '💻 Developed by Huarch | github.com/Huarch',
          iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
        })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
    else if (subcommand === 'ac') {
      await executeRconCommand('whitelist on');
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🔒 Whitelist Aktif')
        .setDescription('Whitelist aktifleştirildi.')
        .setFooter({
          text: '💻 Developed by Huarch | github.com/Huarch',
          iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
        })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
    else if (subcommand === 'kapat') {
      await executeRconCommand('whitelist off');
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🔓 Whitelist Deaktif')
        .setDescription('Whitelist devre dışı bırakıldı.')
        .setFooter({
          text: '💻 Developed by Huarch | github.com/Huarch',
          iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
        })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }
};