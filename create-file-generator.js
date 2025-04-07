/**
 * Bu betik, eksik dosyaları oluşturmanıza yardımcı olur.
 * Node.js ile çalıştırılmalıdır:
 * node create-file-generator.js
 */

const fs = require('fs');
const path = require('path');

// Ana dizin
const rootDir = __dirname;

// İmg klasörü oluştur
const imgDir = path.join(rootDir, 'img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
    console.log('img klasörü oluşturuldu.');
}

// Kullanıcı avatarı oluştur (base64 formatında)
const userImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMDEtMDdUMTU6MjQ6MjQrMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTAxLTA3VDE1OjI1OjM2KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTAxLTA3VDE1OjI1OjM2KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmVjZTcxYzM4LWJh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';
const userImage = Buffer.from(userImageBase64, 'base64');

// Favicon oluştur
const faviconBase64 = 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACIiIgciIiIiIiIiIiIiIiIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiIiJEIiIiniIiIqMiIiKjIiIinyIiIkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIiIiRSIiIqQiIiL/IiIi/yIiIv8iIiL/IiIipSIiIkYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADj4+MA4+PjAP///wD///8A////AP///wDj4+MA4+PjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACIiIgEiIiIRIiIiaiIiItsiIiLbIiIiaiIiIhEiIiIBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIiIiACIiIisiIiK+IiIi/yIiIv8iIiK+IiIiKyIiIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiIiIAIiIiKyIiIr4iIiL/IiIi/yIiIr4iIiIrIiIiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACIiIgAiIiIrIiIiviIiIv8iIiL/IiIiviIiIisiIiIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4+PjAOPj4wD///8A////AP///wD///8A4+PjAOPj4wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIiIiESIiImkiIiLbIiIi2yIiImkiIiIRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AqqqqDqqqqu6qqqruqqqqDv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wCqqqoOqqqq7qqqqu6qqqqR////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPHx8QDx8fEA8fHxAPHx8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgBwAA4AcAAMADAACAAQAAgAEAAIABAACDAwAAg8MAAIPDAACDwwAAgAEAAIABAACAAQAAwAMAAOAHAADwDwAA';
const faviconData = Buffer.from(faviconBase64, 'base64');

// Icon 192x192
function createSVGIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#2c3e50"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#3498db"/>
    <text x="${size/2}" y="${size/2}" font-family="Arial" font-size="${size/3}" 
      font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">CT</text>
  </svg>`;
}

// SVG'leri PNG'ye dönüştür (basit bir yaklaşım)
function svgToPngLike(svg) {
  const base64 = Buffer.from(svg).toString('base64');
  // data:image/svg+xml;base64 formatında döndür (tarayıcı bunu PNG gibi görüntüleyebilir)
  return Buffer.from(base64);
}

// Dosyaları oluştur
fs.writeFileSync(path.join(rootDir, 'favicon.ico'), faviconData);
console.log('favicon.ico oluşturuldu.');

fs.writeFileSync(path.join(imgDir, 'user.png'), userImage);
console.log('img/user.png oluşturuldu.');

fs.writeFileSync(path.join(imgDir, 'icon-192x192.png'), svgToPngLike(createSVGIcon(192)));
console.log('img/icon-192x192.png oluşturuldu.');

fs.writeFileSync(path.join(imgDir, 'icon-512x512.png'), svgToPngLike(createSVGIcon(512)));
console.log('img/icon-512x512.png oluşturuldu.');

console.log('\nTüm eksik dosyalar oluşturuldu! Uygulamayı şimdi yeniden başlatın.');
console.log('Server\'ı başlatmak için: node server.js');
