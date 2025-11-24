const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // DUYURU KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('duyuru')
      .setDescription('Sunucuya duyuru gönder (Yönetici)')
      .addStringOption(option =>
        option.setName('mesaj')
          .setDescription('Duyuru mesajı')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const mesaj = interaction.options.getString('mesaj');
      await executeRconCommand(`say ${mesaj}`);
      const embed = new EmbedBuilder()
        .setColor('#ffff00')
        .setTitle('📢 Duyuru Gönderildi')
        .setDescription(`"${mesaj}"`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // MSG KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('msg')
      .setDescription('Oyuncuya özel mesaj gönder (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Oyuncu adı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('mesaj')
          .setDescription('Mesaj')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const mesaj = interaction.options.getString('mesaj');
      await executeRconCommand(`msg ${oyuncu} ${mesaj}`);
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('💬 Mesaj Gönderildi')
        .addFields(
          { name: 'Alıcı', value: oyuncu, inline: true },
          { name: 'Mesaj', value: mesaj, inline: false }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // TITLE KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('title')
      .setDescription('Oyuncuya ekranda başlık göster (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Oyuncu adı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('baslik')
          .setDescription('Başlık metni')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('altbaslik')
          .setDescription('Alt başlık metni')),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const baslik = interaction.options.getString('baslik');
      const altbaslik = interaction.options.getString('altbaslik');
      
      await executeRconCommand(`title ${oyuncu} title {"text":"${baslik}"}`);
      if (altbaslik) {
        await executeRconCommand(`title ${oyuncu} subtitle {"text":"${altbaslik}"}`);
      }
      
      const embed = new EmbedBuilder()
        .setColor('#ff00ff')
        .setTitle('📺 Başlık Gösterildi')
        .addFields(
          { name: 'Oyuncu', value: oyuncu, inline: false },
          { name: 'Başlık', value: baslik, inline: false }
        )
        .setFooter(createFooter())
        .setTimestamp();
      
      if (altbaslik) {
        embed.addFields({ name: 'Alt Başlık', value: altbaslik, inline: false });
      }
      
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // STOP KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('stop')
      .setDescription('⚠️ Sunucuyu durdur (Yönetici)'),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⚠️ Sunucu Durduruluyor')
        .setDescription('Minecraft sunucusu kapatılıyor...')
        .setFooter(createFooter())
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
      await executeRconCommand('stop');
    }
  },

  // KOMUT KOMUTU (Özel RCON)
  {
    data: new SlashCommandBuilder()
      .setName('komut')
      .setDescription('Özel RCON komutu çalıştır (Yönetici)')
      .addStringOption(option =>
        option.setName('cmd')
          .setDescription('Çalıştırılacak komut')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply({ flags: 64 });
      const cmd = interaction.options.getString('cmd');
      const response = await executeRconCommand(cmd);
      const embed = new EmbedBuilder()
        .setColor('#9900ff')
        .setTitle('⚙️ Komut Çalıştırıldı')
        .addFields(
          { name: 'Komut', value: `\`${cmd}\``, inline: false },
          { name: 'Sonuç', value: `\`\`\`${response || 'Yanıt alınamadı'}\`\`\``, inline: false }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }
];