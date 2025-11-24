const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  AttachmentBuilder,
  MessageFlags
} = require('discord.js');
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Konfigürasyon
const CONFIG = {
  TOKEN: '',
  TICKET_CATEGORY_ID: '',
  SUPPORT_ROLE_ID: '',
  LOG_CHANNEL_ID: '',
  TICKET_PANEL_CHANNEL_ID: '',
  TRANSCRIPT_CHANNEL_ID: '',
  MAX_TICKETS_PER_USER: 3,
  TICKET_INACTIVITY_TIME: 24 * 60 * 60 * 1000,
  AUTO_CLOSE_WARNING_TIME: 23 * 60 * 60 * 1000,
  TICKET_COOLDOWN: 5 * 60 * 1000,
  PRIORITY_COLORS: {
    low: '#00FF00',
    medium: '#FFA500',
    high: '#FF0000',
    urgent: '#8B0000'
  }
};

// Veritabanı (JSON dosyası)
const DB_PATH = path.join(__dirname, 'tickets.json');

// Varsayılan veritabanı yapısı
const defaultDatabase = {
  tickets: [],
  statistics: {
    totalTickets: 0,
    closedTickets: 0,
    averageResponseTime: 0,
    categoryStats: {}
  },
  userCooldowns: {},
  blacklist: []
};

let ticketDatabase = { ...defaultDatabase };

// Veritabanı yükleme
async function loadDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const loadedData = JSON.parse(data);
    
    // Eksik alanları varsayılanlarla doldur
    ticketDatabase = {
      tickets: loadedData.tickets || [],
      statistics: {
        totalTickets: loadedData.statistics?.totalTickets || 0,
        closedTickets: loadedData.statistics?.closedTickets || 0,
        averageResponseTime: loadedData.statistics?.averageResponseTime || 0,
        categoryStats: loadedData.statistics?.categoryStats || {}
      },
      userCooldowns: loadedData.userCooldowns || {},
      blacklist: loadedData.blacklist || []
    };
    
    console.log('✅ Veritabanı yüklendi:', {
      toplamTicket: ticketDatabase.statistics.totalTickets,
      kapalıTicket: ticketDatabase.statistics.closedTickets
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📁 Yeni veritabanı oluşturuluyor...');
      ticketDatabase = { ...defaultDatabase };
      await saveDatabase();
    } else {
      console.error('❌ Veritabanı yükleme hatası:', error);
      ticketDatabase = { ...defaultDatabase };
    }
  }
}

// Veritabanı kaydetme
async function saveDatabase() {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(ticketDatabase, null, 2));
  } catch (error) {
    console.error('❌ Veritabanı kaydetme hatası:', error);
  }
}

