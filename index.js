const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED - Scan this with your WhatsApp!');
    console.log(qr);
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async (msg) => {
    const text = msg.body;
    
    if (text.includes('youtube.com') || text.includes('youtu.be') || text.includes('instagram.com') || text.includes('facebook.com')) {
        msg.reply('جاري تحميل الفيديو، انتظر قليلاً...');
        
        const videoPath = path.join(__dirname, `video_${Date.now()}.mp4`);
        const command = `yt-dlp -f "bestvideo[height<=720]+bestaudio/best[height<=720]" -o "${videoPath}" "${text}"`;
        
        exec(command, (error) => {
            if (error) {
                msg.reply('حدث خطأ أثناء تحميل الفيديو.');
                return;
            }
            
            const media = MessageMedia.fromFilePath(videoPath);
            client.sendMessage(msg.from, media).then(() => {
                fs.unlinkSync(videoPath);
            });
        });
    }
});

client.initialize();