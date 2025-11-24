const { spawn } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('    Discord Bot Launcher');
console.log('========================================\n');

// Minecraft Bot'u başlat
console.log('🎮 Minecraft Bot başlatılıyor...');
const minecraftBot = spawn('node', ['index.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

minecraftBot.on('error', (error) => {
  console.error('❌ Minecraft Bot hatası:', error);
});

minecraftBot.on('exit', (code) => {
  console.log(`⚠️ Minecraft Bot kapandı (kod: ${code})`);
});

// 2 saniye bekle
setTimeout(() => {
  // Ticket Bot'u başlat
  console.log('🎫 Ticket Bot başlatılıyor...');
  const ticketBot = spawn('node', ['ticketbot.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  ticketBot.on('error', (error) => {
    console.error('❌ Ticket Bot hatası:', error);
  });

  ticketBot.on('exit', (code) => {
    console.log(`⚠️ Ticket Bot kapandı (kod: ${code})`);
  });

  console.log('\n========================================');
  console.log('✅ Her iki bot da çalışıyor!');
  console.log('========================================');
  console.log('Durdurmak için CTRL+C tuşlarına basın.\n');
}, 2000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️ Botlar kapatılıyor...');
  minecraftBot.kill();
  ticketBot.kill();
  process.exit(0);
});