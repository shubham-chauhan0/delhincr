import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const db = supabaseAdmin(); if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const { pin_id, reason } = await request.json();
  if (!pin_id || !reason) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const { error } = await db.from('reports').insert([{ pin_id, reason, reporter_ip: ip }]);
  if (error && error.code === '23505') return NextResponse.json({ error: 'Already reported' }, { status: 409 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Auto-flag if 3+ reports
  const { count } = await db.from('reports').select('*', { count: 'exact', head: true }).eq('pin_id', pin_id);
  if (count >= 3) await db.from('pins').update({ is_flagged: true }).eq('id', pin_id);
  return NextResponse.json({ success: true });
}
