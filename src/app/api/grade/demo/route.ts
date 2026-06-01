import { NextRequest, NextResponse } from 'next/server';
import { gradePost } from '@/lib/grader';
import { GradeResult } from '@/types';

// In-memory rate limit store: ip -> timestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > RATE_LIMIT_MS) {
      rateLimitMap.delete(ip);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Cleanup old entries periodically
    if (rateLimitMap.size > 1000) {
      cleanupRateLimitMap();
    }

    // Check rate limit
    const lastRequest = rateLimitMap.get(ip);
    if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS) {
      const minutesLeft = Math.ceil(
        (RATE_LIMIT_MS - (Date.now() - lastRequest)) / 60000
      );
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: `You can try one demo per hour. Create a free account for 3 grades per month.`,
        },
        { status: 429 }
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

    // Record this request
    rateLimitMap.set(ip, Date.now());

    return NextResponse.json({
      ...result,
      is_demo: true,
    });
  } catch (error) {
    console.error('Demo grade error:', error);
    return NextResponse.json(
      { error: 'Failed to grade post' },
      { status: 500 }
    );
  }
}