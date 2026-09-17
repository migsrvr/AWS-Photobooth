-- Photobooth: q1 back to college year levels plus an escape hatch
-- (1st Year / 2nd Year / 3rd Year / 4th Year / Others), replacing the
-- short-lived school-level set (Elem / Junior Highschool /
-- Senior Highschool / College).
-- Column stays `year text`. The school-level backfill overwrote every
-- row with 'College' and the original values were never backed up, so
-- reset every row to '1st Year' for a consistent rollout.
update public.survey_responses
set year = '1st Year'
where year is distinct from '1st Year';

comment on column public.survey_responses.year is
  'q1: 1st Year / 2nd Year / 3rd Year / 4th Year / Others';
