# Lingo Jungle

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tauri Planned](https://img.shields.io/badge/Tauri-planned-FFC131?logo=tauri&logoColor=white)](https://tauri.app/)
[![SQLite Planned](https://img.shields.io/badge/SQLite-planned-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Status](https://img.shields.io/badge/status-active%20prototype-2ea44f)](#)

Lingo Jungle is a portfolio-ready language learning application focused on guided onboarding, adaptive lesson practice, flashcard review, and a playful reward loop. The repository combines a `Next.js` frontend with a lightweight `Spring Boot` logic API and optional `Supabase` persistence for profile and lesson state.

## Short Description

This project explores how a language product can feel friendly, motivating, and structured for early learners. It combines goal-based learning paths, mentor avatars, lesson feedback, and practice repetition into one cohesive study flow.

## Project Goals

Lingo Jungle is designed to be an approachable language-learning workspace for learners who need more than a static course catalog. The product goal is to make vocabulary, lesson progression, and review practice feel personal, visible, and rewarding from the first session.

## Why This Project Matters

This repository shows product thinking, not just UI assembly:

- it frames onboarding around learner intent such as travel, work, movies, or general study
- it separates lesson logic from presentation so feedback rules can evolve independently
- it treats motivation as part of the product through avatars, coins, progression, and repeat practice
- it is structured so the app can start in a demo-friendly mode and grow into a fuller data-backed learning platform

## Key Features

- Guided onboarding for language, goal, avatar, and level selection
- Course dashboard with lesson progression
- Multiple exercise formats in the lesson player
- Java-backed answer checking and flashcard review logic
- Profile, avatar shop, and theme-driven UI state
- Optional Supabase sync for profiles, lesson results, and practice progress
- Practice mode for spaced-style vocabulary review

## Tech Stack

- Frontend: `Next.js 16`, `React 19`, `TypeScript`, `Tailwind CSS 4`
- Backend: `Java 21`, `Spring Boot 3`
- Data/Auth: `Supabase` for optional auth and persistence
- Tooling: `ESLint`, `Maven`, `npm`

## Screenshots

Screenshots are intentionally not embedded yet. Add real assets to these paths:

```text
docs/screenshots/home-dashboard.png
docs/screenshots/onboarding-flow.png
docs/screenshots/lesson-player.png
docs/screenshots/profile-shop.png
```

## Demo GIF

Add a real demo recording here when available:

```text
docs/demo/lingo-jungle-demo.gif
```

## Installation

### Prerequisites

- `Node.js 20+`
- `npm 10+`
- `Java 21`
- `Maven 3.9+`

### Windows Setup

```powershell
git clone <your-repo-url>
cd LingoJungle
Copy-Item frontend\.env.example frontend\.env.local
cd frontend
npm install
cd ..\backend-java
mvn clean install
```

### Environment Variables

Create `frontend/.env.local` from `frontend/.env.example`.

If you want Supabase-enabled auth and syncing, fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_JAVA_API_URL=http://localhost:8081
```

If Supabase values are left empty, the frontend still runs in local/demo mode. The Java API URL should match the backend port.

## Usage

Run the backend in one terminal:

```powershell
cd backend-java
mvn spring-boot:run
```

Run the frontend in a second terminal:

```powershell
cd frontend
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Available Frontend Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Backend Commands

```bash
mvn test
mvn spring-boot:run
```

## Folder Structure

```text
LingoJungle/
|- .github/
|  |- ISSUE_TEMPLATE/
|  `- pull_request_template.md
|- backend-java/
|  |- src/main/java/
|  |- src/main/resources/
|  `- src/test/java/
|- docs/
|  |- demo/
|  |- screenshots/
|  |- architecture.md
|  `- roadmap.md
|- frontend/
|  |- public/
|  |- src/app/
|  |- src/components/
|  |- src/hooks/
|  `- src/lib/
`- README.md
```

## Architecture Notes

- The `frontend/` app owns navigation, UI state, onboarding, lesson rendering, and profile-facing screens.
- The `backend-java/` service owns answer checking, flashcard review scoring, and recommendation-style lesson logic.
- `Supabase` is used as an optional persistence/auth layer rather than a hard runtime dependency for basic local usage.
- The current repository is a web application. `Tauri` and `SQLite` are listed as planned portfolio extensions, not active runtime dependencies in this codebase today.

More detail lives in [docs/architecture.md](./docs/architecture.md).

## Future Improvements

- Add automated integration tests for frontend-to-backend flows
- Replace demo fallback content with fully database-backed lesson content
- Add deployment instructions for a public staging environment
- Introduce analytics for lesson completion and review retention
- Explore desktop packaging and offline-first storage with `Tauri` and `SQLite`

See [docs/roadmap.md](./docs/roadmap.md) for a more detailed backlog.

## Author

Update this section with your portfolio identity before publishing:

- Name: `Your Name`
- GitHub: `https://github.com/your-username`
- LinkedIn: `https://www.linkedin.com/in/your-profile`

## License

This project is available under the [MIT License](./LICENSE).
