-- Bootstrap profiles from Supabase Auth users.
-- This keeps signup working when email confirmation means the browser has no session yet.

create or replace function public.generate_profile_handle()
returns text
language plpgsql
as $$
declare
  words text[] := array[
    'civic', 'signal', 'ballot', 'forum', 'public', 'ledger', 'veritas', 'polis',
    'atlas', 'nova', 'orion', 'river', 'stone', 'summit', 'harbor', 'sparrow'
  ];
  candidate text;
begin
  loop
    candidate := words[1 + floor(random() * array_length(words, 1))::int]
      || '-'
      || words[1 + floor(random() * array_length(words, 1))::int]
      || '-'
      || lpad(floor(random() * 10000)::text, 4, '0');

    exit when not exists (select 1 from public.profiles where handle = candidate);
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_handle text;
begin
  requested_handle := nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'handle', ''), '[^a-z0-9-]', '', 'g'), '');

  insert into public.profiles (id, handle)
  values (new.id, coalesce(requested_handle, public.generate_profile_handle()))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user_profile();

insert into public.profiles (id, handle, verified, verified_at, created_at)
select
  u.id,
  coalesce(
    nullif(regexp_replace(coalesce(u.raw_user_meta_data ->> 'handle', ''), '[^a-z0-9-]', '', 'g'), ''),
    public.generate_profile_handle()
  ),
  (u.email_confirmed_at is not null),
  u.email_confirmed_at,
  u.created_at
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
