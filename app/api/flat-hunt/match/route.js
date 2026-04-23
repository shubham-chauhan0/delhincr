import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ── Haversine distance in metres ──────────────────────────────────────────────
function distanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// ── Compatibility score (0–100) ───────────────────────────────────────────────
function compatibilityScore(seeker, owner) {
  let score = 100;

  // Budget: owner's asking rent must be within seeker's budget
  // (owner stores their flat's expected rent in budget field)
  if (owner.budget > seeker.budget) {
    const overage = ((owner.budget - seeker.budget) / seeker.budget) * 100;
    if (overage > 20) return 0; // more than 20% over budget — hard fail
    score -= overage; // small penalty for being close to budget
  }

  // BHK: must match unless one side says 'Any'
  if (seeker.bhk !== 'Any' && owner.bhk !== 'Any' && seeker.bhk !== owner.bhk) {
    score -= 40;
  }

  // Gender preference
  if (seeker.gender_pref !== 'Any' && owner.gender_pref !== 'Any') {
    if (seeker.gender_pref !== owner.gender_pref) score -= 20;
  }

  // Smoking preference
  if (seeker.smoking_pref === 'No smoking' && owner.smoking_pref === 'Okay with smoking') score -= 15;
  if (seeker.smoking_pref === 'Okay with smoking' && owner.smoking_pref === 'No smoking') score -= 15;

  // Food preference (minor penalty)
  if (seeker.food_pref === 'Veg only' && owner.food_pref === 'Non-veg OK') score -= 10;

  return Math.max(0, Math.round(score));
}

// ── Send match email via Resend ───────────────────────────────────────────────
async function sendMatchEmail(seeker, owner, distM) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    console.log('RESEND_API_KEY not set — skipping email. Match:', seeker.email, '↔', owner.email);
    return { sent: false, reason: 'No email API key configured' };
  }

  const distKm = (distM / 1000).toFixed(1);
  const formatBudget = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

  // Email to seeker
  const seekerHtml = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1a1a1a;padding:24px;text-align:center;">
        <div style="font-size:28px;margin-bottom:8px;">🏠</div>
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">We found a flat for you!</h1>
        <p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">NCR Realty — Real rents, no brokers</p>
      </div>
      <div style="padding:28px;">
        <p style="color:#374151;font-size:15px;margin:0 0 20px;">Hi there! We found a flat owner near <strong>${seeker.area_name}</strong> that matches your preferences.</p>
        
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:20px;">
          <h3 style="margin:0 0 12px;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Flat Details</h3>
          <div style="display:grid;gap:8px;">
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">Location</span><strong style="color:#1a1a1a;font-size:14px;">${owner.area_name}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">Distance from you</span><strong style="color:#1a1a1a;font-size:14px;">${distKm} km away</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">BHK</span><strong style="color:#1a1a1a;font-size:14px;">${owner.bhk}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">Rent</span><strong style="color:#16a34a;font-size:14px;">${formatBudget(owner.budget)}/month</strong></div>
            ${owner.note ? `<div style="margin-top:4px;padding-top:12px;border-top:1px solid #e5e7eb;"><span style="color:#6b7280;font-size:13px;font-style:italic;">"${owner.note}"</span></div>` : ''}
          </div>
        </div>

        <div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:20px;margin-bottom:24px;">
          <h3 style="margin:0 0 12px;font-size:14px;color:#166534;text-transform:uppercase;letter-spacing:.06em;">Owner Contact</h3>
          <div style="display:grid;gap:6px;">
            <div><span style="color:#166534;font-size:15px;">📧 </span><a href="mailto:${owner.email}" style="color:#166534;font-weight:700;font-size:15px;">${owner.email}</a></div>
            ${owner.phone ? `<div><span style="color:#166534;font-size:15px;">📞 </span><a href="tel:${owner.phone}" style="color:#166534;font-weight:700;font-size:15px;">${owner.phone}</a></div>` : ''}
          </div>
        </div>

        <p style="color:#6b7280;font-size:13px;margin:0 0 16px;">💡 <strong>Next step:</strong> Contact the owner directly via email or phone. Mention you found them on NCR Realty. No broker involved — negotiate directly!</p>
        
        <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">Your pin is active for 30 days. We'll notify you of other matches too.</p>
          <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">ncrrealty.in · Real rents · No brokers</p>
        </div>
      </div>
    </div>`;

  // Email to owner
  const ownerHtml = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1a1a1a;padding:24px;text-align:center;">
        <div style="font-size:28px;margin-bottom:8px;">🔑</div>
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">We found a tenant for your flat!</h1>
        <p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">NCR Realty — Real rents, no brokers</p>
      </div>
      <div style="padding:28px;">
        <p style="color:#374151;font-size:15px;margin:0 0 20px;">Hi there! We found someone looking for a flat near <strong>${owner.area_name}</strong> that matches your listing.</p>
        
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:20px;">
          <h3 style="margin:0 0 12px;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Seeker Profile</h3>
          <div style="display:grid;gap:8px;">
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">Looking in</span><strong style="color:#1a1a1a;font-size:14px;">${seeker.area_name}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">Distance from flat</span><strong style="color:#1a1a1a;font-size:14px;">${distKm} km away</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">BHK wanted</span><strong style="color:#1a1a1a;font-size:14px;">${seeker.bhk}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">Budget</span><strong style="color:#16a34a;font-size:14px;">up to ${formatBudget(seeker.budget)}/month</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;font-size:14px;">Move-in</span><strong style="color:#1a1a1a;font-size:14px;">${seeker.timeline}</strong></div>
            ${seeker.note ? `<div style="margin-top:4px;padding-top:12px;border-top:1px solid #e5e7eb;"><span style="color:#6b7280;font-size:13px;font-style:italic;">"${seeker.note}"</span></div>` : ''}
          </div>
        </div>

        <div style="background:#dbeafe;border:1px solid #93c5fd;border-radius:10px;padding:20px;margin-bottom:24px;">
          <h3 style="margin:0 0 12px;font-size:14px;color:#1d4ed8;text-transform:uppercase;letter-spacing:.06em;">Seeker Contact</h3>
          <div style="display:grid;gap:6px;">
            <div><span style="color:#1d4ed8;font-size:15px;">📧 </span><a href="mailto:${seeker.email}" style="color:#1d4ed8;font-weight:700;font-size:15px;">${seeker.email}</a></div>
            ${seeker.phone ? `<div><span style="color:#1d4ed8;font-size:15px;">📞 </span><a href="tel:${seeker.phone}" style="color:#1d4ed8;font-weight:700;font-size:15px;">${seeker.phone}</a></div>` : ''}
          </div>
        </div>

        <p style="color:#6b7280;font-size:13px;margin:0 0 16px;">💡 <strong>Next step:</strong> Reach out to the seeker directly. Discuss availability, terms, and show the flat. No broker commission!</p>
        
        <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">ncrrealty.in · Real rents · No brokers</p>
        </div>
      </div>
    </div>`;

  try {
    const [r1, r2] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'NCR Realty <matches@ncrrealty.in>',
          to:      [seeker.email],
          subject: `🏠 Match found! A flat in ${owner.area_name} fits your budget`,
          html:    seekerHtml,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'NCR Realty <matches@ncrrealty.in>',
          to:      [owner.email],
          subject: `🔑 Match found! A tenant near ${owner.area_name} wants to rent`,
          html:    ownerHtml,
        }),
      }),
    ]);
    const ok = r1.ok && r2.ok;
    if (!ok) console.error('Resend error:', await r1.text(), await r2.text());
    return { sent: ok };
  } catch (err) {
    console.error('Email send error:', err);
    return { sent: false, reason: err.message };
  }
}

