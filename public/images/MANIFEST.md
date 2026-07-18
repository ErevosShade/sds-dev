# Image placeholder manifest

Generated placeholders for every image slot on the site that was still rendering
a solid-color box. All files are SVG (scalable, no quality loss at any size) and
follow the site's dark/void + blue/amber accent palette so they don't look out
of place next to real content while they're swapped in.

**To replace one:** drop a real photo/logo in with the **same filename** (same
folder, same name, any format — jpg/png/webp all work, just update the
extension in the matching `src`/`logo`/`image` field in the file listed below),
or point the data field at a new path entirely. No component code needs to
change either way — every consumer already reads the path from a data file.

| File | Used in (component) | Wired via (data) | Dimensions | Represents |
|---|---|---|---|---|
| `gallery/01-opening-night.svg` | `src/components/sections/Gallery.jsx` | `GALLERY[0].src` | 520×380 (landscape) | DataQuest 2024 — Opening night |
| `gallery/02-workshop-session.svg` | `src/components/sections/Gallery.jsx` | `GALLERY[1].src` | 320×520 (portrait) | ML Bootcamp — Workshop session |
| `gallery/03-annual-summit.svg` | `src/components/sections/Gallery.jsx` | `GALLERY[2].src` | 520×380 (landscape) | SDS Annual Summit |
| `gallery/04-kaggle-night.svg` | `src/components/sections/Gallery.jsx` | `GALLERY[3].src` | 520×380 (landscape) | Kaggle Night — Final submissions |
| `gallery/05-industry-connect.svg` | `src/components/sections/Gallery.jsx` | `GALLERY[4].src` | 320×520 (portrait) | Industry Connect — Panel AMA |
| `gallery/06-team-offsite.svg` | `src/components/sections/Gallery.jsx` | `GALLERY[5].src` | 520×380 (landscape) | Team offsite — Semester close |
| `speakers/01-speaker-name.svg` | `src/components/sections/Speakers.jsx` | `src/data/speakers.js` → `SPEAKERS[0].image` | 200×200 (circle crop) | Chapter 01 speaker headshot |
| `speakers/02-speaker-name.svg` | `src/components/sections/Speakers.jsx` | `src/data/speakers.js` → `SPEAKERS[1].image` | 200×200 (circle crop) | Chapter 02 speaker headshot |
| `speakers/03-speaker-name.svg` | `src/components/sections/Speakers.jsx` | `src/data/speakers.js` → `SPEAKERS[2].image` | 200×200 (circle crop) | Chapter 03 speaker headshot |
| `sponsors/platinum-1.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[0].logo` | 168×34 | Platinum tier sponsor 1 |
| `sponsors/platinum-2.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[1].logo` | 168×34 | Platinum tier sponsor 2 |
| `sponsors/gold-1.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[2].logo` | 120×24 | Gold tier sponsor 1 |
| `sponsors/gold-2.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[3].logo` | 120×24 | Gold tier sponsor 2 |
| `sponsors/gold-3.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[4].logo` | 120×24 | Gold tier sponsor 3 |
| `sponsors/silver-1.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[5].logo` | 84×17 | Silver tier sponsor 1 |
| `sponsors/silver-2.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[6].logo` | 84×17 | Silver tier sponsor 2 |
| `sponsors/silver-3.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[7].logo` | 84×17 | Silver tier sponsor 3 |
| `sponsors/silver-4.svg` | `src/components/sections/Sponsors.jsx` | `src/data/sponsors.js` → `SPONSORS[8].logo` | 84×17 | Silver tier sponsor 4 |

## Notes

- **Gallery** dimensions are the *maximum* rendered size (`clamp()` in Gallery.jsx
  shrinks them on smaller viewports); the SVGs are vector so this doesn't matter
  for quality, only for aspect ratio — keep landscape ≈ 520:380 and portrait ≈
  320:520 if you swap in a raster photo, so nothing gets stretched or awkwardly
  cropped by the `object-fit: cover` on the `<img>`.
- **Speaker** headshots render inside a circular mask (`border-radius: 50%`),
  so use a centered subject with the same 1:1 aspect ratio.
- **Sponsor** logos are displayed with `filter: brightness(0) invert(1)` and
  `opacity: 0.6` on the live site (forces every logo to the same faint white
  mark regardless of its original colors) — so a real logo file's own colors
  won't matter once dropped in, only its silhouette/shape will read. Keep the
  same roughly 3:0.6 wide aspect ratio per tier so it doesn't look squashed.
- Not covered here because they're not photo placeholders: **Testimonials**
  section uses colored initials by design (no `image` field exists), and
  **Projects** cards are text-only with no thumbnail slot at all.
