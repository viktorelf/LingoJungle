# Ведомость по проекту Lingo Jungle

## 1. Общая информация

`Lingo Jungle` — учебный дипломный веб-проект для изучения английского и французского языков.
Основная идея продукта:

- персонализированные уроки по цели обучения;
- onboarding с выбором языка, цели и наставника;
- lesson flow с несколькими типами упражнений;
- геймификация: монеты, прогресс, магазин, темы;
- краткие грамматические подсказки после ошибок.

Текущее позиционирование проекта описано в [README.md](/E:/LingoJungle/README.md:1), а архитектурная схема — в [architecture.md](/E:/LingoJungle/docs/architecture.md:1).

## 2. Технологический стек

### Frontend

- `Next.js 16.2.5`
- `React 19.2.4`
- `TypeScript 5`
- `Tailwind CSS 4`
- `ESLint 9`
- `@supabase/ssr`
- `@supabase/supabase-js`

Источник: [frontend/package.json](/E:/LingoJungle/frontend/package.json:1)

### Backend

- `Java 21`
- `Spring Boot 3.5.14`
- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `Maven`

Источник: [backend-java/pom.xml](/E:/LingoJungle/backend-java/pom.xml:1)

### База данных и авторизация

- `Supabase`
- `PostgreSQL` как база данных Supabase
- `Google OAuth` через Supabase Auth
- `Row Level Security` на прикладных таблицах

Источники:
- [frontend/supabase/schema.sql](/E:/LingoJungle/frontend/supabase/schema.sql:1)
- [docs/supabase-setup.md](/E:/LingoJungle/docs/supabase-setup.md:1)

## 3. Структура репозитория

- `frontend/` — клиентская часть на Next.js
- `backend-java/` — Java-сервис с логикой проверки и рекомендаций
- `docs/` — описание MVP, архитектуры и настройки

Ключевые frontend-роуты:

- `/` — главная страница
- `/onboarding` — onboarding
- `/course` — экран курса
- `/lesson` — экран урока
- `/profile` — профиль и магазин
- `/auth/callback` — callback после авторизации Google

Источники:
- [frontend/src/app](/E:/LingoJungle/frontend/src/app)
- [frontend/src/app/auth/callback/route.ts](/E:/LingoJungle/frontend/src/app/auth/callback/route.ts:1)

## 4. Архитектура системы

Проект разделён на 3 логических слоя:

1. `Frontend` на Next.js
2. `Supabase` для хранения данных и аутентификации
3. `Java Spring Boot API` для логики проверки ответов и рекомендаций

### Роли слоёв

#### Frontend

Отвечает за:

- UI/UX;
- маршрутизацию;
- onboarding flow;
- отображение курса, урока и профиля;
- локальное состояние пользователя;
- синхронизацию данных с Supabase;
- вызовы Java API.

#### Supabase

Отвечает за:

- пользователей;
- профиль;
- выбранный язык, цель, аватар, тему;
- прогресс;
- результаты уроков;
- inventory и shop;
- учебные сущности курса.

#### Java backend

Отвечает за:

- проверку ответа;
- классификацию ошибки;
- выдачу грамматической подсказки;
- рекомендацию следующего урока.

Источники:
- [docs/architecture.md](/E:/LingoJungle/docs/architecture.md:1)
- [backend-java/src/main/java/com/lingojungle/api/controller/LessonLogicController.java](/E:/LingoJungle/backend-java/src/main/java/com/lingojungle/api/controller/LessonLogicController.java:1)
- [backend-java/src/main/java/com/lingojungle/api/service/LessonLogicService.java](/E:/LingoJungle/backend-java/src/main/java/com/lingojungle/api/service/LessonLogicService.java:1)

## 5. Текущая frontend-архитектура

Проект использует `App Router` Next.js.

Базовый layout:

- глобальные стили подключаются через `globals.css`;
- шрифты `Poppins` и `Geist Mono` подключаются через `next/font/google`;
- `SupabaseProfileHydrator` синхронизирует профиль при старте приложения.

