// Das ist der "Service Worker". Er läuft im Hintergrund und sorgt dafür,
// dass die App auch ohne Internet funktioniert.
//
// So funktioniert es:
//   - Mit Internet: Immer die neuste Version holen und eine Kopie speichern.
//   - Ohne Internet: Die gespeicherte Kopie anzeigen.
//
// Wenn ihr neue Seiten oder Bilder hinzufügt, die sofort offline gehen sollen:
// in die Liste DATEIEN eintragen und die Versionsnummer erhöhen.

const VERSION = "megaphone-v4";

// Diese Dateien werden gleich beim Installieren gespeichert.
// (Die Fotos und Daten kommen aus Supabase und werden hier nicht gespeichert.)
const DATEIEN = [
  "./",
  "index.html",
  "anmelden.html",
  "profil.html",
  "mein-profil.html",
  "style.css?v=10",
  "app.js?v=1",
  "db.js?v=2",
  "lib/supabase-2.45.4.js",
  "manifest.json?v=2",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// 1. Installieren: Dateien speichern
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(DATEIEN);
    })
  );
  // Die neue Version sofort benutzen
  self.skipWaiting();
});

// 2. Aktivieren: alte Versionen wegräumen
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(
        namen
          .filter(function (name) { return name !== VERSION; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// 3. Jede Anfrage: zuerst Internet, sonst gespeicherte Kopie
self.addEventListener("fetch", function (event) {
  // Nur normale Anfragen an unsere eigene Seite
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function (antwort) {
        // Eine Kopie für später speichern
        if (antwort.ok) {
          const kopie = antwort.clone();
          caches.open(VERSION).then(function (cache) {
            cache.put(event.request, kopie);
          });
        }
        return antwort;
      })
      .catch(function () {
        // Kein Internet: gespeicherte Kopie suchen.
        // ignoreSearch: "profil.html?hund=bello" findet auch "profil.html"
        return caches.match(event.request).then(function (kopie) {
          return kopie || caches.match(event.request, { ignoreSearch: true });
        });
      })
  );
});
