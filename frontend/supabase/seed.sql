insert into public.languages (code, name)
values
  ('english', 'English'),
  ('french', 'French')
on conflict (code) do update
set name = excluded.name;

insert into public.goals (slug, title, description)
values
  ('travel', 'Travel', 'Focus on hotels, transport, food, and small talk abroad.'),
  ('work', 'Work', 'Learn vocabulary for jobs, meetings, offices, and professional situations.'),
  ('movies', 'Movies', 'Understand dialogues, emotions, and common spoken expressions.'),
  ('general', 'General Growth', 'Build a balanced everyday foundation for long-term learning.')
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description;

insert into public.avatars (slug, name, role, tone)
values
  ('parrot', 'Rio the Parrot', 'Energetic motivator', 'Fast, bright, and cheering'),
  ('fox', 'Milo the Fox', 'Smart rule guide', 'Calm, precise, and thoughtful'),
  ('panda', 'Luna the Panda', 'Gentle support mentor', 'Soft, patient, and reassuring')
on conflict (slug) do update
set name = excluded.name,
    role = excluded.role,
    tone = excluded.tone;

insert into public.themes (slug, name, preview_color)
values
  ('jungle', 'Jungle Bloom', '#2F8F5B'),
  ('sky', 'Dreamy Sky', '#0EA5E9'),
  ('flower', 'Flower Garden', '#F97316')
on conflict (slug) do update
set name = excluded.name,
    preview_color = excluded.preview_color;

insert into public.avatar_items (slug, name, item_type, price, asset_url)
values
  ('leaf-crown', 'Leaf Crown', 'hat', 40, null),
  ('travel-hat', 'Travel Hat', 'hat', 55, null),
  ('round-glasses', 'Round Glasses', 'accessory', 65, null),
  ('flower-scarf', 'Flower Scarf', 'accessory', 50, null),
  ('mini-backpack', 'Mini Backpack', 'companion', 80, null)
on conflict (slug) do update
set name = excluded.name,
    item_type = excluded.item_type,
    price = excluded.price,
    asset_url = excluded.asset_url;

insert into public.courses (language_id, goal_id, title, description, target_level)
select
  l.id,
  g.id,
  case
    when l.code = 'english' and g.slug = 'travel' then 'English for Travel'
    when l.code = 'english' and g.slug = 'work' then 'English for Work'
    when l.code = 'english' and g.slug = 'movies' then 'English for Movies'
    when l.code = 'english' and g.slug = 'general' then 'English for General Growth'
    when l.code = 'french' and g.slug = 'travel' then 'French for Travel'
    when l.code = 'french' and g.slug = 'work' then 'French for Work'
    when l.code = 'french' and g.slug = 'movies' then 'French for Movies'
    else 'French for General Growth'
  end,
  case
    when g.slug = 'travel' then 'A personalized course focused on movement, booking, transport, and travel conversations.'
    when g.slug = 'work' then 'A personalized course focused on jobs, meetings, office vocabulary, and professional talk.'
    when g.slug = 'movies' then 'A personalized course focused on dialogues, emotions, scenes, and common spoken expressions.'
    else 'A balanced course for self-introduction, routines, hobbies, and everyday communication.'
  end,
  'B1'
from public.languages l
cross join public.goals g
on conflict do nothing;

insert into public.modules (course_id, title, description, position, level_code)
select
  c.id,
  case
    when l.code = 'english' and module_data.position = 1 then 'Personal Basics'
    when l.code = 'english' and module_data.position = 2 then 'First Survival Situations'
    when l.code = 'english' and module_data.position = 3 then 'Travel and Movement'
    when l.code = 'english' and module_data.position = 4 then 'Everyday Independence'
    when l.code = 'english' and module_data.position = 5 then 'Planning and Coordination'
    when l.code = 'english' and module_data.position = 6 then 'Service and Recovery'
    when l.code = 'english' and module_data.position = 7 then 'Experience and Opinions'
    when l.code = 'english' and module_data.position = 8 then 'Discussion and Advice'
    when l.code = 'english' and module_data.position = 9 then 'Confident Communication'
    when l.code = 'french' and module_data.position = 1 then 'Bases Personnelles'
    when l.code = 'french' and module_data.position = 2 then 'Premieres Situations'
    when l.code = 'french' and module_data.position = 3 then 'Deplacements'
    when l.code = 'french' and module_data.position = 4 then 'Autonomie Quotidienne'
    when l.code = 'french' and module_data.position = 5 then 'Organisation'
    when l.code = 'french' and module_data.position = 6 then 'Problemes et Descriptions'
    when l.code = 'french' and module_data.position = 7 then 'Experience et Opinions'
    when l.code = 'french' and module_data.position = 8 then 'Discussion et Conseil'
    else 'Communication Confiante'
  end,
  module_data.description,
  module_data.position,
  module_data.level_code
