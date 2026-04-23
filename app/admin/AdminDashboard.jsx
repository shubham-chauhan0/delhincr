'use client';
import { useState, useMemo } from 'react';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtR = n => !n ? '—' : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtP = n => !n ? '—' : n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : `₹${(n/100000).toFixed(1)}L`;
const tAgo = ts => {
  if (!ts) return '';
  const d = Math.floor((Date.now() - new Date(ts)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1d ago';
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d/30)}mo ago`;
};
const pct = (a, b) => b > 0 ? Math.round((a/b)*100) + '%' : '—';

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color = '#111', bg = '#f8fafc', border = '#e5e7eb', alert }) {
  return (
    <div style={{ background: alert ? '#fef2f2' : bg, border: `1px solid ${alert ? '#fecaca' : border}`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: alert ? '#dc2626' : color, fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHead({ title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f3f4f6' }}>
      <span style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{title}</span>
      {count !== undefined && <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 99 }}>{count}</span>}
    </div>
  );
}

// ── Simple table helper ───────────────────────────────────────────────────────
function Tbl({ heads, rows, emptyMsg = 'No data' }) {
  const TH = { padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'left', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' };
  const TD = { padding: '9px 10px', fontSize: 12, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' };
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr>{heads.map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={heads.length} style={{ ...TD, textAlign: 'center', color: '#9ca3af', padding: 20 }}>{emptyMsg}</td></tr>
            : rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={TD}>{cell}</td>)}</tr>)
          }
        </tbody>
      </table>
    </div>
  );
}

// ── Action Button ─────────────────────────────────────────────────────────────
function ActionBtn({ label, color, bg, border, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: '3px 9px', fontSize: 11, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', border: `1px solid ${border || color}`, background: bg || 'transparent', color, borderRadius: 7, opacity: disabled ? 0.5 : 1 }}>
      {label}
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard({ data }) {
  const [tab, setTab]               = useState('overview');
  const [pinFilter, setPinFilter]   = useState('all');      // all|rent|buy|available|flagged
  const [pinSearch, setPinSearch]   = useState('');
  const [pinSort, setPinSort]       = useState('newest');
  const [acted, setActed]           = useState({});         // pin_id → action done
  const [loading, setLoading]       = useState({});

  const { pins, areaStats, fhPins, matches, reports, fetchedAt } = data;

  // ── Derived KPIs ─────────────────────────────────────────────────────────
  const active     = pins.filter(p => !p.is_flagged);
  const flagged    = pins.filter(p => p.is_flagged);
  const rentPins   = active.filter(p => p.mode === 'rent');
  const buyPins    = active.filter(p => p.mode === 'buy');
  const availPins  = active.filter(p => p.is_available);
  const seekers    = fhPins.filter(p => p.role === 'seeker' && p.is_active);
  const owners     = fhPins.filter(p => p.role === 'owner'  && p.is_active);
  const emailsSent = matches.filter(m => m.email_sent).length;
  const areasWithData = areaStats.filter(a => a.total_pins > 0).length;

  // ── Area intelligence (derived from areaStats) ────────────────────────────
  const topAreas   = [...areaStats].filter(a => a.avg_rent).sort((a,b) => (b.total_pins||0)-(a.total_pins||0)).slice(0,15);
  const cheapest   = [...areaStats].filter(a => a.avg_rent).sort((a,b) => (a.avg_rent||0)-(b.avg_rent||0)).slice(0,8);
  const priciest   = [...areaStats].filter(a => a.avg_rent).sort((a,b) => (b.avg_rent||0)-(a.avg_rent||0)).slice(0,5);

  // ── FH area breakdown ────────────────────────────────────────────────────
  const fhByArea = useMemo(() => {
    const map = {};
    fhPins.filter(p => p.is_active).forEach(p => {
      const k = p.area_name || 'Unknown';
      if (!map[k]) map[k] = { seekers: 0, owners: 0 };
      if (p.role === 'seeker') map[k].seekers++;
      else map[k].owners++;
    });
    return Object.entries(map).sort((a,b) => (b[1].seekers+b[1].owners)-(a[1].seekers+a[1].owners));
  }, [fhPins]);

  // ── Filtered pins for data management tab ────────────────────────────────
  const filteredPins = useMemo(() => {
    let list = pins;
    if (pinFilter === 'rent')      list = list.filter(p => p.mode==='rent' && !p.is_flagged);
    if (pinFilter === 'buy')       list = list.filter(p => p.mode==='buy'  && !p.is_flagged);
    if (pinFilter === 'available') list = list.filter(p => p.is_available  && !p.is_flagged);
    if (pinFilter === 'flagged')   list = list.filter(p => p.is_flagged);
    if (pinSearch.trim()) {
      const q = pinSearch.toLowerCase();
      list = list.filter(p => (p.area_name||'').toLowerCase().includes(q) || (p.city||'').toLowerCase().includes(q) || (p.bhk||'').toLowerCase().includes(q));
    }
    if (pinSort === 'newest')   list = [...list].sort((a,b) => new Date(b.created_at)-new Date(a.created_at));
    if (pinSort === 'oldest')   list = [...list].sort((a,b) => new Date(a.created_at)-new Date(b.created_at));
    if (pinSort === 'upvotes')  list = [...list].sort((a,b) => (b.upvotes||0)-(a.upvotes||0));
    if (pinSort === 'flags')    list = [...list].sort((a,b) => (b.flag_count||0)-(a.flag_count||0));
    return list.slice(0, 200);
  }, [pins, pinFilter, pinSearch, pinSort]);

  // ── Moderation action ────────────────────────────────────────────────────
  const doAction = async (action, pin_id) => {
    if (loading[pin_id]) return;
    if (action === 'delete' && !confirm('Delete this pin permanently?')) return;
    setLoading(l => ({ ...l, [pin_id]: action }));
    try {
      const r = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, pin_id }),
      });
      const d = await r.json();
      if (d.success) setActed(a => ({ ...a, [pin_id]: action }));
      else alert('Error: ' + d.error);
    } catch (e) {
      alert('Request failed');
    } finally {
      setLoading(l => ({ ...l, [pin_id]: null }));
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const TAB_S = (active) => ({
    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none',
    background: active ? '#111' : 'transparent',
    color: active ? '#fff' : '#6b7280',
  });

  const modeColor = m => m === 'rent' ? '#e85d26' : m === 'buy' ? '#2563eb' : '#16a34a';
  const modeBadge = (m, avail) => (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: avail ? '#dcfce7' : `${modeColor(m)}15`, color: avail ? '#166534' : modeColor(m) }}>
      {avail ? 'AVAIL' : m === 'rent' ? 'RENT' : 'BUY'}
    </span>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, color: '#111' }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 52, position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 18 }}>🏙</span>
        <span style={{ fontWeight: 800, fontSize: 16 }}>NCR Realty Admin</span>
        <span style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 99 }}>Private</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Fetched {tAgo(fetchedAt)}</span>
          <form action="/api/admin/auth" method="POST" style={{ display: 'inline' }}>
            <input type="hidden" name="_method" value="DELETE"/>
            <button
              type="button"
              onClick={() => fetch('/api/admin/auth', { method: 'DELETE' }).then(() => location.href = '/admin')}
              style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', borderRadius: 8 }}>
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', gap: 4 }}>
        {[['overview','📊 Overview'],['areas','🗺 Areas'],['flathunt','🏠 Flat Hunt'],['moderation','🚩 Moderation'],['data','📋 All Data']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={TAB_S(tab===id)}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>

        {/* ════════════════════ OVERVIEW ════════════════════ */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              <KpiCard label="Total Pins"        value={active.length}      sub="Live, non-flagged" />
              <KpiCard label="Rent Pins"         value={rentPins.length}    color="#e85d26" />
              <KpiCard label="Buy/Sale Pins"     value={buyPins.length}     color="#2563eb" />
              <KpiCard label="Available Flats"   value={availPins.length}   color="#16a34a" sub="is_available = true" />
              <KpiCard label="Areas with Data"   value={areasWithData}      sub={`of ${areaStats.length} total`} />
              <KpiCard label="FH Seekers"        value={seekers.length}     color="#7c3aed" sub="Active" />
              <KpiCard label="FH Owners"         value={owners.length}      color="#0891b2" sub="Active" />
              <KpiCard label="Matches Made"       value={matches.length}     sub={`${emailsSent} emails sent`} />
              <KpiCard label="Flagged Pins"      value={flagged.length}     sub="Hidden from users" alert={flagged.length > 0} />
              <KpiCard label="Reports Filed"     value={reports.length}     alert={reports.length > 10} />
            </div>

            {/* Recent pins */}
            <div>
              <SectionHead title="Recent Submissions" count={pins.slice(0,20).length} />
              <Tbl
                heads={['Mode','Area','BHK','Value','Upvotes','Flags','Time']}
                rows={pins.slice(0,20).map(p => [
                  modeBadge(p.mode, p.is_available),
                  <span key="a" style={{ fontWeight: 600 }}>{p.area_name || '—'} <span style={{ color: '#9ca3af', fontSize: 11 }}>{p.city}</span></span>,
                  p.bhk,
                  <span key="v" style={{ fontFamily: 'DM Mono, monospace', color: modeColor(p.mode), fontWeight: 700 }}>{p.mode==='rent' ? fmtR(p.rent) : fmtP(p.price)}</span>,
                  p.upvotes || 0,
                  p.flag_count > 0 ? <span key="fl" style={{ color: '#dc2626', fontWeight: 700 }}>{p.flag_count} 🚩</span> : 0,
                  tAgo(p.created_at),
                ])}
              />
            </div>

            {/* Reports list */}
            {reports.length > 0 && (
              <div>
                <SectionHead title="Recent Reports" count={reports.length} />
                <Tbl
                  heads={['Pin ID (short)','Reason','Reporter IP','Time']}
                  rows={reports.slice(0,15).map(r => [
                    <code key="id" style={{ fontSize: 10 }}>{r.pin_id?.slice(0,8)}…</code>,
                    r.reason,
                    <code key="ip" style={{ fontSize: 10, color: '#9ca3af' }}>{(r.reporter_ip||'').slice(0,12)}…</code>,
                    tAgo(r.created_at),
                  ])}
                />
              </div>
            )}
          </div>
        )}

        {/* ════════════════════ AREAS ════════════════════ */}
        {tab === 'areas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Quick area KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              <KpiCard label="Most Active Area"  value={topAreas[0]?.area_name || '—'} sub={`${topAreas[0]?.total_pins || 0} pins`} />
              <KpiCard label="Cheapest Avg Rent" value={fmtR(cheapest[0]?.avg_rent)} sub={cheapest[0]?.area_name} color="#16a34a" />
              <KpiCard label="Priciest Avg Rent" value={fmtR(priciest[0]?.avg_rent)} sub={priciest[0]?.area_name} color="#dc2626" />
              <KpiCard label="Areas with Rent Data" value={areaStats.filter(a=>a.rent_count>0).length} />
              <KpiCard label="Areas with Buy Data"  value={areaStats.filter(a=>a.buy_count>0).length} />
            </div>

            <div>
              <SectionHead title="All Areas — Sorted by Activity" count={areaStats.length} />
              <Tbl
                heads={['Area','City','Pins','Rent','Buy','Avg Rent','Min Rent','Max Rent','Avg ₹/sqft','Last Pin']}
                rows={areaStats.map(a => [
                  <span key="n" style={{ fontWeight: 600 }}>{a.area_name}</span>,
                  <span key="c" style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '1px 6px', borderRadius: 99 }}>{a.city}</span>,
                  <span key="t" style={{ fontWeight: 700, color: '#374151' }}>{a.total_pins}</span>,
                  a.rent_count || 0,
                  a.buy_count  || 0,
                  <span key="ar" style={{ fontFamily: 'DM Mono, monospace', color: '#e85d26', fontWeight: 700 }}>{a.avg_rent ? fmtR(a.avg_rent) : '—'}</span>,
                  fmtR(a.min_rent),
                  fmtR(a.max_rent),
                  a.avg_price_per_sqft ? `₹${a.avg_price_per_sqft?.toLocaleString()}` : '—',
                  tAgo(a.last_pin_at),
                ])}
                emptyMsg="No area data yet"
              />
            </div>

            <div>
              <SectionHead title="Most Affordable Areas (by avg rent)" count={cheapest.length} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {cheapest.map(a => (
                  <div key={a.area_id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{a.area_name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{a.city}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{fmtR(a.avg_rent)}<span style={{ fontSize: 11, color: '#9ca3af' }}>/mo</span></div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{a.rent_count} pins</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ FLAT HUNT ════════════════════ */}
        {tab === 'flathunt' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              <KpiCard label="Active Seekers"   value={seekers.length} color="#7c3aed" />
              <KpiCard label="Active Owners"    value={owners.length}  color="#0891b2" />
              <KpiCard label="Total Matches"    value={matches.length} color="#16a34a" sub="All time" />
              <KpiCard label="Emails Sent"      value={emailsSent}     sub={`${pct(emailsSent, matches.length)} of matches`} />
              <KpiCard label="All-time FH Pins" value={fhPins.length}  sub="incl. expired" />
              <KpiCard label="Already Matched"  value={fhPins.filter(p=>p.matched).length} color="#ca8a04" />
            </div>

            <div>
              <SectionHead title="Supply vs Demand by Area" count={fhByArea.length} />
              <Tbl
                heads={['Area','Seekers (demand)','Owners (supply)','Balance','Status']}
                rows={fhByArea.map(([area, counts]) => {
                  const diff = counts.owners - counts.seekers;
                  return [
                    <span key="a" style={{ fontWeight: 600 }}>{area}</span>,
                    <span key="s" style={{ color: '#7c3aed', fontWeight: 700 }}>{counts.seekers}</span>,
                    <span key="o" style={{ color: '#0891b2', fontWeight: 700 }}>{counts.owners}</span>,
                    <span key="d" style={{ color: diff > 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{diff > 0 ? '+' : ''}{diff}</span>,
                    diff > 0
                      ? <span key="st" style={{ fontSize: 11, color: '#16a34a', background: '#dcfce7', padding: '2px 7px', borderRadius: 99 }}>Supply surplus</span>
                      : diff < 0
                        ? <span key="st2" style={{ fontSize: 11, color: '#dc2626', background: '#fef2f2', padding: '2px 7px', borderRadius: 99 }}>Demand surplus</span>
                        : <span key="st3" style={{ fontSize: 11, color: '#6b7280' }}>Balanced</span>,
                  ];
                })}
                emptyMsg="No active flat hunt pins"
              />
            </div>

            <div>
              <SectionHead title="Recent Matches" count={matches.length} />
              <Tbl
                heads={['Match ID','Distance','Email Sent','Time']}
                rows={matches.slice(0,20).map(m => [
                  <code key="id" style={{ fontSize: 10 }}>{m.id?.slice(0,8)}…</code>,
                  m.distance_m ? `${(m.distance_m/1000).toFixed(1)} km` : '—',
                  m.email_sent
                    ? <span key="e" style={{ color: '#16a34a', fontWeight: 700 }}>✓ Sent</span>
                    : <span key="e2" style={{ color: '#dc2626' }}>Not sent</span>,
                  tAgo(m.created_at),
                ])}
                emptyMsg="No matches yet"
              />
            </div>

            <div>
              <SectionHead title="Recent FH Pins" count={fhPins.length} />
              <Tbl
                heads={['Role','Area','BHK','Budget','Timeline','Status','Created']}
                rows={fhPins.slice(0,30).map(p => [
                  <span key="r" style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: p.role==='seeker'?'#f5f3ff':'#eff6ff', color: p.role==='seeker'?'#7c3aed':'#2563eb' }}>{p.role}</span>,
                  p.area_name || '—',
                  p.bhk,
                  <span key="b" style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>₹{(p.budget||0).toLocaleString()}</span>,
                  p.timeline || '—',
                  p.matched
                    ? <span key="s" style={{ color: '#16a34a', fontWeight: 700 }}>Matched</span>
                    : p.is_active
                      ? <span key="s2" style={{ color: '#ca8a04' }}>Active</span>
                      : <span key="s3" style={{ color: '#9ca3af' }}>Expired</span>,
                  tAgo(p.created_at),
                ])}
              />
            </div>

            {/* TODO: Calculator / Wizard analytics */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e', marginBottom: 6 }}>📊 Budget Wizard / Cost Calculator Analytics</div>
              <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.7 }}>
                No client-side event tracking is currently wired for wizard or calculator usage.
                These features run entirely in the browser with no server-side call.<br/>
                <strong>TODO:</strong> Add a lightweight <code>POST /api/events</code> endpoint that logs feature opens to a simple <code>events</code> table.
                Then surface counts here: wizard opens, rent mode, buy mode, calculator opens, sessions with prefill.
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ MODERATION ════════════════════ */}
        {tab === 'moderation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              <KpiCard label="Flagged Pins"  value={flagged.length}   alert={flagged.length > 0} sub="Hidden from map" />
              <KpiCard label="Total Reports" value={reports.length}   alert={reports.length > 10} />
              <KpiCard label="Auto-flagged"  value={flagged.filter(p=>p.flag_count>=3).length} sub="3+ reports" />
            </div>

            <div>
              <SectionHead title="Flagged Pins" count={flagged.length} />
              {flagged.length === 0
                ? <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>No flagged pins. </div>
                : <Tbl
                    heads={['Mode','Area','BHK','Value','Reports','Time','Actions']}
                    rows={flagged.map(p => {
                      const done  = acted[p.id];
                      const busy  = loading[p.id];
                      return [
                        modeBadge(p.mode),
                        <span key="a" style={{ fontWeight: 600 }}>{p.area_name}</span>,
                        p.bhk,
                        <span key="v" style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: modeColor(p.mode) }}>{p.mode==='rent'?fmtR(p.rent):fmtP(p.price)}</span>,
                        <span key="fc" style={{ color: '#dc2626', fontWeight: 700 }}>{p.flag_count || '?'}</span>,
                        tAgo(p.created_at),
                        done
                          ? <span key="d" style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>✓ {done}</span>
                          : <div key="btn" style={{ display: 'flex', gap: 6 }}>
                              <ActionBtn label="Restore" color="#16a34a" onClick={() => doAction('unflag', p.id)} disabled={!!busy} />
                              <ActionBtn label="Delete"  color="#dc2626" onClick={() => doAction('delete', p.id)} disabled={!!busy} />
                            </div>,
                      ];
                    })}
                  />
              }
            </div>

            {/* High-report pins (not yet auto-flagged) */}
            {(() => {
              const atRisk = active.filter(p => (p.flag_count||0) >= 2).sort((a,b) => (b.flag_count||0)-(a.flag_count||0));
              return atRisk.length > 0 ? (
                <div>
                  <SectionHead title="At-Risk Pins (2+ reports, not yet flagged)" count={atRisk.length} />
                  <Tbl
                    heads={['Mode','Area','BHK','Value','Reports','Actions']}
                    rows={atRisk.map(p => {
                      const done = acted[p.id];
                      const busy = loading[p.id];
                      return [
                        modeBadge(p.mode),
                        <span key="a" style={{ fontWeight: 600 }}>{p.area_name}</span>,
                        p.bhk,
                        <span key="v" style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: modeColor(p.mode) }}>{p.mode==='rent'?fmtR(p.rent):fmtP(p.price)}</span>,
                        <span key="fc" style={{ color: '#ca8a04', fontWeight: 700 }}>{p.flag_count} ⚠</span>,
                        done
                          ? <span key="d" style={{ fontSize: 11, color: '#16a34a' }}>✓ {done}</span>
                          : <div key="btn" style={{ display: 'flex', gap: 6 }}>
                              <ActionBtn label="Flag now" color="#dc2626" onClick={() => doAction('flag', p.id)} disabled={!!busy} />
                            </div>,
                      ];
                    })}
                  />
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* ════════════════════ ALL DATA ════════════════════ */}
        {tab === 'data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: '#fff', padding: '14px 16px', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <input
                value={pinSearch}
                onChange={e => setPinSearch(e.target.value)}
                placeholder="Search area / city / BHK…"
                style={{ padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', width: 220 }}
              />
              {[['all','All'],['rent','Rent'],['buy','Buy'],['available','Available'],['flagged','Flagged 🚩']].map(([v,l]) => (
                <button key={v} onClick={() => setPinFilter(v)} style={{
                  padding: '7px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${pinFilter===v?'#111':'#e5e7eb'}`,
                  background: pinFilter===v?'#111':'#fff', color: pinFilter===v?'#fff':'#6b7280',
                }}>{l}</button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Sort:</span>
                <select value={pinSort} onChange={e => setPinSort(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff' }}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="upvotes">Most upvoted</option>
                  <option value="flags">Most flagged</option>
                </select>
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{filteredPins.length} rows</span>
            </div>

            <Tbl
              heads={['Mode','Area','City','BHK','Value','Upvotes','Flags','Status','Time','Actions']}
              rows={filteredPins.map(p => {
                const done = acted[p.id];
                const busy = loading[p.id];
                return [
                  modeBadge(p.mode, p.is_available),
                  <span key="a" style={{ fontWeight: 600, maxWidth: 120, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.area_name || '—'}</span>,
                  <span key="c" style={{ fontSize: 11, color: '#9ca3af' }}>{p.city}</span>,
                  p.bhk,
                  <span key="v" style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: modeColor(p.mode), fontSize: 12 }}>{p.mode==='rent'?fmtR(p.rent):fmtP(p.price)}</span>,
                  p.upvotes || 0,
                  (p.flag_count||0) > 0 ? <span key="fl" style={{ color: '#dc2626', fontWeight: 700 }}>{p.flag_count} 🚩</span> : <span key="fl2" style={{ color: '#9ca3af' }}>0</span>,
                  p.is_flagged
                    ? <span key="st" style={{ fontSize: 10, color: '#dc2626', background: '#fef2f2', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>HIDDEN</span>
                    : <span key="st2" style={{ fontSize: 10, color: '#16a34a', background: '#dcfce7', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>LIVE</span>,
                  tAgo(p.created_at),
                  done
                    ? <span key="d" style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>✓ {done}</span>
                    : <div key="btn" style={{ display: 'flex', gap: 5 }}>
                        {p.is_flagged
                          ? <ActionBtn label="Restore" color="#16a34a" onClick={() => doAction('unflag', p.id)} disabled={!!busy} />
                          : <ActionBtn label="Flag" color="#ca8a04" onClick={() => doAction('flag', p.id)} disabled={!!busy} />
                        }
                        <ActionBtn label="Del" color="#dc2626" onClick={() => doAction('delete', p.id)} disabled={!!busy} />
                      </div>,
                ];
              })}
              emptyMsg="No pins match the current filters"
            />
          </div>
        )}

      </div>
    </div>
  );
}