Источник: [frontend/src/app/layout.tsx](/E:/LingoJungle/frontend/src/app/layout.tsx:1)

### Основные UI-модули

- `components/onboarding` — onboarding flow
- `components/course` — экран курса
- `components/lesson` — lesson player
- `components/profile` — профиль, магазин, тема
- `components/avatar` — аватар наставника и экипировка
- `components/supabase` — auth/hydration интеграция с Supabase

### Локальное состояние

В проекте используется локальное хранилище профиля и onboarding state, которое затем синхронизируется с Supabase.

Источники:
- [frontend/src/hooks/useStoredProfile.ts](/E:/LingoJungle/frontend/src/hooks/useStoredProfile.ts:1)
- [frontend/src/lib/supabase/profile-sync.ts](/E:/LingoJungle/frontend/src/lib/supabase/profile-sync.ts:1)

## 6. Backend API

Java backend поднимается как отдельный HTTP-сервис.

### Порт

- `server.port=8081`

Источник: [backend-java/src/main/resources/application.properties](/E:/LingoJungle/backend-java/src/main/resources/application.properties:1)

### Реализованные endpoints

- `POST /api/logic/check-answer`
- `POST /api/logic/recommend-next-lesson`

Источник: [LessonLogicController.java](/E:/LingoJungle/backend-java/src/main/java/com/lingojungle/api/controller/LessonLogicController.java:1)

### Реальное поведение backend сейчас

#### Проверка ответа

Сервис:

- нормализует строки;
- сравнивает правильный и пользовательский ответ;
- возвращает `correct`, `mistakeType`, `hint`, `normalizedAnswer`;
- умеет детектировать типы ошибок вроде `ARTICLE`, `TENSE`, `PREPOSITION`, `WORD_ORDER`, `GENERAL`.

#### Рекомендация следующего урока

Сервис:

- берёт слабую тему;
- собирает slug следующего урока;
- формирует mentor message.

Источник: [LessonLogicService.java](/E:/LingoJungle/backend-java/src/main/java/com/lingojungle/api/service/LessonLogicService.java:1)

## 7. Как frontend общается с backend

Frontend использует модуль [java-api.ts](/E:/LingoJungle/frontend/src/lib/java-api.ts:1).

### Механика

- берёт `NEXT_PUBLIC_JAVA_API_URL`;
- отправляет запрос на Java API;
- использует короткий timeout;
- при отсутствии backend или ошибке уходит в локальный fallback.

### Важный нюанс текущего состояния

Сейчас `checkAnswerWithJava()` для основных типов упражнений фактически сразу использует `local fallback`, потому что `shouldUseInstantLocalCheck()` возвращает `true` для:

- `multiple-choice`
- `matching`
- `word-choice`
- `fill-blank`
- `sentence-builder`

То есть Java backend архитектурно предусмотрен и подключён, но значимая часть проверки в текущей версии дублируется или подстраховывается на frontend.

## 8. База данных: сущности

В Supabase описаны следующие таблицы:

- `languages`
- `goals`
- `avatars`
- `themes`
- `profiles`
- `avatar_items`
- `user_inventory`
- `courses`
- `modules`
- `lessons`
- `exercises`
- `user_progress`
- `lesson_results`

Источник: [frontend/supabase/schema.sql](/E:/LingoJungle/frontend/supabase/schema.sql:1)

### Что хранится в базе

#### Каталоги и справочники

- языки;
- цели обучения;
- аватары;
- темы;
- предметы магазина.

#### Учебная структура

- курсы;
- модули;
- уроки;
- упражнения;
- payload упражнений в `jsonb`.

#### Пользовательские данные

- профиль;
- выбранные настройки;
- валюта;
- прогресс;
- история результатов;
- купленные и экипированные предметы.

## 9. Политики безопасности данных

На таблицах включён `RLS`.

Примеры текущей модели доступа:

