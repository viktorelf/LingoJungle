create table if not exists public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  language text not null check (language in ('en', 'fr')),
  level text not null check (level in ('A1', 'A2', 'B1')),
  term text not null,
  translation_uk text not null,
  example text,
  example_translation_uk text,
  part_of_speech text,
  created_at timestamptz default now()
);

create table if not exists public.user_vocabulary_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_item_id uuid not null references public.vocabulary_items(id) on delete cascade,
  mistakes_count int default 0,
  correct_count int default 0,
  last_status text check (last_status in ('KNOW', 'DONT_KNOW', 'REPEAT_LATER')),
  next_review_priority int default 1,
  last_reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, vocabulary_item_id)
);

alter table public.vocabulary_items enable row level security;
alter table public.user_vocabulary_progress enable row level security;

create policy "Vocabulary items are readable by authenticated users"
on public.vocabulary_items
for select
to authenticated
using (true);

create policy "Users can read own vocabulary progress"
on public.user_vocabulary_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own vocabulary progress"
on public.user_vocabulary_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own vocabulary progress"
on public.user_vocabulary_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into public.vocabulary_items
(language, level, term, translation_uk, example, example_translation_uk, part_of_speech)
values
('en', 'A1', 'airport', 'аеропорт', 'The airport is near the city.', 'Аеропорт знаходиться біля міста.', 'noun'),
('en', 'A1', 'hotel', 'готель', 'I booked a hotel.', 'Я забронював готель.', 'noun'),
('en', 'A1', 'ticket', 'квиток', 'I need a ticket.', 'Мені потрібен квиток.', 'noun'),
('en', 'A1', 'passport', 'паспорт', 'Show your passport, please.', 'Покажіть ваш паспорт, будь ласка.', 'noun'),
('en', 'A1', 'station', 'вокзал / станція', 'Where is the station?', 'Де знаходиться вокзал?', 'noun'),
('en', 'A1', 'street', 'вулиця', 'This street is very long.', 'Ця вулиця дуже довга.', 'noun'),
('en', 'A1', 'shop', 'магазин', 'The shop is open.', 'Магазин відкритий.', 'noun'),
('en', 'A1', 'food', 'їжа', 'The food is good.', 'Їжа добра.', 'noun'),
('en', 'A1', 'water', 'вода', 'I need water.', 'Мені потрібна вода.', 'noun'),
('en', 'A1', 'help', 'допомога', 'Can you help me?', 'Ви можете мені допомогти?', 'noun/verb'),

('en', 'A2', 'meeting', 'зустріч', 'We have a meeting today.', 'У нас сьогодні зустріч.', 'noun'),
('en', 'A2', 'schedule', 'розклад', 'My schedule is full.', 'Мій розклад заповнений.', 'noun'),
('en', 'A2', 'task', 'завдання', 'This task is important.', 'Це завдання важливе.', 'noun'),
('en', 'A2', 'office', 'офіс', 'She works in an office.', 'Вона працює в офісі.', 'noun'),
('en', 'A2', 'deadline', 'дедлайн / кінцевий термін', 'The deadline is tomorrow.', 'Кінцевий термін завтра.', 'noun'),
('en', 'A2', 'experience', 'досвід', 'I have work experience.', 'У мене є досвід роботи.', 'noun'),
('en', 'A2', 'message', 'повідомлення', 'I sent a message.', 'Я надіслав повідомлення.', 'noun'),
('en', 'A2', 'important', 'важливий', 'This is an important lesson.', 'Це важливий урок.', 'adjective'),
('en', 'A2', 'improve', 'покращувати', 'I want to improve my English.', 'Я хочу покращити свою англійську.', 'verb'),
('en', 'A2', 'practice', 'практика / практикувати', 'Practice every day.', 'Практикуйся щодня.', 'noun/verb'),

('en', 'B1', 'opportunity', 'можливість', 'This is a good opportunity.', 'Це хороша можливість.', 'noun'),
('en', 'B1', 'decision', 'рішення', 'It was a difficult decision.', 'Це було складне рішення.', 'noun'),
('en', 'B1', 'support', 'підтримка', 'I need your support.', 'Мені потрібна твоя підтримка.', 'noun/verb'),
('en', 'B1', 'goal', 'мета', 'My goal is to speak better.', 'Моя мета — говорити краще.', 'noun'),
('en', 'B1', 'confidence', 'впевненість', 'Practice gives confidence.', 'Практика дає впевненість.', 'noun'),
('en', 'B1', 'mistake', 'помилка', 'This mistake is common.', 'Ця помилка поширена.', 'noun'),
('en', 'B1', 'explain', 'пояснювати', 'Can you explain this rule?', 'Ви можете пояснити це правило?', 'verb'),
('en', 'B1', 'probably', 'ймовірно', 'He will probably come later.', 'Ймовірно, він прийде пізніше.', 'adverb'),
('en', 'B1', 'however', 'однак', 'However, it is not easy.', 'Однак це непросто.', 'adverb'),
('en', 'B1', 'because of', 'через', 'I was late because of traffic.', 'Я запізнився через затор.', 'phrase');


