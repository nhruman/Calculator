# Noman Calculator

A premium, offline-ready calculator (PWA) built with HTML, CSS and vanilla JavaScript.
**Designed & Developed by Noman MD**

## Folder structure
```
noman-calculator/
├── index.html            ← page structure
├── manifest.json         ← app name, icons, colours (PWA)
├── service-worker.js     ← offline caching (PWA)
├── css/style.css         ← all styling, dark + light theme
├── js/
│   ├── calculator.js     ← maths logic (no eval)
│   ├── history.js        ← history + LocalStorage
│   ├── theme.js          ← dark/light theme + LocalStorage
│   └── app.js            ← connects buttons, keyboard, screen
├── icons/icon-192.png, icon-512.png
└── tools/generate_icons.py   ← (extra) recreates the icons
```

## 1. Run in VS Code (Live Server)
1. Install VS Code and the **Live Server** extension (by Ritwick Dey).
2. `File → Open Folder…` → choose `noman-calculator`.
3. Right-click `index.html` → **Open with Live Server**. The app opens at `http://127.0.0.1:5500`.
4. Test: press buttons, type with the keyboard, open History, toggle the theme, then reload (theme and history stay).
5. Test offline: press F12 → **Application → Service Workers** → tick **Offline** → reload. The app still works.
6. Check **F12 → Console**: there should be no red errors.

## 2. Create the app icons
The icons are already included. To redo or change them:
```
pip install pillow
python tools/generate_icons.py
```
Or design a square image in Canva/Figma and export it as `icon-192.png` (192×192) and `icon-512.png` (512×512) into `icons/`.

## 3. Deploy on GitHub Pages
1. Create a free account at github.com.
2. Click **New repository** → name it `noman-calculator` → **Public** → Create.
3. Upload files: **Add file → Upload files** and drag in the *contents* of the folder (keep the `css`, `js`, `icons` folders; `index.html` must be at the top level). Click **Commit changes**.
   (Or with Git: `git init`, `git add .`, `git commit -m "first version"`, `git branch -M main`, `git remote add origin <your-repo-url>`, `git push -u origin main`.)
4. Go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
5. Wait 1–2 minutes. Your link: `https://YOUR-USERNAME.github.io/noman-calculator/`

All paths in this project are *relative* (`css/style.css`, `./index.html`), so they work inside the `/noman-calculator/` sub-folder.

**Updating later:** change the files, then change `CACHE_NAME` in `service-worker.js` (`v1` → `v2`) so phones download the new version.

## 4. Install on your phone
**Android (Chrome):** open the GitHub Pages link → tap ⋮ (menu) → **Install app** (or *Add to Home screen*) → Install. The app icon appears on your home screen.

**iPhone (Safari only):** open the link in **Safari** → tap the **Share** button (square with arrow) → scroll and tap **Add to Home Screen** → **Add**.

Open it once with internet so the files are cached; after that it works offline.

---

## বাংলায় সহজ ব্যাখ্যা (Simple Bengali explanation)

**প্রজেক্টটা কীভাবে কাজ করে?**
- `index.html` হলো অ্যাপের কাঠামো (বাটন, ডিসপ্লে, হিস্ট্রি প্যানেল)।
- `style.css` হলো সাজসজ্জা। উপরে `:root` এ রঙগুলো ভ্যারিয়েবল হিসেবে রাখা আছে। `data-theme="light"` হলে অন্য রঙ বসে, তাই ডার্ক/লাইট থিম বদলানো সহজ।
- `calculator.js` হলো হিসাবের মস্তিষ্ক। আমরা `eval()` ব্যবহার করিনি, কারণ এটা নিরাপদ নয়। এর বদলে সংখ্যা ও চিহ্নগুলো একটা তালিকায় (`["2","+","3","×","4"]`) রাখি। প্রথমে `×` ও `÷` করি, তারপর `+` ও `−`। তাই `2+3×4 = 14` ঠিক আসে।
- `0.1 + 0.2` কম্পিউটারে `0.30000000000000004` হয়। `toPrecision(12)` দিয়ে আমরা এই ছোট ভুল ঠিক করেছি।
- শূন্য দিয়ে ভাগ করলে `Cannot divide by zero` দেখায়, অ্যাপ ভেঙে যায় না।
- `history.js` ও `theme.js` তথ্য **LocalStorage**-এ রাখে। LocalStorage হলো ব্রাউজারের ছোট স্টোরেজ, ব্রাউজার বন্ধ করলেও তথ্য থাকে।
- `app.js` সবকিছু জোড়া দেয়: বাটন চাপলে `Calculator` কে বলে, তারপর স্ক্রিনে ফলাফল দেখায়। কিবোর্ডের কিগুলোও একই `runAction()` ফাংশন ব্যবহার করে।

**PWA কী?**
- `manifest.json` ফোনকে বলে অ্যাপের নাম, আইকন আর রঙ কী। `display: standalone` মানে ব্রাউজারের অ্যাড্রেস বার ছাড়া অ্যাপের মতো খুলবে।
- `service-worker.js` ব্যাকগ্রাউন্ডে চলে এবং সব ফাইল ফোনে সেভ (cache) করে রাখে, তাই ইন্টারনেট ছাড়াও অ্যাপ চলে।
- ফাইল আপডেট করলে `CACHE_NAME` এর সংখ্যা বাড়াতে ভুলবেন না, নইলে ফোন পুরনো সংস্করণ দেখাবে।

**GitHub Pages-এ ফাইলের পথ:** আপনার সাইট `username.github.io/noman-calculator/` এর ভেতরে থাকে, তাই আমরা `/css/style.css` এর বদলে `css/style.css` (শুরুতে `/` ছাড়া) লিখেছি। এতে পথ ঠিকঠাক কাজ করে।
