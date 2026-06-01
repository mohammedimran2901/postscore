export type SubscriptionStatus = 'free' | 'active' | 'past_due' | 'canceled';

export type GradeLabel = 'F' | 'D' | 'C' | 'B' | 'A' | 'A+';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_id: string | null;
  grades_used_this_month: number;
  grades_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface PostGrade {
  id: string;
  user_id: string;
  post_content: string;
  overall_score: number;
  grade_label: GradeLabel;
  hook_score: number;
  readability_score: number;
  scroll_stop_score: number;
  engagement_score: number;
  format_score: number;
  cta_score: number;
  hook_feedback: string;
  readability_feedback: string;
  scroll_stop_feedback: string;
  engagement_feedback: string;
  format_feedback: string;
  cta_feedback: string;
  overall_summary: string;
  top_strength: string;
  top_weakness: string;
  rewrite_suggestion: string | null;
  rewrite_hook: string | null;
  rewrite_body: string | null;
  rewrite_cta: string | null;
  created_at: string;
}

export interface GradeResult {
  overall_score: number;
  grade_label: GradeLabel;
  hook_score: number;
  readability_score: number;
  scroll_stop_score: number;
  engagement_score: number;
  format_score: number;
  cta_score: number;
  hook_feedback: string;
  readability_feedback: string;
  scroll_stop_feedback: string;
  engagement_feedback: string;
  format_feedback: string;
  cta_feedback: string;
  overall_summary: string;
  top_strength: string;
  top_weakness: string;
}

export interface RewriteResult {
  rewrite_hook: string;
  rewrite_body: string;
  rewrite_cta: string;
  rewrite_full: string;
  what_changed: string;
}