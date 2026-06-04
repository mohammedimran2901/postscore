import { GradeResult, GradeLabel } from '@/types';

// DeepSeek API configuration - 50%+ cheaper than OpenAI GPT-4o-mini
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = 'deepseek-chat'; // or 'deepseek-reasoner' for complex reasoning

const GRADING_SYSTEM_PROMPT = `You are an expert LinkedIn content strategist who has analysed over 50,000 LinkedIn posts. You grade LinkedIn posts with ruthless honesty and specific, actionable feedback. You know exactly what makes posts go viral vs what gets ignored.

You grade posts across 6 dimensions, each scored 0-10:

1. HOOK SCORE (0-10): The first 1-2 lines are everything. Does it stop the scroll? Is it specific, surprising, or provocative? Generic openings like "I'm excited to share..." or "Thrilled to announce..." score 0-2. A hook that creates curiosity or stakes scores 8-10.

2. READABILITY SCORE (0-10): Short sentences. White space. No walls of text. Can someone read this while distracted? Score based on average sentence length, paragraph length, and visual scannability.

3. SCROLL-STOP SCORE (0-10): Would someone pause while scrolling their feed to read this? Does it trigger an emotional or intellectual response? Bland updates score 1-3. Counterintuitive takes, personal stories, or surprising data score 8-10.

4. ENGAGEMENT SCORE (0-10): Does the post naturally invite comments? Does it ask a question, take a debatable stance, or create a reason to respond? Posts that just broadcast score 1-4. Posts that invite dialogue score 7-10.

5. FORMAT SCORE (0-10): Proper LinkedIn formatting. Single-sentence lines for key points. Bullet points used sparingly. No unnecessary hashtag spam. Emojis used purposefully not decoratively. Proper line breaks. Score on format hygiene.

6. CTA SCORE (0-10): Is there a clear call to action? Does it direct the reader somewhere or ask them to do something? No CTA = 0-3. Weak CTA = 4-6. Specific, compelling CTA = 7-10.

GRADE LABELS:
- 0-39: F (Invisible — this post will get zero traction)
- 40-54: D (Forgettable — a few likes from close connections only)
- 55-64: C (Mediocre — average engagement, room to improve)
- 65-74: B (Solid — above average, will get noticed)
- 75-84: A (Strong — this will perform well)
- 85-100: A+ (Exceptional — viral potential, top 5% of LinkedIn posts)

Return ONLY valid JSON in this exact structure, no markdown, no explanation:
{
  "overall_score": number,
  "grade_label": "F"|"D"|"C"|"B"|"A"|"A+",
  "hook_score": number,
  "readability_score": number,
  "scroll_stop_score": number,
  "engagement_score": number,
  "format_score": number,
  "cta_score": number,
  "hook_feedback": "specific 1-2 sentence feedback on the hook",
  "readability_feedback": "specific 1-2 sentence feedback on readability",
  "scroll_stop_feedback": "specific 1-2 sentence feedback on scroll-stop power",
  "engagement_feedback": "specific 1-2 sentence feedback on engagement potential",
  "format_feedback": "specific 1-2 sentence feedback on formatting",
  "cta_feedback": "specific 1-2 sentence feedback on the call to action",
  "overall_summary": "2-3 sentence honest overall assessment of this post",
  "top_strength": "The single best thing about this post in one sentence",
  "top_weakness": "The single biggest thing holding this post back in one sentence"
}`;

const VALID_GRADE_LABELS: GradeLabel[] = ['F', 'D', 'C', 'B', 'A', 'A+'];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateOverallScore(result: Omit<GradeResult, 'overall_score' | 'grade_label'>): number {
  return Math.round(
    (result.hook_score +
      result.readability_score +
      result.scroll_stop_score +
      result.engagement_score +
      result.format_score +
      result.cta_score) *
      (100 / 60)
  );
}

function getGradeLabel(score: number): GradeLabel {
  if (score >= 85) return 'A+';
  if (score >= 75) return 'A';
  if (score >= 65) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function validateGradeResult(result: Partial<GradeResult>): result is GradeResult {
  if (!result) return false;

  const scores = [
    result.hook_score,
    result.readability_score,
    result.scroll_stop_score,
    result.engagement_score,
    result.format_score,
    result.cta_score,
  ];

  for (const score of scores) {
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return false;
    }
  }

  if (!VALID_GRADE_LABELS.includes(result.grade_label as GradeLabel)) {
    return false;
  }

  const requiredStrings = [
    'hook_feedback',
    'readability_feedback',
    'scroll_stop_feedback',
    'engagement_feedback',
    'format_feedback',
    'cta_feedback',
    'overall_summary',
    'top_strength',
    'top_weakness',
  ] as const;

  for (const key of requiredStrings) {
    if (!result[key] || typeof result[key] !== 'string') {
      return false;
    }
  }

  return true;
}

async function callDeepSeek(postContent: string): Promise<string> {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: GRADING_SYSTEM_PROMPT },
        { role: 'user', content: postContent },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content;
}

export async function gradePost(postContent: string): Promise<GradeResult> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const content = await callDeepSeek(postContent);

      if (!content) {
        throw new Error('Empty response from DeepSeek');
      }

      let parsed: Partial<GradeResult>;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Invalid JSON response from DeepSeek');
        }
      }

      if (!validateGradeResult(parsed)) {
        throw new Error('Invalid grade result structure from DeepSeek');
      }

      const overall_score = calculateOverallScore(parsed);
      const grade_label = getGradeLabel(overall_score);

      return {
        ...parsed,
        overall_score,
        grade_label,
      } as GradeResult;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await sleep(backoffMs);
      }
    }
  }

  throw lastError || new Error('Failed to grade post after retries');
}