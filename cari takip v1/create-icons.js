const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// İkonları oluşturmak için bir fonksiyon
function createIcon(size, fileName) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Arka plan
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, size, size);

    // Orta daire
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();

    // Metin
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size / 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CT', size / 2, size / 2);

    // PNG dosyasını kaydet
    const outputPath = path.join(__dirname, 'img', fileName);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`${fileName} oluşturuldu: ${outputPath}`);
}

// Kullanıcı avatarı oluşturmak için bir fonksiyon
function createUserAvatar(fileName) {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');

    // Arka plan
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(0, 0, 100, 100);

    // Kullanıcı simgesi (daire)
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.arc(50, 35, 25, 0, Math.PI * 2);
    ctx.fill();

    // Gövde
    ctx.beginPath();
    ctx.arc(50, 90, 40, Math.PI, 2 * Math.PI);
    ctx.fill();

    // PNG dosyasını kaydet
    const outputPath = path.join(__dirname, 'img', fileName);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`${fileName} oluşturuldu: ${outputPath}`);
}

// `img` klasörünü oluştur
const imgDir = path.join(__dirname, 'img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
    console.log('img klasörü oluşturuldu.');
}

// İkonları oluştur
createIcon(192, 'icon-192x192.png');
createIcon(512, 'icon-512x512.png');

// Kullanıcı avatarını oluştur
createUserAvatar('user.png');
