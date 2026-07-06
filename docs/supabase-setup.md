# Supabase Setup

## Files

- `frontend/supabase/schema.sql`
- `frontend/supabase/seed.sql`

## Recommended Order

1. Create a new Supabase project.
2. Enable Google provider in `Authentication -> Providers`.
3. Run `schema.sql` in the SQL Editor.
4. Run `seed.sql` in the SQL Editor.
5. Copy the project URL and anon key into `frontend/.env.local`.

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_JAVA_API_URL=http://localhost:8081
```

## What Seed Data Includes

- languages
- goals
- avatars
- themes
- avatar shop items
- generated course records for both languages and all goals
- starter module
- starter lesson
- starter exercises

## Why This Matters

The app now syncs:

- profile selection
- selected level and recommended level
- placement test completion
- lesson results
- purchased items
- equipped items
- selected theme

These sync flows need real rows in `languages`, `goals`, `avatars`, `themes`,
`avatar_items`, and `lessons`, so the seed file prepares that base.
