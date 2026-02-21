# Meowsic — Deployment Guide

## Stack
- **Backend + Frontend** → [Render](https://render.com) (free tier, serves everything from one place)
- **Database** → [MongoDB Atlas](https://mongodb.com/atlas) (free 512MB cluster)

---

## Step 1 — MongoDB Atlas (Database)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create a **free M0 cluster** (any region)
3. Under **Database Access** → Add user → set username + password → note them down
4. Under **Network Access** → Add IP Address → click **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Go to **Clusters** → Connect → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `<password>` with your actual password.

---

## Step 2 — Cloudinary (Image Uploads)

1. Go to [cloudinary.com](https://cloudinary.com) → free account
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**

---

## Step 3 — Push to GitHub

```bash
cd your-project-folder
git init
git add .
git commit -m "initial commit"
```

Go to [github.com](https://github.com) → New repository → name it `meowsic` → copy the remote URL, then:

```bash
git remote add origin https://github.com/yourusername/meowsic.git
git push -u origin main
```

---

## Step 4 — Deploy on Render

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New +** → **Web Service**
3. Connect your `meowsic` GitHub repo
4. Fill in the settings:

| Setting | Value |
|---|---|
| **Name** | meowsic |
| **Root Directory** | *(leave blank)* |
| **Runtime** | Node |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

5. Under **Environment Variables**, add all of these:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | any long random string (e.g. `meowsic_super_secret_2024`) |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |

6. Click **Create Web Service**

Render will build and deploy automatically. First deploy takes ~3 minutes.

Your app will be live at: `https://meowsic.onrender.com` (or whatever name you chose)

---

## Step 5 — Verify

Once deployed, visit your Render URL:
- `/` → Home page
- `/login` → Login / register
- `/music` → Dashboard (requires login)
- `/games` → Games & cat customizer (requires login)

---

## Re-deploying after changes

Just push to GitHub:
```bash
git add .
git commit -m "your changes"
git push
```

Render auto-deploys on every push to `main`.

---

## Local Development

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Frontend runs on `http://localhost:5173`, proxies `/api` calls to `http://localhost:5000`.

---

## Environment file (.env) — never commit this

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PORT=5000
```