// Aktif ticketlar
const activeTickets = new Map();
let ticketCounter = 1;

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} olarak giriş yapıldı!`);
  console.log('🎫 Gelişmiş Ticket Sistemi Hazır!');
  
  await loadDatabase();
  ticketCounter = ticketDatabase.statistics.totalTickets + 1;
  
  // Otomatik inaktif ticket kontrolü
  setInterval(checkInactiveTickets, 60 * 60 * 1000);
});

// Ticket panelini oluşturma
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // !ticket-panel komutu
  if (message.content === '!ticket-panel' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 Minecraft Sunucu Destek Sistemi')
      .setDescription(
        '**Merhaba! Destek almak için ticket açabilirsiniz.**\n\n' +
        '**📋 Ticket Kategorileri:**\n' +
        '🔧 **Teknik Destek** - Bağlantı, lag, crash sorunları\n' +
        '💰 **Satın Alma** - Rank, item, mağaza sorunları\n' +
        '⚠️ **Şikayet/Rapor** - Oyuncu raporları, hile şikayetleri\n' +
        '❓ **Genel Sorular** - Sunucu hakkında genel bilgiler\n' +
        '🎮 **Oyun İçi Yardım** - Komutlar, özellikler, rehberlik\n' +
        '🏆 **Başvuru** - Yetkili, builder, youtuber başvuruları\n' +
        '💎 **VIP Destek** - Öncelikli destek (Sadece VIP üyeler)\n\n' +
        '**⚡ Hızlı İpuçları:**\n' +
        '• Sorununuzu detaylı açıklayın\n' +
        '• Ekran görüntüsü ekleyin\n' +
        '• Oyuncu adınızı belirtin\n' +
        '• Sabırlı olun, ekibimiz en kısa sürede yardımcı olacak\n\n' +
        '**⏱️ Ortalama Yanıt Süresi:** 5-15 dakika'
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setFooter({ 
        text: 'Lütfen gereksiz ticket açmayın • Max 3 açık ticket',
        iconURL: message.guild.iconURL()
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Ticket Aç')
          .setEmoji('🎫')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('ticket_stats')
          .setLabel('İstatistikler')
          .setEmoji('📊')
          .setStyle(ButtonStyle.Secondary)
      );

    await message.channel.send({ embeds: [embed], components: [row] });
    await message.delete().catch(() => {});
  }

  // !ticket-stats komutu
  if (message.content === '!ticket-stats' && message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    const stats = ticketDatabase.statistics;
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📊 Ticket İstatistikleri')
      .addFields(
        { name: '📝 Toplam Ticket', value: `${stats.totalTickets}`, inline: true },
        { name: '✅ Kapatılan', value: `${stats.closedTickets}`, inline: true },
        { name: '🔔 Aktif', value: `${activeTickets.size}`, inline: true },
        { name: '⏱️ Ort. Yanıt Süresi', value: `${Math.round(stats.averageResponseTime / 60000)} dk`, inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  // !ticket-close komutu (ticket kanalında)
  if (message.content.startsWith('!ticket-close') && activeTickets.has(message.channel.id)) {
    const ticket = activeTickets.get(message.channel.id);
    if (ticket.userId === message.author.id || message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await closeTicket(message.channel, message.author, 'Manuel kapatma');
    }
  }

  // !ticket-add komutu (ticket kanalında)
  if (message.content.startsWith('!ticket-add') && activeTickets.has(message.channel.id)) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
    
    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ Lütfen bir kullanıcı etiketleyin!');

    await message.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    await message.reply(`✅ ${user} ticket'a eklendi!`);
  }

  // !ticket-remove komutu
  if (message.content.startsWith('!ticket-remove') && activeTickets.has(message.channel.id)) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
    
    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ Lütfen bir kullanıcı etiketleyin!');

    await message.channel.permissionOverwrites.delete(user.id);
    await message.reply(`✅ ${user} ticket'tan çıkarıldı!`);
  }

  // !ticket-priority komutu
  if (message.content.startsWith('!ticket-priority') && activeTickets.has(message.channel.id)) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
    
    const args = message.content.split(' ');
    const priority = args[1]?.toLowerCase();
    
    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return message.reply('❌ Geçerli öncelik seviyeleri: low, medium, high, urgent');
    }

    const ticket = activeTickets.get(message.channel.id);
    ticket.priority = priority;
    
    const priorityEmojis = { low: '🟢', medium: '🟡', high: '🔴', urgent: '🚨' };
    await message.reply(`${priorityEmojis[priority]} Ticket önceliği **${priority.toUpperCase()}** olarak ayarlandı!`);
  }

  // !ticket-transcript komutu
  if (message.content === '!ticket-transcript' && activeTickets.has(message.channel.id)) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
    
    await message.reply('📄 Transcript oluşturuluyor...');
    await createTranscript(message.channel);
  }

  // !ticket-blacklist komutu
  if (message.content.startsWith('!ticket-blacklist') && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ Lütfen bir kullanıcı etiketleyin!');

    if (ticketDatabase.blacklist.includes(user.id)) {
      ticketDatabase.blacklist = ticketDatabase.blacklist.filter(id => id !== user.id);
      await saveDatabase();
      return message.reply(`✅ ${user.tag} blacklist'ten çıkarıldı!`);
    } else {
      ticketDatabase.blacklist.push(user.id);
      await saveDatabase();
      return message.reply(`✅ ${user.tag} blacklist'e eklendi!`);
    }
  }
});

