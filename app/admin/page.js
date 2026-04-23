import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Admin — NCR Realty',
  robots: { index: false, follow: false },
};

// Wraps any Supabase query — returns [] if the table doesn't exist or query fails
async function safeQuery(queryFn) {
  try {
    const { data, error } = await queryFn();
    if (error) { console.warn('Admin query warning:', error.message); return []; }
    return data || [];
  } catch (e) {
    console.warn('Admin query failed:', e.message);
    return [];
  }
}

async function fetchAdminData() {
  const db = supabaseAdmin();
  if (!db) return null;

  try {
    // Run all queries in parallel — each is individually safe
    const [pins, areaStats, fhPins, matches, reports] = await Promise.all([
      safeQuery(() =>
        db.from('pins')
          .select('id,area_id,area_name,city,mode,bhk,rent,price,is_available,is_flagged,flag_count,upvotes,prop_type,submitter_ip,created_at')
          .order('created_at', { ascending: false })
          .limit(500)
      ),
      safeQuery(() =>
        db.from('area_stats')
          .select('area_id,area_name,city,total_pins,rent_count,buy_count,avg_rent,min_rent,max_rent,avg_price,avg_price_per_sqft,last_pin_at')
          .order('total_pins', { ascending: false })
      ),
      safeQuery(() =>
        db.from('flat_hunt_pins')
          .select('id,role,area_name,bhk,budget,timeline,is_active,matched,created_at')
          .order('created_at', { ascending: false })
          .limit(300)
      ),
      safeQuery(() =>
        db.from('flat_hunt_matches')
          .select('id,seeker_id,owner_id,distance_m,email_sent,created_at')
          .order('created_at', { ascending: false })
          .limit(200)
      ),
      safeQuery(() =>
        db.from('reports')
          .select('id,pin_id,reason,reporter_ip,created_at')
          .order('created_at', { ascending: false })
          .limit(100)
      ),
    ]);

    return { pins, areaStats, fhPins, matches, reports, fetchedAt: new Date().toISOString() };
  } catch (err) {
    console.error('fetchAdminData crashed:', err);
    return null;
  }
}

export default async function AdminPage({ searchParams }) {
  const cookieStore = cookies();
  const token = cookieStore.get('ncr_admin')?.value;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  const authed = ADMIN_SECRET && token === ADMIN_SECRET;

  if (!authed) {
    // searchParams may be a Promise in Next 15 — handle both
    const params = searchParams instanceof Promise ? await searchParams : (searchParams || {});
    return <LoginScreen wrongPassword={!!params.err} />;
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
