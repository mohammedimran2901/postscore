import { NextRequest, NextResponse } from 'next/server';
import { createClient_server } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('Auth callback triggered');
  console.log('Code present:', !!code);
  console.log('Origin:', origin);
  console.log('Next:', next);

  if (code) {
    const supabase = await createClient_server();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Exchange code error:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    console.log('Session exchanged successfully');
    console.log('User:', data.user?.email);

    // Ensure profile exists for OAuth users
    if (data.user) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existing) {
        console.log('Creating profile for new user');
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          subscription_status: 'free',
          grades_used_this_month: 0,
          grades_reset_at: new Date().toISOString(),
        });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }
    }

    // Use absolute URL for redirect
    const redirectUrl = new URL(next, origin);
    console.log('Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  console.error('No code provided');
  return NextResponse.redirect(`${origin}/login?error=callback_error`);
}