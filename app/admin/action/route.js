import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

function isAdmin(request) {
  const token = request.cookies.get('ncr_admin')?.value;
  return token && process.env.ADMIN_SECRET && token === process.env.ADMIN_SECRET;
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const { action, pin_id } = body;

  if (!pin_id || !/^[0-9a-f-]{36}$/i.test(pin_id)) {
    return NextResponse.json({ error: 'Invalid pin ID' }, { status: 400 });
  }

  if (action === 'flag') {
    const { error } = await db.from('pins').update({ is_flagged: true }).eq('id', pin_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'unflag') {
    const { error } = await db.from('pins').update({ is_flagged: false, flag_count: 0 }).eq('id', pin_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'delete') {
    const { error } = await db.from('pins').delete().eq('id', pin_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
