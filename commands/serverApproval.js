const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const createFooter = () => ({
  text: '💻 Developed by Huarch | github.com/Huarch',
  iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
});

module.exports = [
  // SUNUCU-ONAYLA KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('sunucu-onayla')
      .setDescription('Bir sunucuyu botun kullanımı için onayla (Sadece Bot Sahibi)')
      .addStringOption(option =>
        option.setName('sunucu-id').setDescription('Onaylanacak sunucu ID\'si').setRequired(true)),
    
    async execute(interaction, { config, client }) {
      await interaction.deferReply({ flags: 64 });
      const guildId = interaction.options.getString('sunucu-id');
      const guild = client.guilds.cache.get(guildId);
      
      if (!guild) {
        return await interaction.editReply({ content: '❌ Sunucu bulunamadı!' });
      }
      
      config.approvedGuilds.add(guildId);
      
      let channelMessageSent = false;
      let ownerDmSent = false;
      
      try {
        const channel = guild.systemChannel || guild.channels.cache.find(c => 
          c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages')
        );
        
        if (channel) {
          await channel.send({ embeds: [new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Sunucu Onaylandı!')
            .setDescription('Artık tüm komutları kullanabilirsiniz! `/yardim` ile başlayın.')
            .addFields(
              { name: '🌐 Minecraft Sunucu', value: `\`${config.serverIP}\``, inline: true },
              { name: '📋 İlk Adım', value: 'Discord\'da `/yardim` yazın', inline: true }
            )
            .setFooter(createFooter())
            .setTimestamp()] });
          channelMessageSent = true;
        }
      } catch (channelError) {
        console.log(`⚠️ Sunucuya mesaj gönderilemedi: ${channelError.message}`);
      }
      
      try {
        const owner = await guild.fetchOwner();
        await owner.send({ embeds: [new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle(`✅ ${guild.name} - Sunucu Onaylandı!`)
          .setDescription(
            `Merhaba **${owner.user.username}**! Sunucunuz bot kullanımı için onaylandı!\n\n` +
            `🎮 Artık Discord sunucunuzda \`/yardim\` komutu ile tüm komutlara erişebilirsiniz.`
          )
          .addFields(
            { name: '🏷️ Sunucu', value: guild.name, inline: true },
            { name: '👥 Üye Sayısı', value: guild.memberCount.toString(), inline: true },
            { name: '🌐 Minecraft IP', value: `\`${config.serverIP}\``, inline: false }
          )
          .setFooter(createFooter())
          .setTimestamp()] });
        ownerDmSent = true;
      } catch (dmError) {
        console.error(`❌ Sunucu sahibine DM gönderilemedi: ${dmError.message}`);
      }
      
      const statusMessages = [];
      if (channelMessageSent) statusMessages.push('✅ Sunucu kanalına bildirim gönderildi');
      if (ownerDmSent) statusMessages.push('✅ Sunucu sahibine DM gönderildi');
      
      if (statusMessages.length === 0) {
        statusMessages.push('⚠️ Hiçbir bildirim gönderilemedi (yetki/DM sorunu)');
      }
      
      await interaction.editReply({ 
        content: 
          `✅ **${guild.name}** başarıyla onaylandı!\n\n` +
          `📊 **Bildirim Durumu:**\n${statusMessages.join('\n')}\n\n` +
          `👥 **Üye Sayısı:** ${guild.memberCount}\n` +
          `👑 **Sunucu Sahibi:** <@${guild.ownerId}>`
      });
    }
  },

  // SUNUCU-REDDET KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('sunucu-reddet')
      .setDescription('Bir sunucunun onayını kaldır (Sadece Bot Sahibi)')
      .addStringOption(option =>
        option.setName('sunucu-id').setDescription('Onayı kaldırılacak sunucu ID\'si').setRequired(true)),
    
    async execute(interaction, { config, client }) {
      await interaction.deferReply({ flags: 64 });
      const guildId = interaction.options.getString('sunucu-id');
      const guild = client.guilds.cache.get(guildId);
      
      if (!guild) {
        return await interaction.editReply({ content: '❌ Sunucu bulunamadı!' });
      }
      
      const guildName = guild.name;
      config.approvedGuilds.delete(guildId);
      
      await interaction.editReply({ content: `❌ **${guildName}** onayı kaldırıldı ve sunucudan ayrılıyorum...` });
      
      try {
        await guild.leave();
        console.log(`✅ ${guildName} sunucusundan ayrıldım`);
      } catch (error) {
        console.error('Sunucudan ayrılma hatası:', error);
      }
    }
  },

  // ONAYLANMIS-SUNUCULAR KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('onaylanmis-sunucular')
      .setDescription('Onaylanmış sunucuları listele (Sadece Bot Sahibi)'),
    
    async execute(interaction, { config, client, isGuildApproved }) {
      await interaction.deferReply({ flags: 64 });
      const approved = client.guilds.cache.filter(g => isGuildApproved(g.id));
      
      if (approved.size === 0) {
        return await interaction.editReply({ content: '⚠️ Henüz onaylanmış sunucu yok.' });
      }
      
      const list = approved.map(g => `**${g.name}** (\`${g.id}\`) - ${g.memberCount} üye`).join('\n');
      await interaction.editReply({ content: `✅ **Onaylı Sunucular (${approved.size}):**\n\n${list}` });
    }
  },

  // ONAY-BEKLEYENLER KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('onay-bekleyenler')
      .setDescription('Onay bekleyen sunucuları listele (Sadece Bot Sahibi)'),
    
    async execute(interaction, { client, isGuildApproved, config }) {
      await interaction.deferReply({ flags: 64 });
      const pending = client.guilds.cache.filter(g => !isGuildApproved(g.id));
      
      if (pending.size === 0) {
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Tüm Sunucular Onaylı!')
          .setDescription('Şu anda onay bekleyen sunucu bulunmuyor.')
          .addFields(
            { name: '📊 Toplam Sunucu', value: client.guilds.cache.size.toString(), inline: true },
            { name: '✅ Onaylı', value: config.approvedGuilds.size.toString(), inline: true },
            { name: '⏳ Bekleyen', value: '0', inline: true }
          )
          .setFooter(createFooter())
          .setTimestamp();
        
        return await interaction.editReply({ embeds: [embed] });
      }
      
      const sortedPending = pending.sort((a, b) => b.memberCount - a.memberCount);
      
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⏳ Onay Bekleyen Sunucular')
        .setDescription(
          `**${pending.size}** sunucu bot kullanımı için onayınızı bekliyor.\n` +
          `Aşağıdaki komutlarla işlem yapabilirsiniz.`
        )
        .addFields(
          { 
            name: '📊 Genel İstatistikler', 
            value: 
              `**Toplam Sunucu:** ${client.guilds.cache.size}\n` +
              `**✅ Onaylı:** ${config.approvedGuilds.size}\n` +
              `**⏳ Bekleyen:** ${pending.size}\n` +
              `**👥 Bekleyen Toplam Üye:** ${sortedPending.reduce((acc, g) => acc + g.memberCount, 0)}`,
            inline: false 
          }
        );
      
      const guildsToShow = sortedPending.first(5);
      
      for (const [index, guild] of guildsToShow.entries()) {
        const owner = await guild.fetchOwner().catch(() => null);
        const createdAt = Math.floor(guild.createdTimestamp / 1000);
        const botJoinedAt = guild.members.me ? Math.floor(guild.members.me.joinedTimestamp / 1000) : null;
        
        embed.addFields({
          name: `${index + 1}. ${guild.name}`,
          value: 
            `**🆔 ID:** \`${guild.id}\`\n` +
            `**👥 Üye:** ${guild.memberCount} kişi\n` +
            `**👑 Sahip:** ${owner ? `${owner.user.tag} (<@${owner.id}>)` : 'Bilinmiyor'}\n` +
            `**📅 Oluşturulma:** <t:${createdAt}:R>\n` +
            `**🤖 Bota Katılma:** ${botJoinedAt ? `<t:${botJoinedAt}:R>` : 'Bilinmiyor'}`,
          inline: false
        });
      }
      
      if (pending.size > 5) {
        embed.addFields({
          name: '⚠️ Daha Fazla Sunucu Var',
          value: 
            `Toplam **${pending.size}** sunucu bekliyor, ancak sadece ilk **5** tanesi gösteriliyor.\n` +
            `Diğer sunucular için komutları kullanabilirsiniz:\n` +
            `• \`/sunucu-onayla <ID>\`\n` +
            `• \`/sunucu-reddet <ID>\``,
          inline: false
        });
      }
      
      embed.setFooter(createFooter())
      .setTimestamp();
      
      const firstGuild = sortedPending.first();
      if (firstGuild && firstGuild.iconURL()) {
        embed.setThumbnail(firstGuild.iconURL({ dynamic: true, size: 256 }));
      }
      
      await interaction.editReply({ embeds: [embed] });
    }
  }
];