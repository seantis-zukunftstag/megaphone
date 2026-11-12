-- =====================================================================
-- Änderung: Anzahl Abonnenten anzeigen
--
-- Wer wen abonniert hat, bleibt privat. Diese Funktion verrät nur,
-- WIE VIELE Abonnenten jeder Hund hat, aber nicht WER.
-- ("security definer" = die Funktion darf alle Abos zählen, auch fremde.)
--
-- So benutzen: In Supabase "SQL Editor" → "New query", alles hineinkopieren, "Run".
-- (Nur einmal ausführen. In schema.sql ist dieser Stand schon eingebaut.)
-- =====================================================================

create function abonnenten() returns table (hund_id uuid, anzahl bigint)
language sql stable security definer set search_path = public as $$
  select hund_id, count(*) from abos group by hund_id
$$;

-- Alle dürfen die Zahlen sehen, auch ohne Anmeldung
grant execute on function abonnenten() to anon, authenticated;
