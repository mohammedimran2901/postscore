import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'PostScore <hello@postscore.ai>',
    to: email,
    subject: 'Welcome to PostScore — here are your 3 free grades',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a;">
        <div style="padding: 40px 24px; text-align: center; background: #0a0a0a;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px;">PostScore</h1>
        </div>
        <div style="padding: 40px 24px; background: #ffffff;">
          <h2 style="margin-top: 0; color: #111111;">Hey ${name}, welcome!</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            You have 3 free post grades this month. Here's how to make the most of them:
          </p>
          <ol style="color: #555555; font-size: 16px; line-height: 1.8; padding-left: 20px;">
            <li>Grade a real post you're about to publish — don't waste grades on throwaway text</li>
            <li>Focus on your hook score first — it has the highest leverage on reach</li>
            <li>Compare your score before and after you edit to see improvement</li>
          </ol>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/grade" style="display: inline-block; padding: 14px 32px; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Grade Your First Post →</a>
          </div>
        </div>
        <div style="padding: 24px; text-align: center; background: #f5f5f5; color: #888888; font-size: 12px;">
          <p>You're receiving this because you signed up for PostScore.</p>
        </div>
      </div>
    `,
  });
}

export async function sendUpgradeConfirmationEmail(email: string, name: string) {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7);
  const trialEndStr = trialEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  await resend.emails.send({
    from: 'PostScore <hello@postscore.ai>',
    to: email,
    subject: "You're now on PostScore Pro — unlimited grades unlocked",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a;">
        <div style="padding: 40px 24px; text-align: center; background: #0a0a0a;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px;">PostScore</h1>
        </div>
        <div style="padding: 40px 24px; background: #ffffff;">
          <h2 style="margin-top: 0; color: #111111;">You're now on PostScore Pro!</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Welcome to the Pro plan, ${name}. Here's what's now unlocked:
          </p>
          <ul style="color: #555555; font-size: 16px; line-height: 1.8; padding-left: 20px;">
            <li>Unlimited post grades</li>
            <li>AI-powered post rewrites</li>
            <li>Grade history + 30-day score trends</li>
            <li>Before/after comparison view</li>
            <li>Priority email support</li>
          </ul>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/grade" style="display: inline-block; padding: 14px 32px; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Grade unlimited posts now →</a>
          </div>
          <p style="color: #888888; font-size: 14px; text-align: center;">
            Your 7-day free trial starts today. You won't be charged until ${trialEndStr}.
          </p>
        </div>
        <div style="padding: 24px; text-align: center; background: #f5f5f5; color: #888888; font-size: 12px;">
          <p>You're receiving this because you upgraded to PostScore Pro.</p>
        </div>
      </div>
    `,
  });
}