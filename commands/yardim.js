const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yardim')
    .setDescription('Bot komutlarını gösterir'),
  
  async execute(interaction, { hasPermission, config }) {
    await interaction.deferReply();
    const isAdmin = hasPermission(interaction.member, 'admin');
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📖 Minecraft Bot Komutları')
      .setDescription(isAdmin ? 
        '✅ Yönetici olarak tüm komutları kullanabilirsiniz!' : 
        'Kullanabileceğiniz komutlar:')
      .addFields(
        { 
          name: '🎮 Genel Komutlar (Herkes)', 
          value: '`/sunucu` - Sunucu durumu\n`/oyuncular` - Aktif oyuncular\n`/hesabim` - Minecraft hesap bilgileriniz\n`/yardim` - Bu mesaj',
          inline: false 
        }
      );
    
    if (isAdmin) {
      embed.addFields(
        { 
          name: '👥 Oyuncu Yönetimi (Yönetici)', 
          value: '`/kick` `/ban` `/banip` `/pardon` `/pardonip`\n`/op` `/deop` `/gamemode` `/tp`',
          inline: false 
        },
        { 
          name: '🔐 Whitelist (Yönetici)', 
          value: '`/whitelist ekle/cikar/liste/ac/kapat`',
          inline: false 
        },
        { 
          name: '🌍 Dünya Yönetimi (Yönetici)', 
          value: '`/weather` `/time` `/timeset` `/difficulty`\n`/setworldspawn` `/seed` `/save`',
          inline: false 
        },
        { 
          name: '🎁 Eşya & XP (Yönetici)', 
          value: '`/give` `/clear` `/xp`',
          inline: false 
        },
        { 
          name: '✨ Efektler & Varlıklar (Yönetici)', 
          value: '`/effect` `/effectclear` `/summon` `/kill`',
          inline: false 
        },
        { 
          name: '💬 Mesajlaşma (Yönetici)', 
          value: '`/duyuru` `/msg` `/title`',
          inline: false 
        },
        { 
          name: '⚙️ Sunucu (Yönetici)', 
          value: '`/stop` `/komut`',
          inline: false 
        },
        { 
          name: '🎭 Discord - Rol Yönetimi (Yönetici)', 
          value: '`/rol-ver` `/rol-al` `/rol-olustur` `/rol-sil` `/rol-duzenle`',
          inline: false 
        },
        { 
          name: '👤 Discord - Üye Yönetimi (Yönetici)', 
          value: '`/discord-kick` `/discord-ban` `/discord-unban`\n`/timeout` `/timeout-kaldir` `/nick`',
          inline: false 
        },
        { 
          name: '📁 Discord - Kanal Yönetimi (Yönetici)', 
          value: '`/kanal-olustur` `/kanal-sil` `/kanal-duzenle` `/temizle`',
          inline: false 
        },
        { 
          name: '📢 Discord - Duyuru (Yönetici)', 
          value: '`/discord-duyuru` `/dm-gonder`',
          inline: false 
        },
        { 
          name: 'ℹ️ Discord - Bilgi (Herkes)', 
          value: '`/sunucu-bilgi` `/kullanici-bilgi` `/avatar`',
          inline: false 
        }
      );
    } else {
      embed.addFields(
        { 
          name: 'ℹ️ Discord Bilgi Komutları (Herkes)', 
          value: '`/sunucu-bilgi` - Discord sunucu bilgileri\n`/kullanici-bilgi` - Kullanıcı bilgileri\n`/avatar` - Avatar göster',
          inline: false 
        },
        { 
          name: '🔒 Yönetici Komutları', 
          value: 'Yönetici komutlarını kullanabilmek için <@&' + config.roles.admin + '> rolüne sahip olmalısınız.',
          inline: false 
        }
      );
    }
    
    embed.setFooter({
      text: '💻 Developed by Huarch | github.com/Huarch',
      iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
    })
    .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }
};