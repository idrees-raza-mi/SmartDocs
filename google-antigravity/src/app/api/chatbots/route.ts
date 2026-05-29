import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLAN_LIMITS, type PlanType } from '@/lib/constants';
import { effectivePlan } from '@/lib/plan';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const welcomeMessage = typeof body.welcome_message === 'string' ? body.welcome_message : 'Hi! How can I help you today?';
    const accentColor = typeof body.accent_color === 'string' ? body.accent_color : '#4f46e5';
    const systemPrompt = typeof body.system_prompt === 'string' ? body.system_prompt : null;
    const placeholderText = typeof body.placeholder_text === 'string' ? body.placeholder_text : 'Ask me anything...';

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id, plan, trial_ends_at')
      .eq('user_id', user.id)
      .single();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const plan: PlanType = effectivePlan(org);
    const limit = PLAN_LIMITS[plan].chatbots;

    if (limit !== -1) {
      const { count } = await supabaseAdmin
        .from('chatbots')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', org.id);
      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          { error: `Your ${plan} plan allows up to ${limit} chatbot${limit === 1 ? '' : 's'}.` },
          { status: 403 }
        );
      }
    }

    const { data: chatbot, error } = await supabaseAdmin
      .from('chatbots')
      .insert({
        org_id: org.id,
        name,
        welcome_message: welcomeMessage,
        accent_color: accentColor,
        system_prompt: systemPrompt,
        placeholder_text: placeholderText,
        show_branding: true,
      })
      .select()
      .single();

    if (error || !chatbot) {
      return NextResponse.json({ error: error?.message || 'Failed to create chatbot' }, { status: 500 });
    }

    return NextResponse.json({ chatbot });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create chatbot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