// Etkileşimler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

  // İstatistikler butonu
  if (interaction.customId === 'ticket_stats') {
    const stats = ticketDatabase.statistics;
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📊 Ticket İstatistikleri')
      .setDescription('**Sunucu destek sistemi istatistikleri**')
      .addFields(
        { name: '📝 Toplam Ticket', value: `${stats.totalTickets}`, inline: true },
        { name: '✅ Kapatılan', value: `${stats.closedTickets}`, inline: true },
        { name: '🔔 Aktif', value: `${activeTickets.size}`, inline: true },
        { name: '⏱️ Ortalama Yanıt', value: `${Math.round(stats.averageResponseTime / 60000)} dk`, inline: true },
        { name: '📈 Başarı Oranı', value: `${Math.round((stats.closedTickets / stats.totalTickets) * 100) || 0}%`, inline: true },
        { name: '👥 Aktif Kullanıcı', value: `${new Set([...activeTickets.values()].map(t => t.userId)).size}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // Ticket oluşturma
  if (interaction.customId === 'create_ticket') {
    // Blacklist kontrolü
    if (ticketDatabase.blacklist.includes(interaction.user.id)) {
      return interaction.reply({
        content: '❌ Ticket açmanız engellenmiş. Lütfen yöneticilerle iletişime geçin.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Cooldown kontrolü
    const now = Date.now();
    const cooldown = ticketDatabase.userCooldowns[interaction.user.id];
    if (cooldown && now - cooldown < CONFIG.TICKET_COOLDOWN) {
      const remaining = Math.ceil((CONFIG.TICKET_COOLDOWN - (now - cooldown)) / 1000);
      return interaction.reply({
        content: `⏱️ Çok hızlı! ${remaining} saniye sonra tekrar ticket açabilirsiniz.`,
        flags: MessageFlags.Ephemeral
      });
    }

    // Maksimum ticket kontrolü
    const userTickets = Array.from(activeTickets.values()).filter(
      t => t.userId === interaction.user.id && t.status === 'open'
    );

    if (userTickets.length >= CONFIG.MAX_TICKETS_PER_USER) {
      return interaction.reply({
        content: `❌ En fazla ${CONFIG.MAX_TICKETS_PER_USER} açık ticket'ınız olabilir!\n\n**Açık Ticketlarınız:**\n${userTickets.map(t => `• <#${t.channelId}> - ${t.category}`).join('\n')}`,
        flags: MessageFlags.Ephemeral
      });
    }

    // Kategori seçim menüsü
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_category')
      .setPlaceholder('🏷️ Ticket kategorisi seçin')
      .addOptions([
        {
          label: 'Teknik Destek',
          description: 'Bağlantı, lag, crash ve teknik sorunlar',
          value: 'teknik',
          emoji: '🔧'
        },
        {
          label: 'Satın Alma & Mağaza',
          description: 'Rank, item, donation sorunları',
          value: 'satin_alma',
          emoji: '💰'
        },
        {
          label: 'Şikayet & Rapor',
          description: 'Oyuncu şikayetleri, hile raporları',
          value: 'sikayet',
          emoji: '⚠️'
        },
        {
          label: 'Genel Sorular',
          description: 'Sunucu hakkında genel bilgiler',
          value: 'genel',
          emoji: '❓'
        },
        {
          label: 'Oyun İçi Yardım',
          description: 'Komutlar, özellikler, rehberlik',
          value: 'oyun',
          emoji: '🎮'
        },
        {
          label: 'Başvuru',
          description: 'Yetkili, builder, youtuber başvuruları',
          value: 'basvuru',
          emoji: '🏆'
        },
        {
          label: 'VIP Destek',
          description: 'Öncelikli destek (Sadece VIP üyeler)',
          value: 'vip',
          emoji: '💎'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: '**🎫 Ticket Oluşturma**\n\nLütfen sorununuzla ilgili kategoriyi seçin:',
      components: [row],
      flags: MessageFlags.Ephemeral
    });
  }

  // Kategori seçimi
  if (interaction.customId === 'ticket_category') {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const category = interaction.values[0];
    
    // VIP kontrolü
    if (category === 'vip') {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const hasVIP = member.roles.cache.some(role => 
        role.name.toLowerCase().includes('vip') || 
        role.name.toLowerCase().includes('premium')
      );
      
      if (!hasVIP) {
        return interaction.editReply({
          content: '❌ VIP destek sadece VIP üyeler içindir. Normal kategorilerden birini seçin.',
          flags: MessageFlags.Ephemeral
        });
      }
    }

    const categoryNames = {
      teknik: '🔧 Teknik Destek',
      satin_alma: '💰 Satın Alma',
      sikayet: '⚠️ Şikayet & Rapor',
      genel: '❓ Genel Sorular',
      oyun: '🎮 Oyun Yardım',
      basvuru: '🏆 Başvuru',
      vip: '💎 VIP Destek'
    };

    try {
      const ticketNumber = ticketCounter++;
      const channelName = `ticket-${String(ticketNumber).padStart(4, '0')}`;
      
      // Ticket kanalı oluştur
      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: CONFIG.TICKET_CATEGORY_ID,
        topic: `Ticket #${ticketNumber} | ${interaction.user.tag} | ${categoryNames[category]}`,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks
            ]
          },
          {
            id: CONFIG.SUPPORT_ROLE_ID,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.ManageMessages
            ]
          }
        ]
      });

      // Ticket verilerini kaydet
      const ticketData = {
        ticketNumber,
        userId: interaction.user.id,
        username: interaction.user.tag,
        category,
        status: 'open',
        priority: 'medium',
        channelId: ticketChannel.id,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        messages: [],
        claimedBy: null,
        claimedAt: null,
        closedBy: null,
        closedAt: null,
        rating: null
      };

      activeTickets.set(ticketChannel.id, ticketData);
      ticketDatabase.tickets.push(ticketData);
      ticketDatabase.statistics.totalTickets++;
      ticketDatabase.userCooldowns[interaction.user.id] = Date.now();
      await saveDatabase();

      // Hoş geldin mesajı
      const welcomeEmbed = new EmbedBuilder()
        .setColor(CONFIG.PRIORITY_COLORS.medium)
        .setAuthor({ 
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle(`${categoryNames[category]} - Ticket #${ticketNumber}`)
        .setDescription(
          `Merhaba ${interaction.user}! Ticket'ınız başarıyla oluşturuldu. 🎉\n\n` +
          `<@&${CONFIG.SUPPORT_ROLE_ID}> ekibimiz en kısa sürede size yardımcı olacak.\n\n` +
          `**📋 Ticket Bilgileri:**\n` +
          `╰ **Kategori:** ${categoryNames[category]}\n` +
          `╰ **Ticket No:** #${ticketNumber}\n` +
          `╰ **Durum:** 🟢 Açık\n` +
          `╰ **Öncelik:** 🟡 Normal\n` +
          `╰ **Oluşturulma:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
          `**📝 Lütfen sorunuzu detaylı açıklayın:**\n` +
          `╰ Minecraft kullanıcı adınızı belirtin\n` +
          `╰ Sorununuzu adım adım anlatın\n` +
          `╰ Ekran görüntüleri ve videolar ekleyin\n` +
          `╰ Hata mesajları varsa paylaşın\n\n` +
          `⏱️ **Ortalama yanıt süresi:** 5-15 dakika`
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ 
          text: 'Ticket\'ı kapatmak için aşağıdaki butonu kullanın',
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

      const ticketButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Kapat')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('Üstlen')
            .setEmoji('✋')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ticket_info')
            .setLabel('Bilgi')
            .setEmoji('ℹ️')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('transcript')
            .setLabel('Transcript')
            .setEmoji('📄')
            .setStyle(ButtonStyle.Secondary)
        );

      await ticketChannel.send({
        content: `${interaction.user} <@&${CONFIG.SUPPORT_ROLE_ID}>`,
        embeds: [welcomeEmbed],
        components: [ticketButtons]
      });

      // Kategori özel mesajlar
      const categoryGuides = {
        teknik: '**🔧 Teknik Destek Rehberi:**\n• Java sürümünüzü belirtin\n• Launcher tipini söyleyin (TLauncher, Premium vb.)\n• Hata mesajını tam olarak paylaşın\n• F3 tuşuna basıp ekran görüntüsü alın',
        satin_alma: '**💰 Satın Alma Rehberi:**\n• İşlem numaranızı paylaşın\n• Ödeme yöntemini belirtin\n• Satın aldığınız paketi yazın\n• Minecraft kullanıcı adınızı verin',
        sikayet: '**⚠️ Şikayet/Rapor Rehberi:**\n• Oyuncu adını tam olarak yazın\n• Olayın tarih ve saatini belirtin\n• Kanıt ekran görüntüsü/video ekleyin\n• Detaylı açıklama yapın',
        basvuru: '**🏆 Başvuru Rehberi:**\n• Yaşınızı belirtin\n• Minecraft deneyiminizi anlatın\n• Neden seçilmeniz gerektiğini açıklayın\n• Referanslarınız varsa ekleyin'
      };

      if (categoryGuides[category]) {
        await ticketChannel.send({
          embeds: [new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription(categoryGuides[category])
          ]
        });
      }

      await interaction.editReply({
        content: `✅ Ticket'ınız oluşturuldu: ${ticketChannel}\n\n🔔 Bildirimlerinizi açık tutun, ekibimiz size mesaj atacak!`
      });

      // Log
      await sendLog('ticket_open', {
        ticketNumber,
        user: interaction.user,
        category: categoryNames[category],
        channel: ticketChannel
      });

    } catch (error) {
      console.error('Ticket oluşturma hatası:', error);
      await interaction.editReply({
        content: '❌ Ticket oluşturulurken bir hata oluştu. Lütfen yöneticilere bildirin.'
      });
    }
  }

  // Ticket üstlenme
  if (interaction.customId === 'claim_ticket') {
    const ticket = activeTickets.get(interaction.channel.id);
    if (!ticket) return;

    if (ticket.claimedBy) {
      return interaction.reply({
        content: `❌ Bu ticket zaten <@${ticket.claimedBy}> tarafından üstlenilmiş!`,
        flags: MessageFlags.Ephemeral
      });
    }

    ticket.claimedBy = interaction.user.id;
    ticket.claimedAt = Date.now();
    await saveDatabase();

    const claimEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setDescription(`✋ **${interaction.user}** bu ticket'ı üstlendi ve size yardımcı olacak!`)
      .setTimestamp();

    await interaction.reply({ embeds: [claimEmbed] });

    // Kanalı güncelle
    await interaction.channel.setName(`ticket-${String(ticket.ticketNumber).padStart(4, '0')}-claimed`);
  }

  // Ticket bilgi
  if (interaction.customId === 'ticket_info') {
    const ticket = activeTickets.get(interaction.channel.id);
    if (!ticket) return;

    const uptime = Date.now() - ticket.createdAt;
    const infoEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`ℹ️ Ticket #${ticket.ticketNumber} Bilgileri`)
      .addFields(
        { name: '👤 Açan', value: `<@${ticket.userId}>`, inline: true },
        { name: '📁 Kategori', value: ticket.category, inline: true },
        { name: '🚦 Durum', value: ticket.status, inline: true },
        { name: '⚡ Öncelik', value: ticket.priority, inline: true },
        { name: '✋ Üstlenen', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Kimse', inline: true },
        { name: '⏱️ Süre', value: formatDuration(uptime), inline: true },
        { name: '📅 Oluşturulma', value: `<t:${Math.floor(ticket.createdAt / 1000)}:F>`, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [infoEmbed], flags: MessageFlags.Ephemeral });
  }

  // Transcript oluşturma
  if (interaction.customId === 'transcript') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkiniz yok!', flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({ content: '📄 Transcript oluşturuluyor...', flags: MessageFlags.Ephemeral });
    await createTranscript(interaction.channel);
  }

  // Ticket kapatma
  if (interaction.customId === 'close_ticket') {
    const ticket = activeTickets.get(interaction.channel.id);
    if (!ticket) return;

    // Sadece ticket sahibi veya yetkili kapatabilir
    if (ticket.userId !== interaction.user.id && !interaction
        .member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ Bu ticket\'ı sadece sahibi veya yetkili kapatabilir!',
        flags: MessageFlags.Ephemeral
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('🔒 Ticket Kapatma Onayı')
      .setDescription(
        `Bu ticket'ı kapatmak istediğinizden emin misiniz?\n\n` +
        `**⚠️ Dikkat:**\n` +
        `• Kanal 10 saniye içinde silinecektir\n` +
        `• Transcript otomatik kaydedilecektir\n` +
        `• Bu işlem geri alınamaz\n\n` +
        `Lütfen deneyiminizi değerlendirmek ister misiniz?`
      )
      .setFooter({ text: 'Kapatmak için yeşil butona tıklayın' });

    const confirmButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_close')
          .setLabel('Evet, Kapat')
          .setEmoji('✅')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('close_with_rating')
          .setLabel('Değerlendir & Kapat')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cancel_close')
          .setLabel('İptal')
          .setEmoji('❌')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [confirmButtons],
      flags: MessageFlags.Ephemeral
    });
  }

  // Değerlendirmeli kapatma
  if (interaction.customId === 'close_with_rating') {
    const ratingEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('⭐ Destek Değerlendirmesi')
      .setDescription('Aldığınız desteği nasıl değerlendirirsiniz?');

    const ratingButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rating_1')
          .setLabel('1')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('rating_2')
          .setLabel('2')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('rating_3')
          .setLabel('3')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('rating_4')
          .setLabel('4')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('rating_5')
          .setLabel('5')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Success)
      );

    await interaction.update({
      embeds: [ratingEmbed],
      components: [ratingButtons]
    });
  }

  // Rating butonları
  if (interaction.customId.startsWith('rating_')) {
    const rating = parseInt(interaction.customId.split('_')[1]);
    const ticket = activeTickets.get(interaction.channel.id);
    if (!ticket) return;

    ticket.rating = rating;
    await saveDatabase();

    await interaction.update({
      content: `⭐ Değerlendirmeniz için teşekkürler! (${rating}/5)\n🔒 Ticket kapatılıyor...`,
      embeds: [],
      components: []
    });

    setTimeout(async () => {
      await closeTicket(interaction.channel, interaction.user, `Kullanıcı tarafından kapatıldı (Rating: ${rating}/5)`);
    }, 3000);
  }

  // Kapatma onayı
  if (interaction.customId === 'confirm_close') {
    await interaction.update({
      content: '🔒 Ticket kapatılıyor ve transcript oluşturuluyor...',
      embeds: [],
      components: []
    });

    await closeTicket(interaction.channel, interaction.user, 'Kullanıcı tarafından kapatıldı');
  }

  // Kapatma iptali
  if (interaction.customId === 'cancel_close') {
    await interaction.update({
      content: '✅ Kapatma işlemi iptal edildi.',
      embeds: [],
      components: []
    });

    setTimeout(async () => {
      await interaction.deleteReply();
    }, 3000);
  }
});

