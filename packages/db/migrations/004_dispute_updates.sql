-- 004_dispute_updates.sql
-- Adds resolution_notes to disputes and performance indexes for the resolver service.

-- Add resolution_notes column to disputes if it does not already exist.
-- (The disputes table was created in 001_initial_schema.sql without this column.)
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'disputes'
      and column_name  = 'resolution_notes'
  ) then
    alter table public.disputes add column resolution_notes text;
  end if;
end;
$$;

-- Composite index used by the resolver to look up open/reviewing disputes per poll.
create index if not exists idx_disputes_poll_status
  on public.disputes (poll_id, status);

-- Composite index used by the resolver's auto-close query:
--   WHERE status = 'active' AND cutoff_at < now()
create index if not exists idx_polls_status_cutoff
  on public.polls (status, cutoff_at);
