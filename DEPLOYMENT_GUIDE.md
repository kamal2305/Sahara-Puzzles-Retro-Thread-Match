# Sahara Puzzles Deployment Guide

This guide covers how to maintain and update your live game on Google Cloud Run.

---

## 🛠️ Method 1: Manual Deployment (CLI)
Use this for quick updates from your local machine.

### **Steps:**
1.  **Modify your code** (e.g., change `game.js`).
2.  **Run the deploy command**:
    ```powershell
    gcloud run deploy sahara-puzzles --source . --project puzzle-matching --region us-east1 --allow-unauthenticated
    ```
3.  **Confirm**: Type `y` if asked to allow unauthenticated invocations.

---

## 🤖 Method 2: Automatic Deployment (CI/CD)
Set up GitHub Actions so that every `git push` automatically redeploys the site.

### **Step A: Create a Service Account**
1.  Go to the [GCP Console](https://console.cloud.google.com/iam-admin/serviceaccounts).
2.  Create a service account named `github-deployer`.
3.  Assign the following roles:
    - **Cloud Run Admin**
    - **Storage Admin**
    - **Service Account User**
4.  Create and download a **JSON Key** for this account.

### **Step B: Add Secret to GitHub**
1.  In your GitHub Repo, go to **Settings > Secrets and variables > Actions**.
2.  Create a new secret named `GCP_SA_KEY` and paste the contents of the JSON key.

### **Step C: Create the Workflow File**
Create a file at `.github/workflows/deploy.yml` with this content:

```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Auth with Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: sahara-puzzles
          region: us-east1
          source: ./
```

---

## 📦 Container Management
Since we are using Docker, you can also manage your images directly:
- **Build local**: `docker build -t sahara-puzzles .`
- **Run local**: `docker run -p 8080:8080 sahara-puzzles`

---

## 📈 Management Strategy

Now that your project is live across GitHub, Docker, and Cloud Run, follow this strategy to manage it effectively.

### **1. The "Golden Loop" (Daily Development)**
Whenever you want to add a feature or fix a bug:
1.  **Modify**: Edit your files (`game.js`, `style.css`, etc.) locally.
2.  **Test**: Run `npm start` or check your **Docker Desktop** to verify changes.
3.  **Sync**: Push your code to GitHub:
    ```powershell
    git add .
    git commit -m "Your description"
    git push origin main
    ```
4.  **Update**: Run your `gcloud run deploy` command (or let GitHub Actions handle it).

### **2. Safety & Rollbacks (The "Oops" Button)**
*   **Git History**: Use GitHub to track changes and revert code if needed.
*   **Cloud Run Revisions**: Google Cloud keeps a history of every deployment.
    - If a new version breaks, go to the **Revisions** tab in the Cloud Run console.
    - Use **"Manage Traffic"** to instantly switch back to a previous working version.

### **3. Monitoring & Logs**
*   **Console Logs**: Check the **Logs** tab in the Cloud Run console to see real-time output from `server.js`.
*   **Health Metrics**: Monitor CPU, Memory, and Request counts to see how many people are playing.

### **4. Cost Control**
*   **Scale to Zero**: Cloud Run automatically scales to zero when no one is playing, meaning you pay **$0** for idle time.
*   **Free Tier**: This project is optimized to stay within the Google Cloud Free Tier for most personal use cases.

---
*Your live URL: https://sahara-puzzles-430905176824.us-east1.run.app*
