export type SeedLanguage = "en" | "fr";
export type SeedLevel = "A1" | "A2" | "B1";
export type SeedGoal = "travel" | "work" | "movies" | "self-development";

export type VocabularyItem = {
  word: string;
  translationUk: string;
  example: string;
  exampleTranslationUk: string;
};

export type UsefulPhrase = {
  phrase: string;
  translationUk: string;
};

export type LessonPresentation = {
  topicIntroUk: string;
  communicativeTaskUk: string;
  keyVocabularyPreview: string[];
};

export type LessonExercise =
  | {
      id: string;
      type: "multiple-choice";
      questionUk: string;
      options: string[];
      correctAnswer: string;
      explanationUk: string;
    }
  | {
      id: string;
      type: "matching";
      questionUk: string;
      pairs: Array<[string, string]>;
      explanationUk: string;
    }
  | {
      id: string;
      type: "fill-blank";
      questionUk: string;
      sentence: string;
      correctAnswer: string;
      explanationUk: string;
    }
  | {
      id: string;
      type: "sentence-builder";
      questionUk: string;
      words: string[];
      correctAnswer: string;
      explanationUk: string;
    }
  | {
      id: string;
      type: "word-choice";
      questionUk: string;
      sourceWord: string;
      options: string[];
      correctAnswer: string;
      explanationUk: string;
    }
  | {
      id: string;
      type: "dialogue-choice";
      questionUk: string;
      options: string[];
      correctAnswer: string;
      explanationUk: string;
    }
  | {
      id: string;
      type: "translation";
      questionUk: string;
      sourceUk: string;
      correctAnswer: string;
      acceptableAnswers?: string[];
      explanationUk: string;
    };

export type FinalCheckpointTask = {
  questionUk: string;
  correctAnswer: string;
  explanationUk: string;
};

export type LessonSeed = {
  id: string;
  language: SeedLanguage;
  level: SeedLevel;
  goal: SeedGoal;
  moduleTitle: string;
  lessonTitle: string;
  communicativeGoalUk: string;
  grammarFocus: string;
  vocabularySet: VocabularyItem[];
  usefulPhrases: UsefulPhrase[];
  presentation: LessonPresentation;
  exercises: LessonExercise[];
  finalCheckpoint: FinalCheckpointTask[];
  mentorSuccessMessage: string;
  mentorErrorMessage: string;
};

const mc = (
  id: string,
  questionUk: string,
  options: string[],
  correctAnswer: string,
  explanationUk: string,
): LessonExercise => ({
  id,
  type: "multiple-choice",
  questionUk,
  options,
  correctAnswer,
  explanationUk,
});

const match = (
  id: string,
  questionUk: string,
  pairs: Array<[string, string]>,
  explanationUk: string,
): LessonExercise => ({
  id,
  type: "matching",
  questionUk,
  pairs,
  explanationUk,
});

const blank = (
  id: string,
  questionUk: string,
  sentence: string,
  correctAnswer: string,
  explanationUk: string,
): LessonExercise => ({
  id,
  type: "fill-blank",
  questionUk,
  sentence,
  correctAnswer,
  explanationUk,
});

const builder = (
  id: string,
  questionUk: string,
  words: string[],
  correctAnswer: string,
  explanationUk: string,
): LessonExercise => ({
  id,
  type: "sentence-builder",
  questionUk,
  words,
  correctAnswer,
  explanationUk,
});

const wordChoice = (
  id: string,
  questionUk: string,
  sourceWord: string,
  options: string[],
  correctAnswer: string,
  explanationUk: string,
): LessonExercise => ({
  id,
  type: "word-choice",
  questionUk,
  sourceWord,
  options,
  correctAnswer,
  explanationUk,
});

const dialogueChoice = (
  id: string,
  questionUk: string,
  options: string[],
  correctAnswer: string,
  explanationUk: string,
): LessonExercise => ({
  id,
  type: "dialogue-choice",
  questionUk,
  options,
  correctAnswer,
  explanationUk,
});

const translation = (
  id: string,
  questionUk: string,
  sourceUk: string,
  correctAnswer: string,
  explanationUk: string,
  acceptableAnswers?: string[],
): LessonExercise => ({
  id,
  type: "translation",
  questionUk,
  sourceUk,
  correctAnswer,
  acceptableAnswers,
  explanationUk,
});

const checkpoint = (
  questionUk: string,
  correctAnswer: string,
  explanationUk: string,
): FinalCheckpointTask => ({
  questionUk,
  correctAnswer,
  explanationUk,
});

