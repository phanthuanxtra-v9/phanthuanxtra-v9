# PROJECT STATE

## Current checkpoint — 2026-09-06

### Previous production checkpoint
- Run #58: `34023110015` completed successfully.
- Worker `phanthuanxtra-v2` deployed version `ee69e468-dfc9-45d9-987d-8b2a2e268817`.

### New PT Xtra image-branding change
- Added `public/branding/pt-xtra-plate.svg` as a **display branding overlay**, not a legal registration plate.
- Added Cloudflare Images binding `IMAGES` to `wrangler.json`.
- `/media/<key>?branding=pt-xtra` now transforms the R2 image with the PT Xtra display plate overlay.
- Overlay is centered near the bottom of the image and uses a plate-like white/black visual treatment.
- Auto-published Telegram vehicle images now use the branded media URL with `branding=pt-xtra`.
- Original source image remains unchanged in R2.
- If the Images binding or overlay asset is unavailable, branded delivery fails closed instead of silently sending the unbranded image.
- Enabled Workers Cache for repeat transformed-image requests.

### Safety
- `PT Xtra` is branding/display text only.
- The system never invents or overwrites a real legal registration plate number in vehicle data.
- No AI-generated vehicle facts are added by the branding layer.

### Tests
- Added `tests/pt-xtra-plate.test.mjs` for branding identity and legal-plate separation.
- Added `tests/pt-xtra-media.test.mjs` for the media transformation path and unbranded fallback.
- CI workflow updated to execute both new test files.

### CI / production gate
- Latest implementation commit: `331dfa5353cedb74a28cb68f95fbb49ea03c2b97`.
- Awaiting GitHub Actions validation and production deployment evidence for this new image-branding change.
- Do not claim the new PT Xtra overlay is production-active until the new CI validate job and production deployment both finish successfully.
