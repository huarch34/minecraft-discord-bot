const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // ROL-VER KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('rol-ver')
      .setDescription('Kullanıcıya rol ver (Discord Yönetici)')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Rol verilecek kullanıcı')
          .setRequired(true))
      .addRoleOption(option =>
        option.setName('rol')
          .setDescription('Verilecek rol')
          .setRequired(true)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullanici = interaction.options.getMember('kullanici');
      const rol = interaction.options.getRole('rol');
      
      try {
        await kullanici.roles.add(rol);
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Rol Verildi')
          .setDescription(`${kullanici} kullanıcısına ${rol} rolü verildi.`)
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Rol verilemedi. Botun yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // ROL-AL KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('rol-al')
      .setDescription('Kullanıcıdan rol al (Discord Yönetici)')
      .addUserOption(option =>
        option.setName('kullanici')
          .setDescription('Rolü alınacak kullanıcı')
          .setRequired(true))
      .addRoleOption(option =>
        option.setName('rol')
          .setDescription('Alınacak rol')
          .setRequired(true)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const kullanici = interaction.options.getMember('kullanici');
      const rol = interaction.options.getRole('rol');
      
      try {
        await kullanici.roles.remove(rol);
        const embed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('⚠️ Rol Alındı')
          .setDescription(`${kullanici} kullanıcısından ${rol} rolü alındı.`)
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Rol alınamadı. Botun yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // ROL-OLUSTUR KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('rol-olustur')
      .setDescription('Yeni rol oluştur (Discord Yönetici)')
      .addStringOption(option =>
        option.setName('isim')
          .setDescription('Rol ismi')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('renk')
          .setDescription('Rol rengi (HEX kodu, örn: #FF0000)'))
      .addBooleanOption(option =>
        option.setName('goruntule')
          .setDescription('Rol ayrı görüntülensin mi?')),
    
    async execute(interaction) {
      await interaction.deferReply();
      const isim = interaction.options.getString('isim');
      const renk = interaction.options.getString('renk');
      const goruntule = interaction.options.getBoolean('goruntule') || false;
      
      try {
        const roleData = {
          name: isim,
          hoist: goruntule,
          reason: `${interaction.user.tag} tarafından oluşturuldu`
        };
        
        if (renk) {
          roleData.color = renk;
        }
        
        const yeniRol = await interaction.guild.roles.create(roleData);
        
        const embed = new EmbedBuilder()
          .setColor(yeniRol.hexColor)
          .setTitle('✅ Rol Oluşturuldu')
          .setDescription(`${yeniRol} rolü başarıyla oluşturuldu!`)
          .addFields(
            { name: 'Rol ID', value: yeniRol.id, inline: true },
            { name: 'Renk', value: yeniRol.hexColor, inline: true },
            { name: 'Ayrı Görüntüleme', value: goruntule ? 'Evet' : 'Hayır', inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Rol oluşturulamadı. Botun yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // ROL-SIL KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('rol-sil')
      .setDescription('Rol sil (Discord Yönetici)')
      .addRoleOption(option =>
        option.setName('rol')
          .setDescription('Silinecek rol')
          .setRequired(true)),
    
    async execute(interaction) {
      await interaction.deferReply();
      const rol = interaction.options.getRole('rol');
      
      try {
        await rol.delete(`${interaction.user.tag} tarafından silindi`);
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🗑️ Rol Silindi')
          .setDescription(`**${rol.name}** rolü başarıyla silindi.`)
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Rol silinemedi. Botun yetkileri veya rol hiyerarşisi kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },

  // ROL-DUZENLE KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('rol-duzenle')
      .setDescription('Rol düzenle (Discord Yönetici)')
      .addRoleOption(option =>
        option.setName('rol')
          .setDescription('Düzenlenecek rol')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('yeni-isim')
          .setDescription('Yeni rol ismi'))
      .addStringOption(option =>
        option.setName('yeni-renk')
          .setDescription('Yeni renk (HEX kodu, örn: #00FF00)')),
    
    async execute(interaction) {
      await interaction.deferReply();
      const rol = interaction.options.getRole('rol');
      const yeniIsim = interaction.options.getString('yeni-isim');
      const yeniRenk = interaction.options.getString('yeni-renk');
      
      try {
        const updates = {};
        if (yeniIsim) updates.name = yeniIsim;
        if (yeniRenk) updates.color = yeniRenk;
        
        await rol.edit(updates);
        
        const embed = new EmbedBuilder()
          .setColor(rol.hexColor)
          .setTitle('✅ Rol Düzenlendi')
          .setDescription(`${rol} rolü başarıyla güncellendi!`)
          .addFields(
            { name: 'Yeni İsim', value: yeniIsim || 'Değiştirilmedi', inline: true },
            { name: 'Yeni Renk', value: yeniRenk || 'Değiştirilmedi', inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Hata')
          .setDescription('Rol düzenlenemedi. Botun yetkileri kontrol edin.')
          .setFooter(createFooter())
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    }
  }
];