const frenchTravelA1Lessons: LessonSeed[] = [
  {
    id: "fr-a1-travel-se-presenter",
    language: "fr",
    level: "A1",
    goal: "travel",
    moduleTitle: "Перші кроки в подорожі",
    lessonTitle: "Se présenter",
    communicativeGoalUk:
      "Після уроку користувач зможе коротко представитися в подорожі: назвати себе, країну та сказати, що він турист.",
    grammarFocus: "Être у простих фразах самопрезентації: je suis, tu es, il/elle est",
    vocabularySet: [
      {
        word: "bonjour",
        translationUk: "добрий день",
        example: "Bonjour, je suis Anna.",
        exampleTranslationUk: "Добрий день, я Анна.",
      },
      {
        word: "je m'appelle",
        translationUk: "мене звати",
        example: "Je m'appelle Paul.",
        exampleTranslationUk: "Мене звати Поль.",
      },
      {
        word: "je suis",
        translationUk: "я є / я",
        example: "Je suis touriste.",
        exampleTranslationUk: "Я турист.",
      },
      {
        word: "touriste",
        translationUk: "турист",
        example: "Je suis touriste.",
        exampleTranslationUk: "Я турист.",
      },
      {
        word: "français / française",
        translationUk: "француз / француженка",
        example: "Elle est française.",
        exampleTranslationUk: "Вона француженка.",
      },
      {
        word: "le passeport",
        translationUk: "паспорт",
        example: "Voici mon passeport.",
        exampleTranslationUk: "Ось мій паспорт.",
      },
    ],
    usefulPhrases: [
      { phrase: "Bonjour, je m'appelle Anna.", translationUk: "Добрий день, мене звати Анна." },
      { phrase: "Je suis ukrainienne.", translationUk: "Я українка." },
      { phrase: "Je suis touriste.", translationUk: "Я турист / туристка." },
    ],
    presentation: {
      topicIntroUk:
        "У цьому уроці ти вчишся безпечно почати розмову в подорожі: привітатися, назвати себе та сказати, хто ти.",
      communicativeTaskUk:
        "Твоє завдання — коротко представитися на стійці інформації або під час знайомства.",
      keyVocabularyPreview: ["bonjour", "je m'appelle", "je suis", "touriste", "française"],
    },
    exercises: [
      wordChoice(
        "ex1",
        "Обери переклад слова «touriste».",
        "touriste",
        ["турист", "квиток", "готель", "валіза"],
        "турист",
        "Слово «touriste» означає людину, яка подорожує.",
      ),
      match(
        "ex2",
        "Зістав французькі слова з перекладом.",
        [
          ["bonjour", "добрий день"],
          ["je m'appelle", "мене звати"],
          ["touriste", "турист"],
          ["le passeport", "паспорт"],
        ],
        "Це базові слова для першого короткого знайомства під час подорожі.",
      ),
      mc(
        "ex3",
        "Choose the best option: Je ___ Anna.",
        ["suis", "es", "est", "sommes"],
        "suis",
        "Після «je» у теперішньому часі дієслова être вживається форма «suis».",
      ),
      blank(
        "ex4",
        "Заповни пропуск: Je m'___ Paul.",
        "Je m'___ Paul.",
        "appelle",
        "У фразі «Je m'appelle...» використовується дієслово «appeler» у формі «appelle».",
      ),
      builder(
        "ex5",
        "Склади речення: «Я турист».",
        ["Je", "suis", "touriste"],
        "Je suis touriste.",
        "У простому твердженні порядок слів такий: підмет + être + іменник.",
      ),
      dialogueChoice(
        "ex6",
        "Ти знайомишся в хостелі. Яку фразу обереш?",
        [
          "Bonjour, je m'appelle Anna.",
          "Où est la gare ?",
          "Je voudrais un café.",
          "La chambre est petite.",
        ],
        "Bonjour, je m'appelle Anna.",
        "Для знайомства потрібна формула привітання та імені.",
      ),
      translation(
        "ex7",
        "Переклади французькою: «Я туристка».",
        "Я туристка.",
        "Je suis touriste.",
        "На рівні A1 достатньо короткої структури «Je suis + іменник».",
        ["Je suis une touriste."],
      ),
      mc(
        "ex8",
        "Фінальна перевірка: обери правильне речення.",
        [
          "Je suis Anna.",
          "Je es Anna.",
          "Je est Anna.",
          "Je être Anna.",
        ],
        "Je suis Anna.",
        "Лише речення з формою «je suis» є граматично правильним.",
      ),
    ],
    finalCheckpoint: [
      checkpoint(
        "Як сказати французькою: «Добрий день, мене звати Олена. Я туристка»?",
        "Bonjour, je m'appelle Olena. Je suis touriste.",
        "Тут поєднуються дві базові моделі: «je m'appelle...» та «je suis...».",
      ),
    ],
    mentorSuccessMessage:
      "Чудово! Ти вже можеш коротко представитися французькою в реальній подорожі.",
    mentorErrorMessage:
      "Не страшно. Повтори форми être з «je» та готові фрази «Bonjour» і «Je m'appelle».",
  },
  {
    id: "fr-a1-travel-a-laeroport",
    language: "fr",
    level: "A1",
    goal: "travel",
    moduleTitle: "Перші кроки в подорожі",
    lessonTitle: "À l'aéroport",
    communicativeGoalUk:
      "Після уроку користувач зможе запитати, де знаходиться місце в аеропорту, та зрозуміти коротку відповідь.",
    grammarFocus: "Питання про місце: Où est ... ?",
    vocabularySet: [
      {
        word: "l'aéroport",
        translationUk: "аеропорт",
        example: "Je suis à l'aéroport.",
        exampleTranslationUk: "Я в аеропорту.",
      },
      {
        word: "la porte",
        translationUk: "вихід на посадку",
        example: "La porte est ici.",
        exampleTranslationUk: "Вихід тут.",
      },
      {
        word: "le contrôle",
        translationUk: "контроль",
        example: "Le contrôle est à gauche.",
        exampleTranslationUk: "Контроль ліворуч.",
      },
      {
        word: "le comptoir",
        translationUk: "стійка",
        example: "Le comptoir est devant vous.",
        exampleTranslationUk: "Стійка перед вами.",
      },
      {
        word: "à droite",
        translationUk: "праворуч",
        example: "La porte est à droite.",
        exampleTranslationUk: "Вихід праворуч.",
      },
      {
        word: "à gauche",
        translationUk: "ліворуч",
        example: "Le contrôle est à gauche.",
        exampleTranslationUk: "Контроль ліворуч.",
      },
    ],
    usefulPhrases: [
      { phrase: "Où est la porte 12 ?", translationUk: "Де вихід 12?" },
      { phrase: "Le contrôle est à gauche.", translationUk: "Контроль ліворуч." },
      { phrase: "Le comptoir est devant vous.", translationUk: "Стійка перед вами." },
    ],
    presentation: {
      topicIntroUk:
        "Ти вчишся ставити просте питання про місце в аеропорту та розуміти короткий напрямок.",
      communicativeTaskUk:
        "Твоє завдання — знайти потрібний вихід або стійку, звернувшись до працівника аеропорту.",
      keyVocabularyPreview: ["la porte", "le contrôle", "le comptoir", "à droite", "à gauche"],
    },
    exercises: [
      wordChoice(
        "ex1",
        "Обери переклад «la porte».",
        "la porte",
        ["вихід на посадку", "валіза", "паспорт", "літак"],
        "вихід на посадку",
        "У контексті аеропорту «la porte» означає гейт або вихід на посадку.",
      ),
      match(
        "ex2",
        "Зістав слова з перекладом.",
        [
          ["le contrôle", "контроль"],
          ["le comptoir", "стійка"],
          ["à droite", "праворуч"],
          ["à gauche", "ліворуч"],
        ],
        "Ці слова часто потрібні, щоб зрозуміти коротку інструкцію в аеропорту.",
      ),
      mc(
        "ex3",
        "Choose the best option: Où ___ le comptoir ?",
        ["est", "suis", "es", "sommes"],
        "est",
        "Після «Où» у питанні про місце з іменником «le comptoir» потрібна форма «est».",
      ),
      blank(
        "ex4",
        "Заповни пропуск: La porte est ___ droite.",
        "La porte est ___ droite.",
        "à",
        "У виразі напрямку використовується сталій зворот «à droite».",
      ),
      builder(
        "ex5",
        "Склади речення: «Контроль ліворуч».",
        ["Le", "contrôle", "est", "à gauche"],
        "Le contrôle est à gauche.",
        "Проста відповідь про місце будується як підмет + est + напрямок.",
      ),
      dialogueChoice(
        "ex6",
        "Ти шукаєш вихід на посадку. Яку фразу обереш?",
        [
          "Où est la porte 12 ?",
          "Je suis touriste.",
          "Je voudrais un café.",
          "C'est mon passeport.",
        ],
        "Où est la porte 12 ?",
        "Щоб знайти місце, потрібне питання з «Où est ... ?».",
      ),
      translation(
        "ex7",
        "Переклади французькою: «Стійка праворуч».",
        "Стійка праворуч.",
        "Le comptoir est à droite.",
        "Тут використовується базова структура опису місця: «Le comptoir est ...».",
      ),
      mc(
        "ex8",
        "Фінальна перевірка: обери правильну коротку відповідь.",
        [
          "Le contrôle est à gauche.",
          "Le contrôle suis à gauche.",
          "Le contrôle à gauche est.",
          "Le contrôle sont à gauche.",
        ],
        "Le contrôle est à gauche.",
        "Правильний порядок слів: підмет + est + напрямок.",
      ),
    ],
    finalCheckpoint: [
      checkpoint(
        "Як сказати французькою: «Де стійка?»",
        "Où est le comptoir ?",
        "Починай із «Où est ... ?», коли запитуєш про місце.",
      ),
    ],
    mentorSuccessMessage:
      "Супер! Ти вже можеш запитати дорогу в аеропорту та зрозуміти просту відповідь.",
    mentorErrorMessage:
      "Спробуй ще раз. Повтори модель «Où est ... ?» та вирази напрямку «à droite / à gauche».",
  },
  {
    id: "fr-a1-travel-en-ville",
    language: "fr",
    level: "A1",
    goal: "travel",
    moduleTitle: "Перші кроки в подорожі",
    lessonTitle: "En ville",
    communicativeGoalUk:
      "Після уроку користувач зможе запитати, де знаходиться місце у місті, та зрозуміти коротку відповідь.",
    grammarFocus: "Прийменники місця: près de, à côté de, devant, derrière",
    vocabularySet: [
      {
        word: "la gare",
        translationUk: "вокзал",
        example: "Où est la gare ?",
        exampleTranslationUk: "Де вокзал?",
      },
      {
        word: "l'hôtel",
        translationUk: "готель",
        example: "L'hôtel est près de la gare.",
        exampleTranslationUk: "Готель біля вокзалу.",
      },
      {
        word: "la banque",
        translationUk: "банк",
        example: "La banque est à côté de la poste.",
        exampleTranslationUk: "Банк поруч із поштою.",
      },
      {
        word: "la poste",
        translationUk: "пошта",
        example: "La poste est devant l'hôtel.",
        exampleTranslationUk: "Пошта перед готелем.",
      },
      {
        word: "près de",
        translationUk: "біля",
        example: "Le café est près de la gare.",
        exampleTranslationUk: "Кафе біля вокзалу.",
      },
      {
        word: "derrière",
        translationUk: "позаду",
        example: "La banque est derrière l'hôtel.",
        exampleTranslationUk: "Банк позаду готелю.",
      },
    ],
    usefulPhrases: [
      { phrase: "Où est la gare ?", translationUk: "Де вокзал?" },
      { phrase: "La banque est près de la poste.", translationUk: "Банк біля пошти." },
      { phrase: "Tournez à droite.", translationUk: "Поверніть праворуч." },
    ],
    presentation: {
      topicIntroUk:
        "У цьому уроці ти вчишся знаходити орієнтири в місті та ставити короткі питання про місце.",
      communicativeTaskUk:
        "Твоє завдання — запитати про місце в місті та зрозуміти відповідь із прийменником місця.",
      keyVocabularyPreview: ["la gare", "l'hôtel", "la banque", "la poste", "près de"],
    },
    exercises: [
      wordChoice(
        "ex1",
        "Обери переклад «la gare».",
        "la gare",
        ["вокзал", "музей", "квиток", "кава"],
        "вокзал",
        "Слово «la gare» означає вокзал або залізничну станцію.",
      ),
      match(
        "ex2",
        "Зістав слова з перекладом.",
        [
          ["la gare", "вокзал"],
          ["la banque", "банк"],
          ["la poste", "пошта"],
          ["l'hôtel", "готель"],
        ],
        "Це базові місця в місті, які часто з'являються в простих діалогах подорожі.",
      ),
      mc(
        "ex3",
        "Choose the best option: La banque est ___ la poste.",
        ["près de", "devant", "derrière", "loin de"],
        "près de",
        "«près de» означає «біля» і вказує, що два місця розташовані поруч.",
      ),
      blank(
        "ex4",
        "Заповни пропуск: Où ___ la gare ?",
        "Où ___ la gare ?",
        "est",
        "У питаннях про місце з іменником в однині використовується «est».",
      ),
      builder(
        "ex5",
        "Склади речення: «Готель біля вокзалу».",
        ["L'hôtel", "est", "près de", "la gare"],
        "L'hôtel est près de la gare.",
        "У відповіді про місце спочатку називається об'єкт, потім «est», а далі прийменник.",
      ),
      dialogueChoice(
        "ex6",
        "Ти шукаєш вокзал. Яку фразу обрати?",
        [
          "Où est la gare ?",
          "Je suis fatigué.",
          "J'aime le café.",
          "Il est huit heures.",
        ],
        "Où est la gare ?",
        "Щоб запитати про місце, використовується структура «Où est ... ?».",
      ),
      translation(
        "ex7",
        "Переклади французькою: «Банк позаду готелю».",
        "Банк позаду готелю.",
        "La banque est derrière l'hôtel.",
        "Слово «derrière» означає «позаду» і вживається після дієслова «est».",
      ),
      mc(
        "ex8",
        "Фінальна перевірка: обери правильне речення.",
        [
          "La poste est devant l'hôtel.",
          "La poste devant l'hôtel est.",
          "La poste sont devant l'hôtel.",
          "La poste est à devant l'hôtel.",
        ],
        "La poste est devant l'hôtel.",
        "Прийменник «devant» не потребує додаткового «à» у цій моделі.",
      ),
    ],
    finalCheckpoint: [
      checkpoint(
        "Як сказати французькою: «Готель біля вокзалу»?",
        "L'hôtel est près de la gare.",
        "Тут поєднується місце «l'hôtel», дієслово «est» та прийменник «près de».",
      ),
    ],
    mentorSuccessMessage:
      "Чудово! Ти вже можеш запитати просту дорогу в місті та зрозуміти коротку відповідь.",
    mentorErrorMessage:
      "Не страшно. Повтори прийменники місця: près de, devant, derrière, à côté de.",
  },
  {
    id: "fr-a1-travel-a-lhotel",
    language: "fr",
    level: "A1",
    goal: "travel",
    moduleTitle: "Перші кроки в подорожі",
    lessonTitle: "À l'hôtel",
    communicativeGoalUk:
      "Після уроку користувач зможе спитати, чи є щось у номері, та коротко відповісти про зручності.",
    grammarFocus: "Il y a / Est-ce qu'il y a ... ?",
    vocabularySet: [
      {
        word: "la chambre",
        translationUk: "кімната",
        example: "La chambre est grande.",
        exampleTranslationUk: "Кімната велика.",
      },
      {
        word: "la clé",
        translationUk: "ключ",
        example: "Voici la clé.",
        exampleTranslationUk: "Ось ключ.",
      },
      {
        word: "la douche",
        translationUk: "душ",
        example: "Il y a une douche.",
        exampleTranslationUk: "Є душ.",
      },
      {
        word: "le wifi",
        translationUk: "вайфай",
        example: "Il y a le wifi.",
        exampleTranslationUk: "Є вайфай.",
      },
      {
        word: "la serviette",
        translationUk: "рушник",
        example: "Il y a une serviette.",
        exampleTranslationUk: "Є рушник.",
      },
      {
        word: "la réception",
        translationUk: "ресепшн",
        example: "La réception est ici.",
        exampleTranslationUk: "Ресепшн тут.",
      },
    ],
    usefulPhrases: [
      { phrase: "Il y a le wifi ?", translationUk: "Є вайфай?" },
      { phrase: "Il y a une douche.", translationUk: "Є душ." },
      { phrase: "Voici la clé.", translationUk: "Ось ключ." },
    ],
    presentation: {
      topicIntroUk:
        "Тепер ти вчишся говорити про те, що є або чого немає в номері.",
      communicativeTaskUk:
        "Твоє завдання — поставити просте питання на ресепшні й зрозуміти коротку відповідь про зручності.",
      keyVocabularyPreview: ["la chambre", "la clé", "la douche", "le wifi", "il y a"],
    },
    exercises: [
      wordChoice(
        "ex1",
        "Обери переклад слова «la serviette».",
        "la serviette",
        ["рушник", "подушка", "валіза", "вікно"],
        "рушник",
        "«La serviette» — це рушник, слово з частого словника готелю.",
      ),
      match(
        "ex2",
        "Зістав слова з перекладом.",
        [
          ["la chambre", "кімната"],
          ["la clé", "ключ"],
          ["la douche", "душ"],
          ["la réception", "ресепшн"],
        ],
        "Ці слова допомагають описати номер і базові речі в ньому.",
      ),
      mc(
        "ex3",
        "Choose the best option: Il y ___ le wifi.",
        ["a", "est", "ont", "es"],
        "a",
        "У конструкції наявності використовується стала форма «il y a».",
      ),
      blank(
        "ex4",
        "Заповни пропуск: Est-ce qu'il y ___ une douche ?",
        "Est-ce qu'il y ___ une douche ?",
        "a",
        "У питанні з «il y a» форма не змінюється, тому зберігається «a».",
      ),
      builder(
        "ex5",
        "Склади речення: «Є рушник».",
        ["Il", "y", "a", "une serviette"],
        "Il y a une serviette.",
        "Конструкція «il y a» вживається, коли ми повідомляємо про наявність предмета.",
      ),
      dialogueChoice(
        "ex6",
        "Ти хочеш спитати про вайфай у номері. Яку фразу обереш?",
        [
          "Il y a le wifi ?",
          "Je m'appelle Nadia.",
          "Où est la gare ?",
          "Je voudrais un café.",
        ],
        "Il y a le wifi ?",
        "Коли ми питаємо, чи є щось, можна використати просту інтонаційну форму «Il y a ... ?».",
      ),
      translation(
        "ex7",
        "Переклади французькою: «Є душ».",
        "Є душ.",
        "Il y a une douche.",
        "Для повідомлення про наявність зручності використовується «Il y a ...».",
      ),
      mc(
        "ex8",
        "Фінальна перевірка: обери правильну відповідь на питання про номер.",
        [
          "Il y a une clé.",
          "Il est une clé.",
          "Il y est une clé.",
          "Il a une clé y.",
        ],
        "Il y a une clé.",
        "Лише «Il y a ...» правильно виражає наявність предмета.",
      ),
    ],
    finalCheckpoint: [
      checkpoint(
        "Як сказати французькою: «Є вайфай і душ»?",
        "Il y a le wifi et une douche.",
        "Тут використовується одна конструкція «Il y a ...» для переліку зручностей.",
      ),
    ],
    mentorSuccessMessage:
      "Добре! Ти вже можеш ставити прості питання про номер і розуміти базові відповіді в готелі.",
    mentorErrorMessage:
      "Спробуй ще раз. Повтори сталу конструкцію «Il y a» та словник про зручності в номері.",
  },
  {
    id: "fr-a1-travel-au-cafe",
    language: "fr",
    level: "A1",
    goal: "travel",
    moduleTitle: "Перші кроки в подорожі",
    lessonTitle: "Au café",
    communicativeGoalUk:
      "Після уроку користувач зможе просто замовити напій або страву в кафе.",
    grammarFocus: "Je voudrais + іменник",
    vocabularySet: [
      {
        word: "un café",
        translationUk: "кава",
        example: "Je voudrais un café.",
        exampleTranslationUk: "Я хотів би каву.",
      },
      {
        word: "un thé",
        translationUk: "чай",
        example: "Je voudrais un thé.",
        exampleTranslationUk: "Я хотів би чай.",
      },
      {
        word: "de l'eau",
        translationUk: "вода",
        example: "Je voudrais de l'eau.",
        exampleTranslationUk: "Я хотів би води.",
      },
      {
        word: "un sandwich",
        translationUk: "сендвіч",
        example: "Je voudrais un sandwich.",
        exampleTranslationUk: "Я хотів би сендвіч.",
      },
      {
        word: "l'addition",
        translationUk: "рахунок",
        example: "L'addition, s'il vous plaît.",
        exampleTranslationUk: "Рахунок, будь ласка.",
      },
      {
        word: "s'il vous plaît",
        translationUk: "будь ласка",
        example: "Un café, s'il vous plaît.",
        exampleTranslationUk: "Каву, будь ласка.",
      },
    ],
    usefulPhrases: [
      { phrase: "Je voudrais un café.", translationUk: "Я хотів би каву." },
      { phrase: "Un sandwich, s'il vous plaît.", translationUk: "Сендвіч, будь ласка." },
      { phrase: "L'addition, s'il vous plaît.", translationUk: "Рахунок, будь ласка." },
    ],
    presentation: {
      topicIntroUk:
        "У цьому уроці ти переходиш до ввічливого замовлення в кафе.",
      communicativeTaskUk:
        "Твоє завдання — замовити один напій або просту страву та завершити мінідіалог.",
      keyVocabularyPreview: ["un café", "un thé", "de l'eau", "un sandwich", "je voudrais"],
    },
    exercises: [
      wordChoice(
        "ex1",
        "Обери переклад «l'addition».",
        "l'addition",
        ["рахунок", "меню", "склянка", "ложка"],
        "рахунок",
        "У кафе «l'addition» — це рахунок за замовлення.",
      ),
      match(
        "ex2",
        "Зістав слова з перекладом.",
        [
          ["un café", "кава"],
          ["un thé", "чай"],
          ["de l'eau", "вода"],
          ["un sandwich", "сендвіч"],
        ],
        "Це базові позиції, які легко замовити на рівні A1.",
      ),
      mc(
        "ex3",
        "Choose the best option: Je voudrais ___ café.",
        ["un", "une", "des", "de"],
        "un",
        "Слово «café» — іменник чоловічого роду в однині, тому вживається «un».",
      ),
      blank(
        "ex4",
        "Заповни пропуск: Je ___ un thé.",
        "Je ___ un thé.",
        "voudrais",
        "Для ввічливого замовлення використовується форма «je voudrais».",
      ),
      builder(
        "ex5",
        "Склади речення: «Я хотів би води».",
        ["Je", "voudrais", "de l'eau"],
        "Je voudrais de l'eau.",
        "Після «Je voudrais» одразу називається те, що людина хоче замовити.",
      ),
      dialogueChoice(
        "ex6",
        "Ти готовий зробити замовлення. Яку фразу обереш?",
        [
          "Je voudrais un sandwich.",
          "Où est la banque ?",
          "Je suis touriste.",
          "La chambre est petite.",
        ],
        "Je voudrais un sandwich.",
        "Для замовлення в кафе потрібна модель «Je voudrais + іменник».",
      ),
      translation(
        "ex7",
        "Переклади французькою: «Чай, будь ласка».",
        "Чай, будь ласка.",
        "Un thé, s'il vous plaît.",
        "Коротке замовлення теж може бути коректним, якщо додати «s'il vous plaît».",
      ),
      mc(
        "ex8",
        "Фінальна перевірка: обери правильну фразу для замовлення.",
        [
          "Je voudrais un café.",
          "Je suis un café.",
          "Je voudrais est café.",
          "Je café voudrais.",
        ],
        "Je voudrais un café.",
        "Після «Je voudrais» має стояти іменник або словосполучення з ним.",
      ),
    ],
    finalCheckpoint: [
      checkpoint(
        "Як сказати французькою: «Я хотів би сендвіч і воду»?",
        "Je voudrais un sandwich et de l'eau.",
        "Тут використовується одна модель ввічливого замовлення для двох позицій.",
      ),
    ],
    mentorSuccessMessage:
      "Чудово! Ти вже можеш замовити щось просте в кафе без зайвого стресу.",
    mentorErrorMessage:
      "Не страшно. Повтори конструкцію «Je voudrais ...» та назви напоїв і страв.",
  },
  {
    id: "fr-a1-travel-acheter-un-billet",
    language: "fr",
    level: "A1",
    goal: "travel",
    moduleTitle: "Перші кроки в подорожі",
    lessonTitle: "Acheter un billet",
    communicativeGoalUk:
      "Після уроку користувач зможе попросити квиток і назвати пункт призначення.",
    grammarFocus: "Je voudrais un billet pour ...",
    vocabularySet: [
      {
        word: "un billet",
        translationUk: "квиток",
        example: "Je voudrais un billet.",
        exampleTranslationUk: "Я хотів би квиток.",
      },
      {
        word: "pour Paris",
        translationUk: "до Парижа",
        example: "Un billet pour Paris.",
        exampleTranslationUk: "Квиток до Парижа.",
      },
      {
        word: "aller simple",
        translationUk: "в один бік",
        example: "Un billet aller simple.",
        exampleTranslationUk: "Квиток в один бік.",
      },
      {
        word: "aller-retour",
        translationUk: "туди й назад",
        example: "Un billet aller-retour.",
        exampleTranslationUk: "Квиток туди й назад.",
      },
      {
        word: "le train",
        translationUk: "поїзд",
        example: "Le train pour Lyon.",
        exampleTranslationUk: "Потяг до Ліона.",
      },
      {
        word: "la gare",
        translationUk: "вокзал",
        example: "Je suis à la gare.",
        exampleTranslationUk: "Я на вокзалі.",
      },
    ],
    usefulPhrases: [
      { phrase: "Je voudrais un billet pour Paris.", translationUk: "Я хотів би квиток до Парижа." },
      { phrase: "Aller simple, s'il vous plaît.", translationUk: "В один бік, будь ласка." },
      { phrase: "Un billet aller-retour.", translationUk: "Квиток туди й назад." },
    ],
    presentation: {
      topicIntroUk:
        "Останній урок модуля вчить тебе формулювати коротке прохання про квиток.",
      communicativeTaskUk:
        "Твоє завдання — купити квиток і чітко назвати напрямок або тип поїздки.",
      keyVocabularyPreview: ["un billet", "pour Paris", "aller simple", "aller-retour", "la gare"],
    },
    exercises: [
      wordChoice(
        "ex1",
        "Обери переклад слова «aller-retour».",
        "aller-retour",
        ["туди й назад", "швидкий потяг", "посадковий талон", "перон"],
        "туди й назад",
        "«Aller-retour» означає поїздку в обидва боки.",
      ),
      match(
        "ex2",
        "Зістав слова з перекладом.",
        [
          ["un billet", "квиток"],
          ["aller simple", "в один бік"],
          ["aller-retour", "туди й назад"],
          ["la gare", "вокзал"],
        ],
        "Ці слова формують базову лексику для купівлі квитка на вокзалі.",
      ),
      mc(
        "ex3",
        "Choose the best option: Je voudrais un billet ___ Paris.",
        ["pour", "avec", "dans", "sur"],
        "pour",
        "Щоб назвати напрямок, у цій моделі використовується прийменник «pour».",
      ),
      blank(
        "ex4",
        "Заповни пропуск: Un billet aller ___, s'il vous plaît.",
        "Un billet aller ___, s'il vous plaît.",
        "simple",
        "Фраза «aller simple» означає квиток в один бік.",
      ),
      builder(
        "ex5",
        "Склади речення: «Я хотів би квиток до Ліона».",
        ["Je", "voudrais", "un billet", "pour", "Lyon"],
        "Je voudrais un billet pour Lyon.",
        "Після «Je voudrais» спочатку називається квиток, а далі напрямок з «pour».",
      ),
      dialogueChoice(
        "ex6",
        "Ти на вокзалі. Яку фразу обереш, щоб купити квиток?",
        [
          "Je voudrais un billet pour Paris.",
          "Je suis dans la chambre.",
          "Où est la réception ?",
          "L'addition, s'il vous plaît.",
        ],
        "Je voudrais un billet pour Paris.",
        "Для купівлі квитка потрібна ввічлива модель із «Je voudrais».",
      ),
      translation(
        "ex7",
        "Переклади французькою: «Квиток туди й назад до Парижа».",
        "Квиток туди й назад до Парижа.",
        "Un billet aller-retour pour Paris.",
        "Тип поїздки «aller-retour» стоїть після слова «billet», а напрямок вводиться через «pour».",
      ),
      mc(
        "ex8",
        "Фінальна перевірка: обери правильну фразу.",
        [
          "Je voudrais un billet aller simple pour Nice.",
          "Je voudrais pour Nice un aller simple billet.",
          "Je billet voudrais pour Nice.",
          "Je voudrais un billet à Nice simple.",
        ],
        "Je voudrais un billet aller simple pour Nice.",
        "Правильний порядок: «Je voudrais» + предмет + тип квитка + напрямок.",
      ),
    ],
    finalCheckpoint: [
      checkpoint(
        "Як сказати французькою: «Я хотів би квиток в один бік до Парижа»?",
        "Je voudrais un billet aller simple pour Paris.",
        "У фразі поєднуються ввічливе прохання, тип квитка та напрямок.",
      ),
    ],
    mentorSuccessMessage:
      "Супер! Ти вже можеш купити простий квиток французькою та назвати потрібний напрямок.",
    mentorErrorMessage:
      "Спробуй ще раз. Повтори модель «Je voudrais un billet pour ...» та різницю між aller simple й aller-retour.",
  },
];

