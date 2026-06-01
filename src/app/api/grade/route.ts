import { NextRequest, NextResponse } from 'next/server';
import { createClient_server } from '@/lib/supabase-server';
import { gradePost } from '@/lib/grader';
import { GradeResult } from '@/types';

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

    // Check if free user has exceeded their limit
    if (
      profile.subscription_status !== 'active' &&
      profile.grades_used_this_month >= 3
    ) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message:
            'You have used your 3 free grades this month. Upgrade to Pro for unlimited grading.',
        },
        { status: 403 }
      );
    }

    const { post_content } = await request.json();

    // Validate post content
    if (!post_content || typeof post_content !== 'string') {
      return NextResponse.json(
        { error: 'post_content is required' },
        { status: 400 }
      );
    }

    if (post_content.length < 50) {
      return NextResponse.json(
        { error: 'Post must be at least 50 characters' },
        { status: 400 }
      );
    }

    if (post_content.length > 3000) {
      return NextResponse.json(
        { error: 'Post must be at most 3000 characters' },
        { status: 400 }
      );
    }

    // Grade the post
    const result: GradeResult = await gradePost(post_content);

    // Save to database
    const { data: savedGrade, error: saveError } = await supabase
      .from('post_grades')
      .insert({
        user_id: user.id,
        post_content,
        overall_score: result.overall_score,
        grade_label: result.grade_label,
        hook_score: result.hook_score,
        readability_score: result.readability_score,
        scroll_stop_score: result.scroll_stop_score,
        engagement_score: result.engagement_score,
        format_score: result.format_score,
        cta_score: result.cta_score,
        hook_feedback: result.hook_feedback,
        readability_feedback: result.readability_feedback,
        scroll_stop_feedback: result.scroll_stop_feedback,
        engagement_feedback: result.engagement_feedback,
        format_feedback: result.format_feedback,
        cta_feedback: result.cta_feedback,
        overall_summary: result.overall_summary,
        top_strength: result.top_strength,
        top_weakness: result.top_weakness,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving grade:', saveError);
      return NextResponse.json(
        { error: 'Failed to save grade' },
        { status: 500 }
      );
    }

    // Increment grades_used_this_month
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        grades_used_this_month: profile.grades_used_this_month + 1,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating grade count:', updateError);
    }

    return NextResponse.json({
      ...result,
      grade_id: savedGrade.id,
    });
  } catch (error) {
    console.error('Grade error:', error);
    return NextResponse.json(
      { error: 'Failed to grade post' },
      { status: 500 }
    );
  }
}