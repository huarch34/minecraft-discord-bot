const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sunucu')
    .setDescription('Minecraft sunucu durumunu gösterir'),
  
  async execute(interaction, { checkServerStatus, serverStatus, config }) {
    await interaction.deferReply();
    await checkServerStatus();
    
    const embed = new EmbedBuilder()
      .setColor(serverStatus.online ? '#00ff00' : '#ff0000')
      .setTitle('Minecraft Sunucu Durumu')
      .setThumbnail('https://media.discordapp.net/attachments/1432059191484485854/1432898632218054786/wio.png?ex=6902ba57&is=690168d7&hm=76cf2c6ed56adbab5ac09e2a616b2b55a07831f64c60777ea4a0e3a108a94dc4&=&format=webp&quality=lossless&width=968&height=968')
      .addFields(
        { 
          name: '📊 Durum', 
          value: serverStatus.online ? '```✅ Çevrimiçi```' : '```❌ Çevrimdışı```', 
          inline: true 
        },
        { 
          name: '⏰ Son Kontrol', 
          value: serverStatus.lastCheck ? `<t:${Math.floor(serverStatus.lastCheck.getTime() / 1000)}:R>` : '`Bilinmiyor`', 
          inline: true 
        },
        { 
          name: '🌐 Sunucu IP', 
          value: `\`\`\`${config.serverIP}\`\`\`\n*IP'yi kopyalayıp Minecraft'ta kullanabilirsiniz*`, 
          inline: false 
        },
        { 
          name: '🔗 Website', 
          value: `[🌐 ${config.website.replace('https://', '').replace('http://', '')}](${config.website})\n*Websitemizi ziyaret edin!*`, 
          inline: false 
        }
      )
      .setFooter({
        text: '💻 Developed by Huarch | github.com/Huarch',
        iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png?ex=6902ce52&is=69017cd2&hm=7f84cd3a505f93d57156904c9c463ac51837b3aba34fc89b93341e046493e49c&=&format=webp&quality=lossless&width=968&height=968'
      })
      .setTimestamp();
    
    if (serverStatus.online && serverStatus.maxPlayers > 0) {
      const percentage = Math.round((serverStatus.players / serverStatus.maxPlayers) * 100);
      const filled = Math.round(percentage / 10);
      const empty = 10 - filled;
      
      const filledBars = Math.max(0, Math.min(10, filled));
      const emptyBars = Math.max(0, Math.min(10, empty));
      
      const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
    }
    
    await interaction.editReply({ embeds: [embed] });
  }
};