from public.courses c
join public.languages l on l.id = c.language_id
cross join (
  values
    (1, 'A1', 'Introductions, identity, and first present-tense communication.'),
    (2, 'A1', 'Directions, shops, and first practical survival situations.'),
    (3, 'A1', 'Transport, movement, and final A1 grammar consolidation.'),
    (4, 'A2', 'Home, routines, and talking about the recent past.'),
    (5, 'A2', 'Plans, coordination, and practical service communication.'),
    (6, 'A2', 'Problems, descriptions, and checkpoint consolidation.'),
    (7, 'B1', 'Experience, interpretation, and more natural personal reactions.'),
    (8, 'B1', 'Advice, consequences, and structured discussion.'),
    (9, 'B1', 'Confident follow-up, opinions, and practical summarizing.')
) as module_data(position, level_code, description)
where not exists (
  select 1
  from public.modules m
  where m.course_id = c.id
    and m.position = module_data.position
);

insert into public.lessons (module_id, slug, title, topic, lesson_type, position)
select
  m.id,
  lower(l.code || '-' || g.slug || '-' || lesson_data.slug),
  lesson_data.title,
  lesson_data.topic,
  'mixed',
  lesson_data.lesson_position
from public.modules m
join public.courses c on c.id = m.course_id
join public.languages l on l.id = c.language_id
join public.goals g on g.id = c.goal_id
cross join lateral (
  select *
  from (
    values
      (1, 1, 'introduce-yourself-a1', 'Introduce Yourself', 'identity'),
      (1, 2, 'daily-routine-a1', 'Daily Routine', 'present-simple'),
      (2, 1, 'around-town-a1', 'Around Town', 'directions'),
      (2, 2, 'shopping-basics-a1', 'Shopping Basics', 'requests'),
      (3, 1, 'travel-connections-a1', 'Travel Connections', 'travel-vocabulary'),
      (3, 2, 'grammar-foundations-a1', 'Grammar Foundations', 'grammar-review'),
      (4, 1, 'home-and-living-a2', 'Home and Living', 'home-vocabulary'),
      (4, 2, 'past-events-a2', 'Past Events', 'past-simple'),
      (5, 1, 'future-plans-a2', 'Future Plans', 'future-forms'),
      (5, 2, 'workday-dialogues-a2', 'Workday Dialogues', 'work-dialogue'),
      (6, 1, 'solving-problems-a2', 'Solving Problems', 'problem-solving'),
      (6, 2, 'a2-review-checkpoint', 'A2 Review Checkpoint', 'grammar-review')
  ) as english_lessons(module_position, lesson_position, slug, title, topic)
  where l.code = 'english'
    and english_lessons.module_position = m.position

  union all

  select *
  from (
    values
      (1, 1, 'se-presenter-a1', 'Se Presenter', 'identity'),
      (1, 2, 'routine-quotidienne-a1', 'Routine Quotidienne', 'present'),
      (2, 1, 'en-ville-a1', 'En Ville', 'directions'),
      (2, 2, 'cafe-et-achats-a1', 'Cafe et Achats', 'requests'),
      (3, 1, 'voyage-debutant-a1', 'Voyage Debutant', 'travel-vocabulary'),
      (3, 2, 'bases-de-grammaire-a1', 'Bases de Grammaire', 'grammar-review'),
      (4, 1, 'maison-et-vie-a2', 'Maison et Vie', 'home-vocabulary'),
      (4, 2, 'raconter-le-passe-a2', 'Raconter le Passe', 'past-tense'),
      (5, 1, 'projets-et-plans-a2', 'Projets et Plans', 'future-forms'),
      (5, 2, 'situations-de-service-a2', 'Situations de Service', 'service-dialogue'),
      (6, 1, 'parler-des-personnes-a2', 'Parler des Personnes', 'descriptions'),
      (6, 2, 'checkpoint-a2', 'Checkpoint A2', 'grammar-review')
  ) as french_lessons(module_position, lesson_position, slug, title, topic)
  where l.code = 'french'
    and french_lessons.module_position = m.position
) as lesson_data
where m.position between 1 and 6
  and not exists (
    select 1
    from public.lessons ls
    where ls.slug = lower(l.code || '-' || g.slug || '-' || lesson_data.slug)
  );

insert into public.lessons (module_id, slug, title, topic, lesson_type, position)
select
  m.id,
  lower(
    case
      when l.code = 'english' then 'en'
      else 'fr'
    end || '-b1-' ||
    case
      when g.slug = 'general' then 'general'
      else g.slug
    end || '-' || lesson_data.lesson_number
  ),
  lesson_data.title,
  lesson_data.topic,
  'mixed',
  lesson_data.lesson_position
