// Dieses Skript macht aus unserer Webseite eine App (PWA).
// Es wird auf jeder Seite geladen.

// 1. Den Service Worker starten (für Offline und Installieren)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function (fehler) {
    console.log("Service Worker konnte nicht starten:", fehler);
  });
}

// 2. "App installieren"-Knopf
// Android/Chrome sagt uns, wenn man die App installieren kann.
// Dann zeigen wir alle Knöpfe mit der Klasse "installieren-knopf" an.
let installAnfrage = null;

window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault();
  installAnfrage = event;
  document.querySelectorAll(".installieren-knopf").forEach(function (knopf) {
    knopf.hidden = false;
  });
});

function appInstallieren() {
  if (!installAnfrage) return;
  installAnfrage.prompt();
  installAnfrage.userChoice.then(function () {
    installAnfrage = null;
    document.querySelectorAll(".installieren-knopf").forEach(function (knopf) {
      knopf.hidden = true;
    });
  });
}
