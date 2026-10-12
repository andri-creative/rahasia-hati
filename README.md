# Rahasia Hati — 22 Babak Twilight Secret

> A 22-scene romantic animation inspired by the "Hidden Love" novel style — pastel twilight, origami stars, lanterns, and a fireworks finale.

## About

`rahasia-hati` is the longest project in the collection: a 22-scene interactive love story split into two sessions. Inspired by the mood of "Hidden Love" (without using original character names), it follows a journey from secret early feelings through reunion, courage, and promises. The largest CSS file in the collection (73 KB) powers its rich twilight-pastel aesthetic.

## 22 Scenes (2 Sessions)

### Sesi 1 — Babak 1–11: Masa Awal & Rahasia
Scenes covering the early hidden-love period: first meetings, secret glances, growing feelings kept private.

### Sesi 2 — Babak 12–22: Reuni, Keberanian & Janji
Scenes covering reunion, gathering courage, confession, and promises for the future.

## Features

- 22 fullscreen scenes with `.active` navigation
- Micro-interactions per scene (tap, hold, drag, type)
- Ambient particle canvas
- Origami stars, lanterns visual motifs
- Finale fireworks canvas
- Music pill + Web Audio SFX
- Progress dots + toast notifications
- localStorage progress saving

## Tech Stack

- Vanilla HTML / CSS / JS
- Canvas (particles, finale)
- Web Audio API (music + SFX)
- Google Fonts

## How to Run

```bash
cd rahasia-hati
npx serve .
```

## Project Structure

```
rahasia-hati/
├── index.html       # 22 scene sections (37 KB)
├── script.js        # Engine + 22 interactions (63 KB)
├── style.css        # Twilight theme (73 KB — largest)
├── PLAN.md          # Full project spec (12 KB)
└── .gitignore
```

## Theme

- **Palette:** Twilight Secret `#1a1226`, Soft Peach Blossom `#ff9aa2`, Warm Milk Candy, Starlight Gold, Velvet Rose Heart
- **Mood:** Pastel twilight night, starlit, bittersweet-then-hopeful