// Mesaj olayı (inaktivite takibi)
client.on('messageCreate', async (message) => {
  if (message.author.bot || !activeTickets.has(message.channel.id)) return;

  const ticket = activeTickets.get(message.channel.id);
  ticket.lastActivity = Date.now();
  ticket.messages.push({
    author: message.author.tag,
    content: message.content,
    timestamp: Date.now()
  });
  await saveDatabase();
});

// Ticket kapatma fonksiyonu
async function closeTicket(channel, closer, reason) {
  const ticket = activeTickets.get(channel.id);
  if (!ticket) return;

  ticket.status = 'closed';
  ticket.closedBy = closer.id;
  ticket.closedAt = Date.now();
  ticket.closeReason = reason;

  ticketDatabase.statistics.closedTickets++;
  
  // Ortalama yanıt süresini hesapla
  const responseTime = ticket.claimedAt ? ticket.claimedAt - ticket.createdAt : 0;
  const currentAvg = ticketDatabase.statistics.averageResponseTime;
  ticketDatabase.statistics.averageResponseTime = 
    (currentAvg * (ticketDatabase.statistics.closedTickets - 1) + responseTime) / 
    ticketDatabase.statistics.closedTickets;

  await saveDatabase();
  activeTickets.delete(channel.id);

  // Transcript oluştur
  await createTranscript(channel);

  // Log gönder
  await sendLog('ticket_close', {
    ticketNumber: ticket.ticketNumber,
    user: await client.users.fetch(ticket.userId),
    closer: closer,
    reason: reason,
    rating: ticket.rating,
    duration: formatDuration(ticket.closedAt - ticket.createdAt)
  });

  // Kanalı sil
  setTimeout(async () => {
    try {
      await channel.delete();
    } catch (error) {
      console.error('Kanal silme hatası:', error);
    }
  }, 10000);
}

