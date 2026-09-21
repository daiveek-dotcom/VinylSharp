# Vinyl Sharp — website

A fast, static rebuild of the vinylsharp.com marketing site. Pure HTML/CSS/JS —
no framework, no video files, no build step.

## Run locally
```bash
cd website
python3 -m http.server 8899
# open http://localhost:8899
```
Deploy the folder as-is to any static host (Vercel, Netlify, Cloudflare Pages, S3).

**If you edit CSS/JS/fonts and don't see the change**, it's almost always the
browser caching the old file, not a real bug — hard-reload (Cmd/Ctrl+Shift+R)
or open a private window before concluding something's broken.

## Pages
```
index.html          Home (see "Homepage structure" below)
about.html          Story / Why Choose Vinyl Sharp / Team (LinkedIn links) / Partner CTA
contact.html        Contact (WhatsApp + email + form)
terms.html · privacy.html · refund.html · delete-account.html   Legal
robots.txt · sitemap.xml · netlify.toml
tools/refresh-crates.py   Optional: re-pulls the crate cover pools from the shop
```
Removed: `experience-centre.html`, `listening-pod.html`, `shop.html` (all deleted;
no links to them anywhere). "Shop" / "Buy Vinyls" go straight to
https://shop.vinylsharp.com/.

## Assets
```
assets/css/styles.css   Design system (see below)
assets/js/main.js       Nav, scroll-reveal, FAQ accordion, contact form,
                        hero parallax, record-of-the-week rotation
assets/fonts/           Bauhaus*.ttf, Futura*.ttf — real, licensed font files
                        pulled from vinylsharp.com's own /static/fonts/, with
                        two defects repaired locally (see "Fonts" below)
assets/img/logo.png, logo-light.png   Real trademarked logo (dark/light bg)
assets/img/app-icon.png               Favicon
assets/img/photo/                     Real photography (from the brand kit)
assets/img/albums/                    6 real album covers, downloaded once
                                      from shop.vinylsharp.com's own image API
                                      (dark-side-of-the-moon, thriller,
                                      abbey-road, rumours, am, nevermind) —
                                      self-hosted, not hotlinked
```

## Fonts — exactly two, both real, both repaired
Only **Bauhaus** (display/headings) and **Futura** (body/UI) are referenced
anywhere in the codebase — no third named fallback font. Both are self-hosted,
the same TrueType files vinylsharp.com itself serves, but two real defects in
those source files were fixed locally:
- **`FuturaBold.ttf` / `FuturaLight.ttf` were dropped.** Their internal names
  are literally "Futura Bold **Condensed** BT" / "Futura Light **Condensed**
  BT" — a narrower cut than Book/Medium. Using them made bold/light text
  render visibly condensed. Missing weights now fall back to the nearest
  real (normal-width) Futura face instead.
- **`BauhausBold.ttf` / `BauhausBoldItalic.ttf` were corrupted** — Chromium's
  OTS sanitizer rejected them (first "overlapping tables", then a non-zero
  cmap language ID once that was fixed). Both repaired via a fontTools
  round-trip + forcing `cmap` language to 0. Verify with `document.fonts` in
  devtools if you ever suspect a regression: Bauhaus weight 700 should show
  `status: "loaded"`, not fall back to Arial Black.

## Design system
- **Colour — a dash, not a wash.** Maroon (`#5E0A11`) is used only as a small
  accent: primary buttons, underline bars under section titles, icons, link
  hovers, the pillar-icon slow spin. It is **not** used as a section
  background anywhere. Backgrounds are white, a neutral off-white
  (`--sheet`), or charcoal/near-black (`--ink`, `--footer-bg`) — no cream
  surfaces. `--cream`/`--taupe` stay defined as brand tokens but aren't used
  as page backgrounds.
- **Section titles**: centred, uppercase, bold Bauhaus with a centred 60×3px
  underline bar (maroon on light sections, taupe on dark ones for contrast).
- **Buttons**: `.btn--primary` (maroon, the one deliberate accent),
  `.btn--ghost` (outlined), `.btn--wa` (WhatsApp green).
- **Always something moving, not a static page**: hero parallax + a
  continuously-spinning decorative vinyl in the hero, a vinyl that travels
  Browse→Order→Ship→Unbox on its own, slow-spinning pillar icons, a soft
  pulse on "photo coming soon" placeholders. All respect
  `prefers-reduced-motion` (paused/hidden, never removed outright).

## Homepage structure (`index.html`)
1. Hero — full-bleed photo with parallax; a spinning vinyl in the corner that
   is also a **scroll button** (each click glides to the next section, with a
   press + ring micro-animation); **Record of the Week** card
