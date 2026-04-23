import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const db = supabaseAdmin();
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

    const { id } = params;
    const body = await request.json();
    const { action, fingerprint } = body;
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

    if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: 'Invalid pin ID' }, { status: 400 });

    const { data: pin } = await db.from('pins').select('id, is_flagged').eq('id', id).single();
    if (!pin) return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    if (pin.is_flagged) return NextResponse.json({ error: 'Pin not available' }, { status: 410 });

    if (action === 'upvote') {
      if (!fingerprint || fingerprint.length > 100) return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 });
      const { data: existing } = await db.from('votes').select('id').eq('pin_id', id).eq('voter_fingerprint', fingerprint).maybeSingle();
      if (existing) return NextResponse.json({ error: 'Already upvoted', already_voted: true }, { status: 409 });
      await db.from('votes').insert([{ pin_id: id, voter_fingerprint: fingerprint }]);
      await db.rpc('increment_upvotes', { p_pin_id: id });
      return NextResponse.json({ success: true });
    }

    if (action === 'flag') {
      const { data: existingFlag } = await db.from('flags').select('id').eq('pin_id', id).eq('flagger_ip', ip).maybeSingle();
      if (existingFlag) return NextResponse.json({ error: 'Already flagged' }, { status: 409 });
      await db.from('flags').insert([{ pin_id: id, flagger_ip: ip, reason: body.reason || null }]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('PATCH /api/pins/[id] error:', err);
    return NextResponse.json({ error: 'Action failed.' }, { status: 500 });
  }
}