// Transcript oluşturma
async function createTranscript(channel) {
  const ticket = activeTickets.get(channel.id) || 
    ticketDatabase.tickets.find(t => t.channelId === channel.id);
  
  if (!ticket) return;

  try {
    const messages = await channel.messages.fetch({ limit: 100 });
    const sortedMessages = Array.from(messages.values()).reverse();

    let transcript = `╔═══════════════════════════════════════════╗\n`;
    transcript += `║   MINECRAFT SUNUCU TICKET TRANSCRIPT      ║\n`;
    transcript += `╚═══════════════════════════════════════════╝\n\n`;
    transcript += `Ticket #${ticket.ticketNumber}\n`;
    transcript += `Kategori: ${ticket.category}\n`;
    transcript += `Açan: ${ticket.username}\n`;
    transcript += `Oluşturulma: ${new Date(ticket.createdAt).toLocaleString('tr-TR')}\n`;
    transcript += `Kapatılma: ${ticket.closedAt ? new Date(ticket.closedAt).toLocaleString('tr-TR') : 'Devam ediyor'}\n`;
    transcript += `Üstlenen: ${ticket.claimedBy ? ticket.claimedBy : 'Kimse'}\n`;
    transcript += `Değerlendirme: ${ticket.rating ? `${ticket.rating}/5 ⭐` : 'Değerlendirilmedi'}\n`;
    transcript += `\n${'═'.repeat(50)}\n\n`;

    for (const msg of sortedMessages) {
      const time = msg.createdAt.toLocaleTimeString('tr-TR');
      transcript += `[${time}] ${msg.author.tag}:\n`;
      transcript += `${msg.content}\n`;
      
      if (msg.attachments.size > 0) {
        transcript += `📎 Ekler: ${msg.attachments.map(a => a.url).join(', ')}\n`;
      }
      transcript += `\n`;
    }

    transcript += `\n${'═'.repeat(50)}\n`;
    transcript += `Toplam Mesaj: ${sortedMessages.length}\n`;
    transcript += `Süre: ${formatDuration(ticket.closedAt - ticket.createdAt)}\n`;

    // Transcript'i dosya olarak kaydet
    const attachment = new AttachmentBuilder(
      Buffer.from(transcript, 'utf-8'),
      { name: `ticket-${ticket.ticketNumber}-transcript.txt` }
    );

    // Transcript kanalına gönder
    if (CONFIG.TRANSCRIPT_CHANNEL_ID) {
      const transcriptChannel = await client.channels.fetch(CONFIG.TRANSCRIPT_CHANNEL_ID);
      
      const transcriptEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📄 Ticket #${ticket.ticketNumber} Transcript`)
        .addFields(
          { name: '👤 Kullanıcı', value: `<@${ticket.userId}>`, inline: true },
          { name: '📁 Kategori', value: ticket.category, inline: true },
          { name: '⭐ Rating', value: ticket.rating ? `${ticket.rating}/5` : 'N/A', inline: true },
          { name: '⏱️ Süre', value: formatDuration(ticket.closedAt - ticket.createdAt), inline: true },
          { name: '✋ Üstlenen', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Kimse', inline: true },
          { name: '💬 Mesaj Sayısı', value: `${sortedMessages.length}`, inline: true }
        )
        .setTimestamp();

      await transcriptChannel.send({ 
        embeds: [transcriptEmbed], 
        files: [attachment] 
      });
    }
  } catch (error) {
    console.error('Transcript oluşturma hatası:', error);
  }
}

// Log gönderme
async function sendLog(type, data) {
  if (!CONFIG.LOG_CHANNEL_ID) return;

  try {
    const logChannel = await client.channels.fetch(CONFIG.LOG_CHANNEL_ID);
    let embed;

    switch (type) {
      case 'ticket_open':
        embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🎫 Yeni Ticket Açıldı')
          .setThumbnail(data.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: '📋 Ticket No', value: `#${data.ticketNumber}`, inline: true },
            { name: '👤 Açan', value: `${data.user.tag}\n<@${data.user.id}>`, inline: true },
            { name: '📁 Kategori', value: data.category, inline: true },
            { name: '🔗 Kanal', value: `${data.channel}`, inline: false }
          )
          .setTimestamp();
        break;

      case 'ticket_close':
        embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🔒 Ticket Kapatıldı')
          .addFields(
            { name: '📋 Ticket No', value: `#${data.ticketNumber}`, inline: true },
            { name: '👤 Açan', value: `<@${data.user.id}>`, inline: true },
            { name: '🔐 Kapatan', value: `${data.closer.tag}`, inline: true },
            { name: '⏱️ Süre', value: data.duration, inline: true },
            { name: '⭐ Rating', value: data.rating ? `${data.rating}/5` : 'N/A', inline: true },
            { name: '📝 Sebep', value: data.reason, inline: true }
          )
          .setTimestamp();
        break;
    }

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Log gönderme hatası:', error);
  }
}