2. Marquee
3. Browse the crates — 4 tiles (New Arrivals, Rock & Classics, Jazz & Blues,
   Pop & Soul), each linking to that crate on the shop. Covers rotate every
   2 days from pools in `assets/js/crates-data.js`
4. Popular vinyl records — 6 real covers linking to real product pages
5. Three Reasons — large brand-red icons, no numbers, light background
6. Crate to Doorstep — a vinyl travels Browse -> Order -> Ship -> Unbox,
   pausing at each stop; the step it rests on lights up (CSS-only, 12s loop)
7. CTA — "Ready to spin your first record?"
8. Listening Pods — "Coming soon" placeholder only (no page, no link)
9. FAQ
10. Instagram grid (placeholder tiles)
11. Vinyl Sharp Events (placeholders)
12. Footer — "Registered office / Vinyl Sharp Private Limited / address"

The "(New Brand Section)" placeholder is hidden (commented out at the end of
`<main>`). The Experience Centre section and page are removed.

## How the rotating content works
- **Record of the Week** (`main.js` -> `featuredRecords`): 6 hand-picked real
  products; the pick is `week number of the year % 6`, so it changes every
  7 days and every visitor sees the same one. Not a live feed.
- **Crate covers** (`main.js` + `crates-data.js`): each tile has a pool of
  10-16 real in-stock covers. Every 2 days (`floor(now / 2 days)`) the tile
  swaps to the next set of 4. The shop's API blocks cross-site requests, so
  the pools are downloaded and self-hosted; run `python3 tools/refresh-crates.py`
  to pull a fresh pool (needs Pillow), then redeploy.

## Shop linking — direct to the real store, everywhere
Nav "Shop" and every "Buy Vinyls" CTA (nav, hero, CTA bands) link straight to
`https://shop.vinylsharp.com/` on every page, including the homepage. This
was a deliberate reversal from an earlier draft that routed through an
on-site `shop.html` landing page — that file still exists but is no longer
linked from anywhere (see the Pages table above).

## What's NOT on this site (by design)
- No Bollywood / Indian classical anywhere (not stocked).
- No Experience Centre or Listening Pod pages; Listening Pods is a "coming soon"
  placeholder on the homepage only.
- No "We Are Rewind" / cassette section. No autoplay video.
- No "Our Mission" stats block on the About page.

## TODO before go-live (search `HANDOFF` in the code)
1. **WhatsApp Business number** — replace the `91XXXXXXXXXX` placeholder
   everywhere (floating button + contact page).
2. **Featured products** — the genre tiles' collages and the "Popular vinyl
   records" strip both use the same 6 general covers; swap in genre-accurate
   or best-selling covers once you have them (same pattern: an image in
   `assets/img/albums/`, `assets/img/crates/` + a `/records/{id}` link).
3. **Record of the week list** (`main.js` → `featuredRecords`) — currently 6
   titles, rotates by week number. Expand the list, or replace with a real
   "best sellers" feed if/when the shop exposes one.
4. **Event photos** — drop into the homepage "Vinyl Sharp Events" section
   (e.g. Whitefield, Mini Cooper collab).
5. **Instagram** — 5 hand-picked posts, thumbnails self-hosted in assets/img/insta/. To change one, swap its image + link in index.html.
   real profile. Connect the Instagram Basic Display / Graph API (or embed
   real post thumbnails manually) to show actual posts.
6. **Concept renders** — drop into `experience-centre.html` and
   `listening-pod.html` once those designs exist.
7. **Team headshots / warehouse / genre-tile photos** — currently honest
   placeholders or reused stand-ins.
8. **OG images** — `og-home.jpg`, `og-about.jpg`, `og-contact.jpg` (1200×630).
9. **Contact form endpoint** — wire a real `action` (Formspree / your API);
   confirm both inbox delivery and the on-page success state work.
10. **Legal text** — update once an official Terms/Privacy PDF is supplied;
    only terminology (portal/warehouse/email) has been touched so far, not
    the substantive legal clauses.
11. **Team LinkedIn URLs + headshots** — the three LinkedIn buttons on About
    currently open a LinkedIn *search* for the person (search `HANDOFF` in
    about.html); swap in the real profile URLs and drop photos in `assets/img/`.
12. **"(New Brand Section)"** — hidden for now; restore the commented block at
    the end of `<main>` in index.html when the content exists.
13. **Clean URLs** — canonicals use extensionless paths (`/about`, …);
    configure the host to serve `*.html` at those paths, or update the
    canonicals to match your routing.

## Performance & SEO
- No video, no JS framework; one stylesheet + one small deferred script.
- Self-hosted fonts with `font-display: swap`.
- Semantic HTML, skip link, focus states, `prefers-reduced-motion` respected
  by every animation, alt text.
- Sticky accessible nav (mobile menu sized off a live `--header-offset` CSS
  var), single-open FAQ via native `<details>`.
