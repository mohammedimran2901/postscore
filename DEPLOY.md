# PostScore - Launch Guide (Go Live in 30 Minutes)

## Step 1: Supabase (Database) - 10 minutes

**1.1 Create Project**
- Go to https://supabase.com
- Click **"New Project"**
- Choose organization → Name it `postscore`
- Set password (save this!)
- Click **"Create new project"**

**1.2 Create Tables**
- Wait for project to be ready (1-2 mins)
- Click **"SQL Editor"** in left sidebar
- Click **"New query"**
- Paste this SQL:

```sql
-- Create tables
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

-- Enable security
alter table profiles enable row level security;
alter table post_grades enable row level security;

-- Add access rules
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can view own grades" on post_grades for select using (auth.uid() = user_id);
create policy "Users can create own grades" on post_grades for insert with check (auth.uid() = user_id);
create policy "Users can delete own grades" on post_grades for delete using (auth.uid() = user_id);
```

- Click **"Run"** (play button)

**1.3 Get API Keys**
- Click **"Settings"** (gear icon, bottom left)
- Click **"API"** in the menu
- Copy these values:

| Field | Value to Copy |
|-------|--------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role secret | `SUPABASE_SERVICE_ROLE_KEY` |

**SAVE THESE - you'll paste them in Vercel later**

---

## Step 2: DeepSeek AI (Cost Savings) - 3 minutes

**2.1 Get API Key**
- Go to https://platform.deepseek.com
- Sign up with email/Google
- Click **"API Keys"** in left sidebar
- Click **"Create API Key"**
- Copy the key (starts with `sk-...`)

**This is your `DEEPSEEK_API_KEY`**

---

## Step 3: Stripe (Payments) - OPTIONAL for now

**You can skip this and launch without payments!** The app works with free tier (3 grades/month) without Stripe.

**To add Stripe later:**
1. Go to https://dashboard.stripe.com
2. Create product "PostScore Pro" - $19/month, 7-day trial
3. Copy Price ID (starts with `price_...`)
4. Add webhook endpoint pointing to `https://YOUR_URL/api/stripe/webhook`
5. Copy API keys to Vercel

---

## Step 4: Deploy to Vercel - 5 minutes

**4.1 Connect GitHub**
- Go to https://vercel.com/new
- Sign in with GitHub
- Find and select `postscore` repo
- Click **"Import"**

**4.2 Configure Project**
- Project Name: `postscore` (or whatever you want)
- Framework Preset: Should auto-detect Next.js
- Root Directory: `./`

**4.3 Add Environment Variables**
Click **"Add"** button and enter these:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DEEPSEEK_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://postscore.vercel.app
```

*(Skip Stripe variables for now if not set up)*

**4.4 Deploy**
- Click **"Deploy"**
- Wait 2-3 minutes for build
- Click **"Visit"** when ready!

---

## Step 5: Test Your App - 2 minutes

1. **Visit your URL** (e.g., `https://postscore.vercel.app`)
2. **Sign up** with email
3. **Grade a post** - paste any LinkedIn post and click "Grade"
4. **Check the score** displays correctly

---

## You're Live! 🎉

Your app is now running at your Vercel URL.

**Next steps (optional):**
- Add Stripe for Pro subscriptions
- Connect custom domain in Vercel settings
- Add Google OAuth in Supabase (for social login)

## Monthly Costs

| Service | Cost |
|---------|------|
| Vercel | Free |
| Supabase | Free tier |
| DeepSeek AI | ~$5-10 (scales with usage) |
| **Total** | **~$5-10/month** |

---

## Troubleshooting

**Error: "relation profiles does not exist"**
→ You didn't run the SQL in Supabase. Go back to Step 1.2

**Error: "Failed to grade post"**
→ Check DeepSeek API key is correct and has credit

**Can't sign up**
→ Check Supabase API keys are correct in Vercel

Need help? Check the code at https://github.com/mohammedimran2901/postscore