type StubTheme = {
  lessonTitle: string;
  communicativeActionUk: string;
};

const lessonThemesByGoal: Record<SeedGoal, StubTheme[]> = {
  travel: [
    { lessonTitle: "Перший контакт у подорожі", communicativeActionUk: "коротко представитися в подорожі" },
    { lessonTitle: "Дорога й транспорт", communicativeActionUk: "запитати та зрозуміти просту інформацію про транспорт" },
    { lessonTitle: "Місто та орієнтири", communicativeActionUk: "знайти місце в місті або пояснити, де воно" },
    { lessonTitle: "Проживання", communicativeActionUk: "поставити просте питання про готель або номер" },
    { lessonTitle: "Їжа й сервіс", communicativeActionUk: "замовити щось або відреагувати на просту пропозицію" },
    { lessonTitle: "Несподівані ситуації", communicativeActionUk: "пояснити потребу або маленьку проблему в поїздці" },
  ],
  work: [
    { lessonTitle: "Знайомство на роботі", communicativeActionUk: "представитися в робочому середовищі" },
    { lessonTitle: "Щоденні задачі", communicativeActionUk: "описати просту робочу дію або обов'язок" },
    { lessonTitle: "Зустрічі та плани", communicativeActionUk: "домовитися про час або коротку дію" },
    { lessonTitle: "Листи й повідомлення", communicativeActionUk: "передати просту інформацію письмово або усно" },
    { lessonTitle: "Проблема та рішення", communicativeActionUk: "описати проблему й запропонувати просте рішення" },
    { lessonTitle: "Робочий підсумок", communicativeActionUk: "дати короткий апдейт або коментар про результат" },
  ],
  movies: [
    { lessonTitle: "Перші враження від фільму", communicativeActionUk: "сказати, що сподобалося або не сподобалося" },
    { lessonTitle: "Персонажі", communicativeActionUk: "описати героя простими словами" },
    { lessonTitle: "Сцени та події", communicativeActionUk: "переказати короткий епізод" },
    { lessonTitle: "Емоції та реакції", communicativeActionUk: "висловити реакцію на сцену або персонажа" },
    { lessonTitle: "Поради й рекомендації", communicativeActionUk: "порадити фільм або пояснити чому" },
    { lessonTitle: "Обговорення сюжету", communicativeActionUk: "дати стислий коментар або думку про сюжет" },
  ],
  "self-development": [
    { lessonTitle: "Я і мої звички", communicativeActionUk: "описати звичку або щоденну дію" },
    { lessonTitle: "Цілі та плани", communicativeActionUk: "розповісти про особисту мету або план" },
    { lessonTitle: "Почуття і стан", communicativeActionUk: "описати свій стан або настрій" },
    { lessonTitle: "Навчання і фокус", communicativeActionUk: "пояснити, як ти навчаєшся або концентруєшся" },
    { lessonTitle: "Проблеми і рішення", communicativeActionUk: "сказати про труднощі та простий вихід" },
    { lessonTitle: "Особистий прогрес", communicativeActionUk: "коротко оцінити свій прогрес або досвід" },
  ],
};

