const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // DISCORD-KICK KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('discord-kick')
      .setDescription('Kullanıcıyı Discord sunucusundan at (Discord Yönetici)')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Atılacak kullanıcı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('sebep')
          .setDescription('Atılma sebebi')),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullanici = interaction.options.getMember('kullanici');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      
      try {
        await kullanici.kick(sebep);
        const embed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('⚠️ Kullanıcı Atıldı')
          .addFields(
            { name: 'Kullanıcı', value: kullanici.user.tag, inline: true },
            { name: 'Sebep', value: sebep, inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Kullanıcı atılamadı. Yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // DISCORD-BAN KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('discord-ban')
      .setDescription('Kullanıcıyı Discord sunucusundan yasakla (Discord Yönetici)')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Yasaklanacak kullanıcı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('sebep')
          .setDescription('Yasaklama sebebi'))
      .addIntegerOption(option =>
        option.setName('mesaj-sil')
          .setDescription('Son kaç günün mesajları silinsin? (0-7)')
          .setMinValue(0)
          .setMaxValue(7)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullanici = interaction.options.getMember('kullanici');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      const mesajSil = interaction.options.getInteger('mesaj-sil') || 0;
      
      try {
        await kullanici.ban({ 
          reason: sebep,
          deleteMessageSeconds: mesajSil * 24 * 60 * 60
        });
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🔨 Kullanıcı Yasaklandı')
          .addFields(
            { name: 'Kullanıcı', value: kullanici.user.tag, inline: true },
            { name: 'Sebep', value: sebep, inline: true },
            { name: 'Mesaj Silme', value: `${mesajSil} gün`, inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Kullanıcı yasaklanamadı. Yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // DISCORD-UNBAN KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('discord-unban')
      .setDescription('Kullanıcının Discord yasağını kaldır (Discord Yönetici)')
      .addStringOption(option =>
        option.setName('kullanici-id')
          .setDescription('Yasağı kaldırılacak kullanıcının ID\'si')
          .setRequired(true)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullaniciId = interaction.options.getString('kullanici-id');
      
      try {
        await interaction.guild.members.unban(kullaniciId);
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Yasak Kaldırıldı')
          .setDescription(`<@${kullaniciId}> kullanıcısının yasağı kaldırıldı.`)
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Yasak kaldırılamadı. ID veya yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // TIMEOUT KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('Kullanıcıyı sustur (Discord Yönetici)')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Susturulacak kullanıcı')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('sure')
          .setDescription('Süre (dakika)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(40320))
      .addStringOption(option =>
        option.setName('sebep')
          .setDescription('Susturma sebebi')),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullanici = interaction.options.getMember('kullanici');
      const sure = interaction.options.getInteger('sure');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      
      try {
        await kullanici.timeout(sure * 60 * 1000, sebep);
        const embed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('🔇 Kullanıcı Susturuldu')
          .addFields(
            { name: 'Kullanıcı', value: kullanici.user.tag, inline: true },
            { name: 'Süre', value: `${sure} dakika`, inline: true },
            { name: 'Sebep', value: sebep, inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Kullanıcı susturulamadı. Yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // TIMEOUT-KALDIR KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('timeout-kaldir')
      .setDescription('Kullanıcının susturmasını kaldır (Discord Yönetici)')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Susturması kaldırılacak kullanıcı')
          .setRequired(true)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullanici = interaction.options.getMember('kullanici');
      
      try {
        await kullanici.timeout(null);
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Susturma Kaldırıldı')
          .setDescription(`${kullanici} kullanıcısının susturması kaldırıldı.`)
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Susturma kaldırılamadı. Yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // NICK KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('nick')
      .setDescription('Kullanıcının ismini değiştir (Discord Yönetici)')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('İsmi değiştirilecek kullanıcı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('yeni-isim')
          .setDescription('Yeni kullanıcı ismi')
          .setRequired(true)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullanici = interaction.options.getMember('kullanici');
      const yeniIsim = interaction.options.getString('yeni-isim');
      
      try {
        const eskiIsim = kullanici.displayName;
        await kullanici.setNickname(yeniIsim);
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('✅ İsim Değiştirildi')
          .addFields(
            { name: 'Kullanıcı', value: kullanici.user.tag, inline: true },
            { name: 'Eski İsim', value: eskiIsim, inline: true },
            { name: 'Yeni İsim', value: yeniIsim, inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('İsim değiştirilemedi. Yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  }
];