# LocalPro

LocalPro is a simple MVP website for discovering local service workers in India and contacting them directly on WhatsApp.

## Tech Stack

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Supabase
- Vercel ready

## Features

- Homepage with hero search, categories, and featured workers
- Worker listing cards with WhatsApp contact
- Worker profile pages with service details, call button, and gallery
- Worker signup/login with Supabase Auth
- Worker dashboard for self-service profile editing
- Profile photo and gallery uploads through Supabase Storage
- Search by category and location
- Sort by rating, experience, or newest
- Customer reviews with automatic average ratings
- Supabase schema, RLS policies, and typed integration
- Demo fallback data for local preview

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add your Supabase URL and anon key to `.env.local`.

4. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. In Authentication settings, enable email/password signups.
5. Add the environment variables from `.env.example` to Vercel.

The SQL script creates:

- `categories`
- `workers`
- `reviews`
- rating refresh triggers
- public worker image storage bucket
- RLS policies so workers only edit their own profile

If Supabase variables are not configured, LocalPro automatically uses demo workers from `lib/demo-data.ts`. Auth, dashboard saving, image uploads, and persistent reviews require Supabase.

## Deploy on Vercel

1. Push this project to GitHub.
2. Import it in Vercel.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy.