const moduleTitlesByGoalUk: Record<SeedGoal, string> = {
  travel: "Комунікативна подорож",
  work: "Мова для роботи",
  movies: "Мова для фільмів і серіалів",
  "self-development": "Мова для особистого розвитку",
};

const englishGrammarByLevel: Record<SeedLevel, string[]> = {
  A1: [
    "to be в простих представленнях",
    "there is / there are у базових описах місця",
    "Present Simple у коротких твердженнях",
    "Питання з do / does у щоденних ситуаціях",
    "can / can't для простих прохань і можливостей",
    "Прийменники місця та часу в базових фразах",
  ],
  A2: [
    "Past Simple для завершених подій",
    "be going to для планів і намірів",
    "some / any та countable / uncountable nouns",
    "Comparatives and superlatives у простих порівняннях",
    "should / shouldn't для порад",
    "Present Continuous для домовленостей і поточних дій",
  ],
  B1: [
    "Present Perfect для досвіду та результату",
    "First Conditional для реальних наслідків",
    "Relative clauses with who / that / which",
    "Modal verbs for obligation, permission, advice",
    "Linkers for opinion: because, so, however",
    "Question forms for follow-up and clarification",
  ],
};

const frenchGrammarByLevel: Record<SeedLevel, string[]> = {
  A1: [
    "Être у простих представленнях",
    "Il y a у базових описах місця",
    "Présent des verbes en -er у коротких фразах",
    "Питання з est-ce que у щоденних ситуаціях",
    "Vouloir для простих прохань і замовлень",
    "Прийменники місця: à, dans, devant, derrière, près de",
  ],
  A2: [
    "Passé composé з avoir у простих подіях",
    "Futur proche для планів",
    "Часткові артиклі та вирази кількості",
    "Comparatif: plus, moins, aussi",
    "Pouvoir / devoir / vouloir у побутових ситуаціях",
    "Прості займенники COD у коротких відповідях",
  ],
  B1: [
    "Imparfait vs passé composé у короткій розповіді",
    "Conditionnel de politesse і conseil",
    "Pronoms y / en у практичних контекстах",
    "Підрядні зв'язки avec parce que, quand, si",
    "Je pense que / je trouve que для думки й аргументації",
    "Pronoms relatifs qui / que / où",
  ],
};

