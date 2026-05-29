import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'edge';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const value = Number(body.value);
    if (![-1, 0, 1].includes(value)) {
      return NextResponse.json({ error: 'Invalid value' }, { status: 400, headers: corsHeaders });
    }
    const { error } = await supabaseAdmin
      .from('messages')
      .update({ feedback: value })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Feedback failed';
    return NextResponse.json({ error: m }, { status: 500, headers: corsHeaders });
  }
}
