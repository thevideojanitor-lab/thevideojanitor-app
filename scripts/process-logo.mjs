import sharp from 'sharp';
import { statSync } from 'fs';

const src = 'brand/TVJLogo-master.png';
const outDir = 'src/assets';

// Trim transparent padding from the 1920x1080 source -> 1388x898 content
const full = await sharp(src).trim().toBuffer();

// Export an optimized PNG + WebP at 480px tall (crisp up to ~160px display @3x; tiny files)
const TARGET_H = 480;

await sharp(full)
  .resize({ height: TARGET_H })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(`${outDir}/logo.png`);

await sharp(full)
  .resize({ height: TARGET_H })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(`${outDir}/logo.webp`);

const kb = (p) => (statSync(p).size / 1024).toFixed(1) + ' KB';
console.log('wrote src/assets/logo.png ', kb(`${outDir}/logo.png`));
console.log('wrote src/assets/logo.webp', kb(`${outDir}/logo.webp`));
