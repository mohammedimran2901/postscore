import { RewriteResult } from '@/types';

// DeepSeek API configuration - 50%+ cheaper than OpenAI GPT-4o-mini
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = 'deepseek-chat';

const REWRITE_SYSTEM_PROMPT = `You are an expert LinkedIn ghostwriter who has written viral posts for founders, executives and creators. You rewrite underperforming LinkedIn posts to maximise engagement while keeping the author's original message and voice.

Given a LinkedIn post, rewrite it with:
- A powerful hook in the first line that stops the scroll (specific, surprising, or stakes-driven)
- Clean formatting with single-sentence lines for impact
- White space between paragraphs
- Authentic personal voice (not corporate)
- A clear, specific CTA at the end
- Maximum 300 words
- No emojis unless the original had them

Return ONLY valid JSON, no markdown:
{
  "rewrite_hook": "Just the rewritten first 1-2 lines (the hook)",
  "rewrite_body": "The rewritten body of the post",
  "rewrite_cta": "The rewritten call to action",
  "rewrite_full": "The complete rewritten post as it would appear on LinkedIn",
  "what_changed": "2-3 sentences explaining the key changes made and why"
}`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateRewriteResult(result: Partial<RewriteResult>): result is RewriteResult {
  if (!result) return false;

  const requiredFields: (keyof RewriteResult)[] = [
    'rewrite_hook',
    'rewrite_body',
    'rewrite_cta',
    'rewrite_full',
    'what_changed',
  ];

  for (const key of requiredFields) {
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
        { role: 'system', content: REWRITE_SYSTEM_PROMPT },
        { role: 'user', content: postContent },
      ],
      temperature: 0.8,
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

export async function rewritePost(postContent: string): Promise<RewriteResult> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const content = await callDeepSeek(postContent);

      if (!content) {
        throw new Error('Empty response from DeepSeek');
      }

      let parsed: Partial<RewriteResult>;
      try {
        parsed = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Invalid JSON response from DeepSeek');
        }
      }

      if (!validateRewriteResult(parsed)) {
        throw new Error('Invalid rewrite result structure from DeepSeek');
      }

      return parsed as RewriteResult;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await sleep(backoffMs);
      }
    }
  }

  throw lastError || new Error('Failed to rewrite post after retries');
}