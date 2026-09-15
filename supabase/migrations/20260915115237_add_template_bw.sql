-- Template chooser + B/W toggle for newspaper output.
-- Derive has_video via video_path; template/bw are nullable for back-compat.
alter table public.survey_responses
  add column if not exists template text check (template in ('orgfest','alt')),
  add column if not exists bw boolean not null default false;

-- Backfill existing rows (if any) to orgfest/color.
update public.survey_responses set template = coalesce(template, 'orgfest'), bw = coalesce(bw, false) where template is null;

create index if not exists survey_responses_template_idx on public.survey_responses (template);
