-- Photobooth: survey answers (year + 5 Yes/No + consent) + storage pointers.
-- Photos/videos live in Storage bucket `photobooth` (public). No has_video bool;
-- derive via video_path IS NOT NULL. No JSON sidecar; answers are columns.
create table if not exists public.survey_responses (
  session_id text primary key,
  created_at timestamptz not null default now(),
  year text,            -- q1: 1st Year / 2nd Year / 3rd Year / 4th Year
  knows_sbg text,       -- q2 Yes/No
  interested text,      -- q3 Yes/No
  had_fun text,         -- q4 Yes/No
  will_follow text,     -- q5 Yes/No
  will_recommend text,  -- q6 Yes/No
  consent boolean not null,
  photo_path text not null,  -- e.g. 'abc123.jpg'
  video_path text             -- e.g. 'abc123.webm' or null
);

alter table public.survey_responses enable row level security;

drop policy if exists "service_role_all" on public.survey_responses;
create policy "service_role_all" on public.survey_responses
  for all using (true) with check (true);

create index if not exists survey_responses_created_at_idx on public.survey_responses (created_at desc);

-- Storage bucket `photobooth` (public). Insert is idempotent via on conflict.
insert into storage.buckets (id, name, public)
values ('photobooth', 'photobooth', true)
on conflict (id) do update set public = true;

-- Storage RLS: public can read, service_role can write (service_role bypasses RLS but keep for completeness)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'public read photobooth' and tablename = 'objects') then
    create policy "public read photobooth" on storage.objects for select using (bucket_id = 'photobooth');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'service insert photobooth' and tablename = 'objects') then
    create policy "service insert photobooth" on storage.objects for insert with check (bucket_id = 'photobooth');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'service update photobooth' and tablename = 'objects') then
    create policy "service update photobooth" on storage.objects for update using (bucket_id = 'photobooth');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'service delete photobooth' and tablename = 'objects') then
    create policy "service delete photobooth" on storage.objects for delete using (bucket_id = 'photobooth');
  end if;
end $$;
