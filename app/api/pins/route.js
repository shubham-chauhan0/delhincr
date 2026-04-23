import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ── Rate limiting ─────────────────────────────────────────────────────────────
const ipTracker = new Map();
function isRateLimited(ip) {
  const now = Date.now(), window = 86400000, limit = 5;
  const r = ipTracker.get(ip) || { count: 0, resetAt: now + window };
  if (now > r.resetAt) { ipTracker.set(ip, { count: 1, resetAt: now + window }); return false; }
  if (r.count >= limit) return true;
  ipTracker.set(ip, { ...r, count: r.count + 1 });
  return false;
}

// ── Validation ────────────────────────────────────────────────────────────────
const VALID_BHK    = ['1RK','1BHK','2BHK','3BHK','4BHK','4BHK+'];
const VALID_MODES  = ['rent','buy'];
const VALID_TENANT = ['Bachelor Male','Bachelor Female','Family','Working Professional','Any'];
const VALID_FURNISH= ['Unfurnished','Semi-Furnished','Fully Furnished'];
const VALID_POSSESS= ['Ready to Move','Under Construction','Resale'];
const VALID_FACING = ['East','West','North','South','Corner'];

function validate(body) {
  const e = [];
  const { mode, area_name, society, bhk, sqft, rent, tenant_type, furnishing, price, possession, facing, note } = body;
  if (!VALID_MODES.includes(mode))              e.push('Invalid mode');
  if (!area_name || !area_name.trim())          e.push('area_name required');
  if (!society || society.trim().length < 1)    e.push('society required');
  if (!VALID_BHK.includes(bhk))                 e.push('Invalid BHK');
  if (sqft && (sqft < 50 || sqft > 50000))      e.push('sqft must be 50–50000');
  if (note && note.length > 300)                e.push('Note too long');
  if (mode === 'rent') {
    if (!rent || rent < 1000 || rent > 5000000)           e.push('Rent must be ₹1,000–₹50L');
    if (tenant_type && !VALID_TENANT.includes(tenant_type)) e.push('Invalid tenant_type');
    if (furnishing && !VALID_FURNISH.includes(furnishing))  e.push('Invalid furnishing');
  }
  if (mode === 'buy') {
    if (!price || price < 100000 || price > 1000000000) e.push('Invalid price');
    if (possession && !VALID_POSSESS.includes(possession)) e.push('Invalid possession');
    if (facing && !VALID_FACING.includes(facing))          e.push('Invalid facing');
  }
  return e;
}

// ── GET /api/pins ─────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const db = supabaseAdmin(); if (!db) return NextResponse.json({ pins: [] });
    const { searchParams } = new URL(request.url);
    const area_id = searchParams.get('area_id');
    const city    = searchParams.get('city');
    const mode    = searchParams.get('mode');
    const bhk     = searchParams.get('bhk');
    const limit   = Math.min(parseInt(searchParams.get('limit') || '500'), 1000);

    let q = db.from('pins')
      .select('id,area_id,area_name,city,society,mode,bhk,sqft,floor,prop_type,pin_lat,pin_lng,rent,tenant_type,furnishing,price,price_per_sqft,possession,builder,facing,note,upvotes,is_available,created_at')
      .eq('is_flagged', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (area_id) q = q.eq('area_id', area_id);
    if (city)    q = q.eq('city', city);
    if (mode)    q = q.eq('mode', mode);
    if (bhk)     q = q.eq('bhk', bhk);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ pins: data || [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40' },
    });
  } catch (err) {
    console.error('GET /api/pins:', err);
    return NextResponse.json({ pins: [], error: err.message }, { status: 500 });
  }
}

// ── POST /api/pins ────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const db = supabaseAdmin(); if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) return NextResponse.json({ error: 'Limit of 5 pins per day reached. Thank you!' }, { status: 429 });

    const body = await request.json();
    const errors = validate(body);
    if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });

    const { mode, area_id, area_name, city, society, bhk, sqft, floor, note,
            prop_type, pin_lat, pin_lng, is_available, contact_email,
            rent, tenant_type, furnishing,
            price, price_per_sqft, possession, builder, facing } = body;

    // Build insert — only include fields that exist in schema
    const row = {
      mode,
      area_id:    area_id || 'custom',
      area_name:  area_name.trim(),
      city:       city || 'delhi',
      society:    society.trim(),
      bhk,
      sqft:       sqft ? parseInt(sqft) : null,
      floor:      floor ? parseInt(floor) : 0,
      note:       note?.trim() || null,
      prop_type:  prop_type || null,
      pin_lat:    pin_lat ? parseFloat(pin_lat) : null,
      pin_lng:    pin_lng ? parseFloat(pin_lng) : null,
      is_available: is_available || false,
      contact_email: contact_email?.trim() || null,
      submitter_ip: ip,
    };

    if (mode === 'rent') {
      row.rent         = parseInt(rent);
      row.tenant_type  = tenant_type || 'Family';
      row.furnishing   = furnishing  || 'Unfurnished';
    } else {
      const numPrice = parseInt(price);
      row.price           = numPrice;
      row.price_per_sqft  = price_per_sqft ? parseInt(price_per_sqft) : (sqft ? Math.round(numPrice / parseInt(sqft)) : null);
      row.possession      = possession || 'Ready to Move';
      row.builder         = builder || null;
      row.facing          = facing  || null;
    }

    const { data, error } = await db.from('pins').insert([row]).select().single();
    if (error) {
      console.error('Insert error:', JSON.stringify(error));
      return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
    }

    // Strip private fields from response
    const { submitter_ip, contact_email: _ce, ...safeData } = data;
    return NextResponse.json({ pin: safeData }, { status: 201 });

  } catch (err) {
    console.error('POST /api/pins:', err);
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 });
  }
}
