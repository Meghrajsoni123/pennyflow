# 💸 PennyFlow PRO — PWA v2

A fully offline-capable personal expense & income tracker with Trash recovery, Transaction Notes, and local analytics.

---

## 📁 File Structure

```
pennyflow-pwa/
├── index.html        ← Main app (all CSS + JS inline)
├── manifest.json     ← PWA manifest
├── sw.js             ← Service Worker v2 (offline caching)
├── README.md         ← This file
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

## ✨ What's New in v2

### 1. 🗑️ Trash / Delete Recovery
- Deleted items move to **Trash** instead of being permanently removed
- Trash badge shows item count
- **Restore** button recovers items back to transactions
- **Permanent Delete** button for final removal (with confirmation)
- **Empty Trash** bulk action
- Items auto-purge after **30 days**

### 2. 📝 Transaction Notes
- Each transaction can have an optional multiline note
- Notes persist in localStorage alongside the transaction
- Click any transaction to open **Transaction Detail modal**
- Notes show/hide with edit mode
- 📝 icon appears on transactions that have notes
- Notes survive trash/restore cycles

### 3. 📊 Analytics (Local)
- Tracks: app opens, active days, total transactions, install status
- Install date and first-seen date
- Accessible via Settings (⚙️ button in header)
- All local — no third-party required by default

### 4. 🔧 Bug Fixes & Improvements
- Fixed `activeForm()` logic — now correctly targets active form
- Added `Entertainment` and `Education` categories
- Improved mobile FAB display logic
- Proper `aria-pressed` on type toggle buttons
- Trash badge updates in real time
- Escape key closes all modals
- Click-outside-to-close on all modals
- Transaction list items are clickable (open detail)
- Day modal transactions are clickable (open detail)
- Empty states with icons
- Note icon (📝) visible in transaction list and day modal

---

## 🚀 Deploy on Netlify (Recommended)

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign in with GitHub / Email
3. Click **"Add new site" → "Deploy manually"**
4. Drag and drop the entire `pennyflow-pwa/` folder
5. Get your live HTTPS URL (e.g. `https://pennyflow-xyz.netlify.app`)
6. On Chrome Android: tap ⋮ menu → **"Add to Home Screen"**

---

## 🐙 Deploy on GitHub Pages

1. Create a new GitHub repository (public)
2. Upload all files to the repo root
3. Go to **Settings → Pages → Source → main / (root)**
4. Your URL: `https://username.github.io/repo-name/`
5. Service Workers require HTTPS — GitHub Pages provides this ✓

---

## 📱 Install on Phone

**Chrome Android:**
1. Open the hosted URL
2. Tap install banner or ⋮ → "Add to Home Screen"

**Safari iOS:**
1. Open URL in Safari
2. Tap Share button → "Add to Home Screen" → Add

---

## 🔥 Firebase Analytics Integration Guide

For cross-device install and user tracking, add Firebase (free Spark plan).

### Step 1: Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project" → name it "PennyFlow"
3. Enable Google Analytics when prompted
4. Choose or create a Analytics account

### Step 2: Register Web App
1. In the project console, click the Web icon `</>`
2. Register app as "PennyFlow PWA"
3. Copy the `firebaseConfig` object shown

### Step 3: Add SDK to index.html
Add just before `</body>`:

```html
<!-- Firebase SDK -->
<script type="module">
  import { initializeApp }    from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
  import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
  import { getFirestore, doc, setDoc, increment, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

  const firebaseConfig = {
    // ← paste your config here
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "...",
    measurementId: "..."
  };

  const app       = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db        = getFirestore(app);

  /* Generate or retrieve a stable device ID */
  let deviceId = localStorage.getItem('pf_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('pf_device_id', deviceId);
  }

  /* Track app open */
  logEvent(analytics, 'app_open');

  /* Write to Firestore — one doc per device, incrementing opens */
  setDoc(doc(db, 'sessions', deviceId), {
    opens: increment(1),
    lastSeen: serverTimestamp(),
    platform: navigator.platform || 'unknown',
  }, { merge: true });

  /* Track install */
  window.addEventListener('appinstalled', () => {
    logEvent(analytics, 'pwa_install');
    setDoc(doc(db, 'installs', deviceId), {
      installedAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  });
</script>
```

### Step 4: Firestore Security Rules
In Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{deviceId} {
      allow read, write: if true;  // public, no auth needed for analytics
    }
    match /installs/{deviceId} {
      allow create, update: if true;
      allow read: if false;  // only you read via console
    }
  }
}
```

### Step 5: View Analytics
- Firebase Console → Analytics → Events: see `app_open`, `pwa_install`
- Firebase Console → Firestore → sessions: see unique device count
- Total unique sessions = total Firestore docs in `sessions` collection

---

## ✅ PWA Checklist

- [x] `manifest.json` with name, icons, theme, standalone display
- [x] Service Worker v2 with offline cache-first strategy
- [x] HTTPS required (Netlify / GitHub Pages provide this)
- [x] All icon sizes (72 → 512px) for Android + iOS
- [x] `apple-mobile-web-app-capable` meta tags
- [x] Safe area insets for notched iPhones
- [x] Install prompt handling (`beforeinstallprompt`)
- [x] Offline indicator banner
- [x] `localStorage` persistence (no server required)
- [x] Trash / Recently Deleted with Restore + Permanent Delete
- [x] Transaction Notes with edit/save/delete
- [x] Local analytics (opens, active days, install tracking)
- [x] Firebase-ready hooks for cross-device analytics
- [x] Keyboard accessibility (tab, enter, space, escape)
- [x] ARIA labels and roles throughout
- [x] Cross-browser compatible (Chrome, Safari, Firefox, Edge)
- [x] Optimized for Android Chrome (primary target)

---

## 🔐 Security Notes

- No unnecessary permissions requested
- No external data sent without explicit Firebase setup
- All data stored locally in `localStorage`
- XSS protection via `esc()` helper on all user inputs
- Confirmation dialogs before permanent destructive actions
- No eval(), no innerHTML from untrusted sources

---

## 📦 localStorage Keys

| Key | Contents |
|-----|----------|
| `pf_tx` | All active transactions (array) |
| `pf_trash` | Deleted transactions (array) |
| `pf_analytics` | Local analytics data |
| `pf_install_dismissed` | Whether user dismissed install banner |
| `pf_device_id` | Stable device ID for Firebase (set when Firebase is added) |
