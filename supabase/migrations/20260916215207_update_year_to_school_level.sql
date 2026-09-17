-- Photobooth: q1 changed from college year levels
-- (1st Year / 2nd Year / 3rd Year / 4th Year) to school levels
-- (Elem / Junior Highschool / Senior Highschool / College).
-- Column stays `year text`; backfill every existing row to 'College'
-- so old rows stay consistent with the new categories.
update public.survey_responses
set year = 'College'
where year is distinct from 'College';

comment on column public.survey_responses.year is
  'q1: Elem / Junior Highschool / Senior Highschool / College';