insert into public.vocabulary_items
(language, level, term, translation_uk, example, example_translation_uk, part_of_speech)
values

('fr', 'A1', 'bonjour', 'добрий день', 'Bonjour, je suis Anna.', 'Добрий день, я Анна.', 'greeting'),
('fr', 'A1', 'je m''appelle', 'мене звати', 'Je m''appelle Paul.', 'Мене звати Поль.', 'phrase'),
('fr', 'A1', 'touriste', 'турист', 'Je suis touriste.', 'Я турист.', 'noun'),
('fr', 'A1', 'le passeport', 'паспорт', 'Voici mon passeport.', 'Ось мій паспорт.', 'noun'),
('fr', 'A1', 'l''aéroport', 'аеропорт', 'Je suis à l''aéroport.', 'Я в аеропорту.', 'noun'),
('fr', 'A1', 'la porte', 'вихід на посадку', 'La porte est ici.', 'Вихід тут.', 'noun'),
('fr', 'A1', 'le contrôle', 'контроль', 'Le contrôle est à gauche.', 'Контроль ліворуч.', 'noun'),
('fr', 'A1', 'le comptoir', 'стійка', 'Le comptoir est devant vous.', 'Стійка перед вами.', 'noun'),
('fr', 'A1', 'à droite', 'праворуч', 'La porte est à droite.', 'Вихід праворуч.', 'phrase'),
('fr', 'A1', 'à gauche', 'ліворуч', 'Le contrôle est à gauche.', 'Контроль ліворуч.', 'phrase'),

('fr', 'A1', 'la gare', 'вокзал', 'Où est la gare ?', 'Де вокзал?', 'noun'),
('fr', 'A1', 'l''hôtel', 'готель', 'L''hôtel est près de la gare.', 'Готель біля вокзалу.', 'noun'),
('fr', 'A1', 'la banque', 'банк', 'La banque est à côté de la poste.', 'Банк поруч із поштою.', 'noun'),
('fr', 'A1', 'la poste', 'пошта', 'La poste est devant l''hôtel.', 'Пошта перед готелем.', 'noun'),
('fr', 'A1', 'près de', 'біля', 'Le café est près de la gare.', 'Кафе біля вокзалу.', 'phrase'),
('fr', 'A1', 'derrière', 'позаду', 'La banque est derrière l''hôtel.', 'Банк позаду готелю.', 'preposition'),

('fr', 'A1', 'la chambre', 'кімната', 'La chambre est grande.', 'Кімната велика.', 'noun'),
('fr', 'A1', 'la clé', 'ключ', 'Voici la clé.', 'Ось ключ.', 'noun'),
('fr', 'A1', 'la douche', 'душ', 'Il y a une douche.', 'Є душ.', 'noun'),
('fr', 'A1', 'le wifi', 'вайфай', 'Il y a le wifi.', 'Є вайфай.', 'noun'),
('fr', 'A1', 'la serviette', 'рушник', 'Il y a une serviette.', 'Є рушник.', 'noun'),
('fr', 'A1', 'la réception', 'ресепшн', 'La réception est ici.', 'Ресепшн тут.', 'noun'),

('fr', 'A1', 'un café', 'кава', 'Je voudrais un café.', 'Я хотів би каву.', 'noun'),
('fr', 'A1', 'un thé', 'чай', 'Je voudrais un thé.', 'Я хотів би чай.', 'noun'),
('fr', 'A1', 'de l''eau', 'вода', 'Je voudrais de l''eau.', 'Я хотів би води.', 'noun'),
('fr', 'A1', 'un sandwich', 'сендвіч', 'Je voudrais un sandwich.', 'Я хотів би сендвіч.', 'noun'),
('fr', 'A1', 'l''addition', 'рахунок', 'L''addition, s''il vous plaît.', 'Рахунок, будь ласка.', 'noun'),
('fr', 'A1', 's''il vous plaît', 'будь ласка', 'Un café, s''il vous plaît.', 'Каву, будь ласка.', 'phrase'),

