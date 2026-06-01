import { NextRequest, NextResponse } from 'next/server';
import { createClient_server } from '@/lib/supabase-server';
import { rewritePost } from '@/lib/rewriter';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient_server();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user is Pro
    if (profile.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'pro_required' },
        { status: 403 }
      );
    }

    const { grade_id } = await request.json();

    if (!grade_id) {
      return NextResponse.json(
        { error: 'grade_id is required' },
        { status: 400 }
      );
    }

    // Fetch the original post
    const { data: postGrade, error: gradeError } = await supabase
      .from('post_grades')
      .select('*')
      .eq('id', grade_id)
      .eq('user_id', user.id)
      .single();

    if (gradeError || !postGrade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    // Call the rewriter
    const result = await rewritePost(postGrade.post_content);

    // Update the post_grades row
    const { error: updateError } = await supabase
      .from('post_grades')
      .update({
        rewrite_hook: result.rewrite_hook,
        rewrite_body: result.rewrite_body,
        rewrite_cta: result.rewrite_cta,
        rewrite_suggestion: result.rewrite_full,
      })
      .eq('id', grade_id);

    if (updateError) {
      console.error('Error saving rewrite:', updateError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Rewrite error:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite post' },
      { status: 500 }
    );
  }
}