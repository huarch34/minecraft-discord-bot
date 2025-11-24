const Discord = require('discord.js');
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, Collection } = require('discord.js');
const Rcon = require('rcon-client').Rcon;
const fs = require('fs');
const path = require('path');
require('dotenv').config();
process.on('unhandledRejection', (error) => {
  console.error('Yakalanmayan Promise Hatası:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Yakalanmayan Hata:', error);
});

// Bot yapılandırması
const config = {
  token: '',
  guildId: '',
  rcon: {
    host: '',
    port: 25575,
    password: '',
    timeout: 30000
  },
  serverIP: '',
  website: '',
  botBio: ``,
  
  roles: {
    admin: '',
    player: ''
  },
  
  ownerId: '299972133788844034',
  approvedGuilds: new Set(['']),
  autoGiveRoleToOwner: true
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

let serverStatus = {
  online: false,
  players: 0,
  maxPlayers: 20,
  lastCheck: null
};

// Komut koleksiyonu
client.commands = new Collection();

// Komutları yükle
function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Eğer dosya array döndürüyorsa (birden fazla komut)
    if (Array.isArray(command)) {
      for (const cmd of command) {
        client.commands.set(cmd.data.name, cmd);
        console.log(`✅ ${cmd.data.name} komutu yüklendi`);
      }
    } else {
      // Tek komut
      client.commands.set(command.data.name, command);
      console.log(`✅ ${command.data.name} komutu yüklendi`);
    }
  }
}

async function executeRconCommand(command) {
  let rcon = null;
  try {
    rcon = await Rcon.connect({
      host: config.rcon.host,
      port: config.rcon.port,
      password: config.rcon.password,
      timeout: 15000
    });
    
    rcon.on('error', (err) => {
      console.error('RCON socket hatası:', err.message);
    });
    
    const response = await rcon.send(command);
    
    try {
      await rcon.end();
    } catch (endError) {
      // Sessizce geç
    }
    
    return response;
  } catch (error) {
    console.error(`RCON Hatası [${command}]:`, error.message);
    
    if (rcon) {
      try {
        rcon.socket?.destroy();
      } catch (e) {
        // Sessizce geç
      }
    }
    
    return null;
  }
}

async function checkServerStatus() {
  try {
    const response = await executeRconCommand('list');
    
    if (response) {
      serverStatus.online = true;
      
      const cleanResponse = response
        .replace(/§x(§[0-9a-fA-F]){6}/g, '')
        .replace(/§[0-9a-fk-orA-FK-OR]/g, '')
        .replace(/&x[0-9a-fA-F]{6}/g, '')
        .replace(/&[0-9a-fk-orA-FK-OR]/g, '');
      
      const patterns = [
        /There are (\d+) of a max (?:of )?(\d+) players/i,
        /There are (\d+)\/(\d+) players/i,
        /(\d+)\/(\d+) players/i,
        /players online:\s*(\d+)\/(\d+)/i,
        /(\d+) \/ (\d+) players/i,
        /(\d+) of (\d+) players/i
      ];
      
      let found = false;
      for (const pattern of patterns) {
        const match = cleanResponse.match(pattern);
        if (match) {
          serverStatus.players = parseInt(match[1]);
          serverStatus.maxPlayers = parseInt(match[2]);
          found = true;
          break;
        }
      }
      
      if (!found) {
        const numbers = cleanResponse.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
          serverStatus.players = parseInt(numbers[0]);
          serverStatus.maxPlayers = parseInt(numbers[1]);
        }
      }
    } else {
      serverStatus.online = false;
      serverStatus.players = 0;
    }
  } catch (error) {
    console.error('Sunucu durumu kontrol hatası:', error.message);
    serverStatus.online = false;
    serverStatus.players = 0;
  }
  
  serverStatus.lastCheck = new Date();
}

async function updateBotStatus() {
  try {
    if (serverStatus.online) {
      await client.user.setActivity(`${serverStatus.players}/${serverStatus.maxPlayers} Oyuncu | ${config.serverIP}`, { type: 3 });
      await client.user.setStatus('online');
    } else {
      await client.user.setActivity('Sunucu Çevrimdışı', { type: 3 });
      await client.user.setStatus('idle');
    }
  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
  }
}

function hasPermission(member, requiredRole) {
  if (member.id === config.ownerId) return true;
  if (member.guild.ownerId === member.id) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  
  if (requiredRole === 'admin') {
    return member.roles.cache.has(config.roles.admin);
  }
  
  if (requiredRole === 'player') {
    if (!config.roles.player) return true;
    return member.roles.cache.has(config.roles.player) || member.roles.cache.has(config.roles.admin);
  }
  
  return false;
}

function isGuildApproved(guildId) {
  return config.approvedGuilds.has(guildId);
}

