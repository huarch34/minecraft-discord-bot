const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Yapılandırma
const config = {
    token: '',
    guildId: '',
    staffRoleId: '',
    whitelistRoleId: '',
    approvedStaffRoleId: '',
    logChannelId: '',
    whitelistChannelId: '',
    staffApplicationChannelId: '',
    minecraftServerIP: '',
    minAge: 13
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const whitelistFile = path.join(dataDir, 'whitelist.json');
const staffApplicationFile = path.join(dataDir, 'staff_applications.json');
const blacklistFile = path.join(dataDir, 'blacklist.json');

function loadData(file) {
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return [];
}

function saveData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let whitelistData = loadData(whitelistFile);
let staffApplicationData = loadData(staffApplicationFile);
let blacklistData = loadData(blacklistFile);

client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} olarak giriş yaptı!`);
    client.user.setActivity('Minecraft Sunucusu', { type: 'WATCHING' });
    registerCommands();
});

async function registerCommands() {
    const commands = [
        {
            name: 'whitelist-panel',
            description: 'Whitelist başvuru panelini oluşturur (Sadece Yöneticiler)',
            default_member_permissions: PermissionFlagsBits.Administrator.toString()
        },
        {
            name: 'yetkili-panel',
            description: 'Yetkili başvuru panelini oluşturur (Sadece Yöneticiler)',
            default_member_permissions: PermissionFlagsBits.Administrator.toString()
        },
        {
            name: 'whitelist-kontrol',
            description: 'Bir kullanıcının whitelist durumunu kontrol eder',
            options: [{
                name: 'kullanıcı',
                description: 'Kontrol edilecek kullanıcı',
                type: 6,
                required: true
            }]
        },
        {
            name: 'başvuru-sil',
            description: 'Bir başvuruyu siler (Yetkililer)',
            options: [
                {
                    name: 'tür',
                    description: 'Başvuru türü',
                    type: 3,
                    required: true,
                    choices: [
                        { name: 'Whitelist', value: 'whitelist' },
                        { name: 'Yetkili', value: 'staff' }
                    ]
                },
                {
                    name: 'kullanıcı',
                    description: 'Başvurusu silinecek kullanıcı',
                    type: 6,
                    required: true
                }
            ]
        },
        {
            name: 'blacklist',
            description: 'Bir kullanıcıyı yasaklar veya yasağını kaldırır',
            default_member_permissions: PermissionFlagsBits.Administrator.toString(),
            options: [
                {
                    name: 'ekle',
                    description: 'Kullanıcıyı blacklist\'e ekle',
                    type: 1,
                    options: [
                        {
                            name: 'kullanıcı',
                            description: 'Yasaklanacak kullanıcı',
                            type: 6,
                            required: true
                        },
                        {
                            name: 'sebep',
                            description: 'Yasaklama sebebi',
                            type: 3,
                            required: true
                        }
                    ]
                },
                {
                    name: 'kaldır',
                    description: 'Kullanıcıyı blacklist\'ten çıkar',
                    type: 1,
                    options: [{
                        name: 'kullanıcı',
                        description: 'Yasağı kaldırılacak kullanıcı',
                        type: 6,
                        required: true
                    }]
                }
            ]
        },
        {
            name: 'istatistik',
            description: 'Bot istatistiklerini gösterir'
        }
    ];

    try {
        await client.application.commands.set(commands);
        console.log('✅ Slash komutları başarıyla yüklendi!');
    } catch (error) {
        console.error('❌ Komut yükleme hatası:', error);
    }
}

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        await handleCommand(interaction);
    } else if (interaction.isButton()) {
        await handleButton(interaction);
    } else if (interaction.isModalSubmit()) {
        await handleModal(interaction);
    }
});

async function handleCommand(interaction) {
    const { commandName } = interaction;
    try {
        switch (commandName) {
            case 'whitelist-panel': await createWhitelistPanel(interaction); break;
            case 'yetkili-panel': await createStaffPanel(interaction); break;
            case 'whitelist-kontrol': await checkWhitelist(interaction); break;
            case 'başvuru-sil': await deleteApplication(interaction); break;
            case 'blacklist': await handleBlacklist(interaction); break;
            case 'istatistik': await showStats(interaction); break;
        }
    } catch (error) {
        console.error('Komut hatası:', error);
        await interaction.reply({ content: '❌ Bir hata oluştu!', ephemeral: true });
    }
}

async function createWhitelistPanel(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('🎮 Minecraft Whitelist Başvurusu')
        .setDescription(`**${config.minecraftServerIP}** sunucumuza hoş geldiniz!\n\nSunucumuza katılabilmek için whitelist başvurusu yapmanız gerekmektedir.`)
        .addFields(
            { name: '📋 Başvuru Süreci', value: 'Aşağıdaki butona tıklayarak başvuru formunu doldurabilirsiniz.' },
            { name: '⏱️ İşlem Süresi', value: 'Başvurular genellikle 24 saat içinde değerlendirilir.' },
            { name: '✅ Onay Sonrası', value: 'Başvurunuz onaylandığında size özel bir rol verilecek ve sunucuya giriş yapabileceksiniz.' },
            { name: '📝 Kurallar', value: '• Gerçek bilgiler paylaşın\n• Minecraft kullanıcı adınızı doğru yazın\n• Sunucu kurallarına uyacağınızı taahhüt edin' }
        )
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: 'Minecraft Whitelist Sistemi' })
        .setTimestamp();

    const button = new ButtonBuilder()
        .setCustomId('whitelist_apply')
        .setLabel('Whitelist Başvurusu Yap')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);
    await interaction.reply({ content: '✅ Whitelist paneli oluşturuldu!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
}

async function createStaffPanel(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('👑 Yetkili Başvurusu')
        .setDescription(`**${interaction.guild.name}** sunucusunun yetkili kadrosuna katılmak ister misiniz?\n\nDeneyimli, sorumluluk sahibi ve aktif yetkili adayları arıyoruz!`)
        .addFields(
            { name: '📋 Aranan Özellikler', value: '• En az 16 yaşında olmak\n• Günde en az 3 saat aktif olabilmek\n• Discord ve Minecraft deneyimi\n• İyi iletişim becerileri\n• Sorumluluk bilinci' },
            { name: '🎯 Yetkili Görevleri', value: '• Oyuncuların sorularını yanıtlamak\n• Kural ihlallerini tespit etmek\n• Etkinlik düzenlemek\n• Sunucu gelişimine katkıda bulunmak' },
            { name: '⚠️ Önemli Bilgiler', value: '• Başvurular dikkatle incelenir\n• Mülakat süreci vardır\n• Deneme süresi uygulanır\n• Yalan beyanda bulunmayın' },
            { name: '📝 Başvuru Sonrası', value: 'Başvurunuz değerlendirildikten sonra size Discord üzerinden ulaşılacaktır.' }
        )
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: 'Yetkili Başvuru Sistemi' })
        .setTimestamp();

    const button = new ButtonBuilder()
        .setCustomId('staff_apply')
        .setLabel('Yetkili Başvurusu Yap')
        .setEmoji('👑')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);
    await interaction.reply({ content: '✅ Yetkili başvuru paneli oluşturuldu!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
}

async function handleButton(interaction) {
    const { customId, user } = interaction;

    if (blacklistData.some(b => b.userId === user.id)) {
        return interaction.reply({ content: '❌ Yasaklı olduğunuz için başvuru yapamazsınız!', ephemeral: true });
    }

    if (customId === 'whitelist_apply') {
        if (whitelistData.some(w => w.userId === user.id && w.status === 'pending')) {
            return interaction.reply({ content: '❌ Zaten beklemede bir başvurunuz var!', ephemeral: true });
        }
        if (whitelistData.some(w => w.userId === user.id && w.status === 'approved')) {
            return interaction.reply({ content: '✅ Zaten whitelist\'e eklendiniz!', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId('whitelist_modal').setTitle('Whitelist Başvuru Formu');
        const minecraftUsername = new TextInputBuilder().setCustomId('minecraft_username').setLabel('Minecraft Kullanıcı Adı').setPlaceholder('steve123').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(16);
        const age = new TextInputBuilder().setCustomId('age').setLabel('Yaşınız').setPlaceholder('18').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(2);
        const experience = new TextInputBuilder().setCustomId('experience').setLabel('Minecraft Deneyiminiz').setPlaceholder('5 yıldır Minecraft oynuyorum...').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500);
        const whyJoin = new TextInputBuilder().setCustomId('why_join').setLabel('Neden Katılmak İstiyorsunuz?').setPlaceholder('Dostça bir toplulukta oynamak istiyorum...').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500);
        const rules = new TextInputBuilder().setCustomId('rules_accept').setLabel('Kuralları Kabul Ediyor Musunuz? (Evet/Hayır)').setPlaceholder('Evet').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(5);

        modal.addComponents(
            new ActionRowBuilder().addComponents(minecraftUsername),
            new ActionRowBuilder().addComponents(age),
            new ActionRowBuilder().addComponents(experience),
            new ActionRowBuilder().addComponents(whyJoin),
            new ActionRowBuilder().addComponents(rules)
        );
        await interaction.showModal(modal);
    }

    if (customId === 'staff_apply') {
        if (staffApplicationData.some(s => s.userId === user.id && s.status === 'pending')) {
            return interaction.reply({ content: '❌ Zaten beklemede bir yetkili başvurunuz var!', ephemeral: true });
        }
        if (staffApplicationData.some(s => s.userId === user.id && s.status === 'approved')) {
            return interaction.reply({ content: '✅ Zaten yetkilisiniz!', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId('staff_modal').setTitle('Yetkili Başvuru Formu');
        const age = new TextInputBuilder().setCustomId('staff_age').setLabel('Yaşınız').setPlaceholder('18').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(2);
        const activeTime = new TextInputBuilder().setCustomId('active_time').setLabel('Günde Kaç Saat Aktif Olabilirsiniz?').setPlaceholder('4-5 saat').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50);
        const experience = new TextInputBuilder().setCustomId('staff_experience').setLabel('Daha Önce Yetkililik Yaptınız Mı?').setPlaceholder('Evet, X sunucusunda...').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500);
        const whyStaff = new TextInputBuilder().setCustomId('why_staff').setLabel('Neden Yetkili Olmak İstiyorsunuz?').setPlaceholder('Sunucuya katkıda bulunmak istiyorum...').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500);
        const situation = new TextInputBuilder().setCustomId('situation').setLabel('Kural İhlali Durumunda Ne Yapardınız?').setPlaceholder('Önce uyarı verirdim...').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500);

        modal.addComponents(
            new ActionRowBuilder().addComponents(age),
            new ActionRowBuilder().addComponents(activeTime),
            new ActionRowBuilder().addComponents(experience),
            new ActionRowBuilder().addComponents(whyStaff),
            new ActionRowBuilder().addComponents(situation)
        );
        await interaction.showModal(modal);
    }

    if (customId.startsWith('approve_whitelist_') || customId.startsWith('reject_whitelist_')) {
        await handleWhitelistDecision(interaction);
    }
    if (customId.startsWith('approve_staff_') || customId.startsWith('reject_staff_')) {
        await handleStaffDecision(interaction);
    }
}

async function handleModal(interaction) {
    const { customId, user, fields } = interaction;

    if (customId === 'whitelist_modal') {
        const minecraftUsername = fields.getTextInputValue('minecraft_username');
        const age = parseInt(fields.getTextInputValue('age'));
        const experience = fields.getTextInputValue('experience');
        const whyJoin = fields.getTextInputValue('why_join');
        const rulesAccept = fields.getTextInputValue('rules_accept').toLowerCase();

        if (age < config.minAge) {
            return interaction.reply({ content: `❌ Sunucumuza katılmak için en az ${config.minAge} yaşında olmalısınız!`, ephemeral: true });
        }
        if (rulesAccept !== 'evet') {
            return interaction.reply({ content: '❌ Sunucu kurallarını kabul etmelisiniz!', ephemeral: true });
        }

        const application = {
            userId: user.id, username: user.username, minecraftUsername, age, experience, whyJoin, timestamp: Date.now(), status: 'pending'
        };

        whitelistData.push(application);
        saveData(whitelistFile, whitelistData);
        await interaction.reply({ content: '✅ Whitelist başvurunuz başarıyla gönderildi!', ephemeral: true });
        await sendWhitelistNotification(interaction, application);
    }

    if (customId === 'staff_modal') {
        const age = parseInt(fields.getTextInputValue('staff_age'));
        const activeTime = fields.getTextInputValue('active_time');
        const experience = fields.getTextInputValue('staff_experience');
        const whyStaff = fields.getTextInputValue('why_staff');
        const situation = fields.getTextInputValue('situation');

        if (age < 16) {
            return interaction.reply({ content: '❌ Yetkili olmak için en az 16 yaşında olmalısınız!', ephemeral: true });
        }

        const application = {
            userId: user.id, username: user.username, age, activeTime, experience, whyStaff, situation, timestamp: Date.now(), status: 'pending'
        };

        staffApplicationData.push(application);
        saveData(staffApplicationFile, staffApplicationData);
        await interaction.reply({ content: '✅ Yetkili başvurunuz başarıyla gönderildi!', ephemeral: true });
        await sendStaffNotification(interaction, application);
    }
}

async function sendWhitelistNotification(interaction, application) {
    const channel = await interaction.guild.channels.fetch(config.logChannelId);
    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('📝 Yeni Whitelist Başvurusu')
        .setDescription(`<@${application.userId}> whitelist başvurusu yaptı.`)
        .addFields(
            { name: '👤 Discord', value: `<@${application.userId}>`, inline: true },
            { name: '🎮 Minecraft', value: application.minecraftUsername, inline: true },
            { name: '🎂 Yaş', value: application.age.toString(), inline: true },
            { name: '⏱️ Deneyim', value: application.experience },
            { name: '❓ Katılma Nedeni', value: application.whyJoin }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `Başvuru ID: ${application.userId}` })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`approve_whitelist_${application.userId}`).setLabel('Onayla').setEmoji('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`reject_whitelist_${application.userId}`).setLabel('Reddet').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );
    await channel.send({ embeds: [embed], components: [row] });
}

async function sendStaffNotification(interaction, application) {
    const channel = await interaction.guild.channels.fetch(config.logChannelId);
    const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('👑 Yeni Yetkili Başvurusu')
        .setDescription(`<@${application.userId}> yetkili başvurusu yaptı.`)
        .addFields(
            { name: '👤 Kullanıcı', value: `<@${application.userId}>`, inline: true },
            { name: '🎂 Yaş', value: application.age.toString(), inline: true },
            { name: '⏰ Aktiflik', value: application.activeTime, inline: true },
            { name: '📚 Deneyim', value: application.experience },
            { name: '💭 Yetkili Olma Nedeni', value: application.whyStaff },
            { name: '⚖️ Durum Senaryosu', value: application.situation }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `Başvuru ID: ${application.userId}` })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`approve_staff_${application.userId}`).setLabel('Onayla').setEmoji('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`reject_staff_${application.userId}`).setLabel('Reddet').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );
    await channel.send({ embeds: [embed], components: [row] });
}

async function handleWhitelistDecision(interaction) {
    const { customId, member, user } = interaction;
    const [action, type, userId] = customId.split('_');

    if (!member.roles.cache.has(config.staffRoleId) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Bu işlemi yapmaya yetkiniz yok!', ephemeral: true });
    }

    const applicationIndex = whitelistData.findIndex(w => w.userId === userId && w.status === 'pending');
    if (applicationIndex === -1) {
        return interaction.reply({ content: '❌ Başvuru bulunamadı!', ephemeral: true });
    }

    const application = whitelistData[applicationIndex];
    const targetMember = await interaction.guild.members.fetch(userId);

    if (action === 'approve') {
        application.status = 'approved';
        application.approvedBy = user.id;
        application.approvedAt = Date.now();
        saveData(whitelistFile, whitelistData);
        await targetMember.roles.add(config.whitelistRoleId);

        try {
            await targetMember.send({ embeds: [new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Whitelist Başvurunuz Onaylandı!')
                .setDescription(`Tebrikler! **${interaction.guild.name}** sunucusuna whitelist başvurunuz onaylandı.`)
                .addFields(
                    { name: '🎮 Sunucu IP', value: config.minecraftServerIP },
                    { name: '📝 Minecraft Kullanıcı Adı', value: application.minecraftUsername }
                )
                .setTimestamp()
            ]});
        } catch (e) { console.log('DM gönderilemedi'); }

        await interaction.update({ content: `✅ **${application.username}** kullanıcısının başvurusu onaylandı!`, embeds: [interaction.message.embeds[0]], components: [] });
    } else if (action === 'reject') {
        application.status = 'rejected';
        application.rejectedBy = user.id;
        application.rejectedAt = Date.now();
        saveData(whitelistFile, whitelistData);

        try {
            await targetMember.send({ embeds: [new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ Whitelist Başvurunuz Reddedildi')
                .setDescription(`Üzgünüz, **${interaction.guild.name}** sunucusuna whitelist başvurunuz reddedildi.`)
                .setTimestamp()
            ]});
        } catch (e) { console.log('DM gönderilemedi'); }

        await interaction.update({ content: `❌ **${application.username}** kullanıcısının başvurusu reddedildi!`, embeds: [interaction.message.embeds[0]], components: [] });
    }
}

async function handleStaffDecision(interaction) {
    const { customId, member, user } = interaction;
    const [action, type, userId] = customId.split('_');

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Bu işlemi yapmaya yetkiniz yok!', ephemeral: true });
    }

    const applicationIndex = staffApplicationData.findIndex(s => s.userId === userId && s.status === 'pending');
    if (applicationIndex === -1) {
        return interaction.reply({ content: '❌ Başvuru bulunamadı!', ephemeral: true });
    }

    const application = staffApplicationData[applicationIndex];
    const targetMember = await interaction.guild.members.fetch(userId);

    if (action === 'approve') {
        application.status = 'approved';
        application.approvedBy = user.id;
        application.approvedAt = Date.now();
        saveData(staffApplicationFile, staffApplicationData);
        await targetMember.roles.add(config.approvedStaffRoleId);

        try {
            await targetMember.send({ embeds: [new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Yetkili Başvurunuz Onaylandı!')
                .setDescription(`Tebrikler! **${interaction.guild.name}** sunucusunda yetkili kadrosuna katıldınız.`)
                .setTimestamp()
            ]});
        } catch (e) { console.log('DM gönderilemedi'); }

        await interaction.update({ content: `✅ **${application.username}** kullanıcısının başvurusu onaylandı!`, embeds: [interaction.message.embeds[0]], components: [] });
    } else if (action === 'reject') {
        application.status = 'rejected';
        application.rejectedBy = user.id;
        application.rejectedAt = Date.now();
        saveData(staffApplicationFile, staffApplicationData);

        try {
            await targetMember.send({ embeds: [new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ Yetkili Başvurunuz Reddedildi')
                .setDescription(`Üzgünüz, **${interaction.guild.name}** sunucusuna yetkili başvurunuz reddedildi.`)
                .setTimestamp()
            ]});
        } catch (e) { console.log('DM gönderilemedi'); }

        await interaction.update({ content: `❌ **${application.username}** kullanıcısının başvurusu reddedildi!`, embeds: [interaction.message.embeds[0]], components: [] });
    }
}

async function checkWhitelist(interaction) {
    const targetUser = interaction.options.getUser('kullanıcı');
    const whitelistEntry = whitelistData.find(w => w.userId === targetUser.id);
    const embed = new EmbedBuilder().setColor('#3498db').setTitle('🔍 Whitelist Durum Kontrolü').setThumbnail(targetUser.displayAvatarURL());

    if (!whitelistEntry) {
        embed.setDescription(`**${targetUser.username}** için whitelist kaydı bulunamadı.`).addFields({ name: '📊 Durum', value: 'Başvuru Yok' });
    } else {
        const statusMap = { pending: ['⏳', 'Beklemede'], approved: ['✅', 'Onaylandı'], rejected: ['❌', 'Reddedildi'] };
        const [emoji, text] = statusMap[whitelistEntry.status];
        embed.setDescription(`**${targetUser.username}** whitelist durumu:`).addFields(
            { name: '📊 Durum', value: `${emoji} ${text}`, inline: true },
            { name: '🎮 Minecraft Adı', value: whitelistEntry.minecraftUsername, inline: true },
            { name: '📅 Başvuru Tarihi', value: `<t:${Math.floor(whitelistEntry.timestamp / 1000)}:R>`, inline: true }
        );
        if (whitelistEntry.status === 'approved') {
            embed.addFields({ name: '✅ Onaylayan', value: `<@${whitelistEntry.approvedBy}>`, inline: true });
        } else if (whitelistEntry.status === 'rejected') {
            embed.addFields({ name: '❌ Reddeden', value: `<@${whitelistEntry.rejectedBy}>`, inline: true });
        }
    }
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function deleteApplication(interaction) {
    const type = interaction.options.getString('tür');
    const targetUser = interaction.options.getUser('kullanıcı');

    if (!interaction.member.roles.cache.has(config.staffRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Bu işlemi yapmaya yetkiniz yok!', ephemeral: true });
    }

    if (type === 'whitelist') {
        const index = whitelistData.findIndex(w => w.userId === targetUser.id);
        if (index === -1) {
            return interaction.reply({ content: '❌ Bu kullanıcı için whitelist başvurusu bulunamadı!', ephemeral: true });
        }
        whitelistData.splice(index, 1);
        saveData(whitelistFile, whitelistData);
        await interaction.reply({ content: `✅ **${targetUser.username}** kullanıcısının whitelist başvurusu silindi!`, ephemeral: true });
    } else if (type === 'staff') {
        const index = staffApplicationData.findIndex(s => s.userId === targetUser.id);
        if (index === -1) {
            return interaction.reply({ content: '❌ Bu kullanıcı için yetkili başvurusu bulunamadı!', ephemeral: true });
        }
        staffApplicationData.splice(index, 1);
        saveData(staffApplicationFile, staffApplicationData);
        await interaction.reply({ content: `✅ **${targetUser.username}** kullanıcısının yetkili başvurusu silindi!`, ephemeral: true });
    }
}

async function handleBlacklist(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('kullanıcı');

    if (subcommand === 'ekle') {
        const reason = interaction.options.getString('sebep');
        if (blacklistData.some(b => b.userId === targetUser.id)) {
            return interaction.reply({ content: '❌ Bu kullanıcı zaten blacklist\'te!', ephemeral: true });
        }

        blacklistData.push({
            userId: targetUser.id,
            username: targetUser.username,
            reason,
            addedBy: interaction.user.id,
            timestamp: Date.now()
        });
        saveData(blacklistFile, blacklistData);

        whitelistData = whitelistData.filter(w => w.userId !== targetUser.id);
        staffApplicationData = staffApplicationData.filter(s => s.userId !== targetUser.id);
        saveData(whitelistFile, whitelistData);
        saveData(staffApplicationFile, staffApplicationData);

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            if (member.roles.cache.has(config.whitelistRoleId)) {
                await member.roles.remove(config.whitelistRoleId);
            }
            if (member.roles.cache.has(config.approvedStaffRoleId)) {
                await member.roles.remove(config.approvedStaffRoleId);
            }
        } catch (error) {
            console.log('Rol kaldırma hatası:', error);
        }

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🚫 Kullanıcı Blacklist\'e Eklendi')
            .addFields(
                { name: '👤 Kullanıcı', value: `${targetUser.username} (${targetUser.id})`, inline: true },
                { name: '⚖️ Sebep', value: reason, inline: true },
                { name: '👮 Ekleyen', value: `<@${interaction.user.id}>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'kaldır') {
        const index = blacklistData.findIndex(b => b.userId === targetUser.id);
        if (index === -1) {
            return interaction.reply({ content: '❌ Bu kullanıcı blacklist\'te değil!', ephemeral: true });
        }

        blacklistData.splice(index, 1);
        saveData(blacklistFile, blacklistData);

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✅ Kullanıcı Blacklist\'ten Kaldırıldı')
            .addFields(
                { name: '👤 Kullanıcı', value: `${targetUser.username} (${targetUser.id})`, inline: true },
                { name: '👮 Kaldıran', value: `<@${interaction.user.id}>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}

async function showStats(interaction) {
    const totalWhitelist = whitelistData.length;
    const pendingWhitelist = whitelistData.filter(w => w.status === 'pending').length;
    const approvedWhitelist = whitelistData.filter(w => w.status === 'approved').length;
    const rejectedWhitelist = whitelistData.filter(w => w.status === 'rejected').length;

    const totalStaff = staffApplicationData.length;
    const pendingStaff = staffApplicationData.filter(s => s.status === 'pending').length;
    const approvedStaff = staffApplicationData.filter(s => s.status === 'approved').length;
    const rejectedStaff = staffApplicationData.filter(s => s.status === 'rejected').length;

    const totalBlacklist = blacklistData.length;

    const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('📊 Bot İstatistikleri')
        .setDescription(`**${interaction.guild.name}** sunucusu için başvuru istatistikleri`)
        .addFields(
            { name: '📝 Whitelist Başvuruları', value: `Toplam: **${totalWhitelist}**\n⏳ Bekleyen: **${pendingWhitelist}**\n✅ Onaylı: **${approvedWhitelist}**\n❌ Reddedilen: **${rejectedWhitelist}**`, inline: true },
            { name: '👑 Yetkili Başvuruları', value: `Toplam: **${totalStaff}**\n⏳ Bekleyen: **${pendingStaff}**\n✅ Onaylı: **${approvedStaff}**\n❌ Reddedilen: **${rejectedStaff}**`, inline: true },
            { name: '🚫 Blacklist', value: `Toplam: **${totalBlacklist}**`, inline: true },
            { name: '🎮 Sunucu IP', value: config.minecraftServerIP, inline: true },
            { name: '⚡ Bot Durumu', value: '🟢 Çevrimiçi', inline: true },
            { name: '⏰ Çalışma Süresi', value: `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`, inline: true }
        )
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: `${interaction.guild.name} • Minecraft Bot` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(config.token)