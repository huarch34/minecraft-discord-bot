const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// Yapılandırma
const CONFIG = {
    TOKEN: '',
    YETKILI_ROLLER: ['', 'YETKILI_ROL_ID_2'], // Birden fazla yetkili rol ekleyebilirsiniz
};

// Aktif çekilişler
const aktifCekilisler = new Map();

// Yetki kontrolü
function yetkiKontrol(interaction) {
    const uyeRolleri = interaction.member.roles.cache;
    const yetkiliMi = CONFIG.YETKILI_ROLLER.some(rolId => uyeRolleri.has(rolId)) || 
                      interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    
    if (!yetkiliMi) {
        interaction.reply({ 
            content: '❌ Bu komutu kullanmak için yetkiniz yok!', 
            ephemeral: true 
        });
        return false;
    }
    return true;
}

// Bot hazır olduğunda
client.once('ready', () => {
    console.log(`✅ Bot aktif: ${client.user.tag}`);
    client.user.setActivity('Çekiliş Sistemi | /çekiliş', { type: 'WATCHING' });
});

// Slash komutları kayıt
client.on('ready', async () => {
    const commands = [
        {
            name: 'çekiliş',
            description: 'Yeni bir çekiliş başlatır',
            options: [
                {
                    name: 'süre',
                    description: 'Çekiliş süresi (örn: 1h, 30m, 1d)',
                    type: 3,
                    required: true
                },
                {
                    name: 'kazanan',
                    description: 'Kazanan sayısı',
                    type: 4,
                    required: true
                },
                {
                    name: 'ödül',
                    description: 'Çekiliş ödülü',
                    type: 3,
                    required: true
                },
                {
                    name: 'açıklama',
                    description: 'Çekiliş açıklaması (opsiyonel)',
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: 'çekiliş-bitir',
            description: 'Aktif bir çekilişi erkenden bitirir',
            options: [
                {
                    name: 'mesaj-id',
                    description: 'Çekiliş mesaj ID',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'çekiliş-yeniden-çek',
            description: 'Çekilişte yeni kazanan seçer',
            options: [
                {
                    name: 'mesaj-id',
                    description: 'Çekiliş mesaj ID',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'çekiliş-iptal',
            description: 'Bir çekilişi iptal eder',
            options: [
                {
                    name: 'mesaj-id',
                    description: 'Çekiliş mesaj ID',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'çekiliş-liste',
            description: 'Aktif çekilişleri listeler'
        }
    ];

    try {
        await client.application.commands.set(commands);
        console.log('✅ Slash komutları yüklendi!');
    } catch (error) {
        console.error('❌ Komut yükleme hatası:', error);
    }
});

// Süre hesaplama fonksiyonu
function sureHesapla(sureStr) {
    const regex = /(\d+)([smhd])/g;
    let toplamMs = 0;
    let match;

    while ((match = regex.exec(sureStr)) !== null) {
        const deger = parseInt(match[1]);
        const birim = match[2];

        switch (birim) {
            case 's': toplamMs += deger * 1000; break;
            case 'm': toplamMs += deger * 60 * 1000; break;
            case 'h': toplamMs += deger * 60 * 60 * 1000; break;
            case 'd': toplamMs += deger * 24 * 60 * 60 * 1000; break;
        }
    }

    return toplamMs;
}

// Kalan süre formatı
function kalanSure(bitisTarihi) {
    const simdikiZaman = Date.now();
    const kalan = bitisTarihi - simdikiZaman;

    if (kalan <= 0) return 'Sona erdi';

    const gun = Math.floor(kalan / (1000 * 60 * 60 * 24));
    const saat = Math.floor((kalan % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const dakika = Math.floor((kalan % (1000 * 60 * 60)) / (1000 * 60));
    const saniye = Math.floor((kalan % (1000 * 60)) / 1000);

    let sonuc = '';
    if (gun > 0) sonuc += `${gun}g `;
    if (saat > 0) sonuc += `${saat}s `;
    if (dakika > 0) sonuc += `${dakika}d `;
    if (saniye > 0) sonuc += `${saniye}sn`;

    return sonuc.trim();
}

// Çekiliş başlatma
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'çekiliş') {
        if (!yetkiKontrol(interaction)) return;

        const sureStr = interaction.options.getString('süre');
        const kazananSayisi = interaction.options.getInteger('kazanan');
        const odul = interaction.options.getString('ödül');
        const aciklama = interaction.options.getString('açıklama');

        const sureMs = sureHesapla(sureStr);
        if (sureMs === 0) {
            return interaction.reply({ 
                content: '❌ Geçersiz süre formatı! Örnek: 1h, 30m, 1d', 
                ephemeral: true 
            });
        }

        if (kazananSayisi < 1 || kazananSayisi > 20) {
            return interaction.reply({ 
                content: '❌ Kazanan sayısı 1-20 arasında olmalı!', 
                ephemeral: true 
            });
        }

        const bitisTarihi = Date.now() + sureMs;

        const embed = new EmbedBuilder()
            .setTitle('🎉 ÇEKİLİŞ BAŞLADI!')
            .setDescription(`**Ödül:** ${odul}\n${aciklama ? `\n${aciklama}\n` : ''}`)
            .addFields(
                { name: '📊 Kazanan Sayısı', value: `${kazananSayisi} kişi`, inline: true },
                { name: '⏰ Kalan Süre', value: kalanSure(bitisTarihi), inline: true },
                { name: '👥 Katılımcı', value: '0', inline: true },
                { name: '🎯 Nasıl Katılırım?', value: 'Aşağıdaki 🎉 butonuna tıkla!' }
            )
            .setFooter({ text: `Başlatan: ${interaction.user.tag}` })
            .setTimestamp(bitisTarihi);

        const buton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('cekilis_katil')
                    .setLabel('Çekilişe Katıl')
                    .setEmoji('🎉')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [embed], components: [buton] });
        const mesaj = await interaction.fetchReply();

        const cekilisData = {
            mesajId: mesaj.id,
            kanalId: interaction.channelId,
            bitisTarihi,
            kazananSayisi,
            odul,
            katilimcilar: new Set(),
            baslatanId: interaction.user.id,
            bitti: false
        };

        aktifCekilisler.set(mesaj.id, cekilisData);

        // Çekiliş bitişi için zamanlayıcı
        setTimeout(() => cekilisiTamamla(mesaj.id), sureMs);

        // Süre güncelleyici
        const guncellemeInterval = setInterval(() => {
            if (!aktifCekilisler.has(mesaj.id)) {
                clearInterval(guncellemeInterval);
                return;
            }

            const data = aktifCekilisler.get(mesaj.id);
            if (data.bitti) {
                clearInterval(guncellemeInterval);
                return;
            }

            const yeniEmbed = EmbedBuilder.from(embed)
                .setFields(
                    { name: '📊 Kazanan Sayısı', value: `${kazananSayisi} kişi`, inline: true },
                    { name: '⏰ Kalan Süre', value: kalanSure(bitisTarihi), inline: true },
                    { name: '👥 Katılımcı', value: `${data.katilimcilar.size}`, inline: true },
                    { name: '🎯 Nasıl Katılırım?', value: 'Aşağıdaki 🎉 butonuna tıkla!' }
                );

            mesaj.edit({ embeds: [yeniEmbed] }).catch(() => clearInterval(guncellemeInterval));
        }, 10000); // Her 10 saniyede güncelle
    }

    if (interaction.commandName === 'çekiliş-bitir') {
        if (!yetkiKontrol(interaction)) return;

        const mesajId = interaction.options.getString('mesaj-id');
        
        if (!aktifCekilisler.has(mesajId)) {
            return interaction.reply({ 
                content: '❌ Bu ID ile aktif çekiliş bulunamadı!', 
                ephemeral: true 
            });
        }

        await cekilisiTamamla(mesajId);
        interaction.reply({ content: '✅ Çekiliş erkenden bitirildi!', ephemeral: true });
    }

    if (interaction.commandName === 'çekiliş-yeniden-çek') {
        if (!yetkiKontrol(interaction)) return;

        const mesajId = interaction.options.getString('mesaj-id');
        
        if (!aktifCekilisler.has(mesajId)) {
            return interaction.reply({ 
                content: '❌ Bu ID ile çekiliş bulunamadı!', 
                ephemeral: true 
            });
        }

        const data = aktifCekilisler.get(mesajId);
        if (data.katilimcilar.size === 0) {
            return interaction.reply({ 
                content: '❌ Çekilişte katılımcı yok!', 
                ephemeral: true 
            });
        }

        const kazananlar = kazananSec(data.katilimcilar, data.kazananSayisi);
        const kanal = await client.channels.fetch(data.kanalId);
        
        await kanal.send({
            content: `🎉 **Yeni Kazananlar Çekildi!**\n\n${kazananlar.map(id => `<@${id}>`).join(', ')}\n\n**Ödül:** ${data.odul}\n*Yönetici tarafından yeniden çekildi*`
        });

        interaction.reply({ content: '✅ Yeni kazananlar seçildi!', ephemeral: true });
    }

    if (interaction.commandName === 'çekiliş-iptal') {
        if (!yetkiKontrol(interaction)) return;

        const mesajId = interaction.options.getString('mesaj-id');
        
        if (!aktifCekilisler.has(mesajId)) {
            return interaction.reply({ 
                content: '❌ Bu ID ile aktif çekiliş bulunamadı!', 
                ephemeral: true 
            });
        }

        const data = aktifCekilisler.get(mesajId);
        const kanal = await client.channels.fetch(data.kanalId);
        const mesaj = await kanal.messages.fetch(mesajId);

        const iptalEmbed = new EmbedBuilder()
            .setTitle('❌ ÇEKİLİŞ İPTAL EDİLDİ')
            .setDescription(`**Ödül:** ${data.odul}\n\n*Bu çekiliş yönetici tarafından iptal edildi.*`)
            .setColor('#ff0000')
            .setTimestamp();

        await mesaj.edit({ embeds: [iptalEmbed], components: [] });
        aktifCekilisler.delete(mesajId);

        interaction.reply({ content: '✅ Çekiliş iptal edildi!', ephemeral: true });
    }

    if (interaction.commandName === 'çekiliş-liste') {
        if (!yetkiKontrol(interaction)) return;

        if (aktifCekilisler.size === 0) {
            return interaction.reply({ 
                content: '📋 Şu anda aktif çekiliş bulunmuyor.', 
                ephemeral: true 
            });
        }

        let liste = '**Aktif Çekilişler:**\n\n';
        aktifCekilisler.forEach((data, mesajId) => {
            if (!data.bitti) {
                liste += `🎉 **Ödül:** ${data.odul}\n`;
                liste += `📍 Mesaj ID: \`${mesajId}\`\n`;
                liste += `👥 Katılımcı: ${data.katilimcilar.size}\n`;
                liste += `⏰ Kalan: ${kalanSure(data.bitisTarihi)}\n\n`;
            }
        });

        interaction.reply({ content: liste, ephemeral: true });
    }
});

// Buton etkileşimleri
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'cekilis_katil') {
        const mesajId = interaction.message.id;
        
        if (!aktifCekilisler.has(mesajId)) {
            return interaction.reply({ 
                content: '❌ Bu çekiliş artık aktif değil!', 
                ephemeral: true 
            });
        }

        const data = aktifCekilisler.get(mesajId);
        
        if (data.bitti) {
            return interaction.reply({ 
                content: '❌ Bu çekiliş sona erdi!', 
                ephemeral: true 
            });
        }

        const uyeId = interaction.user.id;

        if (data.katilimcilar.has(uyeId)) {
            data.katilimcilar.delete(uyeId);
            interaction.reply({ 
                content: '✅ Çekilişten çıktınız!', 
                ephemeral: true 
            });
        } else {
            data.katilimcilar.add(uyeId);
            interaction.reply({ 
                content: '🎉 Çekilişe katıldınız! Bol şans!', 
                ephemeral: true 
            });
        }
    }
});

// Kazanan seçme fonksiyonu
function kazananSec(katilimcilar, kazananSayisi) {
    const katilimciArray = Array.from(katilimcilar);
    const kazananlar = [];
    const secilmisIndexler = new Set();

    while (kazananlar.length < Math.min(kazananSayisi, katilimciArray.length)) {
        const randomIndex = Math.floor(Math.random() * katilimciArray.length);
        if (!secilmisIndexler.has(randomIndex)) {
            kazananlar.push(katilimciArray[randomIndex]);
            secilmisIndexler.add(randomIndex);
        }
    }

    return kazananlar;
}

// Çekilişi tamamla
async function cekilisiTamamla(mesajId) {
    if (!aktifCekilisler.has(mesajId)) return;

    const data = aktifCekilisler.get(mesajId);
    data.bitti = true;

    try {
        const kanal = await client.channels.fetch(data.kanalId);
        const mesaj = await kanal.messages.fetch(mesajId);

        let sonucEmbed;
        let kazananMesaj = '';

        if (data.katilimcilar.size === 0) {
            sonucEmbed = new EmbedBuilder()
                .setTitle('😢 ÇEKİLİŞ SONA ERDİ')
                .setDescription(`**Ödül:** ${data.odul}\n\n❌ Yeterli katılımcı olmadığı için çekiliş yapılamadı.`)
                .setColor('#ff6b6b')
                .setTimestamp();
        } else {
            const kazananlar = kazananSec(data.katilimcilar, data.kazananSayisi);

            sonucEmbed = new EmbedBuilder()
                .setTitle('🎊 ÇEKİLİŞ SONA ERDİ!')
                .setDescription(`**Ödül:** ${data.odul}`)
                .addFields(
                    { name: '🏆 Kazananlar', value: kazananlar.map(id => `<@${id}>`).join('\n') },
                    { name: '👥 Toplam Katılımcı', value: `${data.katilimcilar.size}` }
                )
                .setColor('#ffd700')
                .setTimestamp();

            kazananMesaj = `🎉 **Tebrikler!** ${kazananlar.map(id => `<@${id}>`).join(', ')}\n\n**${data.odul}** kazandınız! 🎊`;
        }

        await mesaj.edit({ embeds: [sonucEmbed], components: [] });

        if (kazananMesaj) {
            await kanal.send(kazananMesaj);
        }

    } catch (error) {
        console.error('Çekiliş tamamlama hatası:', error);
    }
}

// Botu başlat
client.login(CONFIG.TOKEN);