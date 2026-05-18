# 💸 PennyFlow PRO — PWA

A fully offline-capable personal expense & income tracker.

## 📁 File Structure

```
pennyflow-pwa/
├── index.html       ← Main app (all CSS + JS inline)
├── manifest.json    ← PWA manifest
├── sw.js            ← Service Worker (offline caching)
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

---

## 🚀 Deploy on Netlify (Recommended — free, HTTPS instant)

1. Go to https://app.netlify.com
2. Sign in with GitHub / Email
3. Click **"Add new site" → "Deploy manually"**
4. Drag and drop the entire `pennyflow-pwa/` folder
5. Netlify gives you a live HTTPS URL instantly (e.g. `https://pennyflow-xyz.netlify.app`)
6. Open on Chrome Android → tap ⋮ menu → **"Add to Home Screen"**

---

## 🐙 Deploy on GitHub Pages

1. Create a new GitHub repository (public)
2. Upload all files from `pennyflow-pwa/` to the repo root
3. Go to **Settings → Pages → Source → main / (root)**
4. GitHub gives you `https://username.github.io/repo-name/`
5. **Important:** Service Workers require HTTPS — GitHub Pages provides this automatically ✓

---

## 📱 Install on Phone (Chrome Android)

1. Open the hosted URL in Chrome
2. The install banner appears automatically — tap **Install**
   - OR tap ⋮ → "Add to Home Screen"
3. App launches standalone (no browser chrome) 🎉

## 🍎 Install on iPhone (Safari)

1. Open the URL in Safari
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

---

## ✅ PWA Checklist

- [x] manifest.json with name, icons, theme, standalone display
- [x] Service Worker with offline cache-first strategy
- [x] HTTPS required (provided by Netlify / GitHub Pages)
- [x] All icon sizes (72 → 512px) for Android + iOS
- [x] apple-mobile-web-app-capable meta tags
- [x] Safe area insets for notched iPhones
- [x] Install prompt handling (beforeinstallprompt)
- [x] Offline indicator banner
- [x] localStorage persistence (no server needed)
