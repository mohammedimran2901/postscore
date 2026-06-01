# PostScore — AI LinkedIn Post Grader

PostScore is a full-stack SaaS application that uses AI to grade LinkedIn posts across 6 performance dimensions and provides actionable feedback to improve engagement.

## Features

- **AI Grading Engine**: GPT-4o-mini grades posts across 6 dimensions (Hook, Readability, Scroll-Stop, Engagement, Format, CTA)
- **Free Plan**: 3 free grades per month, no credit card required
- **Pro Plan**: Unlimited grades, AI post rewrites, score trend charts, 7-day free trial
- **Stripe Integration**: Complete subscription billing with webhook handling
- **Dark UI**: Premium dark theme with indigo accent colors
- **Landing Page**: Full marketing site with demo grader, testimonials, FAQ, pricing

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- OpenAI GPT-4o-mini
- Stripe (Subscriptions)
- Resend (Email)
- Recharts (Charts)

## Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in all required values:
   - Supabase URL and keys
   - OpenAI API key
   - Stripe keys
   - Resend API key

3. **Set up Supabase Database**
   Create the following tables:

   **profiles**
   ```sql
   create table profiles (
     id uuid references auth.users on delete cascade primary key,
     email text not null,
     full_name text,
     avatar_url text,
     stripe_customer_id text,
     subscription_status text default 'free',
     subscription_id text,
     grades_used_this_month integer default 0,
     grades_reset_at timestamptz default now(),
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );
   ```

   **post_grades**
   ```sql
   create table post_grades (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references profiles(id) on delete cascade,
     post_content text not null,
     overall_score integer not null,
     grade_label text not null,
     hook_score integer not null,
     readability_score integer not null,
     scroll_stop_score integer not null,
     engagement_score integer not null,
     format_score integer not null,
     cta_score integer not null,
     hook_feedback text not null,
     readability_feedback text not null,
     scroll_stop_feedback text not null,
     engagement_feedback text not null,
     format_feedback text not null,
     cta_feedback text not null,
     overall_summary text not null,
     top_strength text not null,
     top_weakness text not null,
     rewrite_suggestion text,
     rewrite_hook text,
     rewrite_body text,
     rewrite_cta text,
     created_at timestamptz default now()
   );
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   ```bash
   vercel
   ```

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/grade` | POST | Yes | Grade a LinkedIn post |
| `/api/grade/demo` | POST | No | Public demo grade (rate limited) |
| `/api/rewrite` | POST | Yes (Pro) | AI rewrite a graded post |
| `/api/stripe/checkout` | POST | Yes | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | No | Stripe webhook handler |

## License

MIT