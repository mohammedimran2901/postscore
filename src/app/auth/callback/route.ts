import { NextRequest, NextResponse } from 'next/server';
import { createClient_server } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient_server();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure profile exists for OAuth users
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existing) {
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            subscription_status: 'free',
            grades_used_this_month: 0,
            grades_reset_at: new Date().toISOString(),
          });
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_error`);
}