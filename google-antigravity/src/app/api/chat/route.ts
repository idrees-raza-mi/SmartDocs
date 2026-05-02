import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmbedding, searchSimilarChunks } from '@/lib/embeddings';
import { PLAN_LIMITS } from '@/lib/constants';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { chatbotId, message, sessionId } = await req.json();

    if (!chatbotId || !message || !sessionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data: chatbot, error: chatbotError } = await supabaseAdmin
      .from('chatbots')
      .select('*, organizations(id, plan, message_count_this_month)')
      .eq('id', chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    const org = chatbot.organizations as any;
    const plan = org.plan as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan].messagesPerMonth;

    if (org.message_count_this_month >= limit) {
      return NextResponse.json({ error: 'Message limit reached' }, { status: 429 });
    }

    const queryEmbedding = await generateEmbedding(message);
    const chunks = await searchSimilarChunks(chatbotId, queryEmbedding, 5);

    let promptContext = '';
    const sourceIds = chunks.map((c: any) => c.id);

    if (chunks.length === 0) {
      promptContext = "No relevant context found.";
    } else {
      promptContext = chunks.map((c: any) => `[${c.source_name}]:\n${c.content}`).join('\n\n');
    }

    const systemPrompt = `You are a helpful assistant for ${chatbot.name}. ${chatbot.system_prompt || ''}
Answer ONLY using the context below. If the answer isn't in the context, say you don't know and offer to connect them with a human. Be concise and friendly.
Context:
${promptContext}`;

    let { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id, message_count')
      .eq('session_id', sessionId)
      .eq('chatbot_id', chatbotId)
      .single();

    if (!conv) {
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({ session_id: sessionId, chatbot_id: chatbotId })
        .select()
        .single();
      conv = newConv;
    }

    await supabaseAdmin.from('messages').insert({
      conversation_id: conv!.id,
      role: 'user',
      content: message,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          fullResponse += text;
          controller.enqueue(new TextEncoder().encode(text));
        }
        
        const wasEscalated = fullResponse.toLowerCase().includes("don't know") || fullResponse.toLowerCase().includes("human");
        
        await supabaseAdmin.from('messages').insert({
          conversation_id: conv!.id,
          role: 'assistant',
          content: fullResponse,
          sources_used: sourceIds,
          was_escalated: wasEscalated
        });

        await supabaseAdmin.from('conversations').update({ message_count: conv!.message_count + 1 }).eq('id', conv!.id);
        await supabaseAdmin.from('chatbots').update({ total_messages: chatbot.total_messages + 1 }).eq('id', chatbotId);
        await supabaseAdmin.from('organizations').update({ message_count_this_month: org.message_count_this_month + 1 }).eq('id', org.id);

        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
