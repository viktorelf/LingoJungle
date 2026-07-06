# Lingo Jungle Architecture

## Overview

Lingo Jungle is organized as a split application:

- `frontend/` provides the user experience, routing, stateful flows, and presentation
- `backend-java/` provides lesson and review logic that is intentionally separated from the UI
- `Supabase` optionally provides authentication and persistence for profiles, progress, and inventory-like state

## High-Level Flow

1. The learner enters onboarding and selects a language, goal, avatar, and level.
2. The frontend stores local profile state and can optionally sync it to Supabase.
3. Lesson and practice screens render adaptive content based on learner selections.
4. The frontend calls the Java API for answer checking, flashcard review, and lesson-adjacent logic.
5. Results are written locally and, when configured, synced to Supabase tables.

## Frontend Responsibilities

- App routing and page composition
- Onboarding flow and selection persistence
- Lesson rendering and interaction handling
- Practice mode UI and review controls
- Profile, theme, and avatar presentation

## Backend Responsibilities

- Answer validation
- Hint and feedback generation
- Flashcard review prioritization
- Logic endpoints that are easier to evolve outside the frontend

## Persistence Model

The project currently supports two practical modes:

- Local/demo mode: the frontend runs without Supabase credentials and falls back to local state where possible
- Connected mode: Supabase enables auth, profile syncing, lesson result storage, and practice progress syncing

## Design Rationale

Separating UI from lesson logic keeps the frontend focused on experience and the backend focused on rules. That improves maintainability, makes testing clearer, and leaves room for future expansion such as richer adaptive recommendations or desktop/offline packaging.

## Current Constraints

- Some content is still demo-seeded rather than fully database-driven
- Supabase is optional, so some features are designed to degrade gracefully
- The repository is currently web-first, even though desktop/offline packaging is a reasonable next step
