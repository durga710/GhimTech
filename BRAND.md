# Ghimtech — Brand system

The single source of truth. **Do not drift.** If anything in code contradicts this doc, the code is wrong, not the doc.

---

## 1. Name

**ghimtech** — always lowercase in body copy and as the wordmark. Capitalized only at the start of a sentence or in a heading where typographic case dictates ("Ghimtech is shipping..."). Never **GHIMTECH** in display. Never **GhimTech** (camel). Never **Ghim Tech** (spaced).

Pronounced *ghim-tech* (hard G, like "Durga's last name without the ending").

---

## 2. The mark

A geometric **G** built from a continuous arc + horizontal stroke. Three readings:
- The letter G — ownership, identity
- A tactical compass arc — discipline, direction
- A healthcare pulse curve — care, vitality

The opening of the G points **upper-right** — the same vector as "forward motion." This is fixed. Do not rotate the mark.

### Construction

- **Grid**: 64 × 64 units
- **Stroke width**: 7 units (rounds to integer pixels at 32/64/128/256)
- **Stroke caps**: round, on every endpoint
- **Stroke joins**: round
- **No fill**, only stroke — this is non-negotiable. A filled G is a different logo.

### Clear space

Minimum clear space around the mark = **1× the mark's interior diameter** (so roughly 25% of the bounding box). Nothing — type, photo edge, UI element — enters that zone.

### Minimum size

- **Digital**: 24 × 24 px for the mark alone, 120 px wide for the lockup
- **Print**: 8 mm for the mark alone, 35 mm wide for the lockup

Below those sizes, use the dedicated favicon (different stroke ratio for legibility).

---

## 3. The wordmark

**ghimtech** in Geist Medium, lowercase, letter-spacing −0.02em. Optical kerning baked into spacing. Never substitute another typeface for the wordmark in display contexts.

---

## 4. The lockup

Mark + wordmark, mark on the left. Spacing between mark and wordmark = **1.25 × mark width**.

The wordmark sits optically centered to the cap-height of the mark — *not* baseline-aligned. Eyes read the lockup as one unit, not as "icon next to text."

---

## 5. Color

The system has **five colors**. No additions without explicit decision.

| Token | Hex | Role |
|---|---|---|
| `--carbon` | `#040508` | Primary background. Everywhere. |
| `--carbon-lift` | `#0a0d12` | Slight elevation (cards, app icon bg) |
| `--signal` | `#3aa4ff` | Primary accent. Links, CTAs, focus states, the mark. |
| `--vital` | `#1fe294` | Health, success, "live", positive deltas |
| `--flare` | `#ffa726` | Caution, in-progress, attention-needed |
| `--critical` | `#ff5470` | Errors, destructive actions, overdue |
| `--paper` | `#f4f6fa` | Primary text on carbon |
| `--paper-dim` | `#a1a8b4` | Secondary text |
| `--paper-fade` | `#8a92a1` | Tertiary text, labels |

**Usage rules:**
- The mark is **signal blue** on dark surfaces. White on signal-blue surfaces. Black on white surfaces.
- **Vital emerald** is reserved for *active state* and *positive signal*. Never decorative. A green pixel means something is alive.
- **Flare** = "you need to look at this soon." **Critical** = "you need to look at this now."
- Never mix flare + critical in the same component. Pick one tone.

---

## 6. Typography

| Use | Family | Notes |
|---|---|---|
| Display headings | **Geist** (or Geist fallback chain) | 500–600 weight, letter-spacing −0.03em, tight line-height |
| Body | **Geist** | 400 weight, letter-spacing −0.005em |
| Labels / metadata | **JetBrains Mono** | 500 weight, uppercase, letter-spacing 0.18em |
| Numerals (data) | **JetBrains Mono** with tabular-nums | Tables, KPIs, timestamps |

**Hierarchy** (display sizes, desktop):
- H1 hero: 80px / 1.0 / -0.03em
- H1 page: 56px / 1.05 / -0.03em
- H2 section: 36px / 1.1 / -0.02em
- H3 card: 22px / 1.2 / -0.01em
- Body: 16px / 1.6 / -0.005em
- Label: 11px / 1 / 0.18em / uppercase / mono

---

## 7. Voice

**Quiet authority.** Build like Apple, talk like a Marine.

- Confident, not bombastic. *"Care. Verified. Delivered."* not *"The world's #1 EVV platform!"*
- Specific, not abstract. *"4 deploys overnight · 0 incidents."* not *"We're crushing it."*
- Sentences end. We do not trail off. We do not over-hedge.
- Brand-governance promise: RayHealth is **"designed to support"** compliance. Never **"certified"** or **"federally approved"** without legal sign-off.

---

## 8. Assets shipped

All in `/public/brand/`:

| File | Use |
|---|---|
| `mark.svg` | The mark alone. Use anywhere a logo is needed without text. |
| `wordmark.svg` | Wordmark alone. Footer, tight horizontal spaces. |
| `lockup.svg` | Full lockup. Primary use in nav, OG, headed materials. |
| `icon-512.svg` | App icon (512×512). PWA icon, Apple touch icon. |
| `favicon.svg` | Optimized for 16–32px. Browser tab. |
| `og-image.svg` | 1200×630 Open Graph card. First impression on social. |

All SVGs use `currentColor` where appropriate, so the same file recolors via CSS `color`.

---

## 9. What NOT to do

- ❌ Rotate the mark
- ❌ Add a tagline next to the mark *inside* the lockup (use a separate line below)
- ❌ Place the mark on a gradient or photo without a clear-space buffer
- ❌ Use a "dark mode" and "light mode" variant — there is one variant, recolored via `currentColor`
- ❌ Stretch, skew, or shadow the mark
- ❌ Use any color outside the five-color system as an accent
- ❌ Introduce a second display typeface
- ❌ Use the word "Ghimtech" with mixed case in display (it's lowercase in the wordmark)
- ❌ Pair the mark with the RayHealth logo as a co-equal "and" lockup — they're parent/child, not siblings

---

## 10. Application checklist

When you ship a new surface (page, app, doc, deck), verify:

- [ ] Mark sits on carbon background with required clear space
- [ ] Wordmark is Geist 500, lowercase, −0.02em
- [ ] Only the 5 system colors appear (plus paper/dim/fade for text)
- [ ] One display typeface (Geist), one mono (JetBrains Mono) — no third family
- [ ] Vital emerald only appears on live/positive state
- [ ] Critical only appears on destructive/errored state
- [ ] Favicon is the dedicated `favicon.svg`, not a downscaled mark
- [ ] OG image is set in metadata
