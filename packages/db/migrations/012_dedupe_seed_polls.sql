-- 012_dedupe_seed_polls.sql
-- Clean duplicate seed polls created before seed migrations became idempotent.
-- Only removes duplicate poll rows with no votes, disputes, audit commitments, or proposal links.

with ranked as (
  select
    p.id,
    row_number() over (partition by p.question order by p.created_at asc, p.id asc) as rn
  from public.polls p
), removable as (
  select r.id
  from ranked r
  where r.rn > 1
    and not exists (select 1 from public.votes v where v.poll_id = r.id)
    and not exists (select 1 from public.disputes d where d.poll_id = r.id)
    and not exists (select 1 from public.audit_commitments a where a.poll_id = r.id)
    and not exists (select 1 from public.poll_proposals pp where pp.poll_id = r.id)
)
delete from public.polls p
using removable r
where p.id = r.id;
