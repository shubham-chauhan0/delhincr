import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ── POST: Submit a flat hunt pin (seeker or owner) ────────────────────────────
export async function POST(request) {
  try {
    const db = supabaseAdmin();
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    const body = await request.json();

    const { role, lat, lng, area_name, bhk, budget, timeline,
            gender_pref, smoking_pref, food_pref, email, phone, note } = body;

    // Validate required fields
    if (!role || !['seeker','owner'].includes(role))
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    if (!lat || !lng)
      return NextResponse.json({ error: 'Location (lat/lng) is required. Please drop a pin on the map.' }, { status: 400 });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    if (!budget || +budget < 1000)
      return NextResponse.json({ error: 'Budget must be at least ₹1,000' }, { status: 400 });

    // Deactivate any previous active pins from same IP + role
    await db.from('flat_hunt_pins')
      .update({ is_active: false })
      .eq('submitter_ip', ip)
      .eq('role', role)
      .eq('is_active', true);

    const { data, error } = await db.from('flat_hunt_pins').insert([{
      role,
      lat:          parseFloat(lat),
      lng:          parseFloat(lng),
      area_name:    area_name || 'Delhi NCR',
      bhk:          bhk || 'Any',
      budget:       parseInt(budget),
      timeline:     timeline || 'Flexible',
      gender_pref:  gender_pref || 'Any',
      smoking_pref: smoking_pref || 'No preference',
      food_pref:    food_pref || 'Any',
      email:        email.toLowerCase().trim(),
      phone:        phone?.trim() || null,
      note:         note?.trim() || null,
      submitter_ip: ip,
    }]).select().single();

    if (error) {
      console.error('flat_hunt insert error:', JSON.stringify(error));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Immediately try to find matches for this new pin
    try {
      const matchUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/flat-hunt/match`;
      fetch(matchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger_pin_id: data.id }),
      }).catch(() => {}); // fire and forget
    } catch {}

    return NextResponse.json({
      success: true,
      pin: { id: data.id, role: data.role, area_name: data.area_name },
      message: `${role === 'seeker' ? 'Seeker' : 'Owner'} pin saved! We'll email you when we find a match within 3km.`,
    }, { status: 201 });

  } catch (err) {
    console.error('POST /api/flat-hunt:', err);
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 });
  }
}

// ── GET: Count active pins (for stats display) ────────────────────────────────
export async function GET() {
  try {
    const db = supabaseAdmin();
    if (!db) return NextResponse.json({ seekers: 0, owners: 0 });
    const { data } = await db.from('flat_hunt_pins')
      .select('role').eq('is_active', true);
    const seekers = (data || []).filter(p => p.role === 'seeker').length;
    const owners  = (data || []).filter(p => p.role === 'owner').length;
    return NextResponse.json({ seekers, owners });
  } catch {
    return NextResponse.json({ seekers: 0, owners: 0 });
  }
}