('fr', 'A1', 'un billet', 'квиток', 'Je voudrais un billet.', 'Я хотів би квиток.', 'noun'),
('fr', 'A1', 'aller simple', 'в один бік', 'Un billet aller simple.', 'Квиток в один бік.', 'phrase'),
('fr', 'A1', 'aller-retour', 'туди й назад', 'Un billet aller-retour.', 'Квиток туди й назад.', 'phrase'),
('fr', 'A1', 'le train', 'поїзд', 'Le train pour Lyon.', 'Потяг до Ліона.', 'noun'),
('fr', 'A1', 'le voyage', 'подорож', 'Le voyage continue.', 'Подорож триває.', 'noun');


insert into public.vocabulary_items
(language, level, term, translation_uk, example, example_translation_uk, part_of_speech)
values

-- =========================
-- FR A2
-- =========================

('fr', 'A2', 'réviser', 'повторювати', 'Je révise le français chaque soir.', 'Я повторюю французьку щовечора.', 'verb'),
('fr', 'A2', 'apprendre', 'вивчати', 'J’aime apprendre les langues.', 'Я люблю вивчати мови.', 'verb'),
('fr', 'A2', 'comprendre', 'розуміти', 'Je comprends cette règle.', 'Я розумію це правило.', 'verb'),
('fr', 'A2', 'expliquer', 'пояснювати', 'Le professeur explique la leçon.', 'Викладач пояснює урок.', 'verb'),
('fr', 'A2', 'la habitude', 'звичка', 'J’ai une bonne habitude.', 'У мене є хороша звичка.', 'noun'),
('fr', 'A2', 'le sommeil', 'сон', 'Le sommeil est important.', 'Сон важливий.', 'noun'),
('fr', 'A2', 'fatigué', 'втомлений', 'Je suis fatigué aujourd’hui.', 'Я сьогодні втомлений.', 'adjective'),
('fr', 'A2', 'heureux', 'щасливий', 'Elle est heureuse ici.', 'Вона щаслива тут.', 'adjective'),
('fr', 'A2', 'triste', 'сумний', 'Il est triste ce soir.', 'Він сумний сьогодні ввечері.', 'adjective'),
('fr', 'A2', 'la motivation', 'мотивація', 'La motivation aide beaucoup.', 'Мотивація дуже допомагає.', 'noun'),

('fr', 'A2', 'le travail', 'робота', 'Je cherche un travail.', 'Я шукаю роботу.', 'noun'),
('fr', 'A2', 'le bureau', 'офіс', 'Le bureau est moderne.', 'Офіс сучасний.', 'noun'),
('fr', 'A2', 'le collègue', 'колега', 'Mon collègue est gentil.', 'Мій колега добрий.', 'noun'),
('fr', 'A2', 'le rendez-vous', 'зустріч', 'J’ai un rendez-vous demain.', 'У мене зустріч завтра.', 'noun'),
('fr', 'A2', 'important', 'важливий', 'C’est très important.', 'Це дуже важливо.', 'adjective'),
('fr', 'A2', 'organiser', 'організовувати', 'J’organise mon emploi du temps.', 'Я організовую свій розклад.', 'verb'),
('fr', 'A2', 'le problème', 'проблема', 'J’ai un problème.', 'У мене є проблема.', 'noun'),
('fr', 'A2', 'la solution', 'рішення', 'Voici une solution simple.', 'Ось просте рішення.', 'noun'),
('fr', 'A2', 'commencer', 'починати', 'Je commence une nouvelle leçon.', 'Я починаю новий урок.', 'verb'),
('fr', 'A2', 'continuer', 'продовжувати', 'Je continue mes études.', 'Я продовжую навчання.', 'verb'),

('fr', 'A2', 'le progrès', 'прогрес', 'Je vois mon progrès.', 'Я бачу свій прогрес.', 'noun'),
('fr', 'A2', 'la pratique', 'практика', 'La pratique est nécessaire.', 'Практика необхідна.', 'noun'),
('fr', 'A2', 'réussir', 'досягати успіху', 'Tu peux réussir.', 'Ти можеш досягти успіху.', 'verb'),
('fr', 'A2', 'la confiance', 'впевненість', 'La confiance est importante.', 'Впевненість важлива.', 'noun'),
('fr', 'A2', 'le niveau', 'рівень', 'Mon niveau est A2.', 'Мій рівень A2.', 'noun'),
('fr', 'A2', 'le cours', 'курс', 'Le cours commence lundi.', 'Курс починається у понеділок.', 'noun'),
('fr', 'A2', 'la leçon', 'урок', 'La leçon est intéressante.', 'Урок цікавий.', 'noun'),
('fr', 'A2', 'facile', 'легкий', 'Cet exercice est facile.', 'Ця вправа легка.', 'adjective'),
('fr', 'A2', 'difficile', 'важкий', 'Cette règle est difficile.', 'Це правило складне.', 'adjective'),
('fr', 'A2', 'la mémoire', 'пам’ять', 'J’ai une bonne mémoire.', 'У мене хороша пам’ять.', 'noun'),

