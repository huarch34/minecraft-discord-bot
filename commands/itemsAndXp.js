const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // GIVE KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('give')
      .setDescription('Oyuncuya eşya ver (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Oyuncu adı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('esya')
          .setDescription('Eşya ID (örn: diamond, iron_sword)')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('miktar')
          .setDescription('Miktar (varsayılan: 1)')
          .setMinValue(1)
          .setMaxValue(64)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const esya = interaction.options.getString('esya');
      const miktar = interaction.options.getInteger('miktar') || 1;
      
      await executeRconCommand(`give ${oyuncu} ${esya} ${miktar}`);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🎁 Eşya Verildi')
        .addFields(
          { name: 'Oyuncu', value: oyuncu, inline: true },
          { name: 'Eşya', value: esya, inline: true },
          { name: 'Miktar', value: miktar.toString(), inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // CLEAR KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Oyuncunun envanterini temizle (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Oyuncu adı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('esya')
          .setDescription('Silinecek eşya (boş bırakılırsa tümü)')),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const esya = interaction.options.getString('esya');
      
      let cmd = `clear ${oyuncu}`;
      if (esya) cmd += ` ${esya}`;
      
      await executeRconCommand(cmd);
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🗑️ Envanter Temizlendi')
        .setDescription(`**${oyuncu}** oyuncusunun envanteri temizlendi.${esya ? `\nSilinen eşya: **${esya}**` : ''}`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // XP KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('xp')
      .setDescription('Oyuncuya XP ver veya al (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Oyuncu adı')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('miktar')
          .setDescription('XP miktarı (negatif değer alır)')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('tip')
          .setDescription('XP tipi')
          .addChoices(
            { name: 'Puan', value: 'points' },
            { name: 'Seviye', value: 'levels' }
          )),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const miktar = interaction.options.getInteger('miktar');
      const tip = interaction.options.getString('tip') || 'points';
      
      const suffix = tip === 'levels' ? 'L' : '';
      await executeRconCommand(`xp add ${oyuncu} ${miktar}${suffix}`);
      
      const embed = new EmbedBuilder()
        .setColor(miktar > 0 ? '#00ff00' : '#ff0000')
        .setTitle(miktar > 0 ? '⭐ XP Verildi' : '⚠️ XP Alındı')
        .addFields(
          { name: 'Oyuncu', value: oyuncu, inline: true },
          { name: 'Miktar', value: miktar.toString(), inline: true },
          { name: 'Tip', value: tip, inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // SUMMON KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('summon')
      .setDescription('Varlık spawn et (Yönetici)')
      .addStringOption(option =>
        option.setName('varlik')
          .setDescription('Varlık tipi (örn: zombie, creeper, villager)')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('konum')
          .setDescription('Koordinatlar (x y z) veya oyuncu adı')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const varlik = interaction.options.getString('varlik');
      const konum = interaction.options.getString('konum');
      
      await executeRconCommand(`summon ${varlik} ${konum}`);
      const embed = new EmbedBuilder()
        .setColor('#9900ff')
        .setTitle('✨ Varlık Spawn Edildi')
        .addFields(
          { name: 'Varlık', value: varlik, inline: true },
          { name: 'Konum', value: konum, inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // KILL KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('kill')
      .setDescription('Varlıkları öldür (Yönetici)')
      .addStringOption(option =>
        option.setName('hedef')
          .setDescription('Oyuncu adı veya @e (tüm varlıklar)')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const hedef = interaction.options.getString('hedef');
      await executeRconCommand(`kill ${hedef}`);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('💀 Varlık Öldürüldü')
        .setDescription(`Hedef: **${hedef}**`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // EFFECT KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('effect')
      .setDescription('Oyuncuya efekt ver (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Oyuncu adı')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('efekt')
          .setDescription('Efekt tipi (örn: speed, strength, regeneration)')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('sure')
          .setDescription('Süre (saniye)')
          .setMinValue(1))
      .addIntegerOption(option =>
        option.setName('seviye')
          .setDescription('Seviye (0-255)')
          .setMinValue(0)
          .setMaxValue(255)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      const efekt = interaction.options.getString('efekt');
      const sure = interaction.options.getInteger('sure') || 30;
      const seviye = interaction.options.getInteger('seviye') || 0;
      
      await executeRconCommand(`effect give ${oyuncu} ${efekt} ${sure} ${seviye}`);
      const embed = new EmbedBuilder()
        .setColor('#ff00ff')
        .setTitle('✨ Efekt Verildi')
        .addFields(
          { name: 'Oyuncu', value: oyuncu, inline: true },
          { name: 'Efekt', value: efekt, inline: true },
          { name: 'Süre', value: `${sure} saniye`, inline: true },
          { name: 'Seviye', value: seviye.toString(), inline: true }
        )
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },

  // EFFECTCLEAR KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('effectclear')
      .setDescription('Oyuncunun tüm efektlerini kaldır (Yönetici)')
      .addStringOption(option =>
        option.setName('oyuncu')
          .setDescription('Oyuncu adı')
          .setRequired(true)),
    
    async execute(interaction, { executeRconCommand }) {
      await interaction.deferReply();
      const oyuncu = interaction.options.getString('oyuncu');
      await executeRconCommand(`effect clear ${oyuncu}`);
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🧹 Efektler Temizlendi')
        .setDescription(`**${oyuncu}** oyuncusunun tüm efektleri kaldırıldı.`)
        .setFooter(createFooter())
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }
];