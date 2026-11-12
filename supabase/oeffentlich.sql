-- =====================================================================
-- Änderung: Hunde, Posts, Fotos, Kommentare und Stimmen sind öffentlich.
-- Posten, kommentieren, abstimmen und ändern geht weiterhin nur angemeldet.
--
-- So benutzen: In Supabase "SQL Editor" → "New query", alles hineinkopieren, "Run".
-- (Nur einmal ausführen. In schema.sql ist dieser Stand schon eingebaut.)
-- =====================================================================

-- Lesen: für alle (auch ohne Anmeldung)
drop policy "Hunde sehen"      on hunde;
drop policy "Posts sehen"      on posts;
drop policy "Kommentare sehen" on kommentare;
drop policy "Stimmen sehen"    on stimmen;

create policy "Alle sehen Hunde"      on hunde      for select to anon, authenticated using (true);
create policy "Alle sehen Posts"      on posts      for select to anon, authenticated using (true);
create policy "Alle sehen Kommentare" on kommentare for select to anon, authenticated using (true);
create policy "Alle sehen Stimmen"    on stimmen    for select to anon, authenticated using (true);

grant select on hunde, posts, kommentare, stimmen to anon;

-- Die Tabelle "benutzer" bleibt nur für Angemeldete sichtbar.

-- Fotos: öffentlich lesbar (Hochladen nur in den eigenen Ordner, wie bisher)
update storage.buckets set public = true where id = 'fotos';

-- Rechte für angemeldete Benutzer (falls noch nicht ausgeführt)
grant select, insert, update, delete on benutzer, hunde, posts, kommentare, stimmen to authenticated;
