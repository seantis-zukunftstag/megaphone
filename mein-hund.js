// Hier wird "mein Hund" gespeichert: das eigene Profil mit den eigenen Fotos.
//
// Vorerst speichern wir alles im Browser (localStorage). Das heisst:
// Die eigenen Fotos sieht man nur auf dem eigenen Handy/Computer.
// Damit alle sie sehen, brauchen wir später ein Backend (z.B. Firebase).
//
// Diese Datei muss NACH hunde.js geladen werden.

// Jede angemeldete Person hat ihren eigenen Speicherplatz
function meinHundSchluessel() {
  return "meinHund-" + localStorage.getItem("name");
}

// Bild, das man sieht, solange noch kein Profilbild hochgeladen ist
const LEERES_PROFILBILD =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" fill="#2a2a2a"/>' +
      '<text x="50" y="68" font-size="50" text-anchor="middle">🐶</text>' +
      "</svg>"
  );

// Meinen Hund laden (oder null, wenn es noch keinen gibt)
function ladeMeinenHund() {
  try {
    return JSON.parse(localStorage.getItem(meinHundSchluessel()));
  } catch (e) {
    return null;
  }
}

// Meinen Hund speichern. Gibt false zurück, wenn der Speicher voll ist.
function speichereMeinenHund(hund) {
  try {
    localStorage.setItem(meinHundSchluessel(), JSON.stringify(hund));
    return true;
  } catch (e) {
    return false;
  }
}

// Ein Foto verkleinern, damit es wenig Platz braucht.
// Ruft am Schluss "fertig" mit dem verkleinerten Bild auf.
function verkleinereFoto(datei, maxGroesse, fertig) {
  const leser = new FileReader();
  leser.onload = function () {
    const bild = new Image();
    bild.onload = function () {
      // Das Bild so verkleinern, dass die längere Seite höchstens maxGroesse Pixel hat
      const faktor = Math.min(1, maxGroesse / Math.max(bild.width, bild.height));
      const leinwand = document.createElement("canvas");
      leinwand.width = Math.round(bild.width * faktor);
      leinwand.height = Math.round(bild.height * faktor);
      leinwand.getContext("2d").drawImage(bild, 0, 0, leinwand.width, leinwand.height);
      fertig(leinwand.toDataURL("image/jpeg", 0.8));
    };
    bild.onerror = function () {
      alert("Dieses Bild kann leider nicht geöffnet werden.");
    };
    bild.src = leser.result;
  };
  leser.readAsDataURL(datei);
}

// Meinen Hund zu den anderen Hunden dazutun (unter dem Namen "mein")
(function () {
  const meinHund = ladeMeinenHund();
  if (meinHund && typeof hunde !== "undefined") {
    hunde.mein = {
      name: meinHund.name,
      profilbild: meinHund.profilbild || LEERES_PROFILBILD,
      posts: meinHund.posts || [],
    };
  }
})();
