-- =====================================================================
-- Datenbank für "Unsere Hunde"
--
-- Lesen dürfen alle (Hunde, Posts, Fotos, Kommentare, Stimmen).
-- Posten, kommentieren, abstimmen und ändern dürfen nur angemeldete,
-- vorher freigegebene Benutzer. Konten legt der Admin im Supabase-Dashboard
-- an (Authentication → Users). Die Registrierung muss ausgeschaltet sein.
--
-- So benutzen: In Supabase links auf "SQL Editor" → "New query",
-- diesen ganzen Text hineinkopieren und auf "Run" klicken.
-- =====================================================================


-- ---------- Hilfsfunktion ----------

-- Ist die Person richtig angemeldet? (nicht anonym)
create function ist_freigegeben() returns boolean
language sql stable as $$
  select auth.uid() is not null
     and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
$$;


-- ---------- Tabellen ----------

-- Die Benutzer: Anzeigename für Kommentare. Eine Zeile pro Konto.
create table benutzer (
  id    uuid primary key references auth.users on delete cascade default auth.uid(),
  name  text not null
);

-- Die Hunde. Jede Person (besitzer) hat höchstens einen Hund.
-- Die Beispiel-Hunde haben keinen Besitzer.
create table hunde (
  id          uuid primary key default gen_random_uuid(),
  besitzer    uuid unique references auth.users on delete cascade default auth.uid(),
  name        text not null,
  profilbild  text,                       -- Pfad im Foto-Speicher
  erstellt    timestamptz not null default now()
);

-- Die Posts: ein Foto mit Beschreibung
create table posts (
  id            uuid primary key default gen_random_uuid(),
  hund_id       uuid not null references hunde on delete cascade,
  besitzer      uuid references auth.users on delete cascade default auth.uid(),
  bild          text not null,            -- Pfad im Foto-Speicher
  beschreibung  text not null default '',
  erstellt      timestamptz not null default now()
);

-- Die Kommentare unter einem Post
create table kommentare (
  id        uuid primary key default gen_random_uuid(),
  post_id   uuid not null references posts on delete cascade,
  besitzer  uuid not null references auth.users on delete cascade default auth.uid(),
  von       text not null,                -- Anzeigename
  text      text not null,
  erstellt  timestamptz not null default now()
);

-- Daumen und Herz: pro Person und Post eine Zeile
create table stimmen (
  post_id   uuid not null references posts on delete cascade,
  besitzer  uuid not null references auth.users on delete cascade default auth.uid(),
  daumen    text check (daumen in ('hoch', 'runter')),   -- oder leer
  herz      boolean not null default false,
  primary key (post_id, besitzer)
);


-- ---------- Wer darf was? (Row Level Security) ----------
-- Ohne Anmeldung: nur lesen.
-- Angemeldet: zusätzlich Eigenes anlegen, ändern und löschen.

alter table benutzer   enable row level security;
alter table hunde      enable row level security;
alter table posts      enable row level security;
alter table kommentare enable row level security;
alter table stimmen    enable row level security;

create policy "Benutzer sehen"             on benutzer for select to authenticated using (ist_freigegeben());
create policy "Eigenen Namen anlegen"      on benutzer for insert to authenticated with check (ist_freigegeben() and id = auth.uid());
create policy "Eigenen Namen ändern"       on benutzer for update to authenticated using (ist_freigegeben() and id = auth.uid());

create policy "Alle sehen Hunde"           on hunde for select to anon, authenticated using (true);
create policy "Eigenen Hund anlegen"       on hunde for insert to authenticated with check (ist_freigegeben() and besitzer = auth.uid());
create policy "Eigenen Hund ändern"        on hunde for update to authenticated using (ist_freigegeben() and besitzer = auth.uid());

create policy "Alle sehen Posts"           on posts for select to anon, authenticated using (true);
create policy "Beim eigenen Hund posten"   on posts for insert to authenticated with check (
  ist_freigegeben()
  and besitzer = auth.uid()
  and exists (select 1 from hunde where hunde.id = hund_id and hunde.besitzer = auth.uid())
);
create policy "Eigene Posts löschen"       on posts for delete to authenticated using (ist_freigegeben() and besitzer = auth.uid());

create policy "Alle sehen Kommentare"      on kommentare for select to anon, authenticated using (true);
create policy "Kommentar schreiben"        on kommentare for insert to authenticated with check (ist_freigegeben() and besitzer = auth.uid());
create policy "Eigene Kommentare löschen"  on kommentare for delete to authenticated using (ist_freigegeben() and besitzer = auth.uid());

create policy "Alle sehen Stimmen"         on stimmen for select to anon, authenticated using (true);
create policy "Eigene Stimme abgeben"      on stimmen for insert to authenticated with check (ist_freigegeben() and besitzer = auth.uid());
create policy "Eigene Stimme ändern"       on stimmen for update to authenticated using (ist_freigegeben() and besitzer = auth.uid());
create policy "Eigene Stimme löschen"      on stimmen for delete to authenticated using (ist_freigegeben() and besitzer = auth.uid());


-- ---------- Speicher für die Fotos ----------
-- Der Ordner "fotos" ist öffentlich lesbar.
-- Hochladen darf man nur in den eigenen Unterordner (= eigene Benutzer-ID).
-- Die Beispielbilder kommen in den Unterordner "beispiele/" (lädt der Admin hoch).

insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true);

create policy "Fotos sehen" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and ist_freigegeben());

create policy "Fotos in eigenen Ordner hochladen" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and ist_freigegeben() and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Eigene Fotos löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and ist_freigegeben() and (storage.foldername(name))[1] = auth.uid()::text);


-- ---------- Die Beispiel-Hunde ----------
-- Die Bilder dazu lädt der Admin im Dashboard in "fotos/beispiele/" hoch
-- (Storage → fotos → Ordner "beispiele" anlegen → Dateien hochladen).

with neu as (
  insert into hunde (besitzer, name, profilbild) values
    (null, 'Bello', 'beispiele/bello.jpg'),
    (null, 'Luna',  'beispiele/luna.jpg'),
    (null, 'Max',   'beispiele/max.jpg'),
    (null, 'Kira',  'beispiele/kira.jpg'),
    (null, 'Rocky', 'beispiele/rocky.jpg')
  returning id, name
)
insert into posts (hund_id, besitzer, bild, beschreibung, erstellt)
select neu.id, null, p.bild, p.beschreibung, p.erstellt::timestamptz
from neu join (values
  ('Bello', 'beispiele/bello.jpg',   'Mein erstes Foto hier!',               '2026-11-01'),
  ('Bello', 'beispiele/bello-1.jpg', 'Ein Spaziergang im Park.',             '2026-11-05'),
  ('Bello', 'beispiele/bello-2.jpg', 'Ich warte auf mein Futter.',           '2026-11-10'),
  ('Luna',  'beispiele/luna.jpg',    'Hallo, ich bin Luna!',                 '2026-10-28'),
  ('Luna',  'beispiele/luna-1.jpg',  'Endlich ist es wieder kalt draussen.', '2026-11-03'),
  ('Luna',  'beispiele/luna-2.jpg',  'Müde nach dem Rennen.',                '2026-11-09'),
  ('Max',   'beispiele/max.jpg',     'Das bin ich, Max.',                    '2026-11-02'),
  ('Max',   'beispiele/max-1.jpg',   'Ich habe etwas Spannendes gerochen.',  '2026-11-06'),
  ('Max',   'beispiele/max-2.jpg',   'Zeit für ein Nickerchen.',             '2026-11-11'),
  ('Kira',  'beispiele/kira.jpg',    'Kira hier, mit 101 Punkten.',          '2026-10-30'),
  ('Kira',  'beispiele/kira-1.jpg',  'Mein Lieblingsplatz.',                 '2026-11-04'),
  ('Kira',  'beispiele/kira-2.jpg',  'Wer will mit mir spielen?',            '2026-11-08'),
  ('Rocky', 'beispiele/rocky.jpg',   'Klein, aber stark!',                   '2026-11-01'),
  ('Rocky', 'beispiele/rocky-1.jpg', 'Schaut mal, mein neues Halsband.',     '2026-11-07'),
  ('Rocky', 'beispiele/rocky-2.jpg', 'Heute ist Zukunftstag!',               '2026-11-12')
) as p(hund, bild, beschreibung, erstellt) on p.hund = neu.name;


-- ---------- Zugriffsrechte für angemeldete Benutzer ----------
-- Neue Supabase-Projekte geben Tabellen nicht automatisch frei.
-- Ohne Anmeldung ("anon"): nur lesen. Angemeldet ("authenticated"): mehr.
-- Was genau erlaubt ist, regeln die Policies oben.

grant select on hunde, posts, kommentare, stimmen to anon;
grant select, insert, update, delete on benutzer, hunde, posts, kommentare, stimmen to authenticated;


-- ---------- Abos: Hunde abonnieren ----------
-- Wer welchen Hund abonniert hat. "gesehen" = bis wann man die Posts schon kennt.
-- Abos sind privat: Jede Person sieht und ändert nur ihre eigenen.

create table abos (
  besitzer  uuid not null references auth.users on delete cascade default auth.uid(),
  hund_id   uuid not null references hunde on delete cascade,
  gesehen   timestamptz not null default now(),
  primary key (besitzer, hund_id)
);

alter table abos enable row level security;

create policy "Eigene Abos sehen"     on abos for select to authenticated using (ist_freigegeben() and besitzer = auth.uid());
create policy "Abonnieren"            on abos for insert to authenticated with check (ist_freigegeben() and besitzer = auth.uid());
create policy "Eigene Abos ändern"    on abos for update to authenticated using (ist_freigegeben() and besitzer = auth.uid());
create policy "Abo beenden"           on abos for delete to authenticated using (ist_freigegeben() and besitzer = auth.uid());

grant select, insert, update, delete on abos to authenticated;


-- Anzahl Abonnenten pro Hund. Verrät nur WIE VIELE, nicht WER.
-- ("security definer" = die Funktion darf alle Abos zählen, auch fremde.)
create function abonnenten() returns table (hund_id uuid, anzahl bigint)
language sql stable security definer set search_path = public as $$
  select hund_id, count(*) from abos group by hund_id
$$;

-- Alle dürfen die Zahlen sehen, auch ohne Anmeldung
grant execute on function abonnenten() to anon, authenticated;
