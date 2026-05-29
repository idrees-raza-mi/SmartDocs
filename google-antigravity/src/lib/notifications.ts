// Outbound notifications: Slack/Discord-compatible webhooks for events the
// chatbot owner cares about (escalations, unanswered questions, low-confidence
// answers). Fire-and-forget — never block the user-facing response.

export async function postToWebhook(url: string, payload: { title: string; lines: string[] }) {
  try {
    // Slack & Discord both accept a `{ text: string }` body, so a single payload
    // works for both incoming-webhook URLs.
    const text = `*${payload.title}*\n${payload.lines.join('\n')}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, content: text }),
    });
  } catch (err) {
    console.error('[notifications] webhook post failed:', err);
  }
}
