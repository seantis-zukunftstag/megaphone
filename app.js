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

// 3. "Neu laden"-Knopf
// In der installierten App (vor allem Safari auf dem iPhone) kann man die Seite
// nicht nach unten ziehen, um sie neu zu laden. Darum bauen wir auf jeder Seite
// unten rechts einen runden Knopf 🔄 ein.
document.addEventListener("DOMContentLoaded", function () {
  const knopf = document.createElement("button");
  knopf.className = "neu-laden-knopf";
  knopf.textContent = "🔄";
  knopf.title = "Seite neu laden";
  knopf.addEventListener("click", function () {
    // Die Seite neu laden. Unser Service Worker holt dabei die neuste Version aus dem Internet.
    window.location.reload();
  });
  document.body.appendChild(knopf);
});
