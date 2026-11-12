// Verbindung zu unserer Datenbank (Supabase) und ein paar Helfer,
// die alle Seiten brauchen.
//
// Der "publishable key" darf öffentlich sein. Geschützt sind die Daten
// trotzdem: Supabase gibt nur angemeldeten Benutzern etwas heraus.
// (Den "secret key" NIE hier hineinschreiben!)

const SUPABASE_URL = "https://jzuemvwtlsxzazichsjg.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ap4fYK7fLtszXlGIehpuVA_wv9HRTCI";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Bild, das man sieht, solange noch kein Profilbild hochgeladen ist
const LEERES_PROFILBILD =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" fill="#2a2a2a"/>' +
      '<text x="50" y="68" font-size="50" text-anchor="middle">🐶</text>' +
      "</svg>"
  );

// Prüft, ob man angemeldet ist und einen Namen hat.
// Wenn nicht: zurück zur Anmeldung.
// Gibt { id, name } von der angemeldeten Person zurück.
async function brauchtAnmeldung() {
  const { data } = await db.auth.getSession();
  if (!data.session) {
    window.location.replace("index.html");
    return new Promise(function () {}); // hier nicht weitermachen
  }
  const id = data.session.user.id;
  const { data: ich } = await db.from("benutzer").select("name").eq("id", id).maybeSingle();
  if (!ich) {
    // Angemeldet, aber noch kein Name gewählt
    window.location.replace("index.html");
    return new Promise(function () {});
  }
  return { id: id, name: ich.name };
}

async function abmelden() {
  await db.auth.signOut();
  window.location.replace("index.html");
}

// Zeigt eine Fehlermeldung an
function fehler(was, error) {
  console.error(was, error);
  alert(was + " Bitte versuche es nochmals.");
}

// Die Fotos sind privat. Für angemeldete Benutzer holen wir Links,
// die eine Stunde lang funktionieren.
// Bekommt eine Liste von Pfaden, gibt { pfad: link } zurück.
async function bildLinks(pfade) {
  const eindeutig = Array.from(new Set(pfade.filter(Boolean)));
  if (eindeutig.length === 0) return {};
  const { data, error } = await db.storage.from("fotos").createSignedUrls(eindeutig, 3600);
  if (error) console.error("Bilder konnten nicht geladen werden", error);
  const links = {};
  for (const eintrag of data || []) {
    if (eintrag.signedUrl) links[eintrag.path] = eintrag.signedUrl;
  }
  return links;
}

// Ein Foto verkleinern, damit es schnell hochlädt.
// Gibt ein Versprechen (Promise) mit dem verkleinerten Bild (Blob) zurück.
function verkleinereFoto(datei, maxGroesse) {
  return new Promise(function (fertig, fehlgeschlagen) {
    const bild = new Image();
    bild.onload = function () {
      // Die längere Seite höchstens maxGroesse Pixel
      const faktor = Math.min(1, maxGroesse / Math.max(bild.width, bild.height));
      const leinwand = document.createElement("canvas");
      leinwand.width = Math.round(bild.width * faktor);
      leinwand.height = Math.round(bild.height * faktor);
      leinwand.getContext("2d").drawImage(bild, 0, 0, leinwand.width, leinwand.height);
      URL.revokeObjectURL(bild.src);
      leinwand.toBlob(fertig, "image/jpeg", 0.8);
    };
    bild.onerror = function () {
      alert("Dieses Bild kann leider nicht geöffnet werden.");
      fehlgeschlagen();
    };
    bild.src = URL.createObjectURL(datei);
  });
}

// Ein Foto in den eigenen Ordner hochladen. Gibt den Pfad zurück (oder null).
async function fotoHochladen(benutzerId, blob, name) {
  const pfad = benutzerId + "/" + name + "-" + Date.now() + ".jpg";
  const { error } = await db.storage.from("fotos").upload(pfad, blob, { contentType: "image/jpeg" });
  if (error) {
    fehler("Das Foto konnte nicht hochgeladen werden.", error);
    return null;
  }
  return pfad;
}
