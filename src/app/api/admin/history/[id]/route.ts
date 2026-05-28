import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { action_status } = body as { action_status?: string };

  const allowed = ['pending', 'done', 'not done'];
  if (!action_status || !allowed.includes(action_status)) {
    return NextResponse.json({ error: 'Nieprawidłowy status' }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('diagnoses')
    .update({ action_status } as any)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
