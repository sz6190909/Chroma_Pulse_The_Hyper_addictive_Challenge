# ⚡ CHROMA PULSE

> **The Hyper-Addictive Reflex Arcade Sensation**  
> *"That was quick. Let me try again."* &mdash; *"I bet my friend can't beat my score."*

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-5%2F5%20Passing-brightgreen.svg)]()

---

## 🎮 1. The Game Concept & Innovation

### The 3 Concepts Evaluated:

1. **Orbital Snap / Pulse Ring (Selected: CHROMA PULSE)**:
   - *Mechanic*: Continuous rotational orb needle; single tap/click/space timing mechanic when aligned with radiant sector arcs.
   - *Simplicity*: 10/10 (understood in 2 seconds without text).
   - *Replayability*: 10/10 (harmonic musical scale progression, fever overdrive, instantaneous 0.1s restart).
   - *Shareability*: 10/10 (deterministic daily runs, challenge links with exact seeds, dynamic 1200x630 social score cards).

2. **Chroma Slice (Color Gate Dash)**:
   - High cognitive load, requires dual/triple input buttons; higher barrier on mobile.

3. **Laser Ricochet / Split Core**:
   - Requires continuous 360-degree finger dragging, higher friction on desktop keyboards.

**Verdict**: **CHROMA PULSE** offers the purest, most satisfying "one-touch" flow state. Sessions last 15–45 seconds with instant near-miss adrenaline and zero downtime.

---

## 🕹️ 2. Core Gameplay Mechanics

- **One-Touch Timing**: Tap anywhere, click mouse, or press <kbd>Space</kbd> when the orbiting orb needle aligns with the sector.
- **Bullseye Sweet Spot**: Precision hit in the center (±0.085 rad) yields **+30 points**, golden particle fireworks, and an ascending musical bell chime.
- **Direction Glitch Sectors**: Hitting magenta glitch sectors reverses the needle rotation direction, challenging muscle memory and anticipation.
- **Hazard Zones**: Red danger zones deduct a life (3 shields total in Standard Mode).
- **Fever Overdrive**:
  - Hitting bullseyes and maintaining streaks charges the **Fever Meter**.
  - At 100%, **FEVER OVERDRIVE** activates for 8 seconds:
    - 3x Score Multiplier.
    - Chromatic aberration aura & dynamic background distortion.
    - Hazard sectors disabled.
- **Musical Progression**: Uses a custom **Web Audio API** synthesizer tuned to the C Pentatonic scale. Consecutive combo hits climb the scale (C4 $\to$ D4 $\to$ E4 $\to$ G4 $\to$ A4 $\to$ C5...), creating an uplifting audio reward loop.

---

## 🚀 3. Viral Growth Engine

Built from the ground up for organic sharing:

1. **1-Click Friend Challenge Links**:
   - Generates deterministic challenge URLs:  
     `https://yourgame.domain/?mode=challenge&score=1450&seed=84920&challenger=Alex`
   - Encodes the exact PRNG seed so your friend faces the **identical sequence of targets, direction flips, and speeds**.
   - Displays real-time rival indicator during gameplay with a celebratory confetti blast when beaten!

2. **Dynamic 1200x630 Score Card Generator**:
   - Generates a branded, high-resolution PNG image directly in client-side Canvas.
   - Displays final score, rank tier badge (e.g. *👑 OVERDRIVE GOD*), max combo, bullseyes, and a friendly challenge prompt.
   - 1-click download or native file share.

3. **Global Daily Seed Run**:
   - Every player worldwide receives the exact same seeded run each day based on UTC date (`YYYYMMDD`).
   - Compete on equal footing with friends in group chats, Discord, and Slack.

4. **Web Share API with Clipboard Fallback**:
   - Native system sharing on iOS Safari & Android Chrome.
   - Automatic fallback to clipboard copy with instant toast confirmation.

---

## 🏆 4. Progression & Retention