from public.modules m
join public.courses c on c.id = m.course_id
join public.languages l on l.id = c.language_id
join public.goals g on g.id = c.goal_id
cross join lateral (
  select *
  from (
    values
      (7, 1, 1, 'First Impressions', 'opinions'),
      (7, 2, 2, 'Characters and Traits', 'descriptions'),
      (8, 1, 3, 'Scenes and Events', 'retelling'),
      (8, 2, 4, 'Emotions and Reactions', 'reactions'),
      (9, 1, 5, 'Advice and Recommendations', 'recommendations'),
      (9, 2, 6, 'Plot Discussion', 'discussion')
  ) as english_movies(module_position, lesson_position, lesson_number, title, topic)
  where l.code = 'english'
    and g.slug = 'movies'
    and english_movies.module_position = m.position

  union all

  select *
  from (
    values
      (7, 1, 1, 'Work Introductions', 'introductions'),
      (7, 2, 2, 'Tasks and Priorities', 'priorities'),
      (8, 1, 3, 'Meetings and Coordination', 'coordination'),
      (8, 2, 4, 'Messages and Updates', 'updates'),
      (9, 1, 5, 'Problems and Solutions', 'problem-solving'),
      (9, 2, 6, 'Work Summary', 'summary')
  ) as english_work(module_position, lesson_position, lesson_number, title, topic)
  where l.code = 'english'
    and g.slug = 'work'
    and english_work.module_position = m.position

  union all

  select *
  from (
    values
      (7, 1, 1, 'Travel Introductions', 'travel-introductions'),
      (7, 2, 2, 'Transport and Timing', 'transport'),
      (8, 1, 3, 'City Navigation', 'navigation'),
      (8, 2, 4, 'Stays and Requests', 'accommodation'),
      (9, 1, 5, 'Service and Recommendations', 'service'),
      (9, 2, 6, 'Unexpected Situations', 'travel-problems')
  ) as english_travel(module_position, lesson_position, lesson_number, title, topic)
  where l.code = 'english'
    and g.slug = 'travel'
    and english_travel.module_position = m.position

  union all

  select *
  from (
    values
      (7, 1, 1, 'Habits and Identity', 'habits'),
      (7, 2, 2, 'Goals and Plans', 'goals'),
      (8, 1, 3, 'Feelings and State', 'feelings'),
      (8, 2, 4, 'Learning and Focus', 'learning'),
      (9, 1, 5, 'Problems and Solutions', 'problem-solving'),
      (9, 2, 6, 'Personal Progress', 'progress')
  ) as english_general(module_position, lesson_position, lesson_number, title, topic)
  where l.code = 'english'
    and g.slug = 'general'
    and english_general.module_position = m.position

  union all

  select *
  from (
    values
      (7, 1, 1, 'Premieres impressions', 'opinions'),
      (7, 2, 2, 'Personnages et traits', 'descriptions'),
      (8, 1, 3, 'Scenes et evenements', 'retelling'),
      (8, 2, 4, 'Emotions et reactions', 'reactions'),
      (9, 1, 5, 'Conseils et recommandations', 'recommendations'),
      (9, 2, 6, 'Discussion du scenario', 'discussion')
  ) as french_movies(module_position, lesson_position, lesson_number, title, topic)
  where l.code = 'french'
    and g.slug = 'movies'
    and french_movies.module_position = m.position

  union all

  select *
  from (
    values
      (7, 1, 1, 'Se presenter au travail', 'introductions'),
      (7, 2, 2, 'Taches et priorites', 'priorities'),
      (8, 1, 3, 'Reunions et coordination', 'coordination'),
      (8, 2, 4, 'Messages et nouvelles', 'updates'),
      (9, 1, 5, 'Problemes et solutions', 'problem-solving'),
      (9, 2, 6, 'Bilan du travail', 'summary')
  ) as french_work(module_position, lesson_position, lesson_number, title, topic)
  where l.code = 'french'
    and g.slug = 'work'
    and french_work.module_position = m.position

  union all

  select *
  from (
    values
      (7, 1, 1, 'Premiers contacts en voyage', 'travel-introductions'),
      (7, 2, 2, 'Transport et horaires', 'transport'),
      (8, 1, 3, 'Orientation en ville', 'navigation'),
      (8, 2, 4, 'Sejour et demandes', 'accommodation'),
      (9, 1, 5, 'Service et recommandations', 'service'),
      (9, 2, 6, 'Situations imprevisibles', 'travel-problems')
  ) as french_travel(module_position, lesson_position, lesson_number, title, topic)
  where l.code = 'french'
    and g.slug = 'travel'
    and french_travel.module_position = m.position

  union all

  select *
  from (
    values
      (7, 1, 1, 'Habitudes et identite', 'habits'),
      (7, 2, 2, 'Objectifs et projets', 'goals'),
      (8, 1, 3, 'Etat et emotions', 'feelings'),
      (8, 2, 4, 'Apprentissage et concentration', 'learning'),
      (9, 1, 5, 'Problemes et solutions', 'problem-solving'),
      (9, 2, 6, 'Progression personnelle', 'progress')
  ) as french_general(module_position, lesson_position, lesson_number, title, topic)
  where l.code = 'french'
    and g.slug = 'general'
    and french_general.module_position = m.position
) as lesson_data
where m.position between 7 and 9
  and m.level_code = 'B1'
  and not exists (
    select 1
    from public.lessons ls
    where ls.slug = lower(
      case
        when l.code = 'english' then 'en'
        else 'fr'
      end || '-b1-' ||
      case
        when g.slug = 'general' then 'general'
        else g.slug
      end || '-' || lesson_data.lesson_number
    )
  );
