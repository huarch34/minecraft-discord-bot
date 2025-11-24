const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // KANAL-OLUSTUR KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('kanal-olustur')
      .setDescription('Yeni kanal oluştur (Discord Yönetici)')
      .addStringOption(option =>
        option.setName('isim')
          .setDescription('Kanal ismi')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('tip')
          .setDescription('Kanal tipi')
          .setRequired(true)
          .addChoices(
            { name: '💬 Metin Kanalı', value: 'text' },
            { name: '🔊 Ses Kanalı', value: 'voice' },
            { name: '📁 Kategori', value: 'category' }
          )),
    
    async execute(interaction) {
      await interaction.deferReply();
      const isim = interaction.options.getString('isim');
      const tip = interaction.options.getString('tip');
      
      try {
        let channelType;
        if (tip === 'text') channelType = 0;
        else if (tip === 'voice') channelType = 2;
        else if (tip === 'category') channelType = 4;
        
        const yeniKanal = await interaction.guild.channels.create({
          name: isim,
          type: channelType,
          reason: `${interaction.user.tag} tarafından oluşturuldu`
        });
        
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Kanal Oluşturuldu')
          .setDescription(`${yeniKanal} başarıyla oluşturuldu!`)
          .addFields(
            { name: 'Kanal Tipi', value: tip === 'text' ? '💬 Metin' : tip === 'voice' ? '🔊 Ses' : '📁 Kategori', inline: true },
            { name: 'Kanal ID', value: yeniKanal.id, inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Kanal oluşturulamadı. Botun yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // KANAL-SIL KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('kanal-sil')
      .setDescription('Kanal sil (Discord Yönetici)')
      .addChannelOption(option =>
        option.setName('kanal')
          .setDescription('Silinecek kanal')
          .setRequired(true)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kanal = interaction.options.getChannel('kanal');
      
      try {
        await kanal.delete(`${interaction.user.tag} tarafından silindi`);
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🗑️ Kanal Silindi')
          .setDescription(`**${kanal.name}** kanalı başarıyla silindi.`)
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Kanal silinemedi. Botun yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // KANAL-DUZENLE KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('kanal-duzenle')
      .setDescription('Kanal düzenle (Discord Yönetici)')
      .addChannelOption(option =>
        option.setName('kanal')
          .setDescription('Düzenlenecek kanal')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('yeni-isim')
          .setDescription('Yeni kanal ismi'))
      .addStringOption(option =>
        option.setName('konu')
          .setDescription('Kanal konusu/açıklaması')),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kanal = interaction.options.getChannel('kanal');
      const yeniIsim = interaction.options.getString('yeni-isim');
      const konu = interaction.options.getString('konu');
      
      try {
        const updates = {};
        if (yeniIsim) updates.name = yeniIsim;
        if (konu) updates.topic = konu;
        
        await kanal.edit(updates);
        
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('✅ Kanal Düzenlendi')
          .setDescription(`${kanal} kanalı başarıyla güncellendi!`)
          .addFields(
            { name: 'Yeni İsim', value: yeniIsim || 'Değiştirilmedi', inline: true },
            { name: 'Yeni Konu', value: konu || 'Değiştirilmedi', inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Kanal düzenlenemedi. Botun yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // TEMIZLE KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('temizle')
      .setDescription('Belirtilen sayıda mesaj sil (Discord Yönetici)')
      .addIntegerOption(option =>
        option.setName('adet')
          .setDescription('Silinecek mesaj sayısı (1-100)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(100)),
    
    async execute(interaction) {
      await interaction.deferReply({ flags: 64 });
      const adet = interaction.options.getInteger('adet');
      
      try {
        const botPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);
        
        if (!botPermissions.has('ManageMessages')) {
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Yetki Hatası')
            .setDescription('Botun bu kanalda **Mesajları Yönet** yetkisi yok!')
            .setFooter(createFooter())
            .setTimestamp();
          
          return await interaction.editReply({ embeds: [embed] });
        }
        
        const fetchedMessages = await interaction.channel.messages.fetch({ limit: adet });
        
        if (fetchedMessages.size === 0) {
          const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('⚠️ Uyarı')
            .setDescription('Kanalda silinecek mesaj bulunamadı.')
            .setFooter(createFooter())
            .setTimestamp();
          
          return await interaction.editReply({ embeds: [embed] });
        }
        
        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        const deletableMessages = fetchedMessages.filter(msg => msg.createdTimestamp > twoWeeksAgo);
        
        if (deletableMessages.size === 0) {
          const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('⚠️ Uyarı')
            .setDescription('Tüm mesajlar 14 günden eski! Discord API 14 günden eski mesajları toplu olarak silmeye izin vermez.')
            .setFooter(createFooter())
            .setTimestamp();
          
          return await interaction.editReply({ embeds: [embed] });
        }
        
        const deletedMessages = await interaction.channel.bulkDelete(deletableMessages, true);
        
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🧹 Mesajlar Temizlendi')
          .setDescription(
            `**${deletedMessages.size}** mesaj başarıyla silindi.` +
            (fetchedMessages.size > deletedMessages.size 
              ? `\n\n⚠️ **${fetchedMessages.size - deletedMessages.size}** mesaj silinemedi (muhtemelen 14 günden eski).` 
              : '')
          )
          .setFooter(createFooter())
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (e) {
            console.log('Bot mesajı silinemedi:', e.message);
          }
        }, 5000);
        
      } catch (error) {
        console.error('❌ Mesaj silme hatası:', error);
        
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription(
            `Mesajlar silinemedi.\n\n` +
            `**Hata Kodu:** ${error.code || 'Bilinmiyor'}\n` +
            `**Hata Mesajı:** ${error.message}`
          )
          .setFooter(createFooter())
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      }
    }
  }
];