- **5 Unlockable Arcade Themes**:
  - 🌌 *Cyberpunk Neon* (Default)
  - 🌆 *Synthwave 84* (Unlocked at 300 pts)
  - ☀️ *Solar Flare* (Unlocked at 600 pts)
  - 🟢 *Emerald Matrix* (Unlocked at 1,000 pts)
  - ✨ *Starlight Void* (Unlocked at 1,500 pts)
- **8 Unlockable Achievements**:
  - *First Spark*, *Flow State (5x)*, *Pulse Master (15x)*, *Deadly Precision*, *Overdrive*, *High Roller*, *Cyber Legend*, *Daily Challenger*.
- **Local Persistence**:
  - All stats, personal bests, unlocked themes, audio preferences, and achievements persist in `localStorage`.

---

## 📦 5. Project Structure

```text
├── src/
│   ├── components/
│   │   ├── AchievementsModal.tsx   # Achievements drawer
│   │   ├── CosmeticsModal.tsx      # Theme selector & score unlocks
│   │   ├── FeverBar.tsx            # Glowing fever overdrive meter
│   │   ├── GameCanvas.tsx          # High-DPI canvas & pointer handler
│   │   ├── GameOverModal.tsx       # Results, replay, challenge & cards
│   │   ├── Header.tsx              # HUD, score, streak badge, shields
│   │   ├── LeaderboardModal.tsx    # Hall of Fame & daily challenge launcher
│   │   └── TutorialModal.tsx       # 5-second animated guide
│   ├── game/
│   │   ├── engine.ts               # Core physics, targets, combo & fever
│   │   └── renderer.ts             # 60fps canvas renderer & particle fx
│   ├── types/
│   │   └── game.ts                 # TypeScript data contracts & interfaces
│   ├── utils/
│   │   ├── audio.ts                # Web Audio API procedural synthesizer
│   │   ├── prng.ts                 # Mulberry32 deterministic generator
│   │   ├── shareCard.ts            # High-res canvas score card exporter
│   │   ├── sharing.ts              # URL parameter parsing & Web Share
│   │   └── storage.ts              # LocalStorage statistics & leaderboards
│   ├── App.tsx                     # Main application orchestrator
│   ├── index.css                   # Tailwind tokens & neon glassmorphism
│   └── main.tsx                    # React DOM root entry
├── index.html                      # Mobile-ready meta tags & Google fonts
├── package.json                    # Dependencies & build scripts
├── test_runner.js                  # Automated engine mechanics test suite
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build setup
```

---

## 🛠️ 6. Quick Start & Setup

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm / pnpm / yarn

### Installation
```bash
# Clone the repository and install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Core Engine Tests
```bash
# Executes automated PRNG, rank, and angular math test suite
npm test
```

### Building for Production
```bash
# Typecheck and bundle optimized static assets
npm run build
```
The output will be generated in `dist/` ready to be hosted on Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

---

## 💰 7. Monetization Readiness

The codebase is structured with clear extension points for ethical, non-intrusive monetization:
- **Rewarded Revive**: An optional "+1 Life" button on the Game Over screen before final tally. Active gameplay is never interrupted.
- **Premium Cosmic Themes**: Additional skins can be added to `COLOR_THEMES` with in-app purchase tags or unlock milestones.
- **Analytics Hook**: Pre-configured event dispatch in `engine.ts` (`onScoreUpdate`, `onGameOver`, `onAchievementCheck`) ready to forward to Google Analytics, PostHog, or Mixpanel.

---

## 🌐 8. External Services Roadmap (Optional)

Current version works **100% offline and serverless** using LocalStorage and URL parameter hashing. For expanded cloud features:
- **Global Multiplayer Leaderboard**: Connect to Supabase or Firebase Firestore using the existing `LeaderboardEntry` interface.
- **Short URL Service**: Integrate Bitly or TinyURL API for even shorter SMS challenge links.
