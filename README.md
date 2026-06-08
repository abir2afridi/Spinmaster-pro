# SpinMaster Pro 🎡

A premium, customizable decision-making roulette wheel built with React, TypeScript, and Vite. Add your options, customize the look, and spin to decide.

## Features

- **Spin Wheel** — Animated spinning wheel with realistic deceleration physics (quartic ease-out). Keyboard shortcut: Space bar
- **Entry Editor** — Add/edit/remove entries individually or paste a bulk list. Shuffle, sort, undo/redo
- **Visual Customization** — Wheel skins (Wood, Metal, Gold, Galaxy, etc.), rim colors (Classic, RGB Glow, Gold, Neon), center hub (style, icon, shape, color), pointer style (Classic, Arrow, Minimal, Neon, Rounded), background presets
- **Gameplay Settings** — Spin duration (3s–15s), sound effects (4 tick + 4 win variants, all synthesized via Web Audio API), confetti celebration, auto-remove winner
- **Themes** — Light/Dark mode toggle
- **Language** — 63 languages including Pirate English
- **Saved Wheels** — Save/load/delete named entry lists (persisted in localStorage)
- **Spin History** — Records last 50 results with timestamps (persisted in localStorage)
- **Winner Modal** — Overlay with confetti animation, Close and Remove Winner buttons

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS (CDN) |
| Graphics | D3.js (d3-arc, d3-rgb) |
| Icons | Lucide React |
| Animations | @lottiefiles/dotlottie-react |
| Audio | Web Audio API (synthesized, no external assets) |

## Getting Started

```bash
npm install
npm run dev
```

Opens on `http://localhost:3000`.

## Build

```bash
npm run build
```

Output in `dist/`.

## Project Structure

```
├── App.tsx              # Main app (entry management, settings, spin logic)
├── index.tsx            # Application entry point
├── types.ts             # TypeScript type definitions
├── vite.config.ts       # Vite configuration (port 3000, path alias @/)
├── components/
│   ├── Wheel.tsx        # D3 arc rendering, spin animation, resize handling
│   ├── WinnerModal.tsx  # Winner announcement overlay with confetti
│   └── Confetti.tsx     # Canvas-based confetti particles
└── utils/
    ├── audio.ts         # Web Audio API sound synthesis
    └── translations.ts  # 63-language translation system
```

## Keyboard Shortcuts

- **Space** — Spin the wheel (disabled when typing in input/textarea)

## License

See [LICENSE](./LICENSE).