-- =========================
-- FR B1
-- =========================

('fr', 'B1', 'atteindre', 'досягати', 'Je veux atteindre mon objectif.', 'Я хочу досягти своєї мети.', 'verb'),
('fr', 'B1', 'l’objectif', 'мета', 'Mon objectif est clair.', 'Моя мета зрозуміла.', 'noun'),
('fr', 'B1', 'développer', 'розвивати', 'Je veux développer mes compétences.', 'Я хочу розвивати свої навички.', 'verb'),
('fr', 'B1', 'la compétence', 'навичка', 'Cette compétence est utile.', 'Ця навичка корисна.', 'noun'),
('fr', 'B1', 'l’expérience', 'досвід', 'Cette expérience était importante.', 'Цей досвід був важливим.', 'noun'),
('fr', 'B1', 'améliorer', 'покращувати', 'Je veux améliorer mon français.', 'Я хочу покращити свою французьку.', 'verb'),
('fr', 'B1', 'la concentration', 'концентрація', 'La concentration aide à apprendre.', 'Концентрація допомагає навчанню.', 'noun'),
('fr', 'B1', 'le résultat', 'результат', 'Le résultat est positif.', 'Результат позитивний.', 'noun'),
('fr', 'B1', 'motivé', 'вмотивований', 'Je suis très motivé.', 'Я дуже вмотивований.', 'adjective'),
('fr', 'B1', 'la réussite', 'успіх', 'La réussite demande du temps.', 'Успіх потребує часу.', 'noun'),

('fr', 'B1', 'la décision', 'рішення', 'C’était une bonne décision.', 'Це було хороше рішення.', 'noun'),
('fr', 'B1', 'cependant', 'однак', 'Cependant, ce n’est pas facile.', 'Однак це непросто.', 'adverb'),
('fr', 'B1', 'parfois', 'іноді', 'Parfois je suis fatigué.', 'Іноді я втомлений.', 'adverb'),
('fr', 'B1', 'probablement', 'ймовірно', 'Il viendra probablement demain.', 'Ймовірно, він прийде завтра.', 'adverb'),
('fr', 'B1', 'la situation', 'ситуація', 'La situation est compliquée.', 'Ситуація складна.', 'noun'),
('fr', 'B1', 'gérer', 'керувати', 'Je dois gérer mon temps.', 'Я повинен керувати своїм часом.', 'verb'),
('fr', 'B1', 'le progrès personnel', 'особистий прогрес', 'Je vois mon progrès personnel.', 'Я бачу свій особистий прогрес.', 'noun'),
('fr', 'B1', 'la communication', 'комунікація', 'La communication est essentielle.', 'Комунікація є важливою.', 'noun'),
('fr', 'B1', 'exprimer', 'виражати', 'Je peux exprimer mes idées.', 'Я можу висловлювати свої ідеї.', 'verb'),
('fr', 'B1', 'l’habitude quotidienne', 'щоденна звичка', 'Lire est une habitude quotidienne.', 'Читання — щоденна звичка.', 'noun'),

('fr', 'B1', 'la responsabilité', 'відповідальність', 'C’est une grande responsabilité.', 'Це велика відповідальність.', 'noun'),
('fr', 'B1', 'le développement', 'розвиток', 'Le développement prend du temps.', 'Розвиток потребує часу.', 'noun'),
('fr', 'B1', 'le soutien', 'підтримка', 'Merci pour ton soutien.', 'Дякую за твою підтримку.', 'noun'),
('fr', 'B1', 'réfléchir', 'розмірковувати', 'Je réfléchis à mon avenir.', 'Я розмірковую про своє майбутнє.', 'verb'),
('fr', 'B1', 'le changement', 'зміна', 'Le changement est difficile.', 'Зміни даються важко.', 'noun'),
('fr', 'B1', 'l’apprentissage', 'навчання', 'L’apprentissage continue.', 'Навчання триває.', 'noun'),
('fr', 'B1', 'la motivation personnelle', 'особиста мотивація', 'La motivation personnelle est importante.', 'Особиста мотивація важлива.', 'noun'),
('fr', 'B1', 'la routine', 'рутина', 'Ma routine a changé.', 'Моя рутина змінилася.', 'noun'),
('fr', 'B1', 'réaliser', 'усвідомлювати', 'Je réalise mon erreur.', 'Я усвідомлюю свою помилку.', 'verb'),
('fr', 'B1', 'l’avenir', 'майбутнє', 'Je pense à mon avenir.', 'Я думаю про своє майбутнє.', 'noun');