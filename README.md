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

## 🛠️ Tech Stack
- **Engine**: Custom JavaScript Game Controller
- **Styling**: Vanilla CSS & Tailwind Design Tokens
- **Server**: Node.js / Express
- **Container**: Docker / node:18-slim

---

## 🚀 Deployment Guide
This project is containerized and optimized for Google Cloud Run.

### **Method 1: Manual Deployment (CLI)**
Use this for quick updates from your local machine.

1.  **Modify your code** (e.g., change `game.js`).
2.  **Run the deploy command**:
    ```powershell
    gcloud run deploy sahara-puzzles --source . --project puzzle-matching --region us-east1 --allow-unauthenticated
    ```

### **Method 2: Automatic Deployment (CI/CD)**
Set up GitHub Actions so that every `git push` automatically redeploys the site.

1.  **Create a Service Account** in GCP with roles: `Cloud Run Admin`, `Storage Admin`, `Service Account User`.
2.  **Add Secret to GitHub**: Create a secret named `GCP_SA_KEY` with your service account JSON key.
3.  **Add Workflow**: Create `.github/workflows/deploy.yml` using the configuration found in the repository.

---

## 📈 Management Strategy

### **1. The "Golden Loop" (Daily Development)**
1.  **Modify**: Edit your files locally.
2.  **Test**: Run `npm start` or check your **Docker Desktop**.
3.  **Sync**: Push your code: `git add .`, `git commit`, `git push`.
4.  **Update**: Run `gcloud run deploy` (or let CI/CD handle it).

### **2. Safety & Rollbacks**
*   **Git History**: Revert code via GitHub if needed.
*   **Cloud Run Revisions**: Use the **Revisions** tab in the Cloud Run console to instantly switch back to a previous working version.

### **3. Monitoring & Cost**
*   **Logs**: Check the **Logs** tab in Cloud Run for real-time output.
*   **Cost**: Cloud Run scales to zero when idle, keeping costs at **$0** within the Free Tier.

---
**Live URL**: [https://sahara-puzzles-430905176824.us-east1.run.app](https://sahara-puzzles-430905176824.us-east1.run.app)
