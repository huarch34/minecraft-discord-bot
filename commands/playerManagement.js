const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Ortak footer oluşturma fonksiyonu
const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // KICK KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Oyuncuyu sunucudan at (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Minecraft kullanıcı adı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('sebep')
          .setDescription('Atılma sebebi')),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      await executeRconCommand(`kick ${oyuncu} ${sebep}`);
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ Oyuncu Atıldı')
        .addFields(
          { name: 'Oyuncu', value: oyuncu, inline: true },
          { name: 'Sebep', value: sebep, inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // BAN KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Oyuncuyu kalıcı olarak yasakla (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Minecraft kullanıcı adı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('sebep')
          .setDescription('Yasaklama sebebi')),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      await executeRconCommand(`ban ${oyuncu} ${sebep}`);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔨 Oyuncu Yasaklandı')
        .addFields(
          { name: 'Oyuncu', value: oyuncu, inline: true },
          { name: 'Sebep', value: sebep, inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // BANIP KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('banip')
      .setDescription('IP adresini yasakla (Yönetici)')
      .addStringOption(option =>
        option.setName('ip')
          .setDescription('IP adresi veya oyuncu adı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('sebep')
          .setDescription('Yasaklama sebebi')),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const ip = interaction.options.getString('ip');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      await executeRconCommand(`ban-ip ${ip} ${sebep}`);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔨 IP Yasaklandı')
        .addFields(
          { name: 'IP', value: ip, inline: true },
          { name: 'Sebep', value: sebep, inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // PARDON KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('pardon')
      .setDescription('Oyuncunun yasağını kaldır (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Minecraft kullanıcı adı')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      await executeRconCommand(`pardon ${oyuncu}`);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Yasak Kaldırıldı')
        .setDescription(`**${oyuncu}** artık sunucuya girebilir.`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // PARDONIP KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('pardonip')
      .setDescription('IP yasağını kaldır (Yönetici)')
      .addStringOption(option =>
        option.setName('ip')
          .setDescription('IP adresi')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const ip = interaction.options.getString('ip');
      await executeRconCommand(`pardon-ip ${ip}`);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ IP Yasağı Kaldırıldı')
        .setDescription(`**${ip}** IP'si yasağı kaldırıldı.`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // OP KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('op')
      .setDescription('Oyuncuya operatör yetkisi ver (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Minecraft kullanıcı adı')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      await executeRconCommand(`op ${oyuncu}`);
      const embed = new EmbedBuilder()
        .setColor('#ffff00')
        .setTitle('⭐ OP Verildi')
        .setDescription(`**${oyuncu}** artık operatör.`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // DEOP KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('deop')
      .setDescription('Oyuncunun operatör yetkisini kaldır (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Minecraft kullanıcı adı')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      await executeRconCommand(`deop ${oyuncu}`);
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ OP Kaldırıldı')
        .setDescription(`**${oyuncu}** artık operatör değil.`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // GAMEMODE KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('gamemode')
      .setDescription('Oyun modunu değiştir (Yönetici)')
      .addStringOption(option =>
        option.setName('mod')
          .setDescription('Oyun modu')
          .setRequired(true)
          .addChoices(
            { name: 'Survival', value: 'survival' },
            { name: 'Creative', value: 'creative' },
            { name: 'Adventure', value: 'adventure' },
            { name: 'Spectator', value: 'spectator' }
          ))
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Oyuncu adı (boş bırakılırsa tüm oyuncular)')),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const mod = interaction.options.getString('mod');
      const oyuncu = interaction.options.getString('oyuncu') || '@a';
      await executeRconCommand(`gamemode ${mod} ${oyuncu}`);
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🎮 Oyun Modu Değiştirildi')
        .addFields(
          { name: 'Mod', value: mod, inline: true },
          { name: 'Oyuncu', value: oyuncu, inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // TP KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('tp')
      .setDescription('Oyuncuyu teleport et (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Teleport edilecek oyuncu')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('hedef')
          .setDescription('Hedef oyuncu veya koordinatlar (x y z)')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const hedef = interaction.options.getString('hedef');
      await executeRconCommand(`tp ${oyuncu} ${hedef}`);
      const embed = new EmbedBuilder()
        .setColor('#9900ff')
        .setTitle('🌀 Teleport')
        .setDescription(`**${oyuncu}** → **${hedef}** teleport edildi.`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }
];