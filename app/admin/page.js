import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Admin — NCR Realty',
  robots: { index: false, follow: false },
};

async function fetchAdminData() {
  const db = supabaseAdmin();
  if (!db) return null;

  const [
    { data: pins },
    { data: areaStats },
    { data: fhPins },
    { data: matches },
    { data: reports },
    { data: comments },
  ] = await Promise.all([
    // All pins including flagged — service role bypasses RLS
    db.from('pins')
      .select('id,area_id,area_name,city,mode,bhk,rent,price,is_available,is_flagged,flag_count,upvotes,prop_type,submitter_ip,created_at')
      .order('created_at', { ascending: false })
      .limit(500),

    db.from('area_stats')
      .select('area_id,area_name,city,total_pins,rent_count,buy_count,avg_rent,min_rent,max_rent,avg_price,avg_price_per_sqft,last_pin_at')
      .order('total_pins', { ascending: false }),

    db.from('flat_hunt_pins')
      .select('id,role,area_name,bhk,budget,timeline,gender_pref,is_active,matched,created_at,expires_at')
      .order('created_at', { ascending: false })
      .limit(300),

    db.from('flat_hunt_matches')
      .select('id,seeker_id,owner_id,distance_m,email_sent,created_at')
      .order('created_at', { ascending: false })
      .limit(200),

    // reports table (schema_fix.sql)
    db.from('reports')
      .select('id,pin_id,reason,reporter_ip,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(r => r) // safe even if table missing
      .catch(() => ({ data: [] })),

    db.from('comments')
      .select('id,pin_id,created_at')
      .order('created_at', { ascending: false })
      .limit(500)
      .catch(() => ({ data: [] })),
  ]);

  return {
    pins:      pins      ?? [],
    areaStats: areaStats ?? [],
    fhPins:    fhPins    ?? [],
    matches:   matches   ?? [],
    reports:   reports   ?? [],
    comments:  comments  ?? [],
    fetchedAt: new Date().toISOString(),
  };
}

export default async function AdminPage({ searchParams }) {
  const cookieStore = cookies();
  const token = cookieStore.get('ncr_admin')?.value;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  const authed = ADMIN_SECRET && token === ADMIN_SECRET;

  if (!authed) {
    const err = (await searchParams)?.err;
    return <LoginScreen wrongPassword={!!err} />;
  }

  const data = await fetchAdminData();
  if (!data) {
    return (
      <div style={{ padding: 48, fontFamily: 'system-ui', color: '#dc2626' }}>
        ⚠ Database not configured — check SUPABASE env vars.
      </div>
    );
  }

  return <AdminDashboard data={data} />;
}

function LoginScreen({ wrongPassword }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f9fafb', fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 36px',
        boxShadow: '0 4px 24px rgba(0,0,0,.1)', width: '100%', maxWidth: 360,
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏙</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#111', marginBottom: 4 }}>NCR Realty Admin</div>
        <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 28 }}>
          Private dashboard. Authorised access only.
        </div>
        {wrongPassword && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
            Incorrect password. Try again.
          </div>
        )}
        <form action="/api/admin/auth" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input name="password" type="password" autoFocus
            placeholder="Admin password"
            style={{ padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{
            padding: '12px', borderRadius: 9, border: 'none', background: '#111',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            Sign in →
          </button>
        </form>
      </div>
    </div>
  );
}
