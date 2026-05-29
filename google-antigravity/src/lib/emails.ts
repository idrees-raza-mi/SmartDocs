import { resend } from '@/lib/resend';

const FROM = 'SmartDocs <noreply@smartdocs.ai>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function wrap(title: string, body: string) {
  return `<!doctype html>
<html><body style="font-family: -apple-system, system-ui, sans-serif; background: #f6f7f9; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
    <div style="font-size: 22px; font-weight: 700; color: #0a0a0a; margin-bottom: 16px;">${title}</div>
    ${body}
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
      SmartDocs &middot; <a href="${APP_URL}" style="color: #888;">${APP_URL.replace(/^https?:\/\//, '')}</a>
    </div>
  </div>
</body></html>`;
}

export async function sendWelcomeEmail(to: string, name: string | null) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to SmartDocs',
    html: wrap(
      `Welcome${name ? `, ${name}` : ''} 👋`,
      `
      <p style="color:#333; line-height: 1.5;">Thanks for signing up. Here&apos;s how to get the most out of your trial:</p>
      <ol style="color:#333; line-height: 1.7;">
        <li>Create your first chatbot</li>
        <li>Add a knowledge source (URL, PDF, or raw text)</li>
        <li>Try it in the live preview</li>
        <li>Paste the embed snippet on your site</li>
      </ol>
      <p style="margin-top: 16px;">
        <a href="${APP_URL}/dashboard" style="background:#000; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">Open dashboard</a>
      </p>`
    ),
  });
}

export async function sendTrialEndingEmail(to: string, daysLeft: number, name: string | null) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: daysLeft <= 1 ? 'Your SmartDocs trial ends soon' : `${daysLeft} days left on your SmartDocs trial`,
    html: wrap(
      daysLeft <= 1 ? 'Your trial is about to end' : `${daysLeft} days left`,
      `
      <p style="color:#333; line-height: 1.5;">Hi${name ? ` ${name}` : ''}, your free trial ${daysLeft <= 1 ? 'ends in less than 24 hours' : `ends in ${daysLeft} days`}.</p>
      <p style="color:#333; line-height: 1.5;">Pick a plan to keep your chatbot live for your visitors.</p>
      <p style="margin-top: 16px;">
        <a href="${APP_URL}/dashboard/billing" style="background:#000; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">Choose a plan</a>
      </p>`
    ),
  });
}

export async function sendDailyDigest(
  to: string,
  stats: { chatbotName: string; conversations: number; escalations: number; topQuestions: string[] }
) {
  const list = stats.topQuestions.length
    ? `<ul style="color:#333; line-height: 1.6;">${stats.topQuestions.map((q) => `<li>${q}</li>`).join('')}</ul>`
    : '<p style="color:#666;">Nothing to highlight today.</p>';

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Daily digest — ${stats.chatbotName}`,
    html: wrap(
      `Daily digest`,
      `
      <p style="color:#333; line-height: 1.5;">Activity for <strong>${stats.chatbotName}</strong> in the last 24 hours:</p>
      <div style="display:flex; gap:12px; margin: 16px 0;">
        <div style="flex:1; padding:12px; background:#f6f7f9; border-radius:8px;"><div style="font-size:24px; font-weight:700;">${stats.conversations}</div><div style="color:#888; font-size:12px;">Conversations</div></div>
        <div style="flex:1; padding:12px; background:#f6f7f9; border-radius:8px;"><div style="font-size:24px; font-weight:700;">${stats.escalations}</div><div style="color:#888; font-size:12px;">Escalations</div></div>
      </div>
      <h3 style="margin-top: 16px;">Top questions</h3>
      ${list}
      <p style="margin-top: 16px;">
        <a href="${APP_URL}/dashboard" style="background:#000; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">View dashboard</a>
      </p>`
    ),
  });
}

export async function sendPaymentFailedEmail(to: string, name: string | null) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Action required: SmartDocs payment failed',
    html: wrap(
      'Payment failed',
      `
      <p style="color:#333; line-height: 1.5;">Hi${name ? ` ${name}` : ''}, we couldn&apos;t process your latest payment.</p>
      <p style="color:#333; line-height: 1.5;">Update your billing details to keep your service active.</p>
      <p style="margin-top: 16px;">
        <a href="${APP_URL}/dashboard/billing" style="background:#000; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">Update billing</a>
      </p>`
    ),
  });
}