const genericPhrases: Record<SeedLanguage, Record<SeedGoal, UsefulPhrase[]>> = {
  en: {
    travel: [
      { phrase: "Where is the station?", translationUk: "Де вокзал?" },
      { phrase: "I need a ticket, please.", translationUk: "Мені потрібен квиток, будь ласка." },
      { phrase: "Can you help me?", translationUk: "Ви можете мені допомогти?" },
    ],
    work: [
      { phrase: "I have a meeting at ten.", translationUk: "У мене зустріч о десятій." },
      { phrase: "Can you send the file?", translationUk: "Можеш надіслати файл?" },
      { phrase: "Let's check the plan.", translationUk: "Давай перевіримо план." },
    ],
    movies: [
      { phrase: "I liked this scene.", translationUk: "Мені сподобалась ця сцена." },
      { phrase: "The actor was great.", translationUk: "Актор був чудовий." },
      { phrase: "I would recommend it.", translationUk: "Я б це порадив / порадила." },
    ],
    "self-development": [
      { phrase: "I want to improve.", translationUk: "Я хочу покращитися." },
      { phrase: "This habit helps me.", translationUk: "Ця звичка мені допомагає." },
      { phrase: "I need more focus.", translationUk: "Мені потрібно більше зосередженості." },
    ],
  },
  fr: {
    travel: [
      { phrase: "Où est la gare ?", translationUk: "Де вокзал?" },
      { phrase: "Je voudrais un billet.", translationUk: "Я хотів би квиток." },
      { phrase: "Vous pouvez m'aider ?", translationUk: "Ви можете мені допомогти?" },
    ],
    work: [
      { phrase: "J'ai une réunion à dix heures.", translationUk: "У мене зустріч о десятій." },
      { phrase: "Tu peux envoyer le fichier ?", translationUk: "Ти можеш надіслати файл?" },
      { phrase: "On vérifie le plan.", translationUk: "Перевірмо план." },
    ],
    movies: [
      { phrase: "J'ai aimé cette scène.", translationUk: "Мені сподобалась ця сцена." },
      { phrase: "L'acteur était très bon.", translationUk: "Актор був дуже хорошим." },
      { phrase: "Je le recommande.", translationUk: "Я це рекомендую." },
    ],
    "self-development": [
      { phrase: "Je veux progresser.", translationUk: "Я хочу прогресувати." },
      { phrase: "Cette habitude m'aide.", translationUk: "Ця звичка мені допомагає." },
      { phrase: "J'ai besoin de concentration.", translationUk: "Мені потрібна зосередженість." },
    ],
  },
};