// ── Main matching engine ──────────────────────────────────────────────────────
async function runMatching(db, triggerPinId = null) {
  const MAX_DIST_M = 3000; // 3km radius
  const MIN_SCORE  = 50;   // minimum compatibility score to match

  // Load all active pins
  let seekerQ = db.from('flat_hunt_pins').select('*').eq('role','seeker').eq('is_active',true);
  let ownerQ  = db.from('flat_hunt_pins').select('*').eq('role','owner').eq('is_active',true);

  // If triggered by a specific pin, only match against it
  if (triggerPinId) {
    const { data: trigger } = await db.from('flat_hunt_pins').select('*').eq('id', triggerPinId).single();
    if (trigger?.role === 'seeker') seekerQ = seekerQ.eq('id', triggerPinId);
    if (trigger?.role === 'owner')  ownerQ  = ownerQ.eq('id', triggerPinId);
  }

  const [{ data: seekers }, { data: owners }] = await Promise.all([seekerQ, ownerQ]);
  if (!seekers?.length || !owners?.length) return { matched: 0, skipped: 0 };

  // Load existing matches to avoid re-notifying
  const { data: existingMatches } = await db.from('flat_hunt_matches').select('seeker_id,owner_id');
  const alreadyMatched = new Set((existingMatches||[]).map(m=>`${m.seeker_id}:${m.owner_id}`));

  let matched = 0, skipped = 0;

  for (const seeker of seekers) {
    for (const owner of owners) {
      const key = `${seeker.id}:${owner.id}`;
      if (alreadyMatched.has(key)) { skipped++; continue; }

      const dist  = distanceM(seeker.lat, seeker.lng, owner.lat, owner.lng);
      if (dist > MAX_DIST_M) continue;

      const score = compatibilityScore(seeker, owner);
      if (score < MIN_SCORE) continue;

      // Save match record
      const { error: mErr } = await db.from('flat_hunt_matches').insert([{
        seeker_id:  seeker.id,
        owner_id:   owner.id,
        distance_m: dist,
        email_sent: false,
      }]);
      if (mErr) { skipped++; continue; }

      // Send emails
      const { sent } = await sendMatchEmail(seeker, owner, dist);

      // Mark email sent
      await db.from('flat_hunt_matches')
        .update({ email_sent: sent })
        .eq('seeker_id', seeker.id)
        .eq('owner_id', owner.id);

      // Mark both pins as matched
      await db.from('flat_hunt_pins').update({ matched: true }).in('id', [seeker.id, owner.id]);

      matched++;
      alreadyMatched.add(key);
      console.log(`Match: ${seeker.email} ↔ ${owner.email} | ${(dist/1000).toFixed(1)}km | score:${score}`);
    }
  }

  return { matched, skipped, seekers: seekers.length, owners: owners.length };
}

// ── POST: Trigger matching (called after new pin, or by cron) ─────────────────
export async function POST(request) {
  try {
    const db = supabaseAdmin();
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    // Verify this is a legitimate internal call or cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const body = await request.json().catch(()=>({}));

    // Allow unauthenticated if it has a trigger_pin_id (called from submit flow)
    // Require auth for full matching runs
    if (!body.trigger_pin_id && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runMatching(db, body.trigger_pin_id || null);
    return NextResponse.json({ success: true, ...result });

  } catch (err) {
    console.error('POST /api/flat-hunt/match:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── GET: Manual trigger / browser test (also called by Vercel cron daily) ─────
export async function GET(request) {
  try {
    const db = supabaseAdmin();
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    // Expire old pins (older than 30 days)
    await db.from('flat_hunt_pins')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString());

    const result = await runMatching(db);
    return NextResponse.json({ success: true, ...result });

  } catch (err) {
    console.error('GET /api/flat-hunt/match:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
