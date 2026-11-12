// Verbindung zu unserer Datenbank (Supabase) und ein paar Helfer,
// die alle Seiten brauchen.
//
// Der "publishable key" darf öffentlich sein. Lesen dürfen alle,
// aber posten, kommentieren und ändern erlaubt Supabase nur angemeldeten Benutzern.
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

// Link zur Anmeldung. Nach dem Anmelden geht es zurück zur aktuellen Seite.
function anmeldenLink() {
  const seite = window.location.pathname.split("/").pop() + window.location.search;
  return "anmelden.html?zurueck=" + encodeURIComponent(seite);
}

// Wer ist angemeldet? Gibt { id, name } zurück, oder null, wenn niemand.
// Wer angemeldet ist, aber noch keinen Namen gewählt hat, kommt zur Anmeldung.
async function aktuellerBenutzer() {
  const { data } = await db.auth.getSession();
  if (!data.session) return null;
  const id = data.session.user.id;
  const { data: ich } = await db.from("benutzer").select("name").eq("id", id).maybeSingle();
  if (!ich) {
    window.location.replace(anmeldenLink());
    return new Promise(function () {}); // hier nicht weitermachen
  }
  return { id: id, name: ich.name };
}

// Für Seiten, die man nur angemeldet benutzen darf (z.B. Mein Profil).
// Wenn niemand angemeldet ist: zur Anmeldung.
async function brauchtAnmeldung() {
  const ich = await aktuellerBenutzer();
  if (!ich) {
    window.location.replace(anmeldenLink());
    return new Promise(function () {});
  }
  return ich;
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

// Macht aus dem Pfad eines Fotos (z.B. "beispiele/bello.jpg") einen Link.
// Die Fotos sind öffentlich. Ohne Foto gibt es "".
function bildLink(pfad) {
  if (!pfad) return "";
  return db.storage.from("fotos").getPublicUrl(pfad).data.publicUrl;
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
