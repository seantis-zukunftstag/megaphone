-- =====================================================================
-- Änderung: Profile abonnieren
--
-- In der Tabelle "abos" steht, wer welchen Hund abonniert hat.
-- "gesehen" merkt sich, bis wann man die Posts schon kennt.
-- Alles, was danach gepostet wird, ist "neu" → Benachrichtigung.
--
-- So benutzen: In Supabase "SQL Editor" → "New query", alles hineinkopieren, "Run".
-- (Nur einmal ausführen. In schema.sql ist dieser Stand schon eingebaut.)
-- =====================================================================

create table abos (
  besitzer  uuid not null references auth.users on delete cascade default auth.uid(),
  hund_id   uuid not null references hunde on delete cascade,
  gesehen   timestamptz not null default now(),
  primary key (besitzer, hund_id)
);

-- Abos sind privat: Jede Person sieht und ändert nur ihre eigenen.
alter table abos enable row level security;

create policy "Eigene Abos sehen"     on abos for select to authenticated using (ist_freigegeben() and besitzer = auth.uid());
create policy "Abonnieren"            on abos for insert to authenticated with check (ist_freigegeben() and besitzer = auth.uid());
create policy "Eigene Abos ändern"    on abos for update to authenticated using (ist_freigegeben() and besitzer = auth.uid());
create policy "Abo beenden"           on abos for delete to authenticated using (ist_freigegeben() and besitzer = auth.uid());

grant select, insert, update, delete on abos to authenticated;
