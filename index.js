const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
let qrCodeData = '';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('QR Code generated');
    qrCodeData = qr;
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
});

client.on('message', async (msg) => {
    if (msg.body === '!ping') {
        msg.reply('pong');
    }
});

client.initialize();

app.get('/qr', async (req, res) => {
    if (!qrCodeData) {
        return res.send('جاري إعداد الرمز، يرجى تحديث الصفحة بعد ثوانٍ...');
    }
    try {
        const url = await qrcode.toDataURL(qrCodeData);
        res.send(`<h2>قم بمسح الرمز عبر الواتساب:</h2><img src="${url}" />`);
    } catch (err) {
        res.status(500).send('خطأ في توليد الرمز');
    }
});

app.get('/', (req, res) => {
    res.send('WhatsApp Video Bot is Running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});