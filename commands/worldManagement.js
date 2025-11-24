const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // WEATHER KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('weather')
      .setDescription('Hava durumunu değiştir (Yönetici)')
      .addStringOption(option =>
        option.setName('durum')
          .setDescription('Hava durumu')
          .setRequired(true)
          .addChoices(
            { name: '☀️ Açık', value: 'clear' },
            { name: '🌧️ Yağmur', value: 'rain' },
            { name: '⛈️ Fırtına', value: 'thunder' }
          )),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const durum = interaction.options.getString('durum');
      await executeRconCommand(`weather ${durum}`);
      const emoji = durum === 'clear' ? '☀️' : durum === 'rain' ? '🌧️' : '⛈️';
      const embed = new EmbedBuilder()
        .setColor('#00aaff')
        .setTitle(`${emoji} Hava Durumu Değiştirildi`)
        .setDescription(`Hava durumu: **${durum}**`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // TIME KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('time')
      .setDescription('Zamanı ayarla (Yönetici)')
      .addStringOption(option =>
        option.setName('ayar')
          .setDescription('Zaman ayarı')
          .setRequired(true)
          .addChoices(
            { name: '🌅 Gün', value: 'day' },
            { name: '🌃 Gece', value: 'night' },
            { name: '🌄 Gün Doğumu', value: 'sunrise' },
            { name: '🌆 Gün Batımı', value: 'sunset' }
          )),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const ayar = interaction.options.getString('ayar');
      const timeMap = {
        'day': '1000',
        'night': '13000',
        'sunrise': '0',
        'sunset': '12000'
      };
      await executeRconCommand(`time set ${timeMap[ayar]}`);
      const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('🕐 Zaman Ayarlandı')
        .setDescription(`Zaman: **${ayar}**`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // TIMESET KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('timeset')
      .setDescription('Özel zaman değeri ayarla (Yönetici)')
      .addIntegerOption(option =>
        option.setName('deger')
          .setDescription('Zaman değeri (0-24000)')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const deger = interaction.options.getInteger('deger');
      await executeRconCommand(`time set ${deger}`);
      const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('🕐 Zaman Ayarlandı')
        .setDescription(`Zaman değeri: **${deger}**`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // DIFFICULTY KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('difficulty')
      .setDescription('Zorluk seviyesini değiştir (Yönetici)')
      .addStringOption(option =>
        option.setName('seviye')
          .setDescription('Zorluk seviyesi')
          .setRequired(true)
          .addChoices(
            { name: 'Barışçıl', value: 'peaceful' },
            { name: 'Kolay', value: 'easy' },
            { name: 'Normal', value: 'normal' },
            { name: 'Zor', value: 'hard' }
          )),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const seviye = interaction.options.getString('seviye');
      await executeRconCommand(`difficulty ${seviye}`);
      const embed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle('⚔️ Zorluk Seviyesi Değiştirildi')
        .setDescription(`Yeni zorluk: **${seviye}**`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // SETWORLDSPAWN KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('setworldspawn')
      .setDescription('Dünya spawn noktasını ayarla (Yönetici)')
      .addIntegerOption(option =>
        option.setName('x')
          .setDescription('X koordinatı'))
      .addIntegerOption(option =>
        option.setName('y')
          .setDescription('Y koordinatı'))
      .addIntegerOption(option =>
        option.setName('z')
          .setDescription('Z koordinatı')),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const x = interaction.options.getInteger('x');
      const y = interaction.options.getInteger('y');
      const z = interaction.options.getInteger('z');
      
      let cmd = 'setworldspawn';
      if (x !== null && y !== null && z !== null) {
        cmd += ` ${x} ${y} ${z}`;
      }
      
      await executeRconCommand(cmd);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🏠 Spawn Noktası Ayarlandı')
        .setDescription(x !== null ? `Konum: **${x}, ${y}, ${z}**` : 'Mevcut konum spawn noktası olarak ayarlandı.')
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // SEED KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('seed')
      .setDescription('Dünya seed\'ini göster (Yönetici)'),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const response = await executeRconCommand('seed');
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🌱 Dünya Seed')
        .setDescription(response || 'Seed bilgisi alınamadı.')
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // SAVE KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('save')
      .setDescription('Dünya kaydetme işlemleri (Yönetici)')
      .addStringOption(option =>
        option.setName('islem')
          .setDescription('Kaydetme işlemi')
          .setRequired(true)
          .addChoices(
            { name: 'Kaydet', value: 'save' },
            { name: 'Otomatik Kaydetmeyi Aç', value: 'on' },
            { name: 'Otomatik Kaydetmeyi Kapat', value: 'off' }
          )),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const islem = interaction.options.getString('islem');
      let cmd = '';
      let baslik = '';
      
      if (islem === 'save') {
        cmd = 'save-all';
        baslik = '💾 Dünya Kaydedildi';
      } else if (islem === 'on') {
        cmd = 'save-on';
        baslik = '✅ Otomatik Kaydetme Aktif';
      } else if (islem === 'off') {
        cmd = 'save-off';
        baslik = '⚠️ Otomatik Kaydetme Kapalı';
      }
      
      await executeRconCommand(cmd);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(baslik)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }
];