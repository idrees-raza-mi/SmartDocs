import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'edge';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatbotId = searchParams.get('id');

  if (!chatbotId) {
    return NextResponse.json({ error: 'Missing chatbot id' }, { status: 400, headers: corsHeaders });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('chatbots')
      .select('id, name, accent_color, welcome_message, placeholder_text, show_branding, is_active, allowed_domains, widget_position, lead_capture_mode, gdpr_consent, suggested_questions')
      .eq('id', chatbotId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        accent_color: data.accent_color,
        welcome_message: data.welcome_message,
        placeholder_text: data.placeholder_text,
        show_branding: data.show_branding,
        is_active: data.is_active,
        widget_position: data.widget_position,
        lead_capture_mode: data.lead_capture_mode,
        gdpr_consent: data.gdpr_consent,
        suggested_questions: data.suggested_questions,
      },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503, headers: corsHeaders });
  }
}
