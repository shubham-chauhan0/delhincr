import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const db = supabaseAdmin(); if (!db) return NextResponse.json({ comments: [] });
  const { searchParams } = new URL(request.url);
  const pin_id = searchParams.get('pin_id');
  if (!pin_id) return NextResponse.json({ comments: [] });
  const { data } = await db.from('comments').select('id,body,author_label,created_at').eq('pin_id', pin_id).order('created_at', { ascending: true }).limit(50);
  return NextResponse.json({ comments: data || [] });
}

export async function POST(request) {
  const db = supabaseAdmin(); if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const { pin_id, body, author_label } = await request.json();
  if (!pin_id || !body || body.length < 2 || body.length > 500) return NextResponse.json({ error: 'Invalid comment' }, { status: 400 });
  const { data, error } = await db.from('comments').insert([{ pin_id, body: body.trim(), author_label: author_label?.trim() || 'Anonymous', commenter_ip: ip }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data }, { status: 201 });
}
