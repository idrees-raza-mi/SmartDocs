import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPG, or WebP.' }, { status: 415 });
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: upErr } = await supabaseAdmin.storage
      .from('avatars')
      .upload(path, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (upErr) {
      // If the bucket doesn't exist, surface a clear hint.
      const m = upErr.message?.includes('not found')
        ? 'Avatar storage bucket missing. Create a public bucket named "avatars" in Supabase Storage.'
        : upErr.message;
      return NextResponse.json({ error: m }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage.from('avatars').getPublicUrl(path);
    const url = pub.publicUrl;

    await supabaseAdmin
      .from('profiles')
      .upsert({ user_id: user.id, avatar_url: url, updated_at: new Date().toISOString() });

    return NextResponse.json({ url });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