client.once('clientReady', async () => {
  console.log(`Bot aktif: ${client.user.tag}`);
  
  try {
    // Komutları yükle
    loadCommands();
    
    // Komutları Discord'a kaydet
    const commandData = [];
    for (const [name, command] of client.commands) {
      commandData.push(command.data.toJSON());
    }
    
    await client.application.commands.set(commandData);
    console.log(`${commandData.length} slash komutu kaydedildi!`);
    
    const owner = await client.users.fetch(config.ownerId);
    const guildsNeedingApproval = client.guilds.cache.filter(g => !isGuildApproved(g.id));
    
    if (guildsNeedingApproval.size > 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ Onay Bekleyen Sunucular')
        .setDescription(`${guildsNeedingApproval.size} sunucu onay bekliyor!`)
        .addFields(guildsNeedingApproval.map(guild => ({
          name: guild.name,
          value: `ID: \`${guild.id}\`\nÜye: ${guild.memberCount}`,
          inline: false
        })).slice(0, 10))
        .setTimestamp();
      
      await owner.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (error) {
    console.error('Hata:', error);
  }
  
  await checkServerStatus();
  await updateBotStatus();
  setInterval(async () => {
    await checkServerStatus();
    await updateBotStatus();
  }, 50000);
});

client.on('guildCreate', async (guild) => {
  console.log(`Yeni sunucu: ${guild.name}`);
  
  try {
    const owner = await client.users.fetch(config.ownerId);
    const embed = new EmbedBuilder()
      .setColor('#ffff00')
      .setTitle('🆕 Yeni Sunucu')
      .addFields(
        { name: 'Sunucu', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Üye', value: guild.memberCount.toString(), inline: true }
      )
      .setFooter({ text: '/sunucu-onayla ' + guild.id })
      .setTimestamp();
    
    await owner.send({ embeds: [embed] });
  } catch (error) {}
  
  try {
    const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
    if (channel) {
      await channel.send({ embeds: [new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ Onay Bekleniyor')
        .setDescription('Bot sahibi bu sunucuyu onaylayana kadar komutlar kullanılamaz.')
        .setFooter({
          text: '💻 Developed by Huarch | github.com/Huarch',
          iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
        })
        .setTimestamp()] });
    }
  } catch (error) {}
});

client.on('guildDelete', async (guild) => {
  config.approvedGuilds.delete(guild.id);
  try {
    const owner = await client.users.fetch(config.ownerId);
    await owner.send(`❌ **${guild.name}** sunucusundan çıkarıldım.`);
  } catch (error) {}
});

client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;
  
  try {
    const playerRole = member.guild.roles.cache.get(config.roles.player);
    
    if (!playerRole) {
      console.log(`❌ Üye rolü bulunamadı: ${config.roles.player}`);
      return;
    }
    
    await member.roles.add(playerRole);
    console.log(`✅ ${member.user.tag} kullanıcısına otomatik olarak ${playerRole.name} rolü verildi!`);
    
    const welcomeChannel = member.guild.systemChannel;
    if (welcomeChannel) {
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🎉 Hoşgeldin!')
        .setDescription(`${member} sunucumuza katıldı!\n\n🎮 Minecraft sunucumuz: \`${config.serverIP}\`\n📋 Komutlar için: \`/yardim\``)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128 }))
        .setFooter({
          text: `Üye #${member.guild.memberCount}`,
          iconURL: member.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
      
      await welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(() => {});
    }
  } catch (error) {
    console.error('Otomatik rol verme hatası:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`${interaction.commandName} komutu bulunamadı!`);
    return;
  }
  
  // Sahip komutları kontrolü
  const ownerCommands = ['sunucu-onayla', 'sunucu-reddet', 'onaylanmis-sunucular', 'onay-bekleyenler'];
  
  if (ownerCommands.includes(interaction.commandName)) {
    if (interaction.user.id !== config.ownerId) {
      return await interaction.reply({ content: '❌ Bu komut sadece bot sahibi tarafından kullanılabilir!', flags: 64 });
    }
  } else {
    // Sunucu onay kontrolü
    if (!isGuildApproved(interaction.guildId) && interaction.user.id !== config.ownerId) {
      return await interaction.reply({ content: '⚠️ Bu sunucu henüz onaylanmadı! Bot sahibi onaylayana kadar komutlar kullanılamaz.', flags: 64 });
    }
    
    // Yetki kontrolü
    const publicCommands = ['sunucu', 'oyuncular', 'yardim', 'hesabim', 'sunucu-bilgi', 'kullanici-bilgi', 'avatar'];
    
    if (!publicCommands.includes(interaction.commandName)) {
      if (!hasPermission(interaction.member, 'admin')) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Yetersiz Yetki')
          .setDescription('Bu komutu kullanmak için yetkili olmalısınız!')
          .addFields(
            { name: 'Gerekli Rol', value: `<@&${config.roles.admin}>`, inline: true }
          )
          .setFooter({
            text: '💻 Developed by Huarch | github.com/Huarch',
            iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
          })
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], flags: 64 });
      }
    }
  }
  
  try {
    // Komut context'i
    const context = {
      executeRconCommand,
      checkServerStatus,
      serverStatus,
      config,
      client,
      hasPermission,
      isGuildApproved
    };
    
    await command.execute(interaction, context);
  } catch (error) {
    console.error('Komut çalıştırma hatası:', error);
    
    const errorMessage = {
      embeds: [new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Hata')
        .setDescription('Komut çalıştırılırken bir hata oluştu.')
        .setFooter({
          text: '💻 Developed by Huarch | github.com/Huarch',
          iconURL: 'https://media.discordapp.net/attachments/1429629693098987520/1432920083839193179/HUARCH_2.png'
        })
        .setTimestamp()],
      flags: 64
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(errorMessage).catch(() => {});
    } else {
      await interaction.reply(errorMessage).catch(() => {});
    }
  }
});

client.login(config.token);