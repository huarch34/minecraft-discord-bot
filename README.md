🎮 Minecraft & Discord Yönetim Sistemi
RCON • Ticket • Çekiliş • Başvuru • Çoklu Bot Çalıştırıcı

Bu proje; Minecraft sunucunu ve Discord topluluğunu tek noktadan yönetmeni sağlayan gelişmiş, modüler ve çok amaçlı bir Node.js sistemidir.
İçerisinde 5 farklı bot ve tam kontrol için çalıştırma yöneticisi bulunur.

📌 İçerik

Özellikler

Proje Yapısı

Kurulum

Çevresel Değişkenler

Minecraft Komutları

Discord Yönetim Komutları

Ticket Sistemi

Çekiliş Sistemi

Başvuru Sistemi

Botları Başlatma

Uyarılar

🚀 Özellikler
✔️ Minecraft Yönetim Botu (RCON)

Sunucuya RCON bağlantısı

Konsol komutları gönderme

Ban / unban / kick

Whitelist yönetimi

Sunucu istatistikleri

Broadcast gönderme

✔️ Discord Yönetimi

Rollerle yetki denetimi

Kanal kilitleme / açma

Mesaj temizleme

Embed duyuru

Rol verme / alma

✔️ Ticket Sistemi

Emoji ile ticket açma

Her kullanıcıya özel kanal

Ticket ID sistemi

tickets.json içine kayıt

Log kanalı desteği

✔️ Çekiliş Sistemi (çekiliş botu)

Süreli çekiliş

Emoji ile katılım

Otomatik kazanan seçimi

Reroll komutu

✔️ Başvuru Sistemi

Slash komutla başvuru

Özel mesajdan form doldurma

Cevapları log kanalına embed ile gönderme

Spam / tekrar koruma

✔️ Çoklu Bot Başlatıcı (start.js)

index.js

ticketbot.js

cekilisbot.js

basvuru.js
botlarını aynı anda başlatır.

📁 Proje Yapısı
/
├── index.js          # Minecraft + Discord yönetim botu
├── ticketbot.js      # Ticket sistemi
├── cekilisbot.js     # Çekiliş botu
├── basvuru.js        # Başvuru (form) botu
├── start.js          # Çoklu bot başlatıcı
├── start-bots.bat    # Windows için tek tıkla başlatma
├── tickets.json      # Ticket kayıtları
└── package.json

🔧 Kurulum
1️⃣ Bağımlılıkları yükle
npm install

2️⃣ ENV dosyası oluştur ||ŞART DEĞİL||

Aşağıdaki içeriği .env adında ekleyin:

DISCORD_TOKEN=ana_discord_bot_tokeni
TICKET_BOT_TOKEN=ticket_bot_tokeni
CEKILIS_BOT_TOKEN=cekilis_bot_tokeni
BASVURU_BOT_TOKEN=basvuru_bot_tokeni

GUILD_ID=sunucu_id

3️⃣ RCON ayarlarını doldur (index.js)
rcon: {
  host: "SUNUCU_IP",
  port: 25575,
  password: "RCON_SIFRE",
  timeout: 30000
}

4️⃣ Roller
roles: {
  admin: "ADMIN_ROLE_ID",
  yetkili: "YETKILI_ROLE_ID",
  oyuncu: "OYUNCU_ROLE_ID"
}

🗡️ Minecraft Komutları
Komut	Örnek Kullanım	Açıklama
/ban <oyuncu> <sebep>	/ban Ahmet hile	Oyuncuyu kalıcı olarak banlar.
/unban <oyuncu>	/unban Ahmet	Oyuncunun banını kaldırır.
/kick <oyuncu> <sebep>	/kick Mehmet spam	Oyuncuyu sunucudan atar.
/wl-ekle <oyuncu>	/wl-ekle Burak	Whitelist’e ekler.
/wl-sil <oyuncu>	/wl-sil Burak	Whitelist’ten çıkarır.
/broadcast <mesaj>	/broadcast etkinlik başlıyor!	Sunucudaki herkese mesaj yollar.
/komut <komut>	/komut time set day	RCON’a direkt komut iletir.
/sunucu-bilgi	-	Ping, TPS, online sayısı gibi bilgileri gösterir.
🛡️ Discord Yönetim Komutları
Komut	Açıklama
/yardim	Tüm komutları listeler.
/temizle <miktar>	Kanal mesajlarını temizler.
/kilit	Kanalı kilitler (yazı yazılamaz).
/kilit-kaldir	Kanal kilidini kaldırır.
/rol-ver <kullanıcı> <rol>	Kullanıcıya rol verir.
/rol-al <kullanıcı> <rol>	Kullanıcıdan rol alır.
/duyuru <mesaj>	Embed formatında duyuru gönderir.
🎟️ Ticket Sistemi

(ticketbot.js)

Özellikler:

Emoji ile açılan ticket sistemi

Otomatik kanal oluşturma

Yetkili rol kontrolü

Ticket ID yönetimi

tickets.json içinde kayıt

Log kanalı desteği

Ticket açmak için kullanıcı reaksiyona tıklar → sistem otomatik kanal açar.

🎁 Çekiliş Sistemi

(cekilisbot.js)

Komutlar
Komut	Örnek	Açıklama
/cekilis-baslat <süre> <ödül>	/cekilis-baslat 1h VIP	Süreli çekiliş başlatır.
/cekilis-bitir <mesajID>	-	Devam eden çekilişi erken bitirir.
/cekilis-reroll <mesajID>	-	Yeni kazanan seçer.
Süre Formatları:

1m → 1 dakika

1h → 1 saat

1d → 1 gün

📝 Başvuru Sistemi

(basvuru.js)

Özellikler

/basvuru komutuyla başlatılır

Kullanıcıya özel mesajda form gönderir

Cevaplar log kanalına embed olarak iletilir

Spam / tekrar başvuru engeli

Komutlar
Komut	Açıklama
/basvuru	Kullanıcıya başvuru formu gönderir.
/basvuru-log-ayarla	Log kanalını belirler.
▶️ Botları Başlatma
Tüm botları aynı anda çalıştırmak için:
node start.js

Tek tek başlatmak için:
node index.js
node ticketbot.js
node cekilisbot.js
node basvuru.js

Windows kullanıcıları:
start-bots.bat

⚠️ Uyarılar

Bot tokenlerini asla GitHub’a açık atma.

RCON portun açık olmalı.

tickets.json silinirse tüm ticket geçmişi gider.

Roller doğru atanmazsa komutlar çalışmaz.

Çekiliş, ticket ve başvuru botları için ayrı bot uygulaması gereklidir.

⭐ Destek
Bu proje tamamen kendi bilgilerimle arkadaşımın sunucusu için kodladığım bir projedir ve geliştirmeye açıktır.
Discord: huarch
Projeyi beğendiysen yıldız bırakmayı unutma!
