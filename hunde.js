// Hier stehen alle Hunde und ihre Posts.
//
// Einen neuen Post hinzufügen:
//   1. Das Foto in den Ordner "bilder/posts/" legen
//   2. Beim richtigen Hund unter "posts" einen neuen Block { ... } einfügen
//   3. Jeder Post braucht eine eigene "id" (darf nur einmal vorkommen)
//
// Die Reihenfolge ist egal: Die Seite zeigt immer das neuste Bild (nach "datum") zuoberst.

const hunde = {
  bello: {
    name: "Bello",
    profilbild: "bilder/bello.jpg",
    posts: [
      { id: "bello-1", bild: "bilder/bello.jpg", datum: "2026-11-01", beschreibung: "Mein erstes Foto hier!" },
      { id: "bello-2", bild: "bilder/posts/bello-1.jpg", datum: "2026-11-05", beschreibung: "Ein Spaziergang im Park." },
      { id: "bello-3", bild: "bilder/posts/bello-2.jpg", datum: "2026-11-10", beschreibung: "Ich warte auf mein Futter." },
    ],
  },

  luna: {
    name: "Luna",
    profilbild: "bilder/luna.jpg",
    posts: [
      { id: "luna-1", bild: "bilder/luna.jpg", datum: "2026-10-28", beschreibung: "Hallo, ich bin Luna!" },
      { id: "luna-2", bild: "bilder/posts/luna-1.jpg", datum: "2026-11-03", beschreibung: "Endlich ist es wieder kalt draussen." },
      { id: "luna-3", bild: "bilder/posts/luna-2.jpg", datum: "2026-11-09", beschreibung: "Müde nach dem Rennen." },
    ],
  },

  max: {
    name: "Max",
    profilbild: "bilder/max.jpg",
    posts: [
      { id: "max-1", bild: "bilder/max.jpg", datum: "2026-11-02", beschreibung: "Das bin ich, Max." },
      { id: "max-2", bild: "bilder/posts/max-1.jpg", datum: "2026-11-06", beschreibung: "Ich habe etwas Spannendes gerochen." },
      { id: "max-3", bild: "bilder/posts/max-2.jpg", datum: "2026-11-11", beschreibung: "Zeit für ein Nickerchen." },
    ],
  },

  kira: {
    name: "Kira",
    profilbild: "bilder/kira.jpg",
    posts: [
      { id: "kira-1", bild: "bilder/kira.jpg", datum: "2026-10-30", beschreibung: "Kira hier, mit 101 Punkten." },
      { id: "kira-2", bild: "bilder/posts/kira-1.jpg", datum: "2026-11-04", beschreibung: "Mein Lieblingsplatz." },
      { id: "kira-3", bild: "bilder/posts/kira-2.jpg", datum: "2026-11-08", beschreibung: "Wer will mit mir spielen?" },
    ],
  },

  rocky: {
    name: "Rocky",
    profilbild: "bilder/rocky.jpg",
    posts: [
      { id: "rocky-1", bild: "bilder/rocky.jpg", datum: "2026-11-01", beschreibung: "Klein, aber stark!" },
      { id: "rocky-2", bild: "bilder/posts/rocky-1.jpg", datum: "2026-11-07", beschreibung: "Schaut mal, mein neues Halsband." },
      { id: "rocky-3", bild: "bilder/posts/rocky-2.jpg", datum: "2026-11-12", beschreibung: "Heute ist Zukunftstag!" },
    ],
  },
};
