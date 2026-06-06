// One-off codemod: map legacy hardcoded palette hex (used in Tailwind arbitrary
// values like text-[#FF5F15]) to design tokens so app screens become theme-aware.
// Preserves utility prefix (incl. hover:/md: etc.) and opacity suffix (/10).
// Usage: node scripts/hex-to-token.mjs <file> [<file> ...]
import { readFileSync, writeFileSync } from "node:fs";

const MAP = {
  FF5F15: "primary",
  E54E08: "primary-hover",
  F9FAFB: "foreground",
  "9CA3AF": "muted-foreground",
  121212: "background",
  "2A2A2A": "border",
  "1A1A1A": "input",
  404040: "card",
  "4A4A4A": "surface-elevated",
  "3A3A3A": "border",
  "3B82F6": "editor-accent",
};

const PREFIX =
  "(?:text|bg|border(?:-[a-z]+)?|ring(?:-offset)?|from|to|via|fill|stroke|placeholder|divide|outline|caret|accent|decoration)";

const files = process.argv.slice(2);
let totalFiles = 0;
for (const f of files) {
  let src = readFileSync(f, "utf8");
  const before = src;
  for (const [hex, token] of Object.entries(MAP)) {
    const re = new RegExp(`(?<![\\w-])(${PREFIX}-)\\[#${hex}\\]`, "gi");
    src = src.replace(re, (_m, p1) => `${p1}${token}`);
  }
  if (src !== before) {
    writeFileSync(f, src);
    totalFiles++;
    // count remaining arbitrary hex classes for visibility
    const remaining = (src.match(/-\[#[0-9A-Fa-f]{3,8}\]/g) || []).length;
    console.log(`updated ${f} (remaining arbitrary-hex classes: ${remaining})`);
  } else {
    console.log(`no change ${f}`);
  }
}
console.log(`\n${totalFiles} file(s) changed`);
