import sharp from 'sharp';
import { statSync } from 'fs';

const src = 'E:/Docu and Logo TVJ/TVJLogo.png';
const out = 'public';
const BG = '#121212';

const full = await sharp(src).trim().toBuffer({ resolveWithObject: true });
const { width: fw, height: fh } = full.info;

// Iconic crop: the janitor's head + hard hat (recognizable down to 16px)
const head = await sharp(full.data)
  .extract({
    left: Math.round(fw * 0.40), top: Math.round(fh * 0.02),
    width: Math.round(fw * 0.30), height: Math.round(fh * 0.34),
  })
  .trim()
  .toBuffer();

// Compose the head centered on a filled brand-dark square (filled = safe for iOS + maskable)
async function icon(size, padRatio) {
  const inner = Math.round(size * (1 - padRatio));
  const fitted = await sharp(head)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: fitted, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// Minimal ICO encoder embedding PNG frames (supported everywhere modern)
function buildIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = 6 + frames.length * 16;
  const entries = [], datas = [];
  for (const { size, buffer } of frames) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buffer.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e); datas.push(buffer); offset += buffer.length;
  }
  return Buffer.concat([header, ...entries, ...datas]);
}

// Standard favicons / app icons (slightly tighter padding for the masked Android ones)
const f96  = await icon(96, 0.12);
const f180 = await icon(180, 0.12);
const f192 = await icon(192, 0.18);
const f512 = await icon(512, 0.18);

await sharp(f96).toFile(`${out}/favicon-96x96.png`);
await sharp(f180).toFile(`${out}/apple-touch-icon.png`);
await sharp(f192).toFile(`${out}/web-app-manifest-192x192.png`);
await sharp(f512).toFile(`${out}/web-app-manifest-512x512.png`);

const ico = buildIco([
  { size: 16, buffer: await icon(16, 0.08) },
  { size: 32, buffer: await icon(32, 0.10) },
  { size: 48, buffer: await icon(48, 0.10) },
]);
const { writeFileSync } = await import('fs');
writeFileSync(`${out}/favicon.ico`, ico);

const kb = (p) => (statSync(p).size / 1024).toFixed(1) + ' KB';
for (const f of ['favicon.ico', 'favicon-96x96.png', 'apple-touch-icon.png',
  'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png']) {
  console.log(`${out}/${f}`.padEnd(42), kb(`${out}/${f}`));
}
