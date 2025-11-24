const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // SUNUCU-BILGI KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('sunucu-bilgi')
      .setDescription('Discord sunucu bilgilerini göster'),
    
    async execute(interaction) {
      await interaction.deferReply();
      const guild = interaction.guild;
      
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${guild.name} - Sunucu Bilgileri`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '👑 Sahip', value: `<@${guild.ownerId}>`, inline: true },
          { name: '📅 Oluşturulma', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '👥 Üye Sayısı', value: guild.memberCount.toString(), inline: true },
          { name: '💬 Kanal Sayısı', value: guild.channels.cache.size.toString(), inline: true },
          { name: '🎭 Rol Sayısı', value: guild.roles.cache.size.toString(), inline: true },
          { name: '😊 Emoji Sayısı', value: guild.emojis.cache.size.toString(), inline: true },
          { name: '🆔 Sunucu ID', value: guild.id, inline: false }
        )
        .setFooter(createFooter())
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // KULLANICI-BILGI KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('kullanici-bilgi')
      .setDescription('Kullanıcı bilgilerini göster')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Bilgileri görüntülenecek kullanıcı')),
    
    async execute(interaction) {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici') || interaction.user;
      const member = interaction.guild.members.cache.get(user.id);
      
      const embed = new EmbedBuilder()
        .setColor(member?.displayHexColor || '#5865F2')
        .setTitle(`👤 ${user.tag} - Kullanıcı Bilgileri`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '🆔 ID', value: user.id, inline: false },
          { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '🔥 Sunucuya Katılma', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Bilinmiyor', inline: true },
          { name: '🤖 Bot mu?', value: user.bot ? 'Evet' : 'Hayır', inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      
      if (member) {
        const roles = member.roles.cache
          .filter(role => role.id !== interaction.guild.id)
          .sort((a, b) => b.position - a.position)
          .map(role => role.toString())
          .slice(0, 10);
        
        if (roles.length > 0) {
          embed.addFields({
            name: `🎭 Roller (${member.roles.cache.size - 1})`,
            value: roles.join(', ') + (member.roles.cache.size > 11 ? '...' : ''),
            inline: false
          });
        }
      }
      
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // AVATAR KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription('Kullanıcının avatarını göster')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Avatarı görüntülenecek kullanıcı')),
    
    async execute(interaction) {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici') || interaction.user;
      
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🖼️ ${user.tag} - Avatar`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setDescription(`[PNG](${user.displayAvatarURL({ extension: 'png', size: 1024 })}) | [JPG](${user.displayAvatarURL({ extension: 'jpg', size: 1024 })}) | [WEBP](${user.displayAvatarURL({ extension: 'webp', size: 1024 })})`)
        .setFooter(createFooter())
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // DISCORD-DUYURU KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('discord-duyuru')
      .setDescription('Discord kanalına profesyonel duyuru gönder (Discord Yönetici)')
      .addChannelOption(option =>
        option.setName('kanal')
          .setDescription('Duyuru gönderilecek kanal')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('mesaj')
          .setDescription('Duyuru mesajı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('baslik')
          .setDescription('Duyuru başlığı'))
      .addStringOption(option =>
        option.setName('tip')
          .setDescription('Duyuru tipi')
          .addChoices(
            { name: '📢 Genel Duyuru', value: 'genel' },
            { name: '🔔 Güncelleme', value: 'guncelleme' },
            { name: '⚠️ Önemli', value: 'onemli' },
            { name: '🎉 Etkinlik', value: 'etkinlik' },
            { name: '🛠️ Bakım', value: 'bakim' },
            { name: '✨ Yeni Özellik', value: 'ozellik' }
          ))
      .addStringOption(option =>
        option.setName('resim')
          .setDescription('Duyuru görseli URL (opsiyonel)'))
      .addBooleanOption(option =>
        option.setName('everyone')
          .setDescription('@everyone etiketlensin mi?')),
    
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true });
      const kanal = interaction.options.getChannel('kanal');
      const mesaj = interaction.options.getString('mesaj');
      const baslik = interaction.options.getString('baslik');
      const tip = interaction.options.getString('tip') || 'genel';
      const resim = interaction.options.getString('resim');
      const everyone = interaction.options.getBoolean('everyone') || false;
      
      // Duyuru tipine göre renk ve ikon belirleme
      const tipConfig = {
        genel: { color: '#5865F2', icon: '📢', title: 'Duyuru' },
        guncelleme: { color: '#57F287', icon: '🔔', title: 'Güncelleme' },
        onemli: { color: '#ED4245', icon: '⚠️', title: 'Önemli Duyuru' },
        etkinlik: { color: '#FEE75C', icon: '🎉', title: 'Etkinlik Duyurusu' },
        bakim: { color: '#EB459E', icon: '🛠️', title: 'Bakım Bildirimi' },
        ozellik: { color: '#00D9FF', icon: '✨', title: 'Yeni Özellik' }
      };
      
      const config = tipConfig[tip];
      
      try {
        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setTitle(baslik ? `${config.icon} ${baslik}` : `${config.icon} ${config.title}`)
          .setDescription(mesaj)
          .setAuthor({
            name: `${interaction.guild.name} Yönetimi`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          })
          .addFields({
            name: '👤 Duyuran',
            value: `<@${interaction.user.id}>`,
            inline: true
          })
          .setFooter({
            text: `${interaction.guild.name} • Resmi Duyuru`,
            iconURL: interaction.guild.iconURL()
          })
          .setTimestamp();
        
        if (resim) {
          embed.setImage(resim);
        }
        
        // Thumbnail olarak sunucu ikonu
        embed.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }));
        
        const messageContent = everyone ? '@everyone' : '';
        await kanal.send({ 
          content: messageContent,
          embeds: [embed] 
        });
        
        const confirmEmbed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Duyuru Başarıyla Gönderildi')
          .setDescription(`${kanal} kanalına profesyonel duyuru gönderildi!`)
          .addFields(
            { name: '📝 Duyuru Tipi', value: config.title, inline: true },
            { name: '📍 Kanal', value: kanal.toString(), inline: true },
            { name: '🔔 Everyone', value: everyone ? 'Evet' : 'Hayır', inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [confirmEmbed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Duyuru Gönderilemedi')
          .setDescription('Duyuru gönderilirken bir hata oluştu.')
          .addFields({
            name: '🔍 Olası Sebepler',
            value: '• Botun kanala mesaj gönderme yetkisi yok\n• Kanal geçersiz veya silinmiş\n• Resim URL\'si hatalı olabilir'
          })
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },
  // DM-GONDER KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('dm-gonder')
      .setDescription('Kullanıcıya özel mesaj gönder (Discord Yönetici)')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Mesaj gönderilecek kullanıcı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('mesaj')
          .setDescription('Gönderilecek mesaj')
          .setRequired(true)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullanici = interaction.options.getUser('kullanici');
      const mesaj = interaction.options.getString('mesaj');
      
      try {
        await kullanici.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#0099ff')
              .setTitle('💬 Yöneticiden Mesaj')
              .setDescription(mesaj)
              .setFooter({
                text: `Gönderen: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              })
              .setTimestamp()
          ]
        });
        
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ DM Gönderildi')
          .setDescription(`${kullanici.tag} kullanıcısına özel mesaj gönderildi!`)
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Mesaj gönderilemedi. Kullanıcı DM\'leri kapalı olabilir.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  }
];