import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// ── Areas data (mirrors NCRRealty.jsx) ───────────────────────────────────────
const CITIES = {
  delhi:     { label:'Delhi',      color:'#e85d26' },
  gurgaon:   { label:'Gurgaon',    color:'#2563eb' },
  noida:     { label:'Noida',      color:'#16a34a' },
  faridabad: { label:'Faridabad',  color:'#7c3aed' },
  ghaziabad: { label:'Ghaziabad',  color:'#db2777' },
};

const AREAS = [
  { id:'connaught-place',   name:'Connaught Place',    city:'delhi',    lat:28.6315,lng:77.2167 },
  { id:'karol-bagh',        name:'Karol Bagh',         city:'delhi',    lat:28.6519,lng:77.1909 },
  { id:'lajpat-nagar',      name:'Lajpat Nagar',       city:'delhi',    lat:28.5672,lng:77.2435 },
  { id:'hauz-khas',         name:'Hauz Khas',          city:'delhi',    lat:28.5494,lng:77.2001 },
  { id:'greater-kailash',   name:'Greater Kailash',    city:'delhi',    lat:28.5389,lng:77.2431 },
  { id:'south-ext',         name:'South Extension',    city:'delhi',    lat:28.5703,lng:77.2210 },
  { id:'defence-colony',    name:'Defence Colony',     city:'delhi',    lat:28.5702,lng:77.2339 },
  { id:'nehru-place',       name:'Nehru Place',        city:'delhi',    lat:28.5483,lng:77.2507 },
  { id:'malviya-nagar',     name:'Malviya Nagar',      city:'delhi',    lat:28.5300,lng:77.2080 },
  { id:'saket',             name:'Saket',              city:'delhi',    lat:28.5244,lng:77.2066 },
  { id:'vasant-vihar',      name:'Vasant Vihar',       city:'delhi',    lat:28.5655,lng:77.1603 },
  { id:'vasant-kunj',       name:'Vasant Kunj',        city:'delhi',    lat:28.5200,lng:77.1588 },
  { id:'munirka',           name:'Munirka',            city:'delhi',    lat:28.5535,lng:77.1740 },
  { id:'r-k-puram',         name:'R K Puram',          city:'delhi',    lat:28.5651,lng:77.1751 },
  { id:'moti-bagh',         name:'Moti Bagh',          city:'delhi',    lat:28.5886,lng:77.1690 },
  { id:'janakpuri',         name:'Janakpuri',          city:'delhi',    lat:28.6219,lng:77.0878 },
  { id:'rajouri-garden',    name:'Rajouri Garden',     city:'delhi',    lat:28.6467,lng:77.1195 },
  { id:'dwarka',            name:'Dwarka',             city:'delhi',    lat:28.5921,lng:77.0460 },
  { id:'dwarka-mor',        name:'Dwarka Mor',         city:'delhi',    lat:28.6097,lng:77.0608 },
  { id:'uttam-nagar',       name:'Uttam Nagar',        city:'delhi',    lat:28.6213,lng:77.0557 },
  { id:'tilak-nagar',       name:'Tilak Nagar',        city:'delhi',    lat:28.6399,lng:77.0986 },
  { id:'patel-nagar',       name:'Patel Nagar',        city:'delhi',    lat:28.6530,lng:77.1587 },
  { id:'hari-nagar',        name:'Hari Nagar',         city:'delhi',    lat:28.6278,lng:77.1189 },
  { id:'rohini',            name:'Rohini',             city:'delhi',    lat:28.7041,lng:77.1025 },
  { id:'pitampura',         name:'Pitampura',          city:'delhi',    lat:28.7010,lng:77.1326 },
  { id:'shalimar-bagh',     name:'Shalimar Bagh',      city:'delhi',    lat:28.7172,lng:77.1681 },
  { id:'model-town',        name:'Model Town',         city:'delhi',    lat:28.7165,lng:77.1937 },
  { id:'gtb-nagar',         name:'GTB Nagar',          city:'delhi',    lat:28.6947,lng:77.2030 },
  { id:'mukherjee-nagar',   name:'Mukherjee Nagar',    city:'delhi',    lat:28.7098,lng:77.2122 },
  { id:'laxmi-nagar',       name:'Laxmi Nagar',        city:'delhi',    lat:28.6318,lng:77.2775 },
  { id:'preet-vihar',       name:'Preet Vihar',        city:'delhi',    lat:28.6392,lng:77.2956 },
  { id:'mayur-vihar',       name:'Mayur Vihar',        city:'delhi',    lat:28.6092,lng:77.2967 },
  { id:'kondli',            name:'Kondli',             city:'delhi',    lat:28.5948,lng:77.3302 },
  { id:'shahdara',          name:'Shahdara',           city:'delhi',    lat:28.6700,lng:77.2900 },
  { id:'golf-course-road',  name:'Golf Course Road',   city:'gurgaon',  lat:28.4595,lng:77.0266 },
  { id:'golf-course-ext',   name:'Golf Course Ext',    city:'gurgaon',  lat:28.4340,lng:77.0469 },
  { id:'dwarka-expressway', name:'Dwarka Expressway',  city:'gurgaon',  lat:28.5837,lng:77.0307 },
  { id:'sohna-road',        name:'Sohna Road',         city:'gurgaon',  lat:28.4089,lng:77.0226 },
  { id:'mg-road',           name:'MG Road',            city:'gurgaon',  lat:28.4823,lng:77.0732 },
  { id:'sector-14',         name:'Sector 14',          city:'gurgaon',  lat:28.4725,lng:77.0319 },
  { id:'sector-15',         name:'Sector 15',          city:'gurgaon',  lat:28.4666,lng:77.0393 },
  { id:'sector-22',         name:'Sector 22',          city:'gurgaon',  lat:28.4773,lng:77.0557 },
  { id:'sector-40',         name:'Sector 40',          city:'gurgaon',  lat:28.4525,lng:77.0445 },
  { id:'sector-45',         name:'Sector 45',          city:'gurgaon',  lat:28.4494,lng:77.0625 },
  { id:'sector-56',         name:'Sector 56',          city:'gurgaon',  lat:28.4241,lng:77.0843 },
  { id:'sector-57',         name:'Sector 57',          city:'gurgaon',  lat:28.4231,lng:77.0633 },
  { id:'sector-67',         name:'Sector 67',          city:'gurgaon',  lat:28.4066,lng:77.0752 },
  { id:'new-gurgaon',       name:'New Gurgaon',        city:'gurgaon',  lat:28.3910,lng:76.9790 },
  { id:'sushant-lok',       name:'Sushant Lok',        city:'gurgaon',  lat:28.4664,lng:77.0688 },
  { id:'palam-vihar',       name:'Palam Vihar',        city:'gurgaon',  lat:28.5165,lng:77.0057 },
  { id:'manesar',           name:'Manesar',            city:'gurgaon',  lat:28.3580,lng:76.9380 },
  { id:'south-city',        name:'South City',         city:'gurgaon',  lat:28.4384,lng:77.0337 },
  { id:'dlf-city',          name:'DLF City',           city:'gurgaon',  lat:28.4744,lng:77.0934 },
  { id:'sector-18',         name:'Sector 18',          city:'noida',    lat:28.5700,lng:77.3219 },
  { id:'sector-15-noida',   name:'Sector 15',          city:'noida',    lat:28.5844,lng:77.3238 },
  { id:'sector-44',         name:'Sector 44',          city:'noida',    lat:28.5610,lng:77.3470 },
  { id:'sector-50',         name:'Sector 50',          city:'noida',    lat:28.5565,lng:77.3580 },
  { id:'sector-61',         name:'Sector 61',          city:'noida',    lat:28.6070,lng:77.3683 },
  { id:'sector-62',         name:'Sector 62',          city:'noida',    lat:28.6269,lng:77.3769 },
  { id:'sector-75',         name:'Sector 75',          city:'noida',    lat:28.5760,lng:77.3820 },
  { id:'sector-78',         name:'Sector 78',          city:'noida',    lat:28.5636,lng:77.3912 },
  { id:'sector-100',        name:'Sector 100',         city:'noida',    lat:28.5358,lng:77.3731 },
  { id:'sector-120',        name:'Sector 120',         city:'noida',    lat:28.5520,lng:77.3970 },
  { id:'sector-128',        name:'Sector 128',         city:'noida',    lat:28.5173,lng:77.3900 },
  { id:'sector-137',        name:'Sector 137',         city:'noida',    lat:28.5173,lng:77.3832 },
  { id:'sector-150',        name:'Sector 150',         city:'noida',    lat:28.4744,lng:77.4956 },
  { id:'noida-expressway',  name:'Noida Expressway',   city:'noida',    lat:28.5355,lng:77.3910 },
  { id:'greater-noida-west',name:'Greater Noida West', city:'noida',    lat:28.6089,lng:77.4292 },
  { id:'greater-noida',     name:'Greater Noida',      city:'noida',    lat:28.4744,lng:77.5040 },
  { id:'yamuna-expressway', name:'Yamuna Expressway',  city:'noida',    lat:28.3975,lng:77.5530 },
  { id:'sector-15-fbd',     name:'Sector 15',          city:'faridabad',lat:28.4161,lng:77.3033 },
  { id:'sector-21-fbd',     name:'Sector 21',          city:'faridabad',lat:28.4059,lng:77.3138 },
  { id:'sector-89-fbd',     name:'Sector 89',          city:'faridabad',lat:28.3670,lng:77.3340 },
  { id:'nit-faridabad',     name:'NIT Faridabad',      city:'faridabad',lat:28.3838,lng:77.3090 },
  { id:'old-faridabad',     name:'Old Faridabad',      city:'faridabad',lat:28.4011,lng:77.3125 },
  { id:'ballabhgarh',       name:'Ballabhgarh',        city:'faridabad',lat:28.3410,lng:77.3200 },
  { id:'indirapuram',       name:'Indirapuram',        city:'ghaziabad',lat:28.6460,lng:77.3660 },
  { id:'raj-nagar-ext',     name:'Raj Nagar Extension',city:'ghaziabad',lat:28.6677,lng:77.4160 },
  { id:'vasundhara',        name:'Vasundhara',         city:'ghaziabad',lat:28.6530,lng:77.3530 },
  { id:'vaishali',          name:'Vaishali',           city:'ghaziabad',lat:28.6449,lng:77.3386 },
  { id:'crossings-republik',name:'Crossings Republik', city:'ghaziabad',lat:28.6680,lng:77.4420 },
  { id:'kaushambi',         name:'Kaushambi',          city:'ghaziabad',lat:28.6395,lng:77.3285 },
  { id:'siddharth-vihar',   name:'Siddharth Vihar',    city:'ghaziabad',lat:28.6730,lng:77.4530 },
  { id:'abhay-khand',       name:'Abhay Khand',        city:'ghaziabad',lat:28.6530,lng:77.3750 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const avg = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
const fmtR = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtP = n => n >= 10000000 ? `₹${(n/10000000).toFixed(2)} Cr` : `₹${(n/100000).toFixed(1)}L`;
const rCol = n => n < 20000 ? '#4ade80' : n < 40000 ? '#fbbf24' : n < 80000 ? '#f97316' : '#ef4444';

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getAreaData(areaId) {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const sb = createClient(url, key);
    const { data } = await sb.from('pins')
      .select('*')
      .eq('area_id', areaId)
      .eq('flagged', false)
      .order('created_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const area = AREAS.find(a => a.id === params.id);
  if (!area) return {};
  const city = CITIES[area.city];
  const pins  = await getAreaData(area.id);
  const rents = pins.filter(p=>p.mode==='rent'&&p.rent).map(p=>p.rent);
  const avgR  = avg(rents);
  const priceStr = avgR ? ` Average rent: ${fmtR(avgR)}/month.` : '';

  return {
    title: `Rent in ${area.name}, ${city.label} — Real Prices from Residents`,
    description: `See what people actually pay to rent in ${area.name}, ${city.label}.${priceStr} Community-submitted data, no brokers. ${pins.length} data points.`,
    keywords: [
      `rent in ${area.name}`,
      `${area.name} ${city.label} rent`,
      `flat rent ${area.name}`,
      `2BHK rent ${area.name}`,
      `property price ${area.name}`,
      `${area.name} rental prices 2025`,
      `${city.label} rent data`,
    ],
    openGraph: {
      title: `Rent in ${area.name}, ${city.label} | NCR Realty`,
      description: `Real rent data from residents of ${area.name}.${priceStr} No brokers.`,
      url: `https://delhincr-rents.com/area/${area.id}`,
    },
    alternates: { canonical: `https://delhincr-rents.com/area/${area.id}` },
  };
}

// ── Static params — build all 85 area pages at deploy time ───────────────────
export async function generateStaticParams() {
  return AREAS.map(a => ({ id: a.id }));
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function AreaPage({ params }) {
  const area = AREAS.find(a => a.id === params.id);
  if (!area) notFound();

  const city = CITIES[area.city];
  const pins = await getAreaData(area.id);

  // Compute stats
  const rentPins  = pins.filter(p => p.mode==='rent');
  const buyPins   = pins.filter(p => p.mode==='buy');
  const availPins = rentPins.filter(p => p.is_available);
  const avgRent   = avg(rentPins.filter(p=>p.rent).map(p=>p.rent));
  const avgPsft   = avg(buyPins.filter(p=>p.price_per_sqft).map(p=>p.price_per_sqft));

  // BHK breakdown
  const bhkBreakdown = ['1RK','1BHK','2BHK','3BHK','4BHK','4BHK+'].map(bhk => ({
    bhk,
    count: rentPins.filter(p=>p.bhk===bhk).length,
    avg:   avg(rentPins.filter(p=>p.bhk===bhk&&p.rent).map(p=>p.rent)),
  })).filter(b => b.count > 0);

  // Nearby areas (same city, random 6)
  const nearby = AREAS.filter(a => a.city===area.city && a.id!==area.id).slice(0,6);

  const col = city.color;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:'#f8f9fa',minHeight:'100vh',color:'#1a1a1a'}}>

      {/* Structured data for Google */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context":"https://schema.org",
        "@type":"Dataset",
        "name":`Rental prices in ${area.name}, ${city.label}`,
        "description":`Community-submitted rental data for ${area.name}, ${city.label}. ${rentPins.length} data points.`,
        "url":`https://delhincr-rents.com/area/${area.id}`,
        "creator":{"@type":"Organization","name":"NCR Realty"},
        "spatialCoverage":{"@type":"Place","name":`${area.name}, ${city.label}, India`},
      })}}/>

      {/* Header */}
      <header style={{background:'#1a1a1a',padding:'14px 20px',display:'flex',alignItems:'center',gap:12}}>
        <Link href="/" style={{color:'#fff',textDecoration:'none',fontSize:13,opacity:.7,display:'flex',alignItems:'center',gap:6}}>
          ← NCR Realty
        </Link>
        <span style={{color:'#444',fontSize:13}}>/</span>
        <span style={{color:'#fff',fontSize:13,fontWeight:600}}>{area.name}</span>
      </header>

      {/* Hero */}
      <div style={{background:'#1a1a1a',padding:'28px 20px 32px',borderBottom:`4px solid ${col}`}}>
        <div style={{maxWidth:800,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <span style={{background:col,color:'#fff',padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>{city.label}</span>
            <span style={{color:'#666',fontSize:12}}>{pins.length} community data points</span>
          </div>
          <h1 style={{color:'#fff',fontSize:28,fontWeight:800,margin:'0 0 6px',lineHeight:1.2}}>
            Rent & Property Prices in {area.name}
          </h1>
          <p style={{color:'#999',fontSize:15,margin:0,lineHeight:1.6}}>
            Real prices submitted by residents of {area.name}, {city.label}. No brokers, no inflated listings — just what people actually pay.
          </p>
        </div>
      </div>

      <div style={{maxWidth:800,margin:'0 auto',padding:'24px 20px'}}>

        {/* Stats row */}
        {pins.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:24}}>
            {avgRent>0&&<StatCard label="Avg Rent" value={fmtR(avgRent)+'/mo'} color={rCol(avgRent)} sub={rentPins.length+' rental pins'}/>}
            {avgPsft>0&&<StatCard label="Avg ₹/sqft" value={'₹'+avgPsft.toLocaleString()} color="#2563eb" sub={buyPins.length+' buy listings'}/>}
            {availPins.length>0&&<StatCard label="Available Now" value={availPins.length+' flats'} color="#16a34a" sub="Currently listed"/>}
            <StatCard label="Total Data Points" value={pins.length} color={col} sub="community submitted"/>
          </div>
        )}

        {/* BHK breakdown */}
        {bhkBreakdown.length > 0 && (
          <Section title={`Rent by BHK in ${area.name}`}>
            <div style={{display:'grid',gap:10}}>
              {bhkBreakdown.map(b => (
                <div key={b.bhk} style={{display:'flex',alignItems:'center',gap:12,background:'#fff',borderRadius:10,padding:'12px 16px',border:'1px solid #e8e8e0'}}>
                  <span style={{fontWeight:700,fontSize:15,width:60,color:'#1a1a1a'}}>{b.bhk}</span>
                  <div style={{flex:1,height:8,background:'#f0f0f0',borderRadius:99,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.min(100,(b.avg/(avgRent||1))*60+20)}%`,background:rCol(b.avg),borderRadius:99}}/>
                  </div>
                  <span style={{fontWeight:700,fontSize:15,color:rCol(b.avg),fontFamily:'DM Mono,monospace',width:80,textAlign:'right'}}>
                    {b.avg>0?fmtR(b.avg)+'/mo':'—'}
                  </span>
                  <span style={{fontSize:12,color:'#999',width:40,textAlign:'right'}}>{b.count}p</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Recent listings */}
        {pins.length > 0 ? (
          <Section title={`Recent Listings in ${area.name}`}>
            <div style={{display:'grid',gap:10}}>
              {pins.slice(0,10).map(pin => {
                const isR = pin.mode==='rent';
                const val = isR ? (pin.rent?fmtR(pin.rent)+'/mo':'—') : (pin.price?fmtP(pin.price):'—');
                const c   = isR ? rCol(pin.rent||0) : '#2563eb';
                return (
                  <div key={pin.id} style={{background:'#fff',borderRadius:10,padding:'14px 16px',border:'1px solid #e8e8e0',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:4,flexWrap:'wrap'}}>
                        {pin.is_available&&<span style={{background:'#dcfce7',color:'#166534',border:'1px solid #86efac',padding:'1px 7px',borderRadius:99,fontSize:10,fontWeight:700}}>AVAILABLE</span>}
                        <span style={{background:'#f1f5f9',color:'#475569',padding:'1px 7px',borderRadius:99,fontSize:11}}>{pin.bhk}</span>
                        {pin.prop_type&&<span style={{background:'#f1f5f9',color:'#475569',padding:'1px 7px',borderRadius:99,fontSize:11}}>{pin.prop_type}</span>}
                        {pin.furnishing&&<span style={{background:'#f1f5f9',color:'#475569',padding:'1px 7px',borderRadius:99,fontSize:11}}>{pin.furnishing}</span>}
                      </div>
                      <div style={{fontSize:13,color:'#666',marginTop:2}}>
                        {pin.society&&<span style={{fontWeight:600,color:'#1a1a1a'}}>{pin.society} · </span>}
                        {pin.sqft&&<span>{pin.sqft?.toLocaleString()} sqft</span>}
                        {pin.floor&&<span> · Floor {pin.floor}</span>}
                      </div>
                      {pin.note&&<div style={{fontSize:12,color:'#888',marginTop:4,fontStyle:'italic'}}>"{pin.note.slice(0,80)}{pin.note.length>80?'…':''}"</div>}
                    </div>
                    <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                      <div style={{fontFamily:'DM Mono,monospace',fontSize:16,fontWeight:800,color:c}}>{val}</div>
                      {isR&&pin.price_per_sqft&&<div style={{fontSize:11,color:'#999'}}>₹{pin.price_per_sqft?.toLocaleString()}/sqft</div>}
                      <div style={{fontSize:11,color:'#bbb',marginTop:2}}>{timeAgo(pin.created_at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {pins.length > 10 && (
              <div style={{textAlign:'center',marginTop:16}}>
                <Link href={`/?area=${area.id}`} style={{display:'inline-block',background:'#1a1a1a',color:'#fff',padding:'10px 24px',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none'}}>
                  View all {pins.length} listings on map →
                </Link>
              </div>
            )}
          </Section>
        ) : (
          <Section title={`Listings in ${area.name}`}>
            <div style={{background:'#fff',borderRadius:12,padding:'32px',textAlign:'center',border:'1px solid #e8e8e0'}}>
              <div style={{fontSize:32,marginBottom:12}}>📍</div>
              <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>No data yet for {area.name}</div>
              <p style={{color:'#888',fontSize:14,marginBottom:20,lineHeight:1.6}}>
                Be the first to add rent or property data for this area. It takes 30 seconds and helps everyone house-hunting in {city.label}.
              </p>
              <Link href="/" style={{display:'inline-block',background:'#1a1a1a',color:'#fff',padding:'12px 24px',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none'}}>
                Add data for {area.name} →
              </Link>
            </div>
          </Section>
        )}

        {/* SEO text block */}
        <Section title={`About Renting in ${area.name}`}>
          <div style={{background:'#fff',borderRadius:12,padding:'20px',border:'1px solid #e8e8e0',lineHeight:1.8,color:'#444',fontSize:14}}>
            <p>
              {area.name} is a residential area in {city.label}, Delhi NCR.
              {avgRent>0
                ? ` Based on community-submitted data, the average rent in ${area.name} is around ${fmtR(avgRent)} per month.`
                : ` Rent data for ${area.name} is being collected by the community.`}
              {bhkBreakdown.length>0&&` The most common configurations available are ${bhkBreakdown.map(b=>b.bhk).join(', ')}.`}
            </p>
            <p>
              All data on this page is submitted anonymously by residents and tenants. Prices reflect real transactions, not broker listings which are often inflated. If you live in or have recently rented in {area.name}, consider adding your data to help others.
            </p>
            <p>
              Looking for a flat in {area.name}? Use the <Link href="/" style={{color:col,textDecoration:'none',fontWeight:600}}>NCR Realty map</Link> to see exact pin locations and connect with owners directly through our broker-free flat hunt feature.
            </p>
          </div>
        </Section>

        {/* Nearby areas */}
        <Section title={`Other Areas in ${city.label}`}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {nearby.map(a => (
              <Link key={a.id} href={`/area/${a.id}`} style={{background:'#fff',borderRadius:10,padding:'12px 14px',border:'1px solid #e8e8e0',textDecoration:'none',color:'#1a1a1a',display:'block',transition:'border-color .15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=col}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#e8e8e0'}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{a.name}</div>
                <div style={{fontSize:11,color:'#999'}}>{city.label}</div>
              </Link>
            ))}
          </div>
        </Section>

        {/* Footer CTA */}
        <div style={{background:'#1a1a1a',borderRadius:16,padding:'28px 24px',textAlign:'center',marginTop:8}}>
          <div style={{fontSize:22,marginBottom:8}}>🏠</div>
          <div style={{color:'#fff',fontWeight:700,fontSize:18,marginBottom:8}}>Add your rent data</div>
          <p style={{color:'#999',fontSize:14,marginBottom:20,margin:'0 0 20px'}}>Help build the most accurate rent database for Delhi NCR. Anonymous, takes 30 seconds.</p>
          <Link href="/" style={{display:'inline-block',background:col,color:'#fff',padding:'12px 28px',borderRadius:10,fontSize:15,fontWeight:700,textDecoration:'none'}}>
            Open Map & Add Pin →
          </Link>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, color, sub }) {
  return (
    <div style={{background:'#fff',borderRadius:12,padding:'16px',border:'1px solid #e8e8e0',textAlign:'center'}}>
      <div style={{fontSize:11,color:'#999',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color,fontFamily:'DM Mono,monospace',marginBottom:4}}>{value}</div>
      <div style={{fontSize:11,color:'#bbb'}}>{sub}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{marginBottom:28}}>
      <h2 style={{fontSize:17,fontWeight:700,color:'#1a1a1a',marginBottom:12,paddingBottom:8,borderBottom:'2px solid #f0f0f0'}}>{title}</h2>
      {children}
    </div>
  );
}

function timeAgo(ts) {
  if(!ts) return '';
  const d = Math.floor((Date.now()-new Date(ts))/86400000);
  return d===0?'Today':d===1?'Yesterday':`${d}d ago`;
}
