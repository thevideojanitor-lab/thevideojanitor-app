import sharp from 'sharp';
import { statSync } from 'fs';

const src = 'brand/TVJLogo-master.png';
const out = 'public/og-image.png';
const W = 1200, H = 630;

// Brand-dark background with a soft orange radial halo behind the logo
const bg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="halo" cx="50%" cy="46%" r="42%">
      <stop offset="0%" stop-color="#FF5F15" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="#FF5F15" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#FF5F15" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#121212"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
</svg>`);

const logo = await sharp(src).trim().resize({ width: 720 }).toBuffer();

await sharp(bg)
  .composite([{ input: logo, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(out, (statSync(out).size / 1024).toFixed(1) + ' KB', `(${W}x${H})`);