const stubVocabularyBank: Record<SeedLanguage, Record<SeedGoal, VocabularyItem[][]>> = {
  en: {
    travel: [
      [
        { word: "passport", translationUk: "паспорт", example: "My passport is here.", exampleTranslationUk: "Мій паспорт тут." },
        { word: "airport", translationUk: "аеропорт", example: "The airport is big.", exampleTranslationUk: "Аеропорт великий." },
        { word: "tourist", translationUk: "турист", example: "She is a tourist.", exampleTranslationUk: "Вона туристка." },
        { word: "map", translationUk: "мапа", example: "I need a map.", exampleTranslationUk: "Мені потрібна мапа." },
      ],
      [
        { word: "ticket", translationUk: "квиток", example: "I need a ticket.", exampleTranslationUk: "Мені потрібен квиток." },
        { word: "platform", translationUk: "платформа", example: "The platform is number two.", exampleTranslationUk: "Платформа номер два." },
        { word: "train", translationUk: "поїзд", example: "The train is late.", exampleTranslationUk: "Потяг запізнюється." },
        { word: "seat", translationUk: "місце", example: "My seat is here.", exampleTranslationUk: "Моє місце тут." },
      ],
      [
        { word: "station", translationUk: "станція", example: "The station is near.", exampleTranslationUk: "Станція поруч." },
        { word: "street", translationUk: "вулиця", example: "This street is long.", exampleTranslationUk: "Ця вулиця довга." },
        { word: "bridge", translationUk: "міст", example: "The bridge is old.", exampleTranslationUk: "Міст старий." },
        { word: "museum", translationUk: "музей", example: "The museum is open.", exampleTranslationUk: "Музей відкритий." },
      ],
      [
        { word: "hotel", translationUk: "готель", example: "The hotel is quiet.", exampleTranslationUk: "Готель тихий." },
        { word: "room", translationUk: "кімната", example: "My room is small.", exampleTranslationUk: "Моя кімната маленька." },
        { word: "key", translationUk: "ключ", example: "Here is your key.", exampleTranslationUk: "Ось ваш ключ." },
        { word: "reception", translationUk: "ресепшн", example: "Reception is downstairs.", exampleTranslationUk: "Ресепшн внизу." },
      ],
      [
        { word: "menu", translationUk: "меню", example: "Can I see the menu?", exampleTranslationUk: "Можна меню?" },
        { word: "coffee", translationUk: "кава", example: "The coffee is hot.", exampleTranslationUk: "Кава гаряча." },
        { word: "bill", translationUk: "рахунок", example: "Can I have the bill?", exampleTranslationUk: "Можна рахунок?" },
        { word: "reservation", translationUk: "бронювання", example: "I have a reservation.", exampleTranslationUk: "У мене є бронювання." },
      ],
      [
        { word: "problem", translationUk: "проблема", example: "I have a problem.", exampleTranslationUk: "У мене є проблема." },
        { word: "help", translationUk: "допомога", example: "I need help.", exampleTranslationUk: "Мені потрібна допомога." },
        { word: "taxi", translationUk: "таксі", example: "The taxi is here.", exampleTranslationUk: "Таксі тут." },
        { word: "journey", translationUk: "подорож", example: "The journey was long.", exampleTranslationUk: "Подорож була довгою." },
      ],
    ],
    work: [
      [
        { word: "colleague", translationUk: "колега", example: "My colleague is kind.", exampleTranslationUk: "Мій колега привітний." },
        { word: "manager", translationUk: "менеджер", example: "The manager is busy.", exampleTranslationUk: "Менеджер зайнятий." },
        { word: "office", translationUk: "офіс", example: "The office is modern.", exampleTranslationUk: "Офіс сучасний." },
        { word: "meeting", translationUk: "зустріч", example: "The meeting is at ten.", exampleTranslationUk: "Зустріч о десятій." },
      ],
      [
        { word: "email", translationUk: "електронний лист", example: "I sent an email.", exampleTranslationUk: "Я надіслав листа." },
        { word: "task", translationUk: "завдання", example: "This task is easy.", exampleTranslationUk: "Це завдання легке." },
        { word: "report", translationUk: "звіт", example: "The report is ready.", exampleTranslationUk: "Звіт готовий." },
        { word: "deadline", translationUk: "дедлайн", example: "The deadline is today.", exampleTranslationUk: "Дедлайн сьогодні." },
      ],
      [
        { word: "schedule", translationUk: "розклад", example: "My schedule is full.", exampleTranslationUk: "Мій розклад повний." },
        { word: "calendar", translationUk: "календар", example: "Check the calendar.", exampleTranslationUk: "Перевір календар." },
        { word: "call", translationUk: "дзвінок", example: "I have a call now.", exampleTranslationUk: "У мене зараз дзвінок." },
        { word: "break", translationUk: "перерва", example: "Let's take a break.", exampleTranslationUk: "Давай зробимо перерву." },
      ],
      [
        { word: "project", translationUk: "проєкт", example: "The project starts today.", exampleTranslationUk: "Проєкт починається сьогодні." },
        { word: "client", translationUk: "клієнт", example: "The client called me.", exampleTranslationUk: "Клієнт мені подзвонив." },
        { word: "feedback", translationUk: "зворотний зв'язок", example: "Your feedback helps.", exampleTranslationUk: "Твій зворотний зв'язок допомагає." },
        { word: "laptop", translationUk: "ноутбук", example: "My laptop is slow.", exampleTranslationUk: "Мій ноутбук повільний." },
      ],
      [
        { word: "problem", translationUk: "проблема", example: "We have a problem.", exampleTranslationUk: "У нас є проблема." },
        { word: "solution", translationUk: "рішення", example: "This solution is simple.", exampleTranslationUk: "Це рішення просте." },
        { word: "update", translationUk: "оновлення / апдейт", example: "Here is an update.", exampleTranslationUk: "Ось оновлення." },
        { word: "invoice", translationUk: "рахунок-фактура", example: "The invoice is correct.", exampleTranslationUk: "Рахунок-фактура правильний." },
      ],
      [
        { word: "interview", translationUk: "співбесіда", example: "The interview went well.", exampleTranslationUk: "Співбесіда пройшла добре." },
        { word: "skills", translationUk: "навички", example: "My skills are improving.", exampleTranslationUk: "Мої навички покращуються." },
        { word: "contract", translationUk: "контракт", example: "The contract is ready.", exampleTranslationUk: "Контракт готовий." },
        { word: "salary", translationUk: "зарплата", example: "The salary is fair.", exampleTranslationUk: "Зарплата справедлива." },
      ],
    ],
    movies: [
      [
        { word: "actor", translationUk: "актор", example: "The actor is famous.", exampleTranslationUk: "Актор відомий." },
        { word: "scene", translationUk: "сцена", example: "This scene is funny.", exampleTranslationUk: "Ця сцена смішна." },
        { word: "director", translationUk: "режисер", example: "The director is talented.", exampleTranslationUk: "Режисер талановитий." },
        { word: "cinema", translationUk: "кінотеатр", example: "The cinema is full.", exampleTranslationUk: "Кінотеатр повний." },
      ],
      [
        { word: "episode", translationUk: "епізод", example: "The episode is short.", exampleTranslationUk: "Епізод короткий." },
        { word: "series", translationUk: "серіал", example: "This series is popular.", exampleTranslationUk: "Цей серіал популярний." },
        { word: "trailer", translationUk: "трейлер", example: "The trailer looks good.", exampleTranslationUk: "Трейлер виглядає добре." },
        { word: "review", translationUk: "рецензія", example: "I read a review.", exampleTranslationUk: "Я прочитав рецензію." },
      ],
      [
        { word: "plot", translationUk: "сюжет", example: "The plot is simple.", exampleTranslationUk: "Сюжет простий." },
        { word: "ending", translationUk: "кінцівка", example: "The ending was sad.", exampleTranslationUk: "Кінцівка була сумною." },
        { word: "dialogue", translationUk: "діалог", example: "The dialogue is natural.", exampleTranslationUk: "Діалог природний." },
        { word: "subtitle", translationUk: "субтитр", example: "The subtitle is clear.", exampleTranslationUk: "Субтитр чіткий." },
      ],
      [
        { word: "emotion", translationUk: "емоція", example: "The emotion feels real.", exampleTranslationUk: "Емоція здається реальною." },
        { word: "reaction", translationUk: "реакція", example: "Her reaction was strong.", exampleTranslationUk: "Її реакція була сильною." },
        { word: "character", translationUk: "персонаж", example: "The character changes.", exampleTranslationUk: "Персонаж змінюється." },
        { word: "role", translationUk: "роль", example: "It is an important role.", exampleTranslationUk: "Це важлива роль." },
      ],
      [
        { word: "comedy", translationUk: "комедія", example: "I like comedy.", exampleTranslationUk: "Мені подобається комедія." },
        { word: "drama", translationUk: "драма", example: "The drama is slow.", exampleTranslationUk: "Драма повільна." },
        { word: "horror", translationUk: "горор", example: "This horror is scary.", exampleTranslationUk: "Цей горор страшний." },
        { word: "adventure", translationUk: "пригода", example: "It is an adventure film.", exampleTranslationUk: "Це пригодницький фільм." },
      ],
      [
        { word: "recommendation", translationUk: "рекомендація", example: "Thanks for the recommendation.", exampleTranslationUk: "Дякую за рекомендацію." },
        { word: "performance", translationUk: "акторська гра", example: "The performance was strong.", exampleTranslationUk: "Гра була сильною." },
        { word: "message", translationUk: "посил", example: "The message was clear.", exampleTranslationUk: "Посил був ясним." },
        { word: "opinion", translationUk: "думка", example: "This is my opinion.", exampleTranslationUk: "Це моя думка." },
      ],
    ],
    "self-development": [
      [
        { word: "habit", translationUk: "звичка", example: "This habit helps me.", exampleTranslationUk: "Ця звичка мені допомагає." },
        { word: "routine", translationUk: "рутина", example: "My routine is simple.", exampleTranslationUk: "Моя рутина проста." },
        { word: "goal", translationUk: "ціль", example: "My goal is clear.", exampleTranslationUk: "Моя ціль чітка." },
        { word: "focus", translationUk: "фокус", example: "I need focus.", exampleTranslationUk: "Мені потрібен фокус." },
      ],
      [
        { word: "progress", translationUk: "прогрес", example: "I see progress.", exampleTranslationUk: "Я бачу прогрес." },
        { word: "plan", translationUk: "план", example: "My plan is realistic.", exampleTranslationUk: "Мій план реалістичний." },
        { word: "step", translationUk: "крок", example: "This step is small.", exampleTranslationUk: "Цей крок маленький." },
        { word: "result", translationUk: "результат", example: "The result is good.", exampleTranslationUk: "Результат хороший." },
      ],
      [
        { word: "energy", translationUk: "енергія", example: "I have more energy.", exampleTranslationUk: "У мене більше енергії." },
        { word: "stress", translationUk: "стрес", example: "Stress is high today.", exampleTranslationUk: "Сьогодні стрес високий." },
        { word: "rest", translationUk: "відпочинок", example: "I need rest.", exampleTranslationUk: "Мені потрібен відпочинок." },
        { word: "balance", translationUk: "баланс", example: "Balance is important.", exampleTranslationUk: "Баланс важливий." },
      ],
      [
        { word: "learn", translationUk: "вчитися", example: "I learn every day.", exampleTranslationUk: "Я вчуся щодня." },
        { word: "practice", translationUk: "практика", example: "Practice helps me.", exampleTranslationUk: "Практика мені допомагає." },
        { word: "mistake", translationUk: "помилка", example: "A mistake is normal.", exampleTranslationUk: "Помилка — це нормально." },
        { word: "confidence", translationUk: "впевненість", example: "My confidence is growing.", exampleTranslationUk: "Моя впевненість зростає." },
      ],
      [
        { word: "challenge", translationUk: "виклик", example: "This challenge is useful.", exampleTranslationUk: "Цей виклик корисний." },
        { word: "solution", translationUk: "рішення", example: "I found a solution.", exampleTranslationUk: "Я знайшов рішення." },
        { word: "support", translationUk: "підтримка", example: "Support matters.", exampleTranslationUk: "Підтримка важлива." },
        { word: "patience", translationUk: "терпіння", example: "Patience helps me.", exampleTranslationUk: "Терпіння мені допомагає." },
      ],
      [
        { word: "experience", translationUk: "досвід", example: "This experience changed me.", exampleTranslationUk: "Цей досвід мене змінив." },
        { word: "reflection", translationUk: "рефлексія", example: "Reflection is useful.", exampleTranslationUk: "Рефлексія корисна." },
        { word: "choice", translationUk: "вибір", example: "It was a good choice.", exampleTranslationUk: "Це був добрий вибір." },
        { word: "growth", translationUk: "розвиток", example: "Growth takes time.", exampleTranslationUk: "Розвиток потребує часу." },
      ],
    ],
  },
  fr: {
    travel: [
      [
        { word: "le passeport", translationUk: "паспорт", example: "Voici mon passeport.", exampleTranslationUk: "Ось мій паспорт." },
        { word: "l'aéroport", translationUk: "аеропорт", example: "L'aéroport est grand.", exampleTranslationUk: "Аеропорт великий." },
        { word: "le touriste", translationUk: "турист", example: "Le touriste arrive.", exampleTranslationUk: "Турист прибуває." },
        { word: "le plan", translationUk: "мапа", example: "J'ai un plan.", exampleTranslationUk: "У мене є мапа." },
      ],
      [
        { word: "le billet", translationUk: "квиток", example: "Je prends le billet.", exampleTranslationUk: "Я беру квиток." },
        { word: "le quai", translationUk: "платформа", example: "Le quai est là.", exampleTranslationUk: "Платформа там." },
        { word: "le train", translationUk: "поїзд", example: "Le train arrive.", exampleTranslationUk: "Потяг прибуває." },
        { word: "la place", translationUk: "місце", example: "Ma place est ici.", exampleTranslationUk: "Моє місце тут." },
      ],
      [
        { word: "la gare", translationUk: "вокзал", example: "La gare est ouverte.", exampleTranslationUk: "Вокзал відкритий." },
        { word: "la rue", translationUk: "вулиця", example: "La rue est calme.", exampleTranslationUk: "Вулиця тиха." },
        { word: "le pont", translationUk: "міст", example: "Le pont est vieux.", exampleTranslationUk: "Міст старий." },
        { word: "le musée", translationUk: "музей", example: "Le musée est grand.", exampleTranslationUk: "Музей великий." },
      ],
      [
        { word: "l'hôtel", translationUk: "готель", example: "L'hôtel est calme.", exampleTranslationUk: "Готель тихий." },
        { word: "la chambre", translationUk: "кімната", example: "La chambre est prête.", exampleTranslationUk: "Кімната готова." },
        { word: "la clé", translationUk: "ключ", example: "Voici la clé.", exampleTranslationUk: "Ось ключ." },
        { word: "la réception", translationUk: "ресепшн", example: "La réception est ici.", exampleTranslationUk: "Ресепшн тут." },
      ],
      [
        { word: "le menu", translationUk: "меню", example: "Je lis le menu.", exampleTranslationUk: "Я читаю меню." },
        { word: "le café", translationUk: "кава", example: "Le café est chaud.", exampleTranslationUk: "Кава гаряча." },
        { word: "l'addition", translationUk: "рахунок", example: "Je demande l'addition.", exampleTranslationUk: "Я прошу рахунок." },
        { word: "la réservation", translationUk: "бронювання", example: "J'ai une réservation.", exampleTranslationUk: "У мене є бронювання." },
      ],
      [
        { word: "le problème", translationUk: "проблема", example: "J'ai un problème.", exampleTranslationUk: "У мене є проблема." },
        { word: "l'aide", translationUk: "допомога", example: "J'ai besoin d'aide.", exampleTranslationUk: "Мені потрібна допомога." },
        { word: "le taxi", translationUk: "таксі", example: "Le taxi arrive.", exampleTranslationUk: "Таксі прибуває." },
        { word: "le voyage", translationUk: "подорож", example: "Le voyage continue.", exampleTranslationUk: "Подорож триває." },
      ],
    ],
    work: [
      [
        { word: "le collègue", translationUk: "колега", example: "Mon collègue est sympa.", exampleTranslationUk: "Мій колега приємний." },
        { word: "le manager", translationUk: "менеджер", example: "Le manager est prêt.", exampleTranslationUk: "Менеджер готовий." },
        { word: "le bureau", translationUk: "офіс", example: "Le bureau est moderne.", exampleTranslationUk: "Офіс сучасний." },
        { word: "la réunion", translationUk: "зустріч", example: "La réunion commence.", exampleTranslationUk: "Зустріч починається." },
      ],
      [
        { word: "le mail", translationUk: "лист", example: "J'envoie un mail.", exampleTranslationUk: "Я надсилаю листа." },
        { word: "la tâche", translationUk: "завдання", example: "La tâche est simple.", exampleTranslationUk: "Завдання просте." },
        { word: "le rapport", translationUk: "звіт", example: "Le rapport est prêt.", exampleTranslationUk: "Звіт готовий." },
        { word: "la date limite", translationUk: "дедлайн", example: "La date limite est demain.", exampleTranslationUk: "Дедлайн завтра." },
      ],
      [
        { word: "l'horaire", translationUk: "розклад", example: "L'horaire change.", exampleTranslationUk: "Розклад змінюється." },
        { word: "le calendrier", translationUk: "календар", example: "Je regarde le calendrier.", exampleTranslationUk: "Я дивлюся календар." },
        { word: "l'appel", translationUk: "дзвінок", example: "J'ai un appel.", exampleTranslationUk: "У мене дзвінок." },
        { word: "la pause", translationUk: "перерва", example: "On fait une pause.", exampleTranslationUk: "Ми робимо перерву." },
      ],
      [
        { word: "le projet", translationUk: "проєкт", example: "Le projet commence.", exampleTranslationUk: "Проєкт починається." },
        { word: "le client", translationUk: "клієнт", example: "Le client arrive.", exampleTranslationUk: "Клієнт приходить." },
        { word: "le retour", translationUk: "зворотний зв'язок", example: "Merci pour le retour.", exampleTranslationUk: "Дякую за зворотний зв'язок." },
        { word: "l'ordinateur", translationUk: "комп'ютер", example: "L'ordinateur est lent.", exampleTranslationUk: "Комп'ютер повільний." },
      ],
      [
        { word: "le problème", translationUk: "проблема", example: "On a un problème.", exampleTranslationUk: "У нас є проблема." },
        { word: "la solution", translationUk: "рішення", example: "La solution est simple.", exampleTranslationUk: "Рішення просте." },
        { word: "la mise à jour", translationUk: "оновлення", example: "Voici la mise à jour.", exampleTranslationUk: "Ось оновлення." },
        { word: "la facture", translationUk: "рахунок-фактура", example: "La facture est prête.", exampleTranslationUk: "Рахунок готовий." },
      ],
      [
        { word: "l'entretien", translationUk: "співбесіда", example: "L'entretien se passe bien.", exampleTranslationUk: "Співбесіда проходить добре." },
        { word: "les compétences", translationUk: "навички", example: "Mes compétences changent.", exampleTranslationUk: "Мої навички змінюються." },
        { word: "le contrat", translationUk: "контракт", example: "Le contrat arrive.", exampleTranslationUk: "Контракт надходить." },
        { word: "le salaire", translationUk: "зарплата", example: "Le salaire est correct.", exampleTranslationUk: "Зарплата нормальна." },
      ],
    ],
    movies: [
      [
        { word: "l'acteur", translationUk: "актор", example: "L'acteur est connu.", exampleTranslationUk: "Актор відомий." },
        { word: "la scène", translationUk: "сцена", example: "La scène est drôle.", exampleTranslationUk: "Сцена смішна." },
        { word: "le réalisateur", translationUk: "режисер", example: "Le réalisateur est célèbre.", exampleTranslationUk: "Режисер відомий." },
        { word: "le cinéma", translationUk: "кінотеатр", example: "Le cinéma est plein.", exampleTranslationUk: "Кінотеатр повний." },
      ],
      [
        { word: "l'épisode", translationUk: "епізод", example: "L'épisode est court.", exampleTranslationUk: "Епізод короткий." },
        { word: "la série", translationUk: "серіал", example: "La série est populaire.", exampleTranslationUk: "Серіал популярний." },
        { word: "la bande-annonce", translationUk: "трейлер", example: "La bande-annonce est bonne.", exampleTranslationUk: "Трейлер хороший." },
        { word: "la critique", translationUk: "рецензія", example: "Je lis la critique.", exampleTranslationUk: "Я читаю рецензію." },
      ],
      [
        { word: "l'intrigue", translationUk: "сюжет", example: "L'intrigue est simple.", exampleTranslationUk: "Сюжет простий." },
        { word: "la fin", translationUk: "кінцівка", example: "La fin est triste.", exampleTranslationUk: "Кінцівка сумна." },
        { word: "le dialogue", translationUk: "діалог", example: "Le dialogue est naturel.", exampleTranslationUk: "Діалог природний." },
        { word: "le sous-titre", translationUk: "субтитр", example: "Le sous-titre est clair.", exampleTranslationUk: "Субтитр чіткий." },
      ],
      [
        { word: "l'émotion", translationUk: "емоція", example: "L'émotion est forte.", exampleTranslationUk: "Емоція сильна." },
        { word: "la réaction", translationUk: "реакція", example: "Sa réaction change.", exampleTranslationUk: "Його реакція змінюється." },
        { word: "le personnage", translationUk: "персонаж", example: "Le personnage évolue.", exampleTranslationUk: "Персонаж розвивається." },
        { word: "le rôle", translationUk: "роль", example: "Le rôle est important.", exampleTranslationUk: "Роль важлива." },
      ],
      [
        { word: "la comédie", translationUk: "комедія", example: "J'aime la comédie.", exampleTranslationUk: "Мені подобається комедія." },
        { word: "le drame", translationUk: "драма", example: "Le drame est lent.", exampleTranslationUk: "Драма повільна." },
        { word: "l'horreur", translationUk: "горор", example: "L'horreur est intense.", exampleTranslationUk: "Горор інтенсивний." },
        { word: "l'aventure", translationUk: "пригодницький жанр", example: "C'est une aventure.", exampleTranslationUk: "Це пригода." },
      ],
      [
        { word: "la recommandation", translationUk: "рекомендація", example: "Merci pour la recommandation.", exampleTranslationUk: "Дякую за рекомендацію." },
        { word: "le jeu", translationUk: "акторська гра", example: "Le jeu est fort.", exampleTranslationUk: "Гра сильна." },
        { word: "le message", translationUk: "посил", example: "Le message est clair.", exampleTranslationUk: "Посил зрозумілий." },
        { word: "l'opinion", translationUk: "думка", example: "C'est mon opinion.", exampleTranslationUk: "Це моя думка." },
      ],
    ],
    "self-development": [
      [
        { word: "l'habitude", translationUk: "звичка", example: "Cette habitude m'aide.", exampleTranslationUk: "Ця звичка мені допомагає." },
        { word: "la routine", translationUk: "рутина", example: "Ma routine change.", exampleTranslationUk: "Моя рутина змінюється." },
        { word: "le but", translationUk: "ціль", example: "Mon but est clair.", exampleTranslationUk: "Моя ціль зрозуміла." },
        { word: "la concentration", translationUk: "концентрація", example: "La concentration est difficile.", exampleTranslationUk: "Концентрація важка." },
      ],
      [
        { word: "le progrès", translationUk: "прогрес", example: "Je vois du progrès.", exampleTranslationUk: "Я бачу прогрес." },
        { word: "le plan", translationUk: "план", example: "Le plan est simple.", exampleTranslationUk: "План простий." },
        { word: "l'étape", translationUk: "крок", example: "L'étape est petite.", exampleTranslationUk: "Крок невеликий." },
        { word: "le résultat", translationUk: "результат", example: "Le résultat arrive.", exampleTranslationUk: "Результат приходить." },
      ],
      [
        { word: "l'énergie", translationUk: "енергія", example: "J'ai plus d'énergie.", exampleTranslationUk: "У мене більше енергії." },
        { word: "le stress", translationUk: "стрес", example: "Le stress est fort.", exampleTranslationUk: "Стрес сильний." },
        { word: "le repos", translationUk: "відпочинок", example: "Le repos aide.", exampleTranslationUk: "Відпочинок допомагає." },
        { word: "l'équilibre", translationUk: "баланс", example: "L'équilibre est important.", exampleTranslationUk: "Баланс важливий." },
      ],
      [
        { word: "apprendre", translationUk: "вчитися", example: "J'apprends chaque jour.", exampleTranslationUk: "Я вчуся щодня." },
        { word: "la pratique", translationUk: "практика", example: "La pratique aide.", exampleTranslationUk: "Практика допомагає." },
        { word: "l'erreur", translationUk: "помилка", example: "L'erreur est normale.", exampleTranslationUk: "Помилка — це нормально." },
        { word: "la confiance", translationUk: "впевненість", example: "La confiance grandit.", exampleTranslationUk: "Впевненість зростає." },
      ],
      [
        { word: "le défi", translationUk: "виклик", example: "Le défi est utile.", exampleTranslationUk: "Виклик корисний." },
        { word: "la solution", translationUk: "рішення", example: "Je trouve une solution.", exampleTranslationUk: "Я знаходжу рішення." },
        { word: "le soutien", translationUk: "підтримка", example: "Le soutien aide.", exampleTranslationUk: "Підтримка допомагає." },
        { word: "la patience", translationUk: "терпіння", example: "La patience compte.", exampleTranslationUk: "Терпіння важливе." },
      ],
      [
        { word: "l'expérience", translationUk: "досвід", example: "L'expérience change tout.", exampleTranslationUk: "Досвід усе змінює." },
        { word: "la réflexion", translationUk: "рефлексія", example: "La réflexion aide.", exampleTranslationUk: "Рефлексія допомагає." },
        { word: "le choix", translationUk: "вибір", example: "Le choix est bon.", exampleTranslationUk: "Вибір хороший." },
        { word: "la croissance", translationUk: "розвиток", example: "La croissance prend du temps.", exampleTranslationUk: "Розвиток потребує часу." },
      ],
    ],
  },
};

