# Sahara Puzzles: Retro Thread Matcher

[![Cloud Run Ready](https://img.shields.io/badge/Deployment-Cloud%20Run-blue.svg)](https://cloud.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A minimalist, high-performance memory matching game inspired by traditional weaving patterns and the warm aesthetics of the Sahara.

## 🏜️ The Experience
Players are challenged to match pairs of thread spools on an ever-expanding grid. The game emphasizes focus, pattern recognition, and speed, all wrapped in a sleek, "Warm Minimalism" design system.

## ✨ Key Features
- **Dynamic Progression**: Levels scale automatically from 2x2 up to complex matrices.
- **Responsive Navigation**: Full SPA experience with Rank, Levels, and Settings views.
- **Procedural Audio**: Lightweight, synth-based 8-bit sound effects.
- **State Persistence**: Saves your scores, unlocked levels, and theme preferences locally.
- **Dark Mode Support**: Seamlessly toggle between Light (Sand) and Dark (Onyx) themes.

## 🚀 Deployment
This project is containerized and ready for Google Cloud Run.

### Local Development
```bash
npm install
npm start
```

### Production Deploy
```bash
gcloud run deploy sahara-puzzles --source .
```

## 🛠️ Tech Stack
- **Engine**: Custom JavaScript Game Controller
- **Styling**: Vanilla CSS & Tailwind Design Tokens
- **Server**: Node.js / Express
- **Container**: Docker / node:18-slim

---
*Built with precision. Woven for fun.*
