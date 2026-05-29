import { supabaseAdmin } from '@/lib/supabase/admin';
import { postToWebhook } from '@/lib/notifications';

// Post-chat enrichment: writes confidence score, records unanswered question
// in knowledge-gap queue (clustered by case-insensitive prefix), fires
// outbound Slack/Discord webhook if configured. Runs out-of-band so the user
// sees the answer with no extra latency.
export async function enrichAfterChat(params: {
  chatbotId: string;
  conversationId: string;
  question: string;
  fullResponse: string;
  topSimilarity: number | null;
  wasEscalated: boolean;
}) {
  const { chatbotId, conversationId, question, fullResponse, topSimilarity, wasEscalated } = params;

  // Confidence: blend top similarity score with response length and escalation
  // signal. Cheap heuristic; replaceable by a verifier LLM call later.
  let confidence: number;
  if (wasEscalated || fullResponse.length < 20) {
    confidence = 0.15;
  } else if (topSimilarity == null) {
    confidence = 0.5;
  } else {
    confidence = Math.max(0, Math.min(1, topSimilarity * 0.7 + (fullResponse.length > 60 ? 0.3 : 0.15)));
  }

  try {
    // Persist confidence on the most recent assistant message of this conversation.
    const { data: latest } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('role', 'assistant')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest) {
      await supabaseAdmin.from('messages').update({ confidence }).eq('id', latest.id);
    }
  } catch (err) {
    console.error('[post-chat] confidence update failed:', err);
  }

  if (wasEscalated) {
    try {
      // Cluster by normalized prefix so "what is X" and "what is x?" merge.
      const key = question.trim().toLowerCase().slice(0, 80);

      const { data: existing } = await supabaseAdmin
        .from('unanswered_questions')
        .select('id, count')
        .eq('chatbot_id', chatbotId)
        .ilike('question', `${key}%`)
        .is('resolved_at', null)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from('unanswered_questions')
          .update({ count: existing.count + 1, last_asked_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin.from('unanswered_questions').insert({
          chatbot_id: chatbotId,
          question: question.slice(0, 280),
        });
      }
    } catch (err) {
      console.error('[post-chat] knowledge-gap insert failed:', err);
    }
  }

  // Outbound notify on escalation if configured.
  if (wasEscalated) {
    try {
      const { data: bot } = await supabaseAdmin
        .from('chatbots')
        .select('name, slack_webhook_url, notify_on_escalation')
        .eq('id', chatbotId)
        .single();

      if (bot?.notify_on_escalation && bot.slack_webhook_url) {
        await postToWebhook(bot.slack_webhook_url, {
          title: `⚠️ ${bot.name} couldn't answer a question`,
          lines: [`Question: ${question.slice(0, 240)}`, `Confidence: ${confidence.toFixed(2)}`],
        });
      }
    } catch (err) {
      console.error('[post-chat] slack notify failed:', err);
    }
  }
}
