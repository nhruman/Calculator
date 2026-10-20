/* ============================================================
   service-worker.js
   A service worker is a script the browser runs in the background.
   Ours saves (caches) all app files so the app works OFFLINE.
   All paths start with "./" so they work on GitHub Pages
   (your site lives in a sub-folder like /noman-calculator/).
============================================================= */

// CHANGE this name (v1 -> v2) every time you update your files,
// so phones download the new version instead of the old cache.
const CACHE_NAME = "calculator-v2";

// The list of files to save for offline use
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/calculator.js",
  "./js/history.js",
  "./js/theme.js",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALL: runs once when the service worker is first registered. We save the files here.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting(); // activate the new worker right away
});

// ACTIVATE: runs after install. We delete old caches from previous versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// FETCH: runs for every request. Strategy = "cache first":
// use the saved file if we have it, otherwise go to the network.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match("./index.html")) // offline fallback
      );
    })
  );
});