// İnaktif ticket kontrolü
async function checkInactiveTickets() {
  const now = Date.now();

  for (const [channelId, ticket] of activeTickets) {
    const inactiveTime = now - ticket.lastActivity;

    // 23 saat sonra uyarı
    if (inactiveTime >= CONFIG.AUTO_CLOSE_WARNING_TIME && !ticket.warningSent) {
      try {
        const channel = await client.channels.fetch(channelId);
        
        const warningEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('⚠️ İnaktivite Uyarısı')
          .setDescription(
            `Bu ticket **1 saat** boyunca inaktif!\n\n` +
            `Eğer 1 saat içinde mesaj gönderilmezse, ticket otomatik olarak kapatılacak.\n\n` +
            `Hala yardıma ihtiyacınız varsa lütfen bir mesaj gönderin.`
          )
          .setTimestamp();

        await channel.send({ 
          content: `<@${ticket.userId}>`, 
          embeds: [warningEmbed] 
        });

        ticket.warningSent = true;
        await saveDatabase();
      } catch (error) {
        console.error('Uyarı gönderme hatası:', error);
      }
    }

    // 24 saat sonra otomatik kapatma
    if (inactiveTime >= CONFIG.TICKET_INACTIVITY_TIME) {
      try {
        const channel = await client.channels.fetch(channelId);
        const bot = client.user;
        
        await channel.send({
          embeds: [new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription('🔒 Ticket inaktivite nedeniyle otomatik olarak kapatılıyor...')
          ]
        });

        await closeTicket(channel, bot, 'İnaktivite nedeniyle otomatik kapatıldı');
      } catch (error) {
        console.error('Otomatik kapatma hatası:', error);
      }
    }
  }
}

// Süre formatlama
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}g ${hours % 24}s`;
  if (hours > 0) return `${hours}s ${minutes % 60}d`;
  if (minutes > 0) return `${minutes}d ${seconds % 60}s`;
  return `${seconds}s`;
}

// Hata yakalama
process.on('unhandledRejection', error => {
  console.error('Yakalanmamış hata:', error);
});

client.login(CONFIG.TOKEN);