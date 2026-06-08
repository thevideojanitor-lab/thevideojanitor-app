# Brand assets

`TVJLogo-master.png` — the full-resolution (1920×1080, transparent) TheVideoJanitors
mascot logo. **Source of truth.** All derived assets below are generated from it; edit
or replace the master, then re-run the scripts rather than hand-editing the outputs.

## Derived assets & how to regenerate

All scripts read `brand/TVJLogo-master.png` and use `sharp` (a devDependency).
Run from the repo root:

| Script | Generates |
|---|---|
| `node scripts/process-logo.mjs` | `src/assets/logo.png` + `logo.webp` (footer / in-app logo) |
| `node scripts/make-icons.mjs` | `public/favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192/512` (mascot head crop) |
| `node scripts/make-og.mjs` | `public/og-image.png` (1200×630 social share card) |