const buildStubPresentation = (
  communicativeActionUk: string,
  vocabularySet: VocabularyItem[],
): LessonPresentation => ({
  topicIntroUk:
    "Спочатку розберемо корисні слова, одну просту граматичну модель і кілька фраз, які можна одразу використати в реальній ситуації.",
  communicativeTaskUk: `Твоє завдання — навчитися ${communicativeActionUk} за допомогою коротких фраз і простих вправ.`,
  keyVocabularyPreview: vocabularySet.slice(0, 4).map((item) => item.word),
});

const buildStubLesson = (
  language: SeedLanguage,
  level: SeedLevel,
  goal: SeedGoal,
  index: number,
): LessonSeed => {
  const theme = lessonThemesByGoal[goal][index];
  const vocabularySet = stubVocabularyBank[language][goal][index];
  const grammarFocus =
    language === "en" ? englishGrammarByLevel[level][index] : frenchGrammarByLevel[level][index];
  const moduleTitle = `${moduleTitlesByGoalUk[goal]} • ${level}`;

  return {
    id: `${language}-${level.toLowerCase()}-${goal}-${index + 1}`,
    language,
    level,
    goal,
    moduleTitle,
    lessonTitle: theme.lessonTitle,
    communicativeGoalUk: `Після уроку користувач зможе ${theme.communicativeActionUk}.`,
    grammarFocus,
    vocabularySet,
    usefulPhrases: genericPhrases[language][goal],
    presentation: buildStubPresentation(theme.communicativeActionUk, vocabularySet),
    exercises: [],
    finalCheckpoint: [],
    mentorSuccessMessage:
      "Чудово! Ти впевненіше працюєш із темою уроку та можеш використати ці фрази в простій ситуації.",
    mentorErrorMessage: `Не страшно. Повтори ключові слова уроку та зверни увагу на граматику: ${grammarFocus}.`,
  };
};

const buildStubLessonsForCombination = (
  language: SeedLanguage,
  level: SeedLevel,
  goal: SeedGoal,
): LessonSeed[] =>
  lessonThemesByGoal[goal].map((_, index) => buildStubLesson(language, level, goal, index));

const stubLessonSeedData: LessonSeed[] = [];

for (const language of ["en", "fr"] as const) {
  for (const level of ["A1", "A2", "B1"] as const) {
    for (const goal of ["travel", "work", "movies", "self-development"] as const) {
      if (language === "fr" && level === "A1" && goal === "travel") continue;

      stubLessonSeedData.push(...buildStubLessonsForCombination(language, level, goal));
    }
  }
}

export const lessonSeedData: LessonSeed[] = [
  ...frenchTravelA1Lessons,
  ...stubLessonSeedData,
];
