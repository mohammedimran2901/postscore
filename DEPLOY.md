# PostScore - Launch Checklist

## Quick Start (Go Live in 30 minutes)

### 1. Supabase Setup (10 mins)
1. Go to https://supabase.com and create a new project
2. Once created, go to SQL Editor
3. Run this SQL:

```sql
-- Enable RLS (Row Level Security)
alter table profiles enable row level security;
alter table post_grades enable row level security;

-- Profiles table
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

-- Post grades table
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

-- RLS Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can view own grades" on post_grades for select using (auth.uid() = user_id);
create policy "Users can create own grades" on post_grades for insert with check (auth.uid() = user_id);
create policy "Users can delete own grades" on post_grades for delete using (auth.uid() = user_id);
```

4. Go to Settings → API, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. DeepSeek API (2 mins)
1. Go to https://platform.deepseek.com/
2. Sign up and get API key
3. Add $5-10 credit (more than enough to start)

### 3. Stripe Setup (10 mins)
1. Go to https://dashboard.stripe.com
2. Create a product:
   - Name: "PostScore Pro"
   - Price: $19/month
   - Enable 7-day free trial
3. Copy the Price ID (starts with `price_`)
4. Go to Developers → API keys, copy Secret key
5. Go to Developers → Webhooks → Add endpoint:
   - URL: `https://YOUR_VERCEL_URL/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 4. Resend (Email) (5 mins)
1. Go to https://resend.com
2. Sign up and verify your domain (or use the default resend.dev for testing)
3. Copy API key

### 5. Vercel Deploy (3 mins)
1. Go to https://vercel.com/new
2. Import your GitHub repo (postscore)
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   DEEPSEEK_API_KEY=...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRO_PRICE_ID=price_...
   RESEND_API_KEY=re_...
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
4. Deploy!

### 6. Test (Optional, 5 mins)
1. Visit your deployed URL
2. Sign up with email or Google
3. Grade a test post
4. Check Stripe test mode for Pro subscription

## Cost Estimate

| Service | Monthly Cost (Start) |
|---------|---------------------|
| Vercel | Free tier |
| Supabase | Free tier |
| DeepSeek | ~$5-10 (scales with usage) |
| Stripe | 2.9% + 30¢ per transaction |
| Resend | Free tier (3,000 emails/month) |

**Total: ~$5-10/month to start**

## Domain (Optional)
- Vercel gives you `your-project.vercel.app` free
- Add custom domain later in Vercel settings