- справочники (`languages`, `goals`, `avatars`, `themes`, `courses`, `lessons`, `exercises`) доступны на чтение авторизованным пользователям;
- `profiles` читаются и обновляются только владельцем;
- `user_inventory`, `user_progress`, `lesson_results` доступны только владельцу.

Это означает, что пользовательские данные уже спроектированы с базовой изоляцией по `auth.uid()`.

Источник: [frontend/supabase/schema.sql](/E:/LingoJungle/frontend/supabase/schema.sql:90)

## 10. Аутентификация

Проект использует Google Sign-In через Supabase Auth.

### Текущий поток

1. Пользователь входит через Google.
2. Supabase возвращает код авторизации.
3. `auth/callback` обменивает код на сессию.
4. В `profiles` создаётся или обновляется запись пользователя.

Источник: [frontend/src/app/auth/callback/route.ts](/E:/LingoJungle/frontend/src/app/auth/callback/route.ts:1)

### Сессионные клиенты

- browser client: [frontend/src/lib/supabase/client.ts](/E:/LingoJungle/frontend/src/lib/supabase/client.ts:1)
- server client: [frontend/src/lib/supabase/server.ts](/E:/LingoJungle/frontend/src/lib/supabase/server.ts:1)

## 11. Синхронизация пользовательских данных

Проект уже умеет синхронизировать в Supabase:

- выбор языка, цели, аватара и уровня;
- результат урока;
- inventory;
- выбранную тему;
- гидратацию локального профиля из Supabase при старте.

Источник: [frontend/src/lib/supabase/profile-sync.ts](/E:/LingoJungle/frontend/src/lib/supabase/profile-sync.ts:1)

Это важная часть “существования сайта”: приложение не только рисует интерфейс, но и уже имеет persistence-слой для пользовательского состояния.

## 12. Состояние продукта на текущий момент

### Что уже есть

- главная страница;
- onboarding flow;
- экран курса;
- экран урока;
- экран профиля;
- магазин и темы;
- Supabase auth callback;
- схема базы;
- seed-подготовка данных;
- отдельный Java-сервис под доменную логику.

### Что выглядит как MVP/демо-реализация

- lesson content в значительной степени опирается на локальные данные и demo-структуры;
- Java backend пока относительно компактный и содержит базовую rule-based логику;
- отсутствует полноценный production deployment stack внутри репозитория;
- нет Docker-конфигурации, `docker-compose`, CI/CD или явной infra-конфигурации;
- `next.config.ts` пока фактически пустой.

Источники:
- [frontend/next.config.ts](/E:/LingoJungle/frontend/next.config.ts:1)
- [docs/mvp.md](/E:/LingoJungle/docs/mvp.md:1)

## 13. Конфигурация окружения

Для запуска проекта ожидаются как минимум:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_JAVA_API_URL=http://localhost:8081
```

Источник: [docs/supabase-setup.md](/E:/LingoJungle/docs/supabase-setup.md:17)

## 14. Краткий технический вывод

`Lingo Jungle` — это не просто набор страниц, а уже собранная учебная web-система с разделением на UI, persistence и отдельный logic service.

По текущему состоянию проект можно описать так:

- frontend: современный SPA/SSR-гибрид на Next.js App Router;
- backend: отдельный Java Spring Boot microservice-style слой;
- data/auth: Supabase с PostgreSQL, Google OAuth и RLS;
- доменная модель: курсы, уроки, упражнения, прогресс, результаты, аватары, магазин;
- статус: рабочий дипломный MVP с хорошей базой для дальнейшего production-усиления.

## 15. Что можно добавить в следующую версию ведомости

Если нужно, отдельно можно подготовить ещё 3 документа:

1. `Функциональная ведомость`
   Перечень всех пользовательских возможностей сайта.
2. `Техническая схема API и БД`
   Таблицы, связи, endpoint-ы, payload-структуры.
3. `Пояснительная записка для диплома`
   Официальным стилем: цель, актуальность, архитектура, стек, безопасность, перспективы развития.
