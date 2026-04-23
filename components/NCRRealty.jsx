'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Areas (85 locations) ─────────────────────────────────────────────────────
const CITIES = {
  delhi:     { label:'Delhi',      color:'#e85d26' },
  gurgaon:   { label:'Gurgaon',    color:'#2563eb' },
  noida:     { label:'Noida',      color:'#16a34a' },
  faridabad: { label:'Faridabad',  color:'#7c3aed' },
  ghaziabad: { label:'Ghaziabad',  color:'#db2777' },
};

const AREAS = [
  // Delhi — Central & South
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
  // Delhi — West
  { id:'janakpuri',         name:'Janakpuri',          city:'delhi',    lat:28.6219,lng:77.0878 },
  { id:'rajouri-garden',    name:'Rajouri Garden',     city:'delhi',    lat:28.6467,lng:77.1195 },
  { id:'dwarka',            name:'Dwarka',             city:'delhi',    lat:28.5921,lng:77.0460 },
  { id:'dwarka-mor',        name:'Dwarka Mor',         city:'delhi',    lat:28.6097,lng:77.0608 },
  { id:'uttam-nagar',       name:'Uttam Nagar',        city:'delhi',    lat:28.6213,lng:77.0557 },
  { id:'tilak-nagar',       name:'Tilak Nagar',        city:'delhi',    lat:28.6399,lng:77.0986 },
  { id:'patel-nagar',       name:'Patel Nagar',        city:'delhi',    lat:28.6530,lng:77.1587 },
  { id:'hari-nagar',        name:'Hari Nagar',         city:'delhi',    lat:28.6278,lng:77.1189 },
  // Delhi — North
  { id:'rohini',            name:'Rohini',             city:'delhi',    lat:28.7041,lng:77.1025 },
  { id:'pitampura',         name:'Pitampura',          city:'delhi',    lat:28.7010,lng:77.1326 },
  { id:'shalimar-bagh',     name:'Shalimar Bagh',      city:'delhi',    lat:28.7172,lng:77.1681 },
  { id:'model-town',        name:'Model Town',         city:'delhi',    lat:28.7165,lng:77.1937 },
  { id:'gtb-nagar',         name:'GTB Nagar',          city:'delhi',    lat:28.6947,lng:77.2030 },
  { id:'mukherjee-nagar',   name:'Mukherjee Nagar',    city:'delhi',    lat:28.7098,lng:77.2122 },
  // Delhi — East
  { id:'laxmi-nagar',       name:'Laxmi Nagar',        city:'delhi',    lat:28.6318,lng:77.2775 },
  { id:'preet-vihar',       name:'Preet Vihar',        city:'delhi',    lat:28.6392,lng:77.2956 },
  { id:'mayur-vihar',       name:'Mayur Vihar',        city:'delhi',    lat:28.6092,lng:77.2967 },
  { id:'kondli',            name:'Kondli',             city:'delhi',    lat:28.5948,lng:77.3302 },
  { id:'shahdara',          name:'Shahdara',           city:'delhi',    lat:28.6700,lng:77.2900 },
  // Gurgaon
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
  // Noida
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
  // Faridabad
  { id:'sector-15-fbd',     name:'Sector 15',          city:'faridabad',lat:28.4161,lng:77.3033 },
  { id:'sector-21-fbd',     name:'Sector 21',          city:'faridabad',lat:28.4059,lng:77.3138 },
  { id:'sector-89-fbd',     name:'Sector 89',          city:'faridabad',lat:28.3670,lng:77.3340 },
  { id:'nit-faridabad',     name:'NIT Faridabad',      city:'faridabad',lat:28.3838,lng:77.3090 },
  { id:'old-faridabad',     name:'Old Faridabad',      city:'faridabad',lat:28.4011,lng:77.3125 },
  { id:'ballabhgarh',       name:'Ballabhgarh',        city:'faridabad',lat:28.3410,lng:77.3200 },
  // Ghaziabad
  { id:'indirapuram',       name:'Indirapuram',        city:'ghaziabad',lat:28.6460,lng:77.3660 },
  { id:'raj-nagar-ext',     name:'Raj Nagar Extension',city:'ghaziabad',lat:28.6677,lng:77.4160 },
  { id:'vasundhara',        name:'Vasundhara',         city:'ghaziabad',lat:28.6530,lng:77.3530 },
  { id:'vaishali',          name:'Vaishali',           city:'ghaziabad',lat:28.6449,lng:77.3386 },
  { id:'crossings-republik',name:'Crossings Republik', city:'ghaziabad',lat:28.6680,lng:77.4420 },
  { id:'kaushambi',         name:'Kaushambi',          city:'ghaziabad',lat:28.6395,lng:77.3285 },
  { id:'siddharth-vihar',   name:'Siddharth Vihar',    city:'ghaziabad',lat:28.6730,lng:77.4530 },
  { id:'abhay-khand',       name:'Abhay Khand',        city:'ghaziabad',lat:28.6530,lng:77.3750 },
];

const METRO = [
  { name:'Yellow Line',   color:'#e6b800', pts:[[28.7317,77.1082],[28.7041,77.1025],[28.6804,77.1324],[28.6578,77.1706],[28.6315,77.2167],[28.5957,77.2250],[28.5521,77.2058],[28.5070,77.1756],[28.4590,77.1570]] },
  { name:'Blue Line',     color:'#4169E1', pts:[[28.5921,77.0460],[28.5855,77.1106],[28.6094,77.1682],[28.6315,77.2167],[28.6374,77.2632],[28.6326,77.2892],[28.5700,77.3219],[28.6269,77.3769]] },
  { name:'Red Line',      color:'#DC143C', pts:[[28.7204,77.1072],[28.6877,77.1318],[28.6519,77.1909],[28.6563,77.2079],[28.6677,77.2746],[28.7036,77.2902]] },
  { name:'Violet Line',   color:'#8B008B', pts:[[28.6671,77.2286],[28.6316,77.2295],[28.5820,77.2620],[28.5244,77.2066],[28.4978,77.2418]] },
  { name:'Magenta Line',  color:'#CC00CC', pts:[[28.6219,77.0878],[28.5494,77.2001],[28.5244,77.2066],[28.5355,77.3910]] },
  { name:'Pink Line',     color:'#FF69B4', pts:[[28.7185,77.1800],[28.6682,77.2286],[28.6315,77.2167],[28.5820,77.2200],[28.5050,77.3600]] },
  { name:'Airport Exp.',  color:'#FF8C00', pts:[[28.6315,77.2167],[28.5990,77.1680],[28.5654,77.0892],[28.5537,77.0795]] },
  { name:'Rapid Metro',   color:'#00CED1', pts:[[28.4823,77.0732],[28.4664,77.0688],[28.4500,77.0520]] },
  { name:'Aqua Line',     color:'#00BFFF', pts:[[28.5700,77.3219],[28.5300,77.4000],[28.4744,77.4956]] },
];

const AIRPORTS = [
  { name:'IGI Airport', lat:28.5562, lng:77.1000, code:'IGI' },
  { name:'Hindon Airport', lat:28.6947, lng:77.4285, code:'HDO' },
];

// ─── Searchable locations: AREAS + airports + key metro stations / landmarks ──
// Used by LocationSearch — no external API, fully offline
const SEARCH_LOCS = [
  ...AREAS.map(a=>({ name:a.name, sub:(CITIES[a.city]?.label||'Delhi NCR'), lat:a.lat, lng:a.lng, type:'area',     zoom:14 })),
  { name:'IGI Airport',              sub:'New Delhi',         lat:28.5562, lng:77.1000, type:'airport',  zoom:14 },
  { name:'Hindon Airport',           sub:'Ghaziabad',         lat:28.6947, lng:77.4285, type:'airport',  zoom:14 },
  { name:'Rajiv Chowk Metro',        sub:'Central Delhi',     lat:28.6315, lng:77.2167, type:'metro',    zoom:15 },
  { name:'Kashmere Gate Metro',      sub:'North Delhi',       lat:28.6676, lng:77.2281, type:'metro',    zoom:15 },
  { name:'Huda City Centre Metro',   sub:'Gurgaon',           lat:28.4590, lng:77.1570, type:'metro',    zoom:15 },
  { name:'AIIMS Metro',              sub:'South Delhi',       lat:28.5681, lng:77.2090, type:'metro',    zoom:15 },
  { name:'Saket Metro',              sub:'South Delhi',       lat:28.5244, lng:77.2066, type:'metro',    zoom:15 },
  { name:'Chattarpur Metro',         sub:'South Delhi',       lat:28.5021, lng:77.1760, type:'metro',    zoom:15 },
  { name:'Akshardham Metro',         sub:'East Delhi',        lat:28.6127, lng:77.2773, type:'metro',    zoom:15 },
  { name:'Yamuna Bank Metro',        sub:'East Delhi',        lat:28.6326, lng:77.2892, type:'metro',    zoom:15 },
  { name:'Botanical Garden Metro',   sub:'Noida',             lat:28.5625, lng:77.3360, type:'metro',    zoom:15 },
  { name:'Dwarka Sector 21 Metro',   sub:'West Delhi',        lat:28.5537, lng:77.0795, type:'metro',    zoom:15 },
  { name:'Uttam Nagar East Metro',   sub:'West Delhi',        lat:28.6213, lng:77.0557, type:'metro',    zoom:15 },
  { name:'Netaji Subhash Place',     sub:'North Delhi',       lat:28.6988, lng:77.1550, type:'metro',    zoom:15 },
  { name:'Inderlok Metro',           sub:'North West Delhi',  lat:28.6804, lng:77.1324, type:'metro',    zoom:15 },
  { name:'Central Secretariat',      sub:'Central Delhi',     lat:28.6138, lng:77.2122, type:'metro',    zoom:15 },
  { name:'Noida Sector 52 Metro',    sub:'Noida',             lat:28.6070, lng:77.3683, type:'metro',    zoom:15 },
  { name:'Electronic City Metro',    sub:'Noida',             lat:28.6269, lng:77.3769, type:'metro',    zoom:15 },
  { name:'Dilshad Garden Metro',     sub:'East Delhi',        lat:28.6677, lng:77.2746, type:'metro',    zoom:15 },
  { name:'India Gate',               sub:'Central Delhi',     lat:28.6129, lng:77.2295, type:'landmark', zoom:15 },
  { name:'Khan Market',              sub:'Central Delhi',     lat:28.5993, lng:77.2266, type:'landmark', zoom:15 },
  { name:'Chandni Chowk',            sub:'Old Delhi',         lat:28.6570, lng:77.2310, type:'landmark', zoom:15 },
  { name:'Cyber City / DLF',         sub:'Gurgaon',           lat:28.4950, lng:77.0894, type:'landmark', zoom:15 },
  { name:'Lodi Colony',              sub:'South Delhi',       lat:28.5905, lng:77.2193, type:'landmark', zoom:15 },
  { name:'Sarojini Nagar Market',    sub:'South Delhi',       lat:28.5769, lng:77.1912, type:'landmark', zoom:15 },
  { name:'Sector 29 Gurgaon',        sub:'Gurgaon',           lat:28.4735, lng:77.0586, type:'landmark', zoom:15 },
];

const BHK     = ['1RK','1BHK','2BHK','3BHK','4BHK','4BHK+'];
const PTYPES  = ['Apartment / Flat','Independent House','Builder Floor','Villa','Penthouse','Plot / Land'];
const FURNISH = ['Unfurnished','Semi-Furnished','Fully Furnished'];
const TENANTS = ['Bachelor Male','Bachelor Female','Family','Working Professional','Any'];
const POSS    = ['Ready to Move','Under Construction','Resale'];
const BUILDERS= ['DLF','Godrej','Sobha','Signature Global','M3M','ATS','Lodha','Prestige','Puravankara','Individual Owner','Other'];
const REPORT_REASONS = ['Rent looks fake / inflated','Rent looks too low','Wrong location pinned','Duplicate listing','Other issue'];

// ─── Utils ────────────────────────────────────────────────────────────────────
const avg  = a => a.length ? Math.round(a.reduce((s,x)=>s+x,0)/a.length) : 0;
const fmtR = n => !n?'—': n>=100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtP = n => !n?'—': n>=10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : `₹${(n/100000).toFixed(1)}L`;
const tAgo = ts => { if(!ts)return''; const d=Math.floor((Date.now()-new Date(ts))/864e5); return d===0?'Today':d===1?'Yesterday':`${d}d ago`; };
const rCol = r => !r?'#9ca3af': r<20000?'#16a34a': r<40000?'#ca8a04': r<70000?'#ea580c': r<120000?'#dc2626':'#7c2d12';
const pCol = p => !p?'#9ca3af': p<5e6?'#16a34a': p<1e7?'#ca8a04': p<2e7?'#ea580c': p<5e7?'#dc2626':'#7c2d12';
const aOf  = id => AREAS.find(a=>a.id===id);

// ─── Wizard scoring helpers ───────────────────────────────────────────────────
// Haversine distance in km between two lat/lng points
function haversineKm(lat1,lng1,lat2,lng2){
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
// Nearest metro station distance in km (checks all polyline points across all lines)
function nearestMetroKm(lat,lng){
  let min=Infinity;
  METRO.forEach(line=>line.pts.forEach(([mlat,mlng])=>{ const d=haversineKm(lat,lng,mlat,mlng); if(d<min)min=d; }));
  return +min.toFixed(1);
}
// Score a single area for the wizard (pure function — no side effects)
// Returns null if the area has no relevant data for this intent
// Scoring breakdown (max 100):
//   budget_fit   0-40  — how well avg price matches budget
//   data_density 0-20  — number of pins (trust signal)
//   metro_prox   0-20  — proximity to nearest metro line point
//   availability 0-10  — available flats right now
//   bhk_match    0-10  — area has pins for preferred BHK
// ─── Hidden Cost Calculator — pure functions ──────────────────────────────────
// All values in ₹. Returns NaN-safe results (missing inputs treated as 0).
function calcRent({ rent=0, deposit=0, brokerage=0, maintenance=0, setup=0 }){
  const r=+rent||0, d=+deposit||0, b=+brokerage||0, m=+maintenance||0, s=+setup||0;
  const upfront   = d + b + s + r;          // money out on move-in day (deposit+brokerage+setup+first rent)
  const monthly   = r + m;                  // recurring monthly outflow
  const total6m   = upfront + monthly*5;    // months 2-6 after move-in
  const total12m  = upfront + monthly*11;
  return { upfront, monthly, total6m, total12m,
           effMonthly6m:  total6m/6,
           effMonthly12m: total12m/12 };
}
function calcBuy({ price=0, brokerage=0, stampDuty=0, registration=0, legal=0, interiors=0, misc=0 }){
  const p=+price||0, b=+brokerage||0, sd=+stampDuty||0, r=+registration||0,
        l=+legal||0, i=+interiors||0, m=+misc||0;
  const extras = b+sd+r+l+i+m;
  const total  = p+extras;
  return { basePrice:p, extras, total, overagePct: p>0 ? +((extras/p)*100).toFixed(1) : 0 };
}(area, allPins, prefs){
  const { intent, budget, bhk, wantMetro, tenantType, furnished } = prefs;
  const areaPins = allPins.filter(p=>p.area_id===area.id && p.mode===intent);
  if(!areaPins.length) return null;

  const vals = intent==='rent'
    ? areaPins.map(p=>p.rent).filter(Boolean)
    : areaPins.map(p=>p.price).filter(Boolean);
  const avgVal = avg(vals);
  if(!avgVal) return null;

  let score=0;

  // 1. Budget fit (0-40)
  if(budget){
    const r=avgVal/budget;
    if(r<=0.75)      score+=30;
    else if(r<=0.90) score+=40;  // sweet spot — fits comfortably
    else if(r<=1.00) score+=32;
    else if(r<=1.10) score+=14;
    else if(r<=1.25) score+=4;
    // else 0 — significantly over budget
  } else { score+=25; }

  // 2. Data density (0-20)
  score += Math.min(areaPins.length*3, 20);

  // 3. Metro proximity (0-20)
  const metroKm = nearestMetroKm(area.lat, area.lng);
  const metroPts = Math.max(0, 20-Math.round(metroKm*3));
  score += metroPts;
  if(wantMetro==='yes' && metroKm>4) score -= 12; // hard penalty if metro required but far

  // 4. Available flats (0-10)
  const availCount = areaPins.filter(p=>p.is_available).length;
  score += Math.min(availCount*4, 10);

  // 5. BHK match (0-10)
  if(intent==='rent' && bhk && bhk!=='any'){
    if(areaPins.some(p=>p.bhk===bhk)) score+=10;
  } else if(intent==='buy'){ score+=5; } // no BHK penalty for buy

  // 6. Tenant type (soft bonus, 0-5) — TODO: enrich if schema adds tenant_friendly field
  if(intent==='rent' && tenantType && tenantType!=='any'){
    if(areaPins.some(p=>p.tenant_type===tenantType||p.tenant_type==='Any')) score+=5;
  }

  // Clamp to 100
  score = Math.max(0, Math.min(100, score));

  // Affordability label
  let label='', labelColor='#6b7280';
  if(budget){
    const r=avgVal/budget;
    if(r<=0.75)      { label='Budget-friendly'; labelColor='#16a34a'; }
    else if(r<=0.92) { label='Good value';      labelColor='#2563eb'; }
    else if(r<=1.02) { label='Fits budget';     labelColor='#7c3aed'; }
    else if(r<=1.15) { label='Slightly over';   labelColor='#ca8a04'; }
    else             { label='Above budget';    labelColor='#dc2626'; }
  }

  // BHK breakdown present in this area (for display)
  const bhksPresent = [...new Set(areaPins.map(p=>p.bhk).filter(Boolean))].sort();

  // "Why" explanation — pick 1-2 best reasons
  const reasons=[];
  if(budget && avgVal/budget<=0.92) reasons.push(`Avg ${intent==='rent'?fmtR(avgVal)+'/mo':fmtP(avgVal)} fits your budget`);
  if(metroKm<1.5)      reasons.push('Walking distance to metro');
  else if(metroKm<3)   reasons.push(`~${metroKm}km from metro`);
  if(availCount>0)     reasons.push(`${availCount} flat${availCount>1?'s':''} available now`);
  if(areaPins.length>=5&&!reasons.length) reasons.push(`${areaPins.length} verified data points`);
  if(!reasons.length)  reasons.push(`${areaPins.length} pin${areaPins.length>1?'s':''} in this area`);

  return { area, score, avgVal, pinCount:areaPins.length, availCount, metroKm, label, labelColor, reasons, bhksPresent };
}
// Find area by pin - checks id first, then name match for custom pins
const aOfPin = pin => aOf(pin.area_id) || AREAS.find(a=>
  pin.area_name && a.name.toLowerCase() === pin.area_name.toLowerCase()
);
// Safe coordinate resolver — handles null, undefined, strings from DB
// Priority: 1) Exact GPS drop  2) Predefined area centroid  3) null (NOT shown on map)
// We deliberately do NOT fall back to city centre — that would put unrelated pins at CP/MG Road etc.
function pinCoords(pin) {
  // 1. Exact GPS coordinates from map drop
  const eLat = pin.pin_lat != null && pin.pin_lat !== '' ? parseFloat(pin.pin_lat) : null;
  const eLng = pin.pin_lng != null && pin.pin_lng !== '' ? parseFloat(pin.pin_lng) : null;
  if (eLat && eLng && !isNaN(eLat) && !isNaN(eLng)) return { lat: eLat, lng: eLng, exact: true };
  // 2. Area centroid — only for pins submitted via known-area dropdown (NOT custom)
  if (pin.area_id && pin.area_id !== 'custom') {
    const area = aOfPin(pin);
    if (area?.lat && area?.lng) return { lat: area.lat, lng: area.lng, exact: false };
  }
  // 3. No valid coordinates — do NOT show on map, will appear in Browse panel only
  return null;
}

function getFP(){ let f=localStorage.getItem('ncr_fp'); if(!f){f=crypto.randomUUID();localStorage.setItem('ncr_fp',f);} return f; }
async function revGeo(lat,lng){
  try{
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if(!key) return 'Custom Location';
    const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=en&result_type=sublocality|neighborhood|political`);
    const d = await r.json();
    if(d.results?.[0]){
      const comps = d.results[0].address_components;
      const sub2  = comps.find(c=>c.types.includes('sublocality_level_2'));
      const sub1  = comps.find(c=>c.types.includes('sublocality_level_1'));
      const nbr   = comps.find(c=>c.types.includes('neighborhood'));
      const city  = comps.find(c=>c.types.includes('locality'));
      const name  = sub2?.long_name||sub1?.long_name||nbr?.long_name||'';
      const cname = city?.long_name||'';
      if(!name) return cname||'Custom Location';
      return name + (cname && !name.toLowerCase().includes(cname.toLowerCase()) ? ', '+cname : '');
    }
    return 'Custom Location';
  }catch{ return 'Custom Location'; }
}
function waText(pin){ const a=aOfPin(pin); const v=pin.mode==='rent'?`₹${pin.rent?.toLocaleString()}/mo`:fmtP(pin.price); return encodeURIComponent(`🏠 Real property data from NCR Realty\n📍 ${a?.name||pin.area_name||'Delhi NCR'}\n🏢 ${pin.society||'Property'} · ${pin.bhk}\n💰 ${v}${pin.is_available?' · ✅ AVAILABLE':''}\n\nncrrealty.in — real rents, no brokers`); }

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#__next{height:100%;overflow:hidden;}
body{font-family:'DM Sans',sans-serif;background:#0f172a;color:#1a1a1a;-webkit-tap-highlight-color:transparent;overscroll-behavior:none;}
input,select,textarea,button{font-family:inherit;}
select option{background:#fff;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px;}

/* ── z-index stack: map(1) → legend/rail(490-500) → topbar(600) → mob-bar(600) → modals(800+) → onboard(900) ── */

/* Map */
#map-root{position:fixed;inset:0;z-index:1;background:#1d2c4d;}
#map-root>div{width:100%;height:100%;}
.gm-style .gm-style-iw-c{background:rgba(15,15,15,.96)!important;border-radius:12px!important;padding:12px 16px!important;box-shadow:0 4px 24px rgba(0,0,0,.5)!important;}
.gm-style .gm-style-iw-d{overflow:hidden!important;}
.gm-style .gm-style-iw-tc::after{background:rgba(15,15,15,.96)!important;}
.gm-style-iw-chr{display:none!important;}
.gm-bundled-control{margin-right:10px!important;margin-bottom:28px!important;}

/* ── Top bar: clean white, compact ── */
#tb{
  position:fixed;top:0;left:0;right:0;z-index:600;
  height:52px;
  background:rgba(255,255,255,.97);
  border-bottom:1px solid #e5e7eb;
  display:flex;align-items:center;padding:0 14px;gap:8px;
  box-shadow:0 1px 8px rgba(0,0,0,.08);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
}
/* mode-switch pill inside topbar */
.tb-modes{display:flex;background:#f3f4f6;border-radius:9px;padding:3px;gap:2px;}
.tb-mode{padding:5px 13px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#6b7280;white-space:nowrap;transition:all .12s;}
.tb-mode.on{background:#fff;color:#111;box-shadow:0 1px 4px rgba(0,0,0,.1);}
/* generic topbar action button */
.tb-btn{display:flex;align-items:center;gap:5px;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;color:#4b5563;white-space:nowrap;transition:all .12s;}
.tb-btn:hover{border-color:#111;color:#111;}
.tb-btn.on{border-color:#7c3aed;background:#f5f3ff;color:#7c3aed;}

/* ── Side action rail: desktop only, right edge ── */
#rail{
  position:fixed;right:12px;top:50%;transform:translateY(-50%);
  z-index:500;
  display:flex;flex-direction:column;gap:6px;
}
.rail-btn{
  width:42px;height:42px;border-radius:12px;
  border:1.5px solid #e5e7eb;background:rgba(255,255,255,.95);
  box-shadow:0 2px 8px rgba(0,0,0,.1);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  font-size:17px;color:#374151;transition:all .15s;
  position:relative;
}
.rail-btn:hover{border-color:#111;box-shadow:0 4px 12px rgba(0,0,0,.15);transform:scale(1.05);}
.rail-btn.active{border-color:#e85d26;background:#fff5f0;color:#e85d26;}
/* tooltip */
.rail-btn::before{
  content:attr(data-tip);
  position:absolute;right:48px;top:50%;transform:translateY(-50%);
  background:#111;color:#fff;
  padding:4px 9px;border-radius:7px;font-size:11px;font-weight:600;white-space:nowrap;
  opacity:0;pointer-events:none;transition:opacity .12s;
}
.rail-btn:hover::before{opacity:1;}

/* ── Explore / contribute side panel (desktop) ── */
.side-panel{
  position:fixed;top:52px;left:0;bottom:0;width:320px;
  z-index:500;background:#fff;
  border-right:1px solid #e5e7eb;
  display:flex;flex-direction:column;
  box-shadow:2px 0 16px rgba(0,0,0,.07);
}

/* ── Filter float: centered below topbar ── */
.filter-float{
  position:fixed;top:60px;left:50%;transform:translateX(-50%);
  z-index:750;
  width:min(440px,calc(100vw - 24px));
  background:#fff;border-radius:16px;
  box-shadow:0 8px 32px rgba(0,0,0,.18);border:1px solid #e5e7eb;
  max-height:80dvh;display:flex;flex-direction:column;overflow:hidden;
}

/* ── Bottom sheets & overlay ── */
.overlay{position:fixed;inset:0;z-index:800;background:rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center;touch-action:none;}
.sheet{width:100%;max-width:560px;background:#fff;border-radius:22px 22px 0 0;display:flex;flex-direction:column;max-height:92dvh;touch-action:pan-y;overscroll-behavior:contain;}
.handle{width:36px;height:4px;border-radius:2px;background:#e5e7eb;margin:10px auto 0;flex-shrink:0;}
.sh-head{padding:12px 18px;border-bottom:1px solid #f3f4f6;flex-shrink:0;}
.scroll{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;flex:1;}

/* ── Legend: small, bottom-left ── */
.legend{position:fixed;z-index:490;background:rgba(15,15,15,.85);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px 12px;font-size:10px;box-shadow:0 2px 8px rgba(0,0,0,.3);color:#d1d5db;}

/* ── Mobile bottom bar ── */
#mob-bar{
  position:fixed;bottom:0;left:0;right:0;z-index:600;
  background:rgba(255,255,255,.97);
  border-top:1px solid #e5e7eb;
  padding:10px 12px;
  padding-bottom:max(10px,env(safe-area-inset-bottom));
  display:none;
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
}

/* ── Inputs / form elements ── */
.inp{width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:13px;color:#111;background:#fff;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#111;}
.lbl{font-size:10.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:5px;}
.chip{padding:5px 12px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:#f9fafb;color:#6b7280;transition:all .1s;}
.chip.on{background:color-mix(in srgb,var(--cc,#111) 10%,transparent);border-color:var(--cc,#111);color:var(--cc,#111);}
.btn{padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;width:100%;}
.btn:disabled{opacity:.5;cursor:wait;}

/* ── Map cursors ── */
body.contrib #map-root,body.contrib #map-root *{cursor:crosshair!important;}
body.fh-drop #map-root,body.fh-drop #map-root *{cursor:crosshair!important;}

/* ── Animations ── */
@keyframes su{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes si{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes pu{0%,100%{opacity:.35}50%{opacity:.8}}
.su{animation:su .22s cubic-bezier(.34,1.56,.64,1) both;}
.fi{animation:fi .15s ease both;}
.si{animation:si .18s ease both;}
.pu{animation:pu 1.5s ease infinite;}

/* ── Location search bar ── */
#loc-search-wrap{
  position:fixed;top:60px;left:14px;
  width:min(286px,calc(100vw - 28px));
  z-index:650;
}
#loc-search-input{
  width:100%;padding:8px 30px 8px 32px;
  border:1.5px solid #e5e7eb;border-radius:10px;
  font-size:13px;color:#111;background:rgba(255,255,255,.97);
  outline:none;transition:border-color .15s,box-shadow .15s;
  box-shadow:0 2px 10px rgba(0,0,0,.1);
}
#loc-search-input:focus{border-color:#111;box-shadow:0 2px 14px rgba(0,0,0,.14);}
#loc-search-input::placeholder{color:#9ca3af;}
.loc-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none;color:#9ca3af;}
.loc-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:15px;color:#9ca3af;padding:2px 3px;line-height:1;border-radius:4px;}
.loc-clear:hover{color:#374151;}
.loc-drop{
  position:absolute;top:calc(100% + 4px);left:0;right:0;
  background:#fff;border-radius:12px;border:1.5px solid #e5e7eb;
  box-shadow:0 8px 28px rgba(0,0,0,.16);
  overflow:hidden;max-height:312px;overflow-y:auto;
  z-index:651;
}
.loc-item{
  width:100%;padding:9px 12px;border:none;background:transparent;
  cursor:pointer;text-align:left;display:flex;align-items:center;gap:9px;
  border-bottom:1px solid #f3f4f6;transition:background .08s;
}
.loc-item:last-child{border-bottom:none;}
.loc-item:hover,.loc-item.hi{background:#f3f4f6;}
.loc-item-name{font-size:13px;font-weight:600;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.loc-item-sub{font-size:11px;color:#6b7280;margin-top:1px;}
.loc-empty{padding:14px 12px;text-align:center;font-size:13px;color:#9ca3af;}

@keyframes srchPulse{
  0%  {transform:translate(-50%,-50%) scale(1);   opacity:.9;}
  70% {transform:translate(-50%,-50%) scale(2.8); opacity:0;}
  100%{transform:translate(-50%,-50%) scale(2.8); opacity:0;}
}

/* ── Responsive ── */
@media(max-width:768px){
  .side-panel,#rail,.desk-only{display:none!important;}
  #mob-bar{display:flex!important;}
  .legend{bottom:78px!important;left:10px!important;}
  #loc-search-wrap{width:calc(100vw - 28px);}
  .filter-float{
    top:auto!important;bottom:0!important;left:0!important;right:0!important;
    transform:none!important;width:100%!important;max-width:100%!important;
    border-radius:22px 22px 0 0!important;max-height:88dvh!important;
  }
}
`;

// ─── Google Maps dark style ──────────────────────────────────────────────────
const GM_DARK_STYLE = [
  {elementType:'geometry',stylers:[{color:'#1d2c4d'}]},
  {elementType:'labels.text.fill',stylers:[{color:'#8ec3b9'}]},
  {elementType:'labels.text.stroke',stylers:[{color:'#1a3646'}]},
  {featureType:'administrative',elementType:'geometry.stroke',stylers:[{color:'#4b6878'}]},
  {featureType:'administrative.land_parcel',elementType:'labels.text.fill',stylers:[{color:'#64779e'}]},
  {featureType:'landscape.natural',elementType:'geometry',stylers:[{color:'#023e58'}]},
  {featureType:'landscape.man_made',elementType:'geometry.stroke',stylers:[{color:'#334e87'}]},
  {featureType:'poi',elementType:'geometry',stylers:[{color:'#283d6a'}]},
  {featureType:'poi',elementType:'labels.text.fill',stylers:[{color:'#6f9ba5'}]},
  {featureType:'poi.park',elementType:'geometry.fill',stylers:[{color:'#023e58'}]},
  {featureType:'poi.park',elementType:'labels.text.fill',stylers:[{color:'#3C7680'}]},
  {featureType:'road',elementType:'geometry',stylers:[{color:'#304a7d'}]},
  {featureType:'road',elementType:'labels.text.fill',stylers:[{color:'#98a5be'}]},
  {featureType:'road',elementType:'labels.text.stroke',stylers:[{color:'#1d2c4d'}]},
  {featureType:'road.highway',elementType:'geometry',stylers:[{color:'#2c6675'}]},
  {featureType:'road.highway',elementType:'labels.text.fill',stylers:[{color:'#b0d5ce'}]},
  {featureType:'road.highway',elementType:'labels.text.stroke',stylers:[{color:'#023747'}]},
  {featureType:'transit',elementType:'labels.text.fill',stylers:[{color:'#98a5be'}]},
  {featureType:'transit.line',elementType:'geometry.fill',stylers:[{color:'#283d6a'}]},
  {featureType:'transit.station',elementType:'geometry',stylers:[{color:'#3a4762'}]},
  {featureType:'water',elementType:'geometry',stylers:[{color:'#0e1626'}]},
  {featureType:'water',elementType:'labels.text.fill',stylers:[{color:'#4e6d70'}]},
];

// ─── Map Component (Google Maps) ─────────────────────────────────────────────
function NCRMap({ pins, filters, showMetro, onPinClick, onMapClick, flyTo, fhDropMode, searchHL }) {
  const divRef    = useRef(null);
  const mapInst   = useRef(null);
  const markers   = useRef([]);
  const clusterer = useRef(null);
  const areaBubs  = useRef([]);        // area summary bubbles (zoom 9-13)
  const metroLys  = useRef([]);
  const infoWin   = useRef(null);
  const initDone  = useRef(false);
  const cbRef     = useRef(onMapClick);
  const fhRef     = useRef(fhDropMode);
  const modeRef   = useRef('explore');
  const bubbleFnRef = useRef(null);    // always-current ref to buildAreaBubbles
  const searchMkr = useRef(null);      // temporary pulse marker for search highlight

  useEffect(()=>{ cbRef.current = onMapClick; },[onMapClick]);
  useEffect(()=>{ fhRef.current = fhDropMode; },[fhDropMode]);

  // Build pin markers
  const buildMarkers = useCallback(()=>{
    const G = window.google?.maps;
    if(!mapInst.current || !G) return;

    // Clear old markers
    markers.current.forEach(m=>{ if(m.map!==undefined) m.map=null; else m.setMap(null); });
    markers.current=[];
    if(clusterer.current) clusterer.current.clearMarkers();

    // Filter
    const show = pins.filter(p=>{
      if(filters.mode!=='all'&&p.mode!==filters.mode) return false;
      if(filters.bhk !=='all'&&p.bhk !==filters.bhk)  return false;
      if(filters.city!=='all'&&p.city!==filters.city)  return false;
      if(filters.avail&&!p.is_available)               return false;
      if(filters.furnished==='furnished'  &&p.furnishing!=='Fully Furnished') return false;
      if(filters.furnished==='unfurnished'&&p.furnishing!=='Unfurnished')     return false;
      if(filters.minRent&&p.rent&&p.rent<+filters.minRent) return false;
      if(filters.maxRent&&p.rent&&p.rent>+filters.maxRent) return false;
      return true;
    });

    const newMarkers = [];
    show.forEach(pin=>{
      const coords = pinCoords(pin);
      if(!coords) return;

      const isR   = pin.mode==='rent';
      const col   = isR ? rCol(pin.rent) : pCol(pin.price);
      const val   = isR ? fmtR(pin.rent) : fmtP(pin.price);
      const avail = pin.is_available;
      const indep = pin.prop_type && ['Independent House','Builder Floor','Plot / Land'].includes(pin.prop_type);

      // HTML marker element
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';
      const dotHtml = coords.exact
        ? '<div style="width:5px;height:5px;border-radius:50%;background:'+col+';margin-top:1px;box-shadow:0 0 4px '+col+';"></div>'
        : '';
      el.innerHTML = '<div style="background:'+(avail?col:'#fff')+';color:'+(avail?'#fff':col)+';border:2px solid '+col+';'+(indep?'border-style:dashed;':'')+'border-radius:8px;padding:3px 9px;font-size:'+(avail?11:10)+'px;font-weight:700;font-family:\'DM Sans\',sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.45);">'+(avail?'AVAIL &middot; ':'')+val+'</div><div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid '+col+';"></div>'+dotHtml;

      const marker = new G.marker.AdvancedMarkerElement({
        position: {lat:coords.lat, lng:coords.lng},
        content: el,
        zIndex: avail?200:100,
        map: null,
      });
      marker._pRent   = isR ? pin.rent : null;
      marker._isAvail = avail||false;

      // Click — show detail
      el.addEventListener('click', e=>{ e.stopPropagation(); onPinClick(pin); });

      // Hover tooltip - built with string concat to avoid nested backtick issues
      const area = aOfPin(pin);
      const noteHtml = pin.note
        ? '<div style="color:#8899aa;font-size:11px;margin-top:4px;font-style:italic;">"' + pin.note.slice(0,55) + (pin.note.length>55?'...':'') + '"</div>'
        : '';
      const furnHtml = pin.furnishing
        ? '<div style="color:#94a3b8;font-size:11px;">' + pin.furnishing + '</div>'
        : '';
      const propHtml = pin.prop_type ? ' &middot; ' + pin.prop_type : '';
      const tipContent = '<div style="font-family:\'DM Sans\',sans-serif;max-width:220px;">'
        + '<div style="font-weight:700;font-size:15px;color:' + (avail?'#a3e635':'#f0f2f7') + ';margin-bottom:3px;">' + val + (avail?' &check;':'') + '</div>'
        + '<div style="color:#cbd5e1;font-size:12px;">' + (pin.society||area?.name||pin.area_name||'') + '</div>'
        + '<div style="color:#94a3b8;font-size:11px;margin-top:3px;">' + pin.bhk + propHtml + '</div>'
        + furnHtml + noteHtml
        + '<div style="color:#64748b;font-size:10px;margin-top:5px;">' + tAgo(pin.created_at) + ' &middot; click for details</div>'
        + '</div>';
      el.addEventListener('mouseover', ()=>{ infoWin.current.setContent(tipContent); infoWin.current.open({map:mapInst.current,anchor:marker}); });
      el.addEventListener('mouseout',  ()=>{ infoWin.current.close(); });

      newMarkers.push(marker);
    });

    markers.current = newMarkers;

    // Cluster
    if(window.markerClusterer && clusterer.current){
      clusterer.current.addMarkers(newMarkers);
    } else {
      // No clusterer yet — just add to map directly
      newMarkers.forEach(m=>{ m.map=mapInst.current; });
    }
  },[pins,filters,onPinClick]);

  // Build metro lines
  const buildMetro = useCallback(()=>{
    const G = window.google?.maps;
    if(!mapInst.current||!G) return;
    metroLys.current.forEach(l=>l.setMap(null)); metroLys.current=[];
    if(!showMetro) return;
    METRO.forEach(line=>{
      const pl = new G.Polyline({
        path: line.pts.map(([lat,lng])=>({lat,lng})),
        strokeColor: line.color, strokeWeight:3.5, strokeOpacity:.85, map:mapInst.current,
      });
      metroLys.current.push(pl);
    });
    AIRPORTS.forEach(ap=>{
      const el = document.createElement('div');
      el.style.cssText = 'background:#1a1a1a;color:#fff;border-radius:8px;padding:3px 9px;font-size:10px;font-weight:700;font-family:DM Sans,sans-serif;border:2px solid #FFD700;white-space:nowrap;cursor:default;';
      el.textContent = '✈ '+ap.code;
      const m = new window.google.maps.marker.AdvancedMarkerElement({position:{lat:ap.lat,lng:ap.lng},content:el,zIndex:400,map:mapInst.current});
      metroLys.current.push(m);
    });
  },[showMetro]);

  // Build zoom-aware area summary bubbles
  // Visible at zoom 9–13, only for areas that have pins after current filters
  const buildAreaBubbles = useCallback(()=>{
    const G = window.google?.maps;
    if(!mapInst.current||!G) return;

    // Clear previous bubbles
    areaBubs.current.forEach(m=>{ try{ m.map=null; }catch(e){} });
    areaBubs.current=[];

    const zoom = mapInst.current.getZoom();
    // Outside this range: individual pins / clusters handle the view
    if(zoom<9||zoom>13) return;

    // Apply same filter logic as buildMarkers so bubbles respect active filters
    const show=pins.filter(p=>{
      if(filters.mode!=='all'&&p.mode!==filters.mode) return false;
      if(filters.bhk !=='all'&&p.bhk !==filters.bhk)  return false;
      if(filters.city!=='all'&&p.city!==filters.city)  return false;
      if(filters.avail&&!p.is_available)               return false;
      if(filters.furnished==='furnished'  &&p.furnishing!=='Fully Furnished') return false;
      if(filters.furnished==='unfurnished'&&p.furnishing!=='Unfurnished')     return false;
      if(filters.minRent&&p.rent&&p.rent<+filters.minRent) return false;
      if(filters.maxRent&&p.rent&&p.rent>+filters.maxRent) return false;
      return true;
    });

    // Group by known area (skip custom pins)
    const byArea={};
    show.forEach(p=>{
      if(!p.area_id||p.area_id==='custom') return;
      (byArea[p.area_id]||(byArea[p.area_id]=[])).push(p);
    });

    AREAS.forEach(area=>{
      const ap=byArea[area.id];
      if(!ap||ap.length===0) return; // skip empty — the key improvement

      const rents  = ap.filter(p=>p.mode==='rent'&&p.rent).map(p=>p.rent);
      const prices = ap.filter(p=>p.mode==='buy' &&p.price).map(p=>p.price);
      const avail  = ap.filter(p=>p.is_available).length;
      const avgR   = rents.length  ? Math.round(rents.reduce((a,b)=>a+b,0)/rents.length)  : 0;
      const avgP   = prices.length ? Math.round(prices.reduce((a,b)=>a+b,0)/prices.length): 0;
      const count  = ap.length;
      const col    = avgR ? rCol(avgR) : avgP ? pCol(avgP) : '#6b7280';

      // Primary value label
      const valStr = avgR ? (fmtR(avgR)+'/mo') : avgP ? fmtP(avgP) : '';

      const el=document.createElement('div');
      // Light-theme pill: white bg, colored border, subtle shadow
      el.style.cssText=[
        'background:#fff',
        'border:1.5px solid '+col,
        'border-radius:10px',
        'padding:5px 9px',
        'font-family:"DM Sans",sans-serif',
        'box-shadow:0 2px 10px rgba(0,0,0,.13)',
        'cursor:pointer',
        'text-align:center',
        'transition:box-shadow .12s,transform .12s',
        'white-space:nowrap',
        'user-select:none',
      ].join(';');

      el.innerHTML=
        '<div style="font-size:10.5px;font-weight:700;color:#111;letter-spacing:-.1px;">'+area.name+'</div>'
        +(valStr
          ? '<div style="font-size:12px;font-weight:800;color:'+col+';font-family:\'DM Mono\',monospace;line-height:1.3;">'+valStr+'</div>'
          : '')
        +(avail>0
          ? '<div style="font-size:9px;font-weight:700;color:#16a34a;background:#f0fdf4;border-radius:99px;padding:1px 5px;margin-top:2px;display:inline-block;">'+avail+' avail</div>'
          : '<div style="font-size:9px;color:#9ca3af;margin-top:1px;">'+count+' pin'+(count>1?'s':'')+'</div>');

      el.addEventListener('mouseenter',()=>{
        el.style.boxShadow='0 4px 14px rgba(0,0,0,.2)';
        el.style.transform='scale(1.05)';
      });
      el.addEventListener('mouseleave',()=>{
        el.style.boxShadow='0 2px 10px rgba(0,0,0,.13)';
        el.style.transform='scale(1)';
      });
      // Click → zoom into this area
      el.addEventListener('click',e=>{
        e.stopPropagation();
        mapInst.current.panTo({lat:area.lat,lng:area.lng});
        mapInst.current.setZoom(14);
      });

      const m=new G.marker.AdvancedMarkerElement({
        position:{lat:area.lat,lng:area.lng},
        content:el,
        zIndex:300,
        map:mapInst.current,
      });
      areaBubs.current.push(m);
    });
  },[pins,filters]);
  useEffect(()=>{
    if(initDone.current) return; initDone.current=true;
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if(!key){ console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set'); return; }

    const loadScript=(src,cb)=>{ const s=document.createElement('script');s.src=src;s.onload=cb;document.head.appendChild(s); };

    // Load Google Maps + marker library
    loadScript(`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker,places&v=weekly`, ()=>{
      if(!divRef.current||mapInst.current) return;
      const G = window.google.maps;

      // Note: styles array cannot be used with mapId — use mapId for AdvancedMarkerElement
      // Dark theme is achieved via CSS on the map container
      mapInst.current = new G.Map(divRef.current, {
        mapId:            'DEMO_MAP_ID',
        center:           {lat:28.52, lng:77.18},
        zoom:             11,
        disableDefaultUI: true,
        zoomControl:      true,
        gestureHandling:  'greedy',
        backgroundColor:  '#1d2c4d',
      });

      // Apply dark style after map init (can't use styles with mapId, so set via options separately)
      setTimeout(()=>{
        if(mapInst.current) mapInst.current.setOptions({styles: GM_DARK_STYLE});
      }, 100);

      infoWin.current = new G.InfoWindow({
        pixelOffset: new G.Size(0,-10),
      });
      // Style the info window via DOM after open
      G.event.addListener(infoWin.current, 'domready', ()=>{
        const iwOuter = document.querySelector('.gm-style-iw');
        if(iwOuter){ iwOuter.style.background='rgba(15,15,15,0.95)'; iwOuter.style.borderRadius='10px'; }
      });

      // Map click — only in contribute or fhDrop mode
      mapInst.current.addListener('click', e=>{
        if(fhRef.current || modeRef.current==='contribute'){
          cbRef.current(e.latLng.lat(), e.latLng.lng());
        }
      });

      // Zoom change → rebuild area bubbles (show/hide based on zoom level)
      mapInst.current.addListener('zoom_changed', ()=>{
        if(bubbleFnRef.current) bubbleFnRef.current();
      });

      // Sync mode ref from body class
      const syncMode=()=>{ modeRef.current = document.body.classList.contains('contrib')?'contribute':'explore'; };
      const obs=new MutationObserver(syncMode);
      obs.observe(document.body,{attributes:true,attributeFilter:['class']});
      syncMode();

      // Load MarkerClusterer
      loadScript('https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js', ()=>{
        const MC = window.markerClusterer;
        clusterer.current = new MC.MarkerClusterer({
          map: mapInst.current,
          markers: [],
          renderer: {
            render({count, position, markers:ms}){
              const rents = ms.map(m=>m._pRent).filter(Boolean);
              const avlb  = ms.filter(m=>m._isAvail).length;
              const avgR  = rents.length ? Math.round(rents.reduce((a,b)=>a+b,0)/rents.length) : 0;
              const col   = avgR ? rCol(avgR) : '#6b7280';
              const el = document.createElement('div');
              // Light-theme cluster: white bg, colored border matching avg rent
              el.style.cssText=[
                'background:#fff',
                'border:2px solid '+col,
                'border-radius:12px',
                'padding:5px 11px',
                'font-family:"DM Sans",sans-serif',
                'box-shadow:0 2px 10px rgba(0,0,0,.15)',
                'text-align:center',
                'cursor:pointer',
                'line-height:1.4',
                'min-width:52px',
              ].join(';');
              el.innerHTML=
                (avgR ? '<div style="font-size:12px;font-weight:800;color:'+col+';font-family:\'DM Mono\',monospace;">'+fmtR(avgR)+'</div>' : '')
                +'<div style="font-size:11px;font-weight:700;color:#374151;">'+count+' flat'+(count>1?'s':'')+'</div>'
                +(avlb>0 ? '<div style="font-size:9.5px;font-weight:700;color:#16a34a;">'+avlb+' avail</div>' : '');
              return new window.google.maps.marker.AdvancedMarkerElement({position,content:el,zIndex:500});
            }
          },
          algorithmOptions: { maxZoom: 15 },
        });
        buildMarkers();
        buildMetro();
      });
    });
    return()=>{ if(mapInst.current){ window.google?.maps?.event?.clearInstanceListeners(mapInst.current); } };
  },[]);

  // Sync mode ref
  useEffect(()=>{
    const check=()=>{ modeRef.current=document.body.classList.contains('contrib')?'contribute':'explore'; };
    const obs=new MutationObserver(check); obs.observe(document.body,{attributes:true,attributeFilter:['class']}); check();
    return()=>obs.disconnect();
  },[]);

  useEffect(()=>{ if(mapInst.current&&window.google) buildMarkers(); },[buildMarkers]);
  useEffect(()=>{ if(mapInst.current&&window.google) buildMetro();   },[buildMetro]);

  // Keep bubbleFnRef pointing at the latest buildAreaBubbles closure (pins/filters change)
  useEffect(()=>{ bubbleFnRef.current = buildAreaBubbles; },[buildAreaBubbles]);
  useEffect(()=>{ if(mapInst.current&&window.google) buildAreaBubbles(); },[buildAreaBubbles]);

  // Fly to
  useEffect(()=>{
    if(!flyTo||!mapInst.current) return;
    mapInst.current.panTo({lat:flyTo.lat, lng:flyTo.lng});
    mapInst.current.setZoom(flyTo.zoom||16);
  },[flyTo]);

  // Search highlight pulse marker
  useEffect(()=>{
    if(!searchHL||!mapInst.current||!window.google) return;
    // Clear previous
    if(searchMkr.current){ try{ searchMkr.current.map=null; }catch(e){} searchMkr.current=null; }
    const G=window.google.maps;
    const el=document.createElement('div');
    el.style.cssText='position:relative;width:20px;height:20px;';
    el.innerHTML=
      '<div style="position:absolute;left:50%;top:50%;width:20px;height:20px;border-radius:50%;background:rgba(37,99,235,.22);border:2.5px solid #2563eb;transform:translate(-50%,-50%);animation:srchPulse 1.1s ease-out infinite;"></div>'
      +'<div style="position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;background:#2563eb;transform:translate(-50%,-50%);"></div>';
    searchMkr.current=new G.marker.AdvancedMarkerElement({
      position:{lat:searchHL.lat,lng:searchHL.lng},
      content:el,zIndex:600,map:mapInst.current,
    });
    // Auto-clear after 4s
    const t=setTimeout(()=>{ try{ if(searchMkr.current) searchMkr.current.map=null; }catch(e){} searchMkr.current=null; },4000);
    return()=>{ clearTimeout(t); try{ if(searchMkr.current) searchMkr.current.map=null; }catch(e){} };
  },[searchHL]);

  return <div id="map-root" suppressHydrationWarning><div ref={divRef} style={{width:'100%',height:'100%'}} suppressHydrationWarning/></div>;
}
// ─── PinForm ──────────────────────────────────────────────────────────────────
function PinForm({ onSubmit, onClose, defaultMode='rent', prefLat, prefLng }) {
  const [mode,setMode]  = useState(defaultMode);
  const [saving,setSave]= useState(false);
  const [geo,setGeo]    = useState(!!prefLat);
  const [err,setErr]    = useState({});
  const [f,setF] = useState({
    useCustom:!!prefLat,pinLat:prefLat||null,pinLng:prefLng||null,
    areaId:'',customArea:'',propType:'Apartment / Flat',
    society:'',bhk:'2BHK',floor:'',sqft:'',
    rent:'',tenant:'Family',furnishing:'Semi-Furnished',
    price:'',psf:'',possession:'Ready to Move',builder:'Other',facing:'East',
    note:'',isAvail:false,availEmail:'',
  });

  useEffect(()=>{
    if(!prefLat||!prefLng) return;
    revGeo(prefLat,prefLng).then(n=>{setF(p=>({...p,customArea:n}));setGeo(false);});
  },[prefLat,prefLng]);

  const set=(k,v)=>{
    const u={...f,[k]:v};
    if(k==='sqft'&&u.price)  u.psf=u.sqft?Math.round(u.price/u.sqft):'';
    if(k==='price'&&u.sqft)  u.psf=u.sqft?Math.round(v/u.sqft):'';
    setF(u);setErr(e=>({...e,[k]:undefined}));
  };

  const isIndep=['Independent House','Builder Floor','Plot / Land'].includes(f.propType);

  const validate=()=>{
    const e={};
    if(!f.useCustom&&!f.areaId)               e.areaId='Select an area';
    if(f.useCustom&&!f.customArea.trim())      e.customArea='Enter locality name';
    if(!isIndep&&!f.society.trim())            e.society='Required';
    if(!f.sqft||+f.sqft<50)                   e.sqft='Min 50 sqft';
    if(mode==='rent'&&(!f.rent||+f.rent<1000)) e.rent='Min ₹1,000';
    if(mode==='buy'&&(!f.price||+f.price<1e5)) e.price='Min ₹1 Lakh';
    return e;
  };

  const submit=async()=>{
    const e=validate(); if(Object.keys(e).length){setErr(e);return;} setSave(true);
    let area_id='custom',area_name='',city='delhi';
    if(!f.useCustom){const a=aOf(f.areaId);area_id=a.id;area_name=a.name;city=a.city;}
    else area_name=f.customArea.trim();
    const body={mode,area_id,area_name,city,
      society:isIndep?(f.society.trim()||'Independent Property'):f.society.trim(),
      prop_type:f.propType,bhk:f.bhk,sqft:+f.sqft,floor:+f.floor||0,
      note:f.note.trim()||null,pin_lat:f.pinLat,pin_lng:f.pinLng,
      is_available:f.isAvail,contact_email:f.availEmail.trim()||null,
    };
    if(mode==='rent') Object.assign(body,{rent:+f.rent,tenant_type:f.tenant,furnishing:f.furnishing});
    else Object.assign(body,{price:+f.price,price_per_sqft:f.psf?+f.psf:null,possession:f.possession,builder:f.builder,facing:f.facing});
    try{
      const r=await fetch('/api/pins',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||`HTTP ${r.status}`);
      onSubmit(d.pin); onClose();
    }catch(ex){setErr({_s:ex.message});setSave(false);}
  };

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet su">
        <div className="handle"/>
        <div className="sh-head" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontWeight:700,fontSize:16}}>{prefLat?'📍 Pin this spot':'Add a pin'}</div><div style={{fontSize:11,color:'#aaa',marginTop:1}}>Anonymous · community data</div></div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:'50%',border:'1px solid #e0e0e0',background:'#fafafa',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>
        <div style={{display:'flex',padding:'10px 18px 0',gap:8}}>
          {[['rent','🏠 Rent','#e85d26'],['buy','🏢 Buy / Sale','#2563eb']].map(([m,l,c])=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'8px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',border:`2px solid ${mode===m?c:'#e8e8e0'}`,background:mode===m?`${c}0d`:'#fafafa',color:mode===m?c:'#999'}}>{l}</button>
          ))}
        </div>
        <div className="scroll" style={{padding:'12px 18px 36px',display:'flex',flexDirection:'column',gap:12}}>
          {err._s&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'9px 12px',fontSize:13,color:'#dc2626'}}>{err._s}</div>}

          {/* Location */}
          <div style={{background:'#fafafa',border:'1px solid #f0f0f0',borderRadius:10,padding:'11px 13px'}}>
            <div className="lbl" style={{marginBottom:7}}>Location</div>
            <div style={{display:'flex',gap:6,marginBottom:9}}>
              <button onClick={()=>set('useCustom',false)} style={{flex:1,padding:'7px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',border:`1.5px solid ${!f.useCustom?'#1a1a1a':'#e0e0e0'}`,background:!f.useCustom?'#1a1a1a':'#fff',color:!f.useCustom?'#fff':'#888'}}>Known area</button>
              <button onClick={()=>set('useCustom',true)}  style={{flex:1,padding:'7px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',border:`1.5px solid ${f.useCustom?'#1a1a1a':'#e0e0e0'}`,background:f.useCustom?'#1a1a1a':'#fff',color:f.useCustom?'#fff':'#888'}}>Map pin 📍</button>
            </div>
            {!f.useCustom?(
              <div>
                <select className="inp" style={{appearance:'none'}} value={f.areaId} onChange={e=>set('areaId',e.target.value)}>
                  <option value="">Select area…</option>
                  {Object.entries(CITIES).map(([ck,cv])=><optgroup key={ck} label={`─ ${cv.label}`}>{AREAS.filter(a=>a.city===ck).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>)}
                </select>
                {err.areaId&&<span style={{fontSize:11,color:'#dc2626',display:'block',marginTop:3}}>{err.areaId}</span>}
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                {geo&&<span style={{fontSize:12,color:'#aaa'}}>⏳ Detecting locality…</span>}
                <input className="inp" placeholder="Locality / area name *" value={f.customArea} onChange={e=>set('customArea',e.target.value)}/>
                {err.customArea&&<span style={{fontSize:11,color:'#dc2626'}}>{err.customArea}</span>}
                {f.pinLat
                  ?<span style={{fontSize:11,color:'#16a34a',display:'block',marginTop:2}}>✓ GPS coordinates captured · locality auto-detected — <strong>edit the name above if it looks wrong</strong></span>
                  :<span style={{fontSize:11,color:'#aaa',display:'block',marginTop:2}}>Close this → switch to Contribute mode → tap the exact spot on the map</span>
                }
              </div>
            )}
          </div>

          {/* Property type */}
          <div>
            <div className="lbl">Property Type</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:5}}>
              {PTYPES.map(t=><button key={t} onClick={()=>set('propType',t)} style={{padding:'6px 3px',borderRadius:7,fontSize:10.5,fontWeight:500,cursor:'pointer',border:`1.5px solid ${f.propType===t?'#e85d26':'#e8e8e0'}`,background:f.propType===t?'#fef3ee':'#fafafa',color:f.propType===t?'#e85d26':'#888',textAlign:'center',lineHeight:1.3}}>{t}</button>)}
            </div>
          </div>

          <div>
            <label className="lbl">{isIndep?'Address / Landmark (optional)':'Society / Building *'}</label>
            <input className="inp" placeholder={isIndep?'e.g. near Pillar 88, Gali 3':'e.g. DLF Aralias Tower A'} value={f.society} onChange={e=>set('society',e.target.value)}/>
            {err.society&&<span style={{fontSize:11,color:'#dc2626',display:'block',marginTop:3}}>{err.society}</span>}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9}}>
            <div><label className="lbl">BHK</label><select className="inp" style={{appearance:'none'}} value={f.bhk} onChange={e=>set('bhk',e.target.value)}>{BHK.map(b=><option key={b}>{b}</option>)}</select></div>
            <div><label className="lbl">Floor</label><input className="inp" type="number" placeholder="2" value={f.floor} onChange={e=>set('floor',e.target.value)}/></div>
            <div>
              <label className="lbl">Sqft *</label>
              <input className="inp" type="number" placeholder="950" value={f.sqft} onChange={e=>set('sqft',e.target.value)}/>
              {err.sqft&&<span style={{fontSize:11,color:'#dc2626',display:'block',marginTop:2}}>{err.sqft}</span>}
            </div>
          </div>

          {mode==='rent'&&<>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
              <div>
                <label className="lbl">Monthly Rent (₹) *</label>
                <input className="inp" type="number" placeholder="28000" value={f.rent} onChange={e=>set('rent',e.target.value)}/>
                {err.rent&&<span style={{fontSize:11,color:'#dc2626',display:'block',marginTop:2}}>{err.rent}</span>}
              </div>
              <div><label className="lbl">Tenant Type</label><select className="inp" style={{appearance:'none'}} value={f.tenant} onChange={e=>set('tenant',e.target.value)}>{TENANTS.map(t=><option key={t}>{t}</option>)}</select></div>
            </div>
            <div>
              <label className="lbl">Furnishing</label>
              <div style={{display:'flex',gap:6}}>{FURNISH.map(fo=><button key={fo} onClick={()=>set('furnishing',fo)} style={{flex:1,padding:'7px 3px',borderRadius:7,fontSize:11,fontWeight:500,cursor:'pointer',border:`1.5px solid ${f.furnishing===fo?'#e85d26':'#e0e0e0'}`,background:f.furnishing===fo?'#fef3ee':'#fafafa',color:f.furnishing===fo?'#e85d26':'#888'}}>{fo}</button>)}</div>
            </div>
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'12px 13px'}}>
              <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                <input type="checkbox" checked={f.isAvail} onChange={e=>set('isAvail',e.target.checked)} style={{width:16,height:16,accentColor:'#16a34a'}}/>
                <div><div style={{fontSize:13,fontWeight:600,color:'#166534'}}>✅ Flat is currently available for rent</div><div style={{fontSize:11,color:'#15803d',marginTop:2}}>Shows as bright "AVAIL" pin on map</div></div>
              </label>
              {f.isAvail&&<div style={{marginTop:10}}><label className="lbl">Contact email (private — only shared with matched renters)</label><input className="inp" type="email" placeholder="you@email.com" value={f.availEmail} onChange={e=>set('availEmail',e.target.value)}/></div>}
            </div>
          </>}

          {mode==='buy'&&<>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
              <div>
                <label className="lbl">Total Price (₹) *</label>
                <input className="inp" type="number" placeholder="9500000" value={f.price} onChange={e=>set('price',e.target.value)}/>
                {err.price&&<span style={{fontSize:11,color:'#dc2626',display:'block',marginTop:2}}>{err.price}</span>}
                {f.price>0&&<span style={{fontSize:11,color:'#2563eb',fontWeight:600,display:'block',marginTop:2}}>{fmtP(+f.price)}</span>}
              </div>
              <div><label className="lbl">₹/sqft (auto)</label><input className="inp" style={{color:'#2563eb',fontWeight:600}} readOnly value={f.psf?`₹${Number(f.psf).toLocaleString()}`:''}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              <div><label className="lbl">Status</label><select className="inp" style={{appearance:'none'}} value={f.possession} onChange={e=>set('possession',e.target.value)}>{POSS.map(o=><option key={o}>{o}</option>)}</select></div>
              <div><label className="lbl">Builder</label><select className="inp" style={{appearance:'none'}} value={f.builder} onChange={e=>set('builder',e.target.value)}>{BUILDERS.map(o=><option key={o}>{o}</option>)}</select></div>
              <div><label className="lbl">Facing</label><select className="inp" style={{appearance:'none'}} value={f.facing} onChange={e=>set('facing',e.target.value)}>{['East','West','North','South','Corner'].map(o=><option key={o}>{o}</option>)}</select></div>
            </div>
          </>}

          <div><label className="lbl">Note (optional)</label><input className="inp" placeholder="e.g. 5 min metro, parking included…" value={f.note} onChange={e=>set('note',e.target.value)}/></div>

          <button onClick={submit} disabled={saving} style={{width:'100%',padding:'13px',borderRadius:10,fontSize:14,fontWeight:700,cursor:saving?'wait':'pointer',border:'none',background:mode==='rent'?'#e85d26':'#2563eb',color:'#fff',opacity:saving?0.7:1,marginTop:4}}>
            {saving?'Saving…':`Submit ${mode==='rent'?'rent':'price'} pin`}
          </button>
          <div style={{textAlign:'center',fontSize:11,color:'#bbb'}}>No personal data stored publicly · 100% anonymous</div>
        </div>
      </div>
    </div>
  );
}

// ─── PinDetail ────────────────────────────────────────────────────────────────
function PinDetail({ pin, onClose, onUpvote, onFlyTo, onCalc }) {
  const [tab,setTab]         = useState('info');
  const [comments,setComs]   = useState([]);
  const [cBody,setCBody]     = useState('');
  const [cName,setCName]     = useState('');
  const [sending,setSending] = useState(false);
  const [repR,setRepR]       = useState('');
  const [reported,setReported]=useState(false);
  const area=aOfPin(pin);
  const isR=pin.mode==='rent';
  const col=isR?rCol(pin.rent):pCol(pin.price);
  const val=isR?`₹${pin.rent?.toLocaleString()}/mo`:fmtP(pin.price);

  useEffect(()=>{
    if(tab!=='comments') return;
    fetch(`/api/comments?pin_id=${pin.id}`).then(r=>r.json()).then(d=>setComs(d.comments||[])).catch(()=>{});
  },[tab,pin.id]);

  const postComment=async()=>{
    if(!cBody.trim()) return; setSending(true);
    try{ const r=await fetch('/api/comments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin_id:pin.id,body:cBody.trim(),author_label:cName.trim()||'Anonymous'})}); const d=await r.json(); if(r.ok){setComs(p=>[...p,d.comment]);setCBody('');setCName('');} }finally{setSending(false);}
  };

  const postReport=async()=>{
    if(!repR) return;
    try{ const r=await fetch('/api/reports',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin_id:pin.id,reason:repR})}); if(r.ok||r.status===409) setReported(true); }catch{}
  };

  const flyClose=()=>{
    const coords = pinCoords(pin);
    if(coords){
      // Zoom to 17 for exact GPS pins, 14 for area-centroid pins
      onFlyTo({ lat:coords.lat, lng:coords.lng, zoom:coords.exact?17:14, ts:Date.now() });
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <div className="overlay fi" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet su" style={{maxHeight:'82dvh'}}>
        <div className="handle"/>
        <div style={{padding:'6px 18px 0',flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <div style={{fontSize:30,fontWeight:800,color:col,fontFamily:'DM Mono,monospace',lineHeight:1}}>{val}</div>
              <div style={{fontSize:13,color:'#666',marginTop:3}}>{pin.society||area?.name||pin.area_name} · {pin.bhk}</div>
              <div style={{display:'flex',gap:5,marginTop:5,flexWrap:'wrap'}}>
                {pin.is_available&&<span style={{background:'#dcfce7',color:'#166534',border:'1px solid #86efac',padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700}}>✅ AVAILABLE</span>}
                <span style={{background:'#f1f5f9',color:'#475569',border:'1px solid #cbd5e1',padding:'2px 8px',borderRadius:99,fontSize:11}}>{area?.name||pin.area_name}</span>
                <span style={{background:'#f1f5f9',color:'#475569',border:'1px solid #cbd5e1',padding:'2px 8px',borderRadius:99,fontSize:11}}>{tAgo(pin.created_at)}</span>
              </div>
            </div>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:'50%',border:'1px solid #e0e0e0',background:'#fafafa',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>×</button>
          </div>
          <div style={{display:'flex',gap:0,borderBottom:'1px solid #f0f0f0'}}>
            {[['info','Details'],['comments',`Comments${comments.length?' ('+comments.length+')':''}`],['report','Report']].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 13px 9px',fontSize:12,fontWeight:600,cursor:'pointer',background:'none',border:'none',color:tab===t?'#1a1a1a':'#aaa',borderBottom:tab===t?'2px solid #1a1a1a':'2px solid transparent',marginBottom:-1}}>{l}</button>
            ))}
          </div>
        </div>

        <div className="scroll" style={{padding:'12px 18px 32px'}}>
          {tab==='info'&&<>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
              {[[pin.prop_type,'#e85d26'],[pin.bhk,'#888'],[pin.sqft&&`${pin.sqft?.toLocaleString()} sqft`,'#888'],[pin.floor>0&&`Floor ${pin.floor}`,'#888'],[isR&&pin.tenant_type,'#2563eb'],[isR&&pin.furnishing,'#888'],[!isR&&pin.possession,pin.possession==='Ready to Move'?'#16a34a':'#ca8a04'],[!isR&&pin.builder&&pin.builder!=='Individual Owner'&&pin.builder,'#7c3aed'],[!isR&&pin.facing&&`${pin.facing} facing`,'#888']].filter(([v])=>v).map(([v,c],i)=><span key={i} style={{fontSize:11,fontWeight:500,padding:'3px 9px',borderRadius:99,background:`${c}12`,color:c,border:`1px solid ${c}22`}}>{v}</span>)}
            </div>
            {pin.note&&<div style={{background:'#fafafa',borderRadius:10,padding:'11px 13px',fontSize:13,color:'#555',fontStyle:'italic',marginBottom:14,lineHeight:1.6}}>"{pin.note}"</div>}
            {!isR&&pin.price_per_sqft&&<div style={{background:'#eff6ff',borderRadius:10,padding:'12px 14px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,color:'#2563eb',fontWeight:600}}>Price per sqft</span><span style={{fontSize:20,fontWeight:800,color:'#2563eb',fontFamily:'DM Mono,monospace'}}>₹{pin.price_per_sqft.toLocaleString()}</span></div>}
            {isR&&pin.sqft&&pin.rent&&<div style={{background:'#f8fafc',borderRadius:10,padding:'12px 14px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,color:'#64748b',fontWeight:600}}>Rent per sqft</span><span style={{fontSize:16,fontWeight:700,color:'#64748b',fontFamily:'DM Mono,monospace'}}>₹{Math.round(pin.rent/pin.sqft)}/sqft</span></div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,marginBottom:12}}>
              <button onClick={flyClose} style={{padding:'10px',borderRadius:10,fontSize:12,fontWeight:600,cursor:'pointer',border:'1px solid #e0e0e0',background:'#fafafa',color:'#1a1a1a'}}>🗺 View on map</button>
              <button onClick={()=>onUpvote(pin.id)} style={{padding:'10px 12px',borderRadius:10,fontSize:12,fontWeight:600,cursor:'pointer',border:'1px solid #e0e0e0',background:'#fafafa',color:'#888'}}>👍 {pin.upvotes||0}</button>
              <a href={`https://wa.me/?text=${waText(pin)}`} target="_blank" rel="noreferrer" style={{padding:'10px',borderRadius:10,fontSize:12,fontWeight:700,background:'#25D366',color:'#fff',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>📤 Share</a>
            </div>
            {onCalc&&(
              <button onClick={()=>onCalc(pin)} style={{width:'100%',padding:'9px',borderRadius:10,fontSize:12,fontWeight:700,cursor:'pointer',border:'1.5px solid #7c3aed',background:'#f5f3ff',color:'#7c3aed',marginBottom:12}}>
                💰 Calculate true cost
              </button>
            )}
            {pin.is_available&&<div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'12px 13px',fontSize:13,color:'#166534',lineHeight:1.6}}>✅ <strong>This flat is available.</strong> Use the Share button to send via WhatsApp — the owner will see your interest.</div>}
          </>}

          {tab==='comments'&&<>
            {comments.length===0&&<div style={{textAlign:'center',padding:'24px 0',color:'#bbb',fontSize:13}}>No comments yet. Add yours below.</div>}
            {comments.map(c=><div key={c.id} style={{background:'#fafafa',borderRadius:9,padding:'10px 12px',marginBottom:9}}><div style={{fontSize:12,fontWeight:600,color:'#555',marginBottom:4}}>{c.author_label} <span style={{color:'#bbb',fontWeight:400}}>· {tAgo(c.created_at)}</span></div><div style={{fontSize:13,color:'#333',lineHeight:1.6}}>{c.body}</div></div>)}
            <div style={{borderTop:'1px solid #f0f0f0',paddingTop:14,marginTop:6,display:'flex',flexDirection:'column',gap:8}}>
              <input className="inp" placeholder="Your name (optional)" value={cName} onChange={e=>setCName(e.target.value)}/>
              <textarea className="inp" placeholder="Share your experience — building quality, landlord, area notes…" rows={3} style={{resize:'none',lineHeight:1.5}} value={cBody} onChange={e=>setCBody(e.target.value)}/>
              <button onClick={postComment} disabled={sending||!cBody.trim()} style={{width:'100%',padding:'10px',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background:'#1a1a1a',color:'#fff',opacity:sending||!cBody.trim()?.55:1}}>
                {sending?'Posting…':'Post Comment'}
              </button>
            </div>
          </>}

          {tab==='report'&&<>
            {reported?<div style={{textAlign:'center',padding:'32px 0'}}><div style={{fontSize:36,marginBottom:8}}>✅</div><div style={{fontWeight:600,fontSize:15,marginBottom:4}}>Report submitted</div><div style={{fontSize:13,color:'#aaa',lineHeight:1.6}}>3 reports = pin hidden from averages.</div></div>:<>
              <div style={{fontSize:13,color:'#888',marginBottom:14,lineHeight:1.6}}>Help keep data honest. If this pin looks wrong, tell us:</div>
              {REPORT_REASONS.map(r=><button key={r} onClick={()=>setRepR(r)} style={{display:'block',width:'100%',padding:'10px 12px',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',border:`1.5px solid ${repR===r?'#dc2626':'#e0e0e0'}`,background:repR===r?'#fef2f2':'#fafafa',color:repR===r?'#dc2626':'#555',textAlign:'left',marginBottom:7}}>{r}</button>)}
              <button onClick={postReport} disabled={!repR} style={{width:'100%',padding:'11px',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',background:repR?'#dc2626':'#e5e7eb',color:'#fff',marginTop:4}}>Submit Report</button>
            </>}
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── FilterFloat ──────────────────────────────────────────────────────────────
function FilterFloat({ filters, onChange, onClose, count }) {
  const [f,setF]=useState(filters);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const clear=()=>{const d={mode:'all',bhk:'all',city:'all',furnished:'all',minRent:'',maxRent:'',avail:false};setF(d);onChange(d);};
  const apply=()=>{onChange(f);onClose();};
  return (
    <div className="fi" style={{position:'fixed',inset:0,zIndex:850,background:'rgba(0,0,0,0.5)',touchAction:'none',display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={e=>{if(e.target===e.currentTarget){apply();onClose();}}}>
      <div className="filter-float su" onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,borderRadius:2,background:'#e0e0e0',margin:'10px auto 4px',flexShrink:0}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 18px 12px',borderBottom:'1px solid #f0f0f0',flexShrink:0}}>
          <div style={{fontWeight:700,fontSize:15}}>Filter pins</div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={clear} style={{fontSize:12,color:'#e85d26',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Clear</button>
            <button onClick={()=>{apply();}} style={{padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',border:'none',background:'#1a1a1a',color:'#fff'}}>Show {count}</button>
          </div>
        </div>
        <div className="scroll" style={{padding:'12px 18px 20px',display:'flex',flexDirection:'column',gap:14}}>
          <label style={{display:'flex',alignItems:'center',gap:10,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'10px 12px',cursor:'pointer'}}>
            <input type="checkbox" checked={f.avail} onChange={e=>set('avail',e.target.checked)} style={{width:16,height:16,accentColor:'#16a34a'}}/>
            <div><div style={{fontSize:13,fontWeight:600,color:'#166534'}}>✅ Available flats only</div><div style={{fontSize:11,color:'#15803d'}}>Currently listed for rent</div></div>
          </label>
          {[['Type',[['all','All'],['rent','Rent'],['buy','Buy']],'mode','#e85d26'],['City',[['all','All NCR'],...Object.entries(CITIES).map(([k,v])=>[k,v.label])],'city',null],['BHK',[['all','Any'],...BHK.map(b=>[b,b])],'bhk','#2563eb'],['Furnishing',[['all','Any'],['furnished','Furnished'],['unfurnished','Unfurnished']],'furnished','#7c3aed']].map(([label,opts,key,cc])=>(
            <div key={key}>
              <div className="lbl">{label}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {opts.map(([v,l])=>{ const c=cc||(key==='city'?CITIES[v]?.color:'#1a1a1a'); return <button key={v} onClick={()=>set(key,v)} style={{padding:'5px 11px',borderRadius:99,fontSize:12,fontWeight:600,cursor:'pointer',border:`1.5px solid ${f[key]===v?(c||'#1a1a1a'):'#e0e0e0'}`,background:f[key]===v?`${c||'#1a1a1a'}14`:'#fafafa',color:f[key]===v?(c||'#1a1a1a'):'#888'}}>{l}</button>; })}
              </div>
            </div>
          ))}
          <div>
            <div className="lbl">Rent Range (₹/month)</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <input type="number" className="inp" placeholder="Min" value={f.minRent} onChange={e=>set('minRent',e.target.value)}/>
              <input type="number" className="inp" placeholder="Max" value={f.maxRent} onChange={e=>set('maxRent',e.target.value)}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ExplorePanel ─────────────────────────────────────────────────────────────
function ExplorePanel({ pins, loading, filters, onPinClick, onFlyTo, onClose, isMobile }) {
  const [srch,setSrch] = useState('');
  const [view,setView] = useState('areas');
  const [sort,setSort] = useState('pins');
  const dark = false; // panel background is white in both desktop and mobile after UI pass

  const bg   = dark ? 'transparent'              : '#fff';
  const bd   = dark ? 'rgba(255,255,255,.06)'    : '#f5f5f5';
  const tc   = dark ? '#eee'                     : '#1a1a1a';
  const sc   = dark ? '#666'                     : '#888';
  const hov  = dark ? 'rgba(255,255,255,.04)'    : '#fafafa';
  const divL = dark ? 'rgba(255,255,255,.06)'    : '#f0f0f0';
  const inpBg= dark ? 'rgba(255,255,255,.07)'    : '#f5f5f5';
  const inpBd= dark ? 'rgba(255,255,255,.12)'    : '#e8e8e0';
  const inpC = dark ? '#eee'                     : '#1a1a1a';
  const togBg= dark ? 'rgba(255,255,255,.06)'    : '#f0f0f0';
  const togAc= dark ? 'rgba(255,255,255,.15)'    : '#fff';
  const togC = dark ? '#fff'                     : '#1a1a1a';
  const togIn= dark ? '#777'                     : '#999';
  const noD  = dark ? '#444'                     : '#bbb';

  const fP = pins.filter(p=>{
    if(filters.mode!=='all'&&p.mode!==filters.mode) return false;
    if(filters.bhk !=='all'&&p.bhk !==filters.bhk)  return false;
    if(filters.city!=='all'&&p.city!==filters.city)  return false;
    if(filters.avail&&!p.is_available)               return false;
    return true;
  });

  const areaRows = AREAS
    .filter(a=>(filters.city==='all'||a.city===filters.city)&&(!srch||a.name.toLowerCase().includes(srch.toLowerCase())))
    .map(a=>({...a,rp:fP.filter(p=>p.area_id===a.id&&p.mode==='rent'),bp:fP.filter(p=>p.area_id===a.id&&p.mode==='buy')}))
    .sort((a,b)=>{
      if(sort==='pins')    return (b.rp.length+b.bp.length)-(a.rp.length+a.bp.length);
      if(sort==='rent_lo') return avg(a.rp.map(p=>p.rent))-avg(b.rp.map(p=>p.rent));
      if(sort==='rent_hi') return avg(b.rp.map(p=>p.rent))-avg(a.rp.map(p=>p.rent));
      return avg(b.bp.map(p=>p.price_per_sqft||0))-avg(a.bp.map(p=>p.price_per_sqft||0));
    });

  const pinRows = fP
    .filter(p=>!srch
      ||(p.society||'').toLowerCase().includes(srch.toLowerCase())
      ||(aOf(p.area_id)?.name||'').toLowerCase().includes(srch.toLowerCase())
      ||(p.area_name||'').toLowerCase().includes(srch.toLowerCase())
    )
    .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
    .slice(0,200); // increased from 150

  const maxR = Math.max(...areaRows.map(a=>avg(a.rp.map(p=>p.rent))).filter(Boolean),1);

  const inner=(
    <>
      {/* Search + controls */}
      <div style={{padding:'12px 14px 10px',borderBottom:`1px solid ${divL}`,flexShrink:0}}>
        <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search area or society…"
          style={{width:'100%',padding:'9px 12px',border:`1px solid ${inpBd}`,borderRadius:9,fontSize:13,outline:'none',background:inpBg,color:inpC,marginBottom:10}}/>
        
        {/* Sort row */}
        <div style={{display:'flex',gap:6,marginBottom:10,alignItems:'center'}}>
          <span style={{fontSize:11,fontWeight:600,color:sc,textTransform:'uppercase',letterSpacing:'.04em',flexShrink:0}}>Sort</span>
          <div style={{display:'flex',gap:4,flex:1,flexWrap:'wrap'}}>
            {[['pins','Active'],['rent_lo','Rent ↑'],['rent_hi','Rent ↓'],['psft','₹/sqft']].map(([v,l])=>(
              <button key={v} onClick={()=>setSort(v)} style={{padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${sort===v?'#e85d26':'transparent'}`,background:sort===v?'#e85d2614':'transparent',color:sort===v?'#e85d26':sc,whiteSpace:'nowrap'}}>{l}</button>
            ))}
          </div>
        </div>

        {/* Area / All Pins toggle */}
        <div style={{display:'flex',gap:3,background:togBg,borderRadius:9,padding:3}}>
          {[['areas','By Area'],['list','All Pins']].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{flex:1,padding:'7px',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background:view===v?togAc:'transparent',color:view===v?togC:togIn,boxShadow:view===v?'0 1px 4px rgba(0,0,0,.1)':'none',transition:'all .12s'}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading&&<div style={{padding:'8px 14px 4px',fontSize:11,color:sc}}>
        {view==='areas'
          ? `${areaRows.filter(a=>a.rp.length+a.bp.length>0).length} areas · ${fP.filter(p=>AREAS.find(a=>a.id===p.area_id)).length} pins · ${fP.filter(p=>!AREAS.find(a=>a.id===p.area_id)).length} custom`
          : `${pinRows.length} of ${fP.length} pins`}
      </div>}

      {/* List */}
      <div className="scroll" style={{flex:1}}>
        {loading&&Array.from({length:8}).map((_,i)=><div key={i} className="pu" style={{margin:'6px 12px',height:56,borderRadius:10,background:bd}}/>)}

        {!loading&&view==='areas'&&(()=>{
          // Custom location pins (area_id='custom' or not in AREAS list)
          const customPins = fP.filter(p => !AREAS.find(a=>a.id===p.area_id) && (p.pin_lat||p.pin_lng));
          return <>
          {areaRows.length===0 && customPins.length===0
            ? <div style={{textAlign:'center',padding:'40px 20px'}}><div style={{fontSize:24,marginBottom:8}}>🔍</div><div style={{color:sc,fontSize:13}}>No areas match your search</div></div>
            : areaRows.map(area=>{
                const aR=avg(area.rp.map(p=>p.rent)), aB=avg(area.bp.map(p=>p.price));
                const total=area.rp.length+area.bp.length;
                const avail=area.rp.filter(p=>p.is_available).length;
                const cc=CITIES[area.city]?.color||'#e85d26';
                return (
                  <button key={area.id} onClick={()=>{onFlyTo({lat:area.lat,lng:area.lng,zoom:14,ts:Date.now()});if(isMobile)onClose();}}
                    style={{width:'100%',padding:'11px 14px',border:'none',borderBottom:`1px solid ${divL}`,background:bg,cursor:'pointer',textAlign:'left',transition:'background .1s',opacity:total===0?0.55:1}}
                    onMouseEnter={e=>e.currentTarget.style.background=hov} onMouseLeave={e=>e.currentTarget.style.background=bg}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:total>0?5:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:7}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:total===0?'#d1d5db':cc,flexShrink:0}}/>
                        <span style={{fontWeight:total===0?400:600,fontSize:14,color:tc}}>{area.name}</span>
                        {avail>0&&<span style={{fontSize:10,fontWeight:700,color:'#16a34a',background:'#dcfce7',padding:'2px 6px',borderRadius:99,border:'1px solid #86efac'}}>{avail} avail</span>}
                      </div>
                      <span style={{fontSize:11,color:sc,background:bd,padding:'2px 7px',borderRadius:99}}>{CITIES[area.city]?.label}</span>
                    </div>
                    {total>0&&<>
                      <div style={{height:3,background:'#f0f0f0',borderRadius:99,margin:'6px 0 5px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${(aR/maxR)*100}%`,background:rCol(aR),borderRadius:99,transition:'width .3s'}}/>
                      </div>
                      <div style={{display:'flex',gap:10,alignItems:'center'}}>
                        {aR>0&&<span style={{fontSize:13,color:rCol(aR),fontWeight:700,fontFamily:'DM Mono,monospace'}}>{fmtR(aR)}/mo</span>}
                        {aB>0&&<span style={{fontSize:13,color:pCol(aB),fontWeight:700,fontFamily:'DM Mono,monospace'}}>{fmtP(aB)}</span>}
                        <span style={{fontSize:11,color:sc,marginLeft:'auto'}}>{total} pin{total>1?'s':''}</span>
                      </div>
                    </>}
                    {total===0&&<div style={{fontSize:12,color:'#9ca3af',marginTop:2}}>No data yet</div>}
                  </button>
                );
              })
          }
          {/* Custom location pins — split into: has coords (on map) vs no coords (no location) */}
          {customPins.length>0&&(()=>{
            const onMap    = customPins.filter(p=>pinCoords(p));
            const noCoords = customPins.filter(p=>!pinCoords(p));
            return <>
              {onMap.length>0&&<>
                <div style={{padding:'10px 14px 4px',fontSize:10,fontWeight:700,color:sc,textTransform:'uppercase',letterSpacing:'.06em',background:dark?'rgba(255,255,255,.03)':'#f9f9f9',borderBottom:`1px solid ${divL}`}}>
                  📍 Custom locations ({onMap.length})
                </div>
                {onMap.map(pin=>{
                  const c=pin.mode==='rent'?rCol(pin.rent):pCol(pin.price);
                  const coords=pinCoords(pin);
                  return (
                    <div key={pin.id} onClick={()=>{onPinClick(pin);if(coords)onFlyTo({lat:coords.lat,lng:coords.lng,zoom:coords.exact?17:14,ts:Date.now()});if(isMobile)onClose();}}
                      style={{padding:'11px 14px',borderBottom:`1px solid ${divL}`,display:'flex',gap:12,alignItems:'center',cursor:'pointer',background:bg}}
                      onMouseEnter={e=>e.currentTarget.style.background=hov} onMouseLeave={e=>e.currentTarget.style.background=bg}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:c,flexShrink:0,boxShadow:`0 0 6px ${c}88`}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:tc}}>
                          {pin.is_available&&<span style={{fontSize:10,fontWeight:700,color:'#16a34a',background:'#dcfce7',padding:'1px 5px',borderRadius:99,marginRight:5}}>AVAIL</span>}
                          {pin.society||pin.area_name||'Custom location'}
                        </div>
                        <div style={{fontSize:11,color:sc,marginTop:2}}>{pin.bhk} · {pin.prop_type||'Property'} · {tAgo(pin.created_at)}</div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontFamily:'DM Mono,monospace',fontSize:13,fontWeight:700,color:c}}>{pin.mode==='rent'?`₹${pin.rent?.toLocaleString()}`:fmtP(pin.price)}</div>
                        <div style={{fontSize:10,color:sc}}>{pin.mode==='rent'?'/mo':''}</div>
                      </div>
                    </div>
                  );
                })}
              </>}
              {noCoords.length>0&&<>
                <div style={{padding:'10px 14px 4px',fontSize:10,fontWeight:700,color:'#ca8a04',textTransform:'uppercase',letterSpacing:'.06em',background:dark?'rgba(202,138,4,.06)':'#fefce8',borderBottom:`1px solid ${divL}`}}>
                  ⚠ No map location ({noCoords.length}) — tap to view details
                </div>
                {noCoords.map(pin=>{
                  const c=pin.mode==='rent'?rCol(pin.rent):pCol(pin.price);
                  return (
                    <div key={pin.id} onClick={()=>{onPinClick(pin);if(isMobile)onClose();}}
                      style={{padding:'11px 14px',borderBottom:`1px solid ${divL}`,display:'flex',gap:12,alignItems:'center',cursor:'pointer',background:dark?'rgba(202,138,4,.04)':'#fffbeb',opacity:0.85}}
                      onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.85'}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:'#ca8a04',flexShrink:0,border:'2px dashed #ca8a04',boxSizing:'border-box'}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:tc}}>
                          {pin.society||pin.area_name||'Custom location'}
                        </div>
                        <div style={{fontSize:11,color:'#ca8a04',marginTop:2}}>📍 No precise location — submitted before map-drop was available</div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontFamily:'DM Mono,monospace',fontSize:13,fontWeight:700,color:c}}>{pin.mode==='rent'?`₹${pin.rent?.toLocaleString()}`:fmtP(pin.price)}</div>
                        <div style={{fontSize:10,color:sc}}>{pin.mode==='rent'?'/mo':''}</div>
                      </div>
                    </div>
                  );
                })}
              </>}
            </>;
          })()}
          </>;
        })()}

        {!loading&&view==='list'&&(
          pinRows.length===0
            ? <div style={{textAlign:'center',padding:'40px 20px'}}><div style={{fontSize:24,marginBottom:8}}>📭</div><div style={{color:sc,fontSize:13}}>No pins yet</div></div>
            : pinRows.map(pin=>{
                const c=pin.mode==='rent'?rCol(pin.rent):pCol(pin.price);
                const coords=pinCoords(pin);
                const areaName=aOfPin(pin)?.name||pin.area_name||'Custom location';
                return (
                  <div key={pin.id} onClick={()=>{onPinClick(pin);if(coords)onFlyTo({lat:coords.lat,lng:coords.lng,zoom:coords.exact?17:14,ts:Date.now()});if(isMobile)onClose();}}
                    style={{padding:'11px 14px',borderBottom:`1px solid ${divL}`,display:'flex',gap:12,alignItems:'center',cursor:'pointer',background:bg,transition:'background .1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=hov} onMouseLeave={e=>e.currentTarget.style.background=bg}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:c,flexShrink:0,boxShadow:`0 0 6px ${c}88`}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:tc,display:'flex',alignItems:'center',gap:5}}>
                        {pin.is_available&&<span style={{fontSize:10,fontWeight:700,color:'#16a34a',background:'#dcfce7',padding:'1px 5px',borderRadius:99,flexShrink:0}}>AVAIL</span>}
                        <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{pin.society||pin.area_name}</span>
                      </div>
                      <div style={{fontSize:11,color:sc,marginTop:2,display:'flex',gap:6}}>
                        <span>{areaName}</span>
                        <span>·</span>
                        <span>{pin.bhk}</span>
                        {pin.prop_type&&pin.prop_type!=='Apartment / Flat'&&<><span>·</span><span>{pin.prop_type}</span></>}
                        <span>·</span>
                        <span>{tAgo(pin.created_at)}</span>
                      </div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontFamily:'DM Mono,monospace',fontSize:14,fontWeight:700,color:c}}>{pin.mode==='rent'?`₹${pin.rent?.toLocaleString()}`:fmtP(pin.price)}</div>
                      <div style={{fontSize:10,color:sc}}>{pin.mode==='rent'?'/mo':''}</div>
                    </div>
                  </div>
                );
              })
        )}
      </div>
    </>
  );

  if(isMobile){
    return (
      <div className="overlay fi" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
        <div className="sheet su" style={{maxHeight:'85dvh'}}>
          <div className="handle"/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 18px 8px',flexShrink:0}}>
            <div>
              <div style={{fontWeight:700,fontSize:17,color:'#1a1a1a'}}>Browse data</div>
              <div style={{fontSize:12,color:'#aaa',marginTop:1}}>{pins.length} pins across Delhi NCR</div>
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:'50%',border:'1px solid #e0e0e0',background:'#f5f5f5',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>{inner}</div>
        </div>
      </div>
    );
  }
  return <div className="side-panel si" style={{display:'flex',flexDirection:'column'}}>{inner}</div>;
}

// ─── Location Search ──────────────────────────────────────────────────────────
// Uses Google Places AutocompleteService (same key already loaded for the map).
// Falls back to local SEARCH_LOCS dataset if Places isn't ready or query fails.
function LocationSearch({ onSelect }) {
  const [q,setQ]           = useState('');
  const [results,setRes]   = useState([]);
  const [open,setOpen]     = useState(false);
  const [active,setActive] = useState(-1);
  const [loading,setLoad]  = useState(false);
  const inputRef  = useRef(null);
  const wrapRef   = useRef(null);
  const dummyRef  = useRef(null); // PlacesService needs a DOM node or Map instance
  const autoSvc   = useRef(null); // AutocompleteService singleton
  const detailSvc = useRef(null); // PlacesService singleton
  const debounce  = useRef(null);

  // Delhi NCR bounding box — biases autocomplete toward NCR without hard-blocking
  const NCR_BOUNDS = ()=>new window.google.maps.LatLngBounds(
    {lat:27.85, lng:76.80},  // SW: south of Faridabad / west of Gurgaon
    {lat:28.95, lng:77.80}   // NE: north of Rohini / east of Ghaziabad
  );

  const getAutoSvc=()=>{
    if(autoSvc.current) return autoSvc.current;
    if(window.google?.maps?.places){
      autoSvc.current=new window.google.maps.places.AutocompleteService();
    }
    return autoSvc.current;
  };

  const getDetailSvc=()=>{
    if(detailSvc.current) return detailSvc.current;
    if(window.google?.maps?.places && dummyRef.current){
      detailSvc.current=new window.google.maps.places.PlacesService(dummyRef.current);
    }
    return detailSvc.current;
  };

  // Local fallback — instant, no API call
  const localFallback=lq=>{
    const hits=SEARCH_LOCS.filter(l=>
      l.name.toLowerCase().includes(lq)||l.sub.toLowerCase().includes(lq)
    ).sort((a,b)=>{
      const as=a.name.toLowerCase().startsWith(lq), bs=b.name.toLowerCase().startsWith(lq);
      if(as&&!bs) return -1; if(bs&&!as) return 1;
      return a.name.localeCompare(b.name);
    }).slice(0,7);
    setRes(hits.map(h=>({...h,_local:true})));
    setOpen(hits.length>0);
    setActive(-1);
  };

  useEffect(()=>{
    const lq=q.trim().toLowerCase();
    if(!lq){ setRes([]); setOpen(false); setLoad(false); return; }

    clearTimeout(debounce.current);
    debounce.current=setTimeout(()=>{
      const svc=getAutoSvc();
      if(!svc){ localFallback(lq); return; }

      setLoad(true);
      svc.getPlacePredictions({
        input: q,
        bounds: NCR_BOUNDS(),
        componentRestrictions: { country:'in' },
      },(preds,status)=>{
        setLoad(false);
        const OK=window.google.maps.places.PlacesServiceStatus.OK;
        if(status===OK && preds?.length){
          setRes(preds.slice(0,7).map(p=>({
            place_id: p.place_id,
            name: p.structured_formatting?.main_text || p.description,
            sub:  p.structured_formatting?.secondary_text || '',
            type: 'place',
            _local: false,
          })));
          setOpen(true);
          setActive(-1);
        } else {
          // API returned nothing useful — fall back to local
          localFallback(lq);
        }
      });
    }, 220);
    return()=>clearTimeout(debounce.current);
  },[q]);

  // Close on outside click / tap
  useEffect(()=>{
    const fn=e=>{ if(wrapRef.current&&!wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',fn);
    document.addEventListener('touchstart',fn);
    return()=>{ document.removeEventListener('mousedown',fn); document.removeEventListener('touchstart',fn); };
  },[]);

  // Pick a local result (lat/lng already known)
  const pickLocal=r=>{
    onSelect({lat:r.lat, lng:r.lng, name:r.name, zoom:r.zoom||14});
    setQ(r.name); setOpen(false); setActive(-1); inputRef.current?.blur();
  };

  // Pick a Places result — need to fetch geometry via getDetails
  const pickPlace=r=>{
    const svc=getDetailSvc();
    if(!svc){ setQ(r.name); setOpen(false); return; }
    svc.getDetails({placeId:r.place_id, fields:['geometry','name']},(place,st)=>{
      const OK=window.google.maps.places.PlacesServiceStatus.OK;
      if(st===OK && place?.geometry?.location){
        const lat=place.geometry.location.lat();
        const lng=place.geometry.location.lng();
        onSelect({lat, lng, name:r.name, zoom:15});
      }
      setQ(r.name); setOpen(false); setActive(-1); inputRef.current?.blur();
    });
  };

  const pick=r=> r._local ? pickLocal(r) : pickPlace(r);

  const onKey=e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); setActive(a=>Math.min(a+1,results.length-1)); }
    if(e.key==='ArrowUp')  { e.preventDefault(); setActive(a=>Math.max(a-1,0)); }
    if(e.key==='Enter'&&active>=0){ e.preventDefault(); pick(results[active]); }
    if(e.key==='Escape')  { setOpen(false); inputRef.current?.blur(); }
  };

  const icon=t=>t==='metro'?'🚇':t==='airport'?'✈️':t==='landmark'?'🏛':'📍';

  return (
    <div id="loc-search-wrap" ref={wrapRef}>
      {/* Hidden div for PlacesService — never shown */}
      <div ref={dummyRef} style={{display:'none'}}/>
      <div style={{position:'relative'}}>
        <span className="loc-icon">🔍</span>
        <input id="loc-search-input" ref={inputRef}
          value={q}
          onChange={e=>{ setQ(e.target.value); setOpen(true); }}
          onKeyDown={onKey}
          onFocus={()=>{ if(results.length>0) setOpen(true); }}
          placeholder="Search area, society, landmark…"
          autoComplete="off"
        />
        {loading&&!q&&null}
        {loading&&<span style={{position:'absolute',right:q?28:10,top:'50%',transform:'translateY(-50%)',fontSize:12,color:'#9ca3af',pointerEvents:'none'}}>…</span>}
        {q&&<button className="loc-clear" onMouseDown={e=>{e.preventDefault();setQ('');setRes([]);setOpen(false);}}>×</button>}
      </div>
      {open&&(
        <div className="loc-drop">
          {results.length===0
            ? <div className="loc-empty">No results for "{q}"</div>
            : results.map((r,i)=>(
                <button key={r.place_id||i} className={'loc-item'+(i===active?' hi':'')}
                  onMouseDown={e=>{e.preventDefault();pick(r);}}
                  onMouseEnter={()=>setActive(i)}>
                  <span style={{fontSize:15,flexShrink:0}}>{icon(r.type)}</span>
                  <div style={{minWidth:0}}>
                    <div className="loc-item-name">{r.name}</div>
                    {r.sub&&<div className="loc-item-sub">{r.sub}</div>}
                  </div>
                </button>
              ))
          }
          {results.some(r=>!r._local)&&(
            <div style={{padding:'4px 10px 5px',fontSize:10,color:'#d1d5db',textAlign:'right',borderTop:'1px solid #f3f4f6'}}>
              Powered by Google
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Onboarding Modal (first visit only) ─────────────────────────────────────
function OnboardingModal({ onClose, onContribute }) {
  return (
    <div className="fi" style={{position:'fixed',inset:0,zIndex:900,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div className="su" style={{background:'#fff',borderRadius:20,maxWidth:440,width:'100%',overflow:'hidden',boxShadow:'0 24px 60px rgba(0,0,0,.25)'}}>
        {/* Header */}
        <div style={{background:'#0f172a',padding:'28px 24px 22px',textAlign:'center'}}>
          <div style={{fontSize:26,marginBottom:8}}>🏙</div>
          <div style={{color:'#fff',fontWeight:800,fontSize:20,letterSpacing:'-.3px',marginBottom:6}}>NCR Realty</div>
          <div style={{color:'#94a3b8',fontSize:13.5,lineHeight:1.6}}>Real rents &amp; prices from people who actually live there.<br/>No brokers. No inflated listings.</div>
        </div>
        {/* Feature grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'18px 18px 6px'}}>
          {[
            ['🏠','Real rents','See what neighbours actually pay per month'],
            ['🏢','Buy prices','Community sale data with ₹/sqft breakdown'],
            ['✅','Flats available','Find available flats right now, no broker'],
            ['🤝','Flat Hunt','Broker-free seeker–owner matching within 3km'],
          ].map(([icon,title,desc])=>(
            <div key={title} style={{background:'#f8fafc',borderRadius:12,padding:'13px 12px',border:'1px solid #e2e8f0'}}>
              <div style={{fontSize:20,marginBottom:6}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:12.5,color:'#111',marginBottom:3}}>{title}</div>
              <div style={{fontSize:11.5,color:'#64748b',lineHeight:1.5}}>{desc}</div>
            </div>
          ))}
        </div>
        {/* Trust note */}
        <div style={{margin:'10px 18px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'9px 12px',fontSize:12,color:'#166534',display:'flex',gap:7,alignItems:'center'}}>
          <span>🔒</span>
          <span><strong>100% anonymous.</strong> No login needed. Your data is never sold or shown publicly.</span>
        </div>
        {/* CTAs */}
        <div style={{padding:'12px 18px 22px',display:'flex',flexDirection:'column',gap:8}}>
          <button onClick={onClose} style={{width:'100%',padding:'13px',borderRadius:11,border:'none',background:'#0f172a',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>
            Explore the map →
          </button>
          <button onClick={()=>{onClose();onContribute();}} style={{width:'100%',padding:'11px',borderRadius:11,border:'1.5px solid #e2e8f0',background:'#fff',color:'#374151',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            Add rent data
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── How To Use ───────────────────────────────────────────────────────────────
function HowToUse({ onClose }) {
  return (
    <div className="overlay fi" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet su" style={{maxHeight:'85dvh'}}>
        <div className="handle"/>
        <div className="sh-head" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700,fontSize:17}}>How to use NCR Realty</div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:'50%',border:'1px solid #e0e0e0',background:'#fafafa',cursor:'pointer',fontSize:15,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>
        <div className="scroll" style={{padding:'14px 18px 36px',display:'flex',flexDirection:'column',gap:16}}>
          {[['🗺','What you see','Every bubble = real rent/price pinned by someone who lives there. Solid = society/apt, dashed = independent house, filled bright = available NOW.'],['🔍','Explore mode','Browse freely. Tap any bubble for details. Use "Browse" to search areas or scroll all pins.'],['📍','Contribute mode','Tap map cursor changes to crosshair. Tap any spot to drop a pin at that exact location with GPS precision.'],['✅','Available listings','Tick "available" when submitting — your pin turns bright green. Others can contact you via WhatsApp share.'],['💬','Comments','Tap any pin → Comments tab → share your experience (building quality, landlord, water, parking).'],['⚠️','Reports','Tap any pin → Report → flag fake prices. 3 reports auto-hides from averages.'],['📤','Share','Every pin has a WhatsApp share button. Spread honest data in your society group.'],['🚇','Metro lines','Toggle Metro button to see all 9 Delhi NCR metro lines + airports on the map.']].map(([e,t,d])=>(
            <div key={t} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
              <div style={{width:36,height:36,borderRadius:10,background:'#f5f4f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{e}</div>
              <div><div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{t}</div><div style={{fontSize:12,color:'#888',lineHeight:1.6}}>{d}</div></div>
            </div>
          ))}
          <div style={{background:'#fef3ee',borderRadius:10,padding:'12px 14px',fontSize:12,color:'#c45319',lineHeight:1.6}}>🔒 <strong>100% anonymous.</strong> No login needed. Your email (if given for available listing) is never shown publicly.</div>
          <button onClick={onClose} style={{width:'100%',padding:'12px',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',border:'none',background:'#1a1a1a',color:'#fff'}}>Got it, let's explore →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Flat Hunt ────────────────────────────────────────────────────────────────
function FlatHuntSheet({ onClose, onRequestMapDrop, pendingCoords, pendingAreaName }) {
  const [step,setStep]     = useState('choice');
  const [mode,setMode]     = useState('');
  const [saving,setSaving] = useState(false);
  const [err,setErr]       = useState('');
  const [f,setF] = useState({bhk:'2BHK',budget:'',timeline:'ASAP',gender:'Any',smoking:'No preference',food:'Any',email:'',phone:'',note:''});
  const set=(k,v)=>{setF(p=>({...p,[k]:v}));setErr('');};
  const locSet = !!(pendingCoords);

  const submit=async()=>{
    setErr('');
    // Validate
    if(!f.email.trim()||!/\S+@\S+\.\S+/.test(f.email)){ setErr('Please enter a valid email address.'); return; }
    if(!f.budget||+f.budget<1000){ setErr('Please enter your budget (min ₹1,000).'); return; }
    if(!locSet){ setErr('Please drop a pin on the map first — tap "Tap map to drop location pin" above.'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/flat-hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role:         mode,
          lat:          pendingCoords.lat,
          lng:          pendingCoords.lng,
          area_name:    pendingAreaName || 'Delhi NCR',
          bhk:          f.bhk,
          budget:       +f.budget,
          timeline:     f.timeline,
          gender_pref:  f.gender,
          smoking_pref: f.smoking,
          food_pref:    f.food,
          email:        f.email.trim(),
          phone:        f.phone.trim() || null,
          note:         f.note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setStep('done');
    } catch(ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay fi" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet su">
        <div className="handle"/>
        <div className="sh-head" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700,fontSize:17}}>🏠 Flat Hunt</div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:'50%',border:'1px solid #e0e0e0',background:'#fafafa',cursor:'pointer',fontSize:15,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>
        <div className="scroll" style={{padding:'14px 18px 36px'}}>
          {step==='choice'&&<>
            <p style={{fontSize:13,color:'#888',marginBottom:18,lineHeight:1.6}}>Connect with landlords and tenants across Delhi NCR — no brokers, zero commission.</p>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:18}}>
              {[['seeker','🔍 I need a flat','Find a flat or room. Set your budget and preferences. Drop a pin where you want to live.'],['owner','🔑 I have a flat','List your flat. Drop a pin at its exact location. Get matched with compatible seekers.']].map(([m,t,d])=>(
                <button key={m} onClick={()=>{setMode(m);setStep('form');}} style={{padding:'14px 16px',borderRadius:12,border:'1.5px solid #e0e0e0',background:'#fafafa',cursor:'pointer',textAlign:'left'}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{t}</div>
                  <div style={{fontSize:12,color:'#888',lineHeight:1.5}}>{d}</div>
                </button>
              ))}
            </div>
            <div style={{background:'#fafafa',borderRadius:10,padding:'12px',fontSize:12,color:'#888',lineHeight:1.7}}>
              🤝 <strong style={{color:'#1a1a1a'}}>How matching works:</strong> We compare pins within 3km on budget, BHK, and preferences. When a match is found, both sides get each other's email + phone in a single email. Never shown publicly.
            </div>
          </>}

          {step==='form'&&<>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{mode==='seeker'?'🔍 Looking for a flat':'🔑 My flat details'}</div>
            <div style={{fontSize:12,color:'#aaa',marginBottom:14}}>{mode==='seeker'?"Tell us what you want — we'll find matches near your pin":"Tell us about your flat — we'll find matching seekers"}</div>

            {/* Map drop card — the key feature */}
            <div style={{background:locSet?'#f0fdf4':'#fafafa',border:`1.5px solid ${locSet?'#86efac':'#e0e0e0'}`,borderRadius:12,padding:'13px 14px',marginBottom:14}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:6,color:locSet?'#166534':'#1a1a1a'}}>
                {locSet?`✅ Location set — ${pendingAreaName||'GPS captured'}`:mode==='seeker'?'📍 Where do you want to live?':'📍 Where is your flat?'}
              </div>
              {locSet
                ?<div style={{fontSize:12,color:'#15803d'}}>Coordinates: {pendingCoords.lat.toFixed(4)}, {pendingCoords.lng.toFixed(4)}. We match within 3km of this point.</div>
                :<>
                  <div style={{fontSize:12,color:'#888',marginBottom:10,lineHeight:1.6}}>{mode==='seeker'?"Drop a pin where you want to live — we'll show you matches nearby.":"Drop a pin at your flat's address — seekers near you will be matched."}</div>
                  <button onClick={()=>{onRequestMapDrop();onClose();}} style={{width:'100%',padding:'10px',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',background:'#1a1a1a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                    🗺 Tap map to drop location pin
                  </button>
                </>
              }
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label className="lbl">Budget (₹/month) *</label><input className="inp" type="number" placeholder="25000" value={f.budget} onChange={e=>set('budget',e.target.value)}/></div>
              <div>
                <label className="lbl">BHK preference</label>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {['1RK','1BHK','2BHK','3BHK','Any'].map(b=><button key={b} onClick={()=>set('bhk',b)} style={{padding:'6px 12px',borderRadius:99,fontSize:12,fontWeight:600,cursor:'pointer',border:`1.5px solid ${f.bhk===b?'#1a1a1a':'#e0e0e0'}`,background:f.bhk===b?'#1a1a1a':'#fafafa',color:f.bhk===b?'#fff':'#888'}}>{b}</button>)}
                </div>
              </div>
              <div>
                <label className="lbl">Move-in timeline</label>
                <div style={{display:'flex',gap:5}}>
                  {['ASAP','Next month','Flexible'].map(t=><button key={t} onClick={()=>set('timeline',t)} style={{flex:1,padding:'7px',borderRadius:8,fontSize:12,fontWeight:500,cursor:'pointer',border:`1.5px solid ${f.timeline===t?'#e85d26':'#e0e0e0'}`,background:f.timeline===t?'#fef3ee':'#fafafa',color:f.timeline===t?'#e85d26':'#888'}}>{t}</button>)}
                </div>
              </div>
              <div>
                <label className="lbl">Flatmate gender preference</label>
                <div style={{display:'flex',gap:5}}>
                  {['Male','Female','Any'].map(g=><button key={g} onClick={()=>set('gender',g)} style={{flex:1,padding:'7px',borderRadius:8,fontSize:12,fontWeight:500,cursor:'pointer',border:`1.5px solid ${f.gender===g?'#7c3aed':'#e0e0e0'}`,background:f.gender===g?'#f5f3ff':'#fafafa',color:f.gender===g?'#7c3aed':'#888'}}>{g}</button>)}
                </div>
              </div>
              <div>
                <label className="lbl">Smoking preference</label>
                <div style={{display:'flex',gap:5}}>
                  {['No smoking','Okay with smoking','No preference'].map(s=><button key={s} onClick={()=>set('smoking',s)} style={{flex:1,padding:'6px 4px',borderRadius:7,fontSize:11,fontWeight:500,cursor:'pointer',border:`1.5px solid ${f.smoking===s?'#16a34a':'#e0e0e0'}`,background:f.smoking===s?'#f0fdf4':'#fafafa',color:f.smoking===s?'#16a34a':'#888',lineHeight:1.3}}>{s}</button>)}
                </div>
              </div>
              <div><label className="lbl">Email * <span style={{color:'#bbb',fontWeight:400,fontSize:10}}>(private — shared only with your match)</span></label><input className="inp" type="email" placeholder="you@email.com" value={f.email} onChange={e=>set('email',e.target.value)}/></div>
              <div><label className="lbl">Phone (helps faster matching)</label><input className="inp" type="tel" placeholder="+91 98765 43210" value={f.phone} onChange={e=>set('phone',e.target.value)}/></div>
              <div><label className="lbl">About you / flat (optional)</label><textarea className="inp" rows={3} style={{resize:'none'}} placeholder={mode==='seeker'?'Work from home, vegetarian, no parties…':'2BHK, semi-furnished, parking available…'} value={f.note} onChange={e=>set('note',e.target.value)}/></div>
            </div>
            {err&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 13px',fontSize:13,color:'#dc2626',marginTop:12,lineHeight:1.5}}>{err}</div>}
            <button onClick={submit} disabled={saving} style={{width:'100%',padding:'13px',borderRadius:10,fontSize:14,fontWeight:700,cursor:saving?'wait':'pointer',border:'none',background:'#1a1a1a',color:'#fff',marginTop:12,opacity:saving?0.7:1}}>
              {saving?'⏳ Saving your pin…':mode==='seeker'?'🔍 Find me a flat →':'🔑 List my flat →'}
            </button>
            <button onClick={()=>setStep('choice')} style={{width:'100%',padding:'10px',borderRadius:10,fontSize:13,cursor:'pointer',border:'1px solid #e0e0e0',background:'#fff',color:'#888',marginTop:8}}>← Back</button>
          </>}

          {step==='done'&&<div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:42,marginBottom:12}}>🎉</div>
            <div style={{fontWeight:700,fontSize:18,marginBottom:8}}>You're in the pool!</div>
            <div style={{fontSize:13,color:'#888',lineHeight:1.7,marginBottom:24}}>We scan for matches within 3km daily. When found, both sides get an email with each other's contact. No broker, no commission, ever.</div>
            <a href={`https://wa.me/?text=${encodeURIComponent('🏠 Found a great free tool for Delhi NCR flat hunting — real rent data & broker-free matching. Check it out: ncrrealty.in')}`} target="_blank" rel="noreferrer" style={{display:'block',width:'100%',padding:'12px',borderRadius:10,fontSize:14,fontWeight:700,background:'#25D366',color:'#fff',textDecoration:'none',marginBottom:8,textAlign:'center'}}>
              📤 Share on WhatsApp
            </a>
            <button onClick={onClose} style={{width:'100%',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,border:'1px solid #e0e0e0',background:'#fff',color:'#888',cursor:'pointer'}}>Close</button>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ─── Budget Wizard ────────────────────────────────────────────────────────────
function BudgetWizard({ pins, onClose, onFlyTo, onApplyFilters }) {
  const [step, setStep]     = useState(0); // 0=intent, 1=prefs, 2=results
  const [intent, setIntent] = useState('rent');
  const [budget, setBudget] = useState('');
  const [bhk, setBhk]       = useState('any');
  const [wantMetro, setWM]  = useState('any');
  const [tenantType, setTT] = useState('any');
  const [furnished, setFurn]= useState('any');
  const [results, setRes]   = useState([]);

  const RENT_BUDGETS = [['10K',10000],['15K',15000],['20K',20000],['30K',30000],['40K',40000],['60K',60000],['80K',80000],['1L+',100000]];
  const BUY_BUDGETS  = [['30L',3e6],['50L',5e6],['75L',7.5e6],['1Cr',1e7],['1.5Cr',1.5e7],['2Cr',2e7],['3Cr',3e7],['5Cr+',5e7]];
  const budgetPresets = intent==='rent' ? RENT_BUDGETS : BUY_BUDGETS;

  const compute = () => {
    const prefs = { intent, budget:+budget||0, bhk, wantMetro, tenantType, furnished };
    const scored = AREAS
      .map(area => scoreAreaWizard(area, pins, prefs))
      .filter(Boolean)
      .sort((a,b) => b.score - a.score)
      .slice(0, 8);
    setRes(scored);
    setStep(2);
  };

  const selectPreset = (val) => {
    // toggle off if same
    setBudget(prev => prev===String(val)?'':String(val));
  };

  const Chip = ({label, active, onClick, color}) => (
    <button onClick={onClick} style={{
      padding:'6px 13px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer',
      border:`1.5px solid ${active?(color||'#111'):'#e5e7eb'}`,
      background:active?(color?color+'15':'#f0f0f0'):'#fff',
      color:active?(color||'#111'):'#6b7280',
    }}>{label}</button>
  );

  const closeBtn = (
    <button onClick={onClose} style={{width:30,height:30,borderRadius:'50%',border:'1.5px solid #e5e7eb',background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>×</button>
  );

  return (
    <div className="overlay fi" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet su" style={{maxHeight:'90dvh'}}>
        <div className="handle"/>

        {/* ── Step 0: Intent ── */}
        {step===0&&(
          <>
            <div className="sh-head" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:800,fontSize:17,color:'#111'}}>🎯 Best Areas for You</div>
                <div style={{fontSize:12,color:'#9ca3af',marginTop:2}}>Rank areas by your budget & preferences</div>
              </div>
              {closeBtn}
            </div>
            <div className="scroll" style={{padding:'24px 20px 36px'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:12}}>What are you looking for?</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[['rent','🏠 Renting a flat','Find areas where monthly rents fit your budget'],
                  ['buy', '🏢 Buying property','Find areas with buy prices in your range']].map(([v,title,desc])=>(
                  <button key={v} onClick={()=>{setIntent(v);setStep(1);}} style={{
                    padding:'16px 18px', borderRadius:13, border:`2px solid ${intent===v?'#111':'#e5e7eb'}`,
                    background:intent===v?'#f9fafb':'#fff', cursor:'pointer', textAlign:'left',
                  }}>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:3,color:'#111'}}>{title}</div>
                    <div style={{fontSize:12,color:'#6b7280',lineHeight:1.5}}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Step 1: Preferences ── */}
        {step===1&&(
          <>
            <div className="sh-head" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:9}}>
                <button onClick={()=>setStep(0)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:'#6b7280',padding:'2px 4px'}}>←</button>
                <div>
                  <div style={{fontWeight:800,fontSize:16,color:'#111'}}>{intent==='rent'?'🏠 Rent Preferences':'🏢 Buy Preferences'}</div>
                  <div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>Set your filters to find matching areas</div>
                </div>
              </div>
              {closeBtn}
            </div>
            <div className="scroll" style={{padding:'18px 20px 36px',display:'flex',flexDirection:'column',gap:18}}>

              {/* Budget */}
              <div>
                <div className="lbl" style={{marginBottom:8}}>
                  {intent==='rent'?'Max Monthly Rent':'Budget (Total Price)'}
                </div>
                <div style={{position:'relative',marginBottom:10}}>
                  <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'#9ca3af',fontFamily:'DM Mono,monospace'}}>₹</span>
                  <input type="number" className="inp" style={{paddingLeft:26}}
                    placeholder={intent==='rent'?'e.g. 30000':'e.g. 7500000'}
                    value={budget} onChange={e=>setBudget(e.target.value)}/>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {budgetPresets.map(([label,val])=>(
                    <Chip key={label} label={label} active={budget===String(val)} onClick={()=>selectPreset(val)}/>
                  ))}
                </div>
              </div>

              {/* BHK — rent only */}
              {intent==='rent'&&(
                <div>
                  <div className="lbl">BHK Preference</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {[['any','Any'],...BHK.map(b=>[b,b])].map(([v,l])=>(
                      <Chip key={v} label={l} active={bhk===v} onClick={()=>setBhk(v)} color="#e85d26"/>
                    ))}
                  </div>
                </div>
              )}

              {/* Metro proximity */}
              <div>
                <div className="lbl">Metro proximity</div>
                <div style={{display:'flex',gap:6}}>
                  {[['any','No preference'],['yes','Near metro'],['no','Not important']].map(([v,l])=>(
                    <Chip key={v} label={l} active={wantMetro===v} onClick={()=>setWM(v)} color="#7c3aed"/>
                  ))}
                </div>
              </div>

              {/* Tenant type — rent only */}
              {intent==='rent'&&(
                <div>
                  <div className="lbl">Looking as</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {[['any','Any'],...TENANTS.map(t=>[t,t])].map(([v,l])=>(
                      <Chip key={v} label={l} active={tenantType===v} onClick={()=>setTT(v)}/>
                    ))}
                  </div>
                </div>
              )}

              {/* Furnishing — rent only */}
              {intent==='rent'&&(
                <div>
                  <div className="lbl">Furnishing</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {[['any','Any'],...FURNISH.map(f=>[f,f])].map(([v,l])=>(
                      <Chip key={v} label={l} active={furnished===v} onClick={()=>setFurn(v)} color="#ca8a04"/>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={compute} style={{
                width:'100%',padding:'14px',borderRadius:11,border:'none',
                background:'#111',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:4,
              }}>
                Find best areas →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Results ── */}
        {step===2&&(
          <>
            <div className="sh-head" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:9}}>
                <button onClick={()=>setStep(1)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:'#6b7280',padding:'2px 4px'}}>←</button>
                <div>
                  <div style={{fontWeight:800,fontSize:16,color:'#111'}}>
                    {results.length ? `${results.length} areas match` : 'No matches found'}
                  </div>
                  <div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>
                    {budget ? `Budget: ${intent==='rent'?fmtR(+budget):fmtP(+budget)}` : 'All budgets'}
                    {bhk!=='any'&&intent==='rent'? ` · ${bhk}`:''}
                    {wantMetro==='yes'?' · Near metro':''}
                  </div>
                </div>
              </div>
              {closeBtn}
            </div>
            <div className="scroll" style={{padding:'8px 14px 36px'}}>

              {results.length===0&&(
                <div style={{textAlign:'center',padding:'40px 20px'}}>
                  <div style={{fontSize:32,marginBottom:12}}>🔍</div>
                  <div style={{fontWeight:700,fontSize:15,color:'#111',marginBottom:8}}>No data for these filters yet</div>
                  <div style={{fontSize:13,color:'#6b7280',lineHeight:1.7,marginBottom:20}}>Not enough community pins in this price range yet. Be the first to add data!</div>
                  <button onClick={()=>setStep(1)} style={{padding:'10px 20px',borderRadius:10,border:'1.5px solid #e5e7eb',background:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>← Adjust filters</button>
                </div>
              )}

              {results.map((r,i)=>{
                const cityLabel = CITIES[r.area.city]?.label||r.area.city;
                const isRent = intent==='rent';
                const valColor = isRent?rCol(r.avgVal):pCol(r.avgVal);
                return (
                  <div key={r.area.id} style={{
                    background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:14,
                    padding:'14px 14px 12px', marginBottom:10,
                    boxShadow:'0 1px 6px rgba(0,0,0,.06)',
                  }}>
                    {/* Header row */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                          <span style={{fontWeight:800,fontSize:15,color:'#111'}}>{r.area.name}</span>
                          <span style={{fontSize:10,color:'#9ca3af',background:'#f3f4f6',padding:'1px 6px',borderRadius:99,flexShrink:0}}>{cityLabel}</span>
                          {i===0&&<span style={{fontSize:10,fontWeight:700,color:'#166534',background:'#dcfce7',padding:'1px 7px',borderRadius:99,flexShrink:0}}>Top pick</span>}
                        </div>
                        {/* Why recommended */}
                        <div style={{fontSize:11.5,color:'#6b7280',lineHeight:1.5}}>{r.reasons.slice(0,2).join(' · ')}</div>
                      </div>
                      {/* Affordability label */}
                      {r.label&&(
                        <span style={{fontSize:10,fontWeight:700,color:r.labelColor,background:r.labelColor+'15',border:`1px solid ${r.labelColor}33`,padding:'3px 8px',borderRadius:99,flexShrink:0,marginLeft:8}}>
                          {r.label}
                        </span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div style={{display:'flex',gap:14,marginBottom:10,flexWrap:'wrap'}}>
                      <div>
                        <div style={{fontSize:10,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:'.04em'}}>Avg {isRent?'rent':'price'}</div>
                        <div style={{fontFamily:'DM Mono,monospace',fontSize:16,fontWeight:800,color:valColor,marginTop:1}}>
                          {isRent?fmtR(r.avgVal):fmtP(r.avgVal)}{isRent?'/mo':''}
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:'.04em'}}>Data points</div>
                        <div style={{fontSize:14,fontWeight:700,color:'#374151',marginTop:1}}>{r.pinCount} pin{r.pinCount>1?'s':''}</div>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:'.04em'}}>Metro</div>
                        <div style={{fontSize:14,fontWeight:700,color:r.metroKm<2?'#7c3aed':'#374151',marginTop:1}}>
                          {r.metroKm<1?'<1km':`${r.metroKm}km`}
                        </div>
                      </div>
                      {r.availCount>0&&(
                        <div>
                          <div style={{fontSize:10,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:'.04em'}}>Available</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#16a34a',marginTop:1}}>{r.availCount} now</div>
                        </div>
                      )}
                    </div>

                    {/* BHK row if rent */}
                    {isRent&&r.bhksPresent.length>0&&(
                      <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
                        {r.bhksPresent.map(b=>(
                          <span key={b} style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:99,background:bhk===b?'#e85d2615':'#f3f4f6',color:bhk===b?'#e85d26':'#6b7280',border:`1px solid ${bhk===b?'#e85d2633':'#e5e7eb'}`}}>{b}</span>
                        ))}
                      </div>
                    )}

                    {/* CTAs */}
                    <div style={{display:'flex',gap:7}}>
                      <button onClick={()=>{
                        onFlyTo({lat:r.area.lat,lng:r.area.lng,zoom:14,ts:Date.now()});
                        onClose();
                      }} style={{flex:1,padding:'8px',borderRadius:9,border:'1.5px solid #e5e7eb',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151'}}>
                        🗺 View on map
                      </button>
                      <a href={`/area/${r.area.id}`} style={{flex:1,padding:'8px',borderRadius:9,border:'none',background:'#111',cursor:'pointer',fontSize:12,fontWeight:600,color:'#fff',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        Explore area →
                      </a>
                      {r.availCount>0&&(
                        <button onClick={()=>{
                          onApplyFilters({mode:'rent',bhk:'all',city:r.area.city,furnished:'all',minRent:'',maxRent:'',avail:true});
                          onFlyTo({lat:r.area.lat,lng:r.area.lng,zoom:14,ts:Date.now()});
                          onClose();
                        }} style={{padding:'8px',borderRadius:9,border:'1.5px solid #16a34a',background:'#f0fdf4',cursor:'pointer',fontSize:11,fontWeight:700,color:'#16a34a',flexShrink:0}}>
                          ✅ {r.availCount}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {results.length>0&&(
                <div style={{textAlign:'center',padding:'8px 0 4px'}}>
                  <button onClick={()=>setStep(1)} style={{fontSize:12,color:'#6b7280',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>
                    Adjust filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Hidden Cost Calculator ───────────────────────────────────────────────────
function HiddenCostCalc({ onClose, prefillPin }) {
  const initMode = prefillPin?.mode || 'rent';
  const [mode, setMode] = useState(initMode);

  // ── Rent inputs ──────────────────────────────────────────────────────────
  const [rent,      setRent]  = useState(prefillPin?.mode==='rent' ? String(prefillPin.rent||'')  : '');
  const [deposit,   setDep]   = useState(prefillPin?.mode==='rent' ? String((prefillPin.rent||0)*2) : '');
  const [brokRent,  setBRent] = useState('');
  const [maint,     setMaint] = useState('2000');
  const [setup,     setSetup] = useState('');

  // ── Buy inputs ───────────────────────────────────────────────────────────
  const [price,   setPrice] = useState(prefillPin?.mode==='buy' ? String(prefillPin.price||'') : '');
  const [brokBuy, setBBuy]  = useState('');
  const [stamp,   setStamp] = useState('');
  const [reg,     setReg]   = useState('');
  const [legal,   setLegal] = useState('10000');
  const [intCost, setInt]   = useState('');
  const [misc,    setMisc]  = useState('');

  // live results
  const rr = calcRent({ rent, deposit:deposit, brokerage:brokRent, maintenance:maint, setup });
  const br = calcBuy({ price, brokerage:brokBuy, stampDuty:stamp, registration:reg, legal, interiors:intCost, misc });

  const fmt = n => n>=1e7 ? `₹${(n/1e7).toFixed(2)}Cr` : n>=1e5 ? `₹${(n/1e5).toFixed(1)}L` : n>=1000 ? `₹${Math.round(n/1000)}K` : `₹${Math.round(n).toLocaleString()}`;
  const inp = (val, set, ph) => (
    <div style={{position:'relative'}}>
      <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',fontFamily:'DM Mono,monospace',fontSize:13}}>₹</span>
      <input type="number" className="inp" value={val} onChange={e=>set(e.target.value)} placeholder={ph}
        style={{paddingLeft:24, textAlign:'right', fontFamily:'DM Mono,monospace', fontSize:13}}/>
    </div>
  );
  const Row = ({label, val, bold, accent, border}) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
      padding:'8px 0', borderTop: border ? '1.5px solid #e5e7eb' : '1px solid #f3f4f6',
      marginTop: border ? 4 : 0}}>
      <span style={{fontSize:13,color:bold?'#111':'#6b7280',fontWeight:bold?700:400}}>{label}</span>
      <span style={{fontFamily:'DM Mono,monospace',fontSize:bold?16:13,fontWeight:bold?800:600,
        color:accent||( bold?'#111':'#374151')}}>{val}</span>
    </div>
  );
  const Hint = ({label, val, onClick}) => (
    <button onMouseDown={e=>{e.preventDefault();onClick();}}
      style={{fontSize:10.5,color:'#7c3aed',background:'#f5f3ff',border:'1px solid #e9d5ff',
        borderRadius:99,padding:'2px 8px',cursor:'pointer',marginLeft:5,fontWeight:600}}>
      {label} = {val}
    </button>
  );

  const hasBudget = mode==='rent' ? (+rent>0) : (+price>0);

  return (
    <div className="overlay fi" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="sheet su" style={{maxHeight:'92dvh'}}>
        <div className="handle"/>
        <div className="sh-head" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:'#111'}}>💰 True Cost Calculator</div>
            <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>All hidden costs, no surprises</div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:'50%',border:'1.5px solid #e5e7eb',background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>

        {/* Mode toggle */}
        <div style={{padding:'10px 18px 0',flexShrink:0}}>
          <div style={{display:'flex',background:'#f3f4f6',borderRadius:10,padding:3,gap:2}}>
            {[['rent','🏠 Renting'],['buy','🏢 Buying']].map(([m,l])=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'8px',borderRadius:8,fontSize:13,fontWeight:700,
                cursor:'pointer',border:'none',background:mode===m?'#fff':'transparent',
                color:mode===m?(m==='rent'?'#e85d26':'#2563eb'):'#888',
                boxShadow:mode===m?'0 1px 4px rgba(0,0,0,.1)':''}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="scroll" style={{padding:'14px 18px 36px'}}>

          {/* ── RENT MODE ── */}
          {mode==='rent'&&(
            <>
              <div style={{display:'flex',flexDirection:'column',gap:11}}>
                <div>
                  <label className="lbl">Monthly Rent *</label>
                  {inp(rent, setRent, '25000')}
                </div>
                <div>
                  <label className="lbl" style={{display:'flex',alignItems:'center'}}>
                    Security Deposit
                    {+rent>0&&<Hint label="2 months" val={fmt((+rent)*2)} onClick={()=>setDep(String((+rent)*2))}/>}
                    {+rent>0&&<Hint label="3 months" val={fmt((+rent)*3)} onClick={()=>setDep(String((+rent)*3))}/>}
                  </label>
                  {inp(deposit, setDep, 'Usually 2–3 months rent')}
                </div>
                <div>
                  <label className="lbl" style={{display:'flex',alignItems:'center'}}>
                    Brokerage
                    {+rent>0&&<Hint label="1 month" val={fmt(+rent)} onClick={()=>setBRent(String(+rent))}/>}
                  </label>
                  {inp(brokRent, setBRent, '0 if direct from owner')}
                </div>
                <div>
                  <label className="lbl">Monthly Maintenance / Society</label>
                  {inp(maint, setMaint, '2000')}
                </div>
                <div>
                  <label className="lbl">Furnishing / Setup (one-time)</label>
                  {inp(setup, setSetup, '0 if furnished')}
                </div>
              </div>

              {/* Rent results */}
              {hasBudget&&(
                <div style={{marginTop:20,background:'#f8fafc',borderRadius:12,padding:'14px 16px',border:'1px solid #e5e7eb'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>Cost Breakdown</div>
                  <Row label="First month rent"                     val={`₹${(+rent||0).toLocaleString()}`}/>
                  <Row label="Security deposit"                     val={`₹${(+deposit||0).toLocaleString()}`}/>
                  <Row label="Brokerage"                            val={`₹${(+brokRent||0).toLocaleString()}`}/>
                  {+setup>0&&<Row label="Setup / furnishing"        val={`₹${(+setup||0).toLocaleString()}`}/>}
                  <Row label="Move-in day total" val={fmt(rr.upfront)} bold accent="#e85d26" border/>
                  <div style={{height:8}}/>
                  <Row label="Monthly outflow (rent + maintenance)" val={fmt(rr.monthly)}/>
                  <Row label="6-month total cost"                   val={fmt(rr.total6m)}/>
                  <Row label="  → effective per month"             val={fmt(rr.effMonthly6m)} accent="#7c3aed"/>
                  <Row label="12-month total cost"                  val={fmt(rr.total12m)} bold border/>
                  <Row label="  → effective per month"             val={fmt(rr.effMonthly12m)} bold accent="#7c3aed"/>
                  {rr.effMonthly12m>(+rent)&&(
                    <div style={{marginTop:10,background:'#fef3ee',borderRadius:8,padding:'8px 10px',fontSize:12,color:'#c45319'}}>
                      💡 All-in, you're paying <strong>{fmt(rr.effMonthly12m)}/mo</strong> — {Math.round(((rr.effMonthly12m/(+rent))-1)*100)}% more than the headline rent
                    </div>
                  )}
                </div>
              )}
              {!hasBudget&&<div style={{marginTop:20,textAlign:'center',color:'#9ca3af',fontSize:13,padding:'20px 0'}}>Enter monthly rent to see your true cost breakdown</div>}
            </>
          )}

          {/* ── BUY MODE ── */}
          {mode==='buy'&&(
            <>
              <div style={{display:'flex',flexDirection:'column',gap:11}}>
                <div>
                  <label className="lbl">Purchase Price *</label>
                  {inp(price, setPrice, '7500000')}
                  {+price>0&&<div style={{fontSize:11,color:'#2563eb',marginTop:3,fontWeight:600}}>{fmt(+price)}</div>}
                </div>
                <div>
                  <label className="lbl" style={{display:'flex',alignItems:'center'}}>
                    Brokerage
                    {+price>0&&<Hint label="2%" val={fmt((+price)*.02)} onClick={()=>setBBuy(String(Math.round((+price)*.02)))}/>}
                    {+price>0&&<Hint label="1%" val={fmt((+price)*.01)} onClick={()=>setBBuy(String(Math.round((+price)*.01)))}/>}
                  </label>
                  {inp(brokBuy, setBBuy, '0 if direct from builder/owner')}
                </div>
                <div>
                  <label className="lbl" style={{display:'flex',alignItems:'center'}}>
                    Stamp Duty
                    {+price>0&&<Hint label="Delhi 6%" val={fmt((+price)*.06)} onClick={()=>setStamp(String(Math.round((+price)*.06)))}/>}
                    {+price>0&&<Hint label="HR/UP 7%" val={fmt((+price)*.07)} onClick={()=>setStamp(String(Math.round((+price)*.07)))}/>}
                  </label>
                  {inp(stamp, setStamp, 'Delhi ~6% · Gurgaon/Noida ~7%')}
                </div>
                <div>
                  <label className="lbl" style={{display:'flex',alignItems:'center'}}>
                    Registration Charges
                    {+price>0&&<Hint label="~1%" val={fmt((+price)*.01)} onClick={()=>setReg(String(Math.round((+price)*.01)))}/>}
                  </label>
                  {inp(reg, setReg, '~1% of price, paid at sub-registrar')}
                </div>
                <div>
                  <label className="lbl">Legal / Documentation</label>
                  {inp(legal, setLegal, '10000')}
                </div>
                <div>
                  <label className="lbl">Interiors / Renovation (one-time)</label>
                  {inp(intCost, setInt, '0')}
                </div>
                <div>
                  <label className="lbl">Loan processing / misc</label>
                  {inp(misc, setMisc, '0')}
                </div>
              </div>

              {/* Buy results */}
              {hasBudget&&(
                <div style={{marginTop:20,background:'#f8fafc',borderRadius:12,padding:'14px 16px',border:'1px solid #e5e7eb'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>Acquisition Cost Breakdown</div>
                  <Row label="Base purchase price"            val={fmt(br.basePrice)}/>
                  {+brokBuy>0 &&<Row label="Brokerage"       val={`₹${(+brokBuy).toLocaleString()}`}/>}
                  {+stamp>0   &&<Row label="Stamp duty"       val={`₹${(+stamp).toLocaleString()}`}/>}
                  {+reg>0     &&<Row label="Registration"     val={`₹${(+reg).toLocaleString()}`}/>}
                  {+legal>0   &&<Row label="Legal / docs"     val={`₹${(+legal).toLocaleString()}`}/>}
                  {+intCost>0 &&<Row label="Interiors"        val={`₹${(+intCost).toLocaleString()}`}/>}
                  {+misc>0    &&<Row label="Loan / misc"      val={`₹${(+misc).toLocaleString()}`}/>}
                  <Row label="Additional costs beyond price"  val={fmt(br.extras)} accent="#e85d26" border/>
                  <Row label="Total acquisition cost"         val={fmt(br.total)} bold accent="#2563eb" border/>
                  {br.overagePct>0&&(
                    <div style={{marginTop:10,background:'#eff6ff',borderRadius:8,padding:'8px 10px',fontSize:12,color:'#1d4ed8'}}>
                      💡 You're paying <strong>{br.overagePct}% more</strong> than the headline price — {fmt(br.extras)} in hidden costs
                    </div>
                  )}
                </div>
              )}
              {!hasBudget&&<div style={{marginTop:20,textAlign:'center',color:'#9ca3af',fontSize:13,padding:'20px 0'}}>Enter the purchase price to see your true acquisition cost</div>}
            </>
          )}

          <div style={{marginTop:16,fontSize:11,color:'#d1d5db',textAlign:'center',lineHeight:1.6}}>
            Estimates only. Consult a professional for exact figures.<br/>
            Stamp duty rates may vary by gender, property type &amp; state.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function NCRRealty({ initialPins=[] }) {
  const [pins,setPins]         = useState(initialPins);
  const [loading,setLoading]   = useState(initialPins.length===0);
  const [tab,setTab]           = useState('explore');
  const [filters,setFilters]   = useState({mode:'all',bhk:'all',city:'all',furnished:'all',minRent:'',maxRent:'',avail:false});
  const [showExplore,setShowE] = useState(false);
  const [showFilter,setShowF]  = useState(false);
  const [showHow,setShowHow]   = useState(false);
  const [showFH,setShowFH]     = useState(false);
  const [showWizard,setWizard] = useState(false);
  const [showCalc,setShowCalc] = useState(false);
  const [calcPin,setCalcPin]   = useState(null);  // pin to prefill calculator with
  const [fhDropMode,setFhDrop] = useState(false);  // waiting for user to tap map for flat hunt
  const [fhCoords,setFhCoords] = useState(null);   // captured flat hunt location
  const [fhAreaName,setFhArea] = useState('');
  const [showForm,setShowForm] = useState(false);
  const [showOnboard,setOnboard]= useState(false);
  const [formMode,setFMode]    = useState('rent');
  const [dropLat,setDLat]      = useState(null);
  const [dropLng,setDLng]      = useState(null);
  const [selPin,setSelPin]     = useState(null);
  const [flyTo,setFlyTo]       = useState(null);
  const [searchHL,setSearchHL] = useState(null); // pulse marker from location search
  const [showMetro,setMetro]   = useState(false);
  const [toast,setToast]       = useState(null);
  const [isMobile,setMob]      = useState(false);

  useEffect(()=>{
    const chk=()=>setMob(window.innerWidth<=768);
    chk(); window.addEventListener('resize',chk);
    const seen=localStorage.getItem('ncr_v3_seen');
    if(!seen){setTimeout(()=>setOnboard(true),700);localStorage.setItem('ncr_v3_seen','1');}
    return()=>window.removeEventListener('resize',chk);
  },[]);

  // Sync contribute + fhDrop mode to body class (map reads this)
  useEffect(()=>{
    document.body.classList.toggle('contrib',  tab==='contribute');
    document.body.classList.toggle('fh-drop',  fhDropMode);
  },[tab, fhDropMode]);

  const fetchPins=useCallback(async()=>{
    try{ const r=await fetch('/api/pins?limit=500'); const {pins:d}=await r.json(); setPins(d||[]); }catch{}
    finally{ setLoading(false); }
  },[]);
  useEffect(()=>{ if(initialPins.length===0) fetchPins(); },[fetchPins,initialPins.length]);

  const addPin=p=>{
    setPins(prev=>[p,...prev]);
    setToast('📍 Pin submitted! It\'s now live on the map');
    // fly to newly submitted pin
    const lat=p.pin_lat??aOf(p.area_id)?.lat;
    const lng=p.pin_lng??aOf(p.area_id)?.lng;
    if(lat&&lng) setTimeout(()=>setFlyTo({lat,lng,zoom:17,ts:Date.now()}),400);
  };

  const upvote=async id=>{
    try{
      const fp=getFP();
      const r=await fetch(`/api/pins/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'upvote',fingerprint:fp})});
      const d=await r.json();
      if(d.already_voted){setToast('Already upvoted');return;}
      if(r.ok){setPins(prev=>prev.map(p=>p.id===id?{...p,upvotes:(p.upvotes||0)+1}:p));setToast('👍 Upvoted!');}
    }catch{}
  };

  const handleMapClick=(lat,lng)=>{
    if(fhDropMode){
      setFhCoords({lat,lng});
      setFhDrop(false);
      revGeo(lat,lng).then(name=>setFhArea(name));
      setTimeout(()=>setShowFH(true), 100);
      return;
    }
    if(tab!=='contribute') return;
    setDLat(lat); setDLng(lng); setFMode('rent'); setShowForm(true);
  };

  const openForm=m=>{setDLat(null);setDLng(null);setFMode(m);setShowForm(true);};
  const closeForm=()=>{setShowForm(false);setDLat(null);setDLng(null);};

  const fPins=pins.filter(p=>{
    if(filters.mode!=='all'&&p.mode!==filters.mode) return false;
    if(filters.bhk !=='all'&&p.bhk !==filters.bhk)  return false;
    if(filters.city!=='all'&&p.city!==filters.city)  return false;
    if(filters.avail&&!p.is_available)               return false;
    if(filters.furnished==='furnished'   &&p.furnishing!=='Fully Furnished') return false;
    if(filters.furnished==='unfurnished' &&p.furnishing!=='Unfurnished')     return false;
    if(filters.minRent&&p.rent&&p.rent<+filters.minRent) return false;
    if(filters.maxRent&&p.rent&&p.rent>+filters.maxRent) return false;
    return true;
  });

  const anyFilter=filters.mode!=='all'||filters.bhk!=='all'||filters.city!=='all'||filters.furnished!=='all'||filters.minRent||filters.maxRent||filters.avail;
  const anyModal =showForm||showFilter||selPin||showHow||(showExplore&&isMobile);

  // Legend shifts right when explore panel is open on desktop
  const legendLeft = !isMobile && showExplore ? 328 : 12;
  const legendBottom = isMobile ? 82 : 24;

  // Quick stats for topbar
  const rentPins   = pins.filter(p=>p.mode==='rent'&&p.rent);
  const avgRentVal = avg(rentPins.map(p=>p.rent));
  const availCount = pins.filter(p=>p.is_available).length;

  return (
    <>
      <style>{CSS}</style>

      {/* ── Map (always behind everything) ── */}
      <NCRMap pins={pins} filters={filters} showMetro={showMetro} fhDropMode={fhDropMode}
        onPinClick={p=>{setSelPin(p);const _c=pinCoords(p);if(_c)setFlyTo({lat:_c.lat,lng:_c.lng,zoom:_c.exact?17:14,ts:Date.now()});}}
        onMapClick={handleMapClick} flyTo={flyTo} searchHL={searchHL}/>

      {/* ── Location search bar (floating below topbar) ── */}
      <LocationSearch onSelect={loc=>{
        // Always fly to the location
        setFlyTo({lat:loc.lat, lng:loc.lng, zoom:loc.zoom||14, ts:Date.now()});
        setSearchHL({lat:loc.lat, lng:loc.lng, ts:Date.now()});
        // In contribute mode: pre-fill drop coordinates so user can open form right there
        if(tab==='contribute'){
          setDLat(loc.lat); setDLng(loc.lng);
        }
      }}/>
      {!isMobile&&showExplore&&(
        <ExplorePanel pins={pins} loading={loading} filters={filters}
          onPinClick={p=>{setSelPin(p);const _c=pinCoords(p);if(_c)setFlyTo({lat:_c.lat,lng:_c.lng,zoom:_c.exact?17:14,ts:Date.now()});}}
          onFlyTo={v=>setFlyTo({...v,ts:Date.now()})} onClose={()=>setShowE(false)} isMobile={false}/>
      )}

      {/* ── Desktop contribute helper panel ── */}
      {!isMobile&&tab==='contribute'&&!showExplore&&(
        <div className="side-panel si" style={{padding:'20px',display:'flex',flexDirection:'column'}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:4,color:'#111'}}>📍 Contribute mode</div>
          <div style={{fontSize:13,color:'#6b7280',lineHeight:1.65,marginBottom:18}}>Cursor is a <strong style={{color:'#111'}}>crosshair</strong>. Click anywhere on the map to drop a precise pin at that exact location.</div>
          <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:18}}>
            {[['🏠 Pin rent','#e85d26','rent'],['🏢 Pin buy price','#2563eb','buy']].map(([l,c,m])=>(
              <button key={m} onClick={()=>openForm(m)} style={{padding:'13px 15px',borderRadius:11,border:`1.5px solid ${c}33`,background:`${c}0d`,cursor:'pointer',textAlign:'left'}}>
                <div style={{fontWeight:700,fontSize:13,color:c,marginBottom:2}}>{l}</div>
                <div style={{fontSize:11,color:`${c}99`,lineHeight:1.4}}>{m==='rent'?'Share monthly rent anonymously':'Share a property sale price'}</div>
              </button>
            ))}
          </div>
          <div style={{background:'#f8fafc',borderRadius:10,padding:'11px',fontSize:12,color:'#6b7280',lineHeight:1.7,border:'1px solid #e5e7eb'}}>
            💡 <strong style={{color:'#374151'}}>Tip:</strong> Zoom into your street first, then tap to drop a GPS-precise pin.
          </div>
          <div style={{marginTop:'auto',paddingTop:16,borderTop:'1px solid #f3f4f6'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7,textAlign:'center'}}>
              {[['🏠',pins.filter(p=>p.mode==='rent').length,'Rents'],['🏢',pins.filter(p=>p.mode==='buy').length,'Buys'],['✅',pins.filter(p=>p.is_available).length,'Available']].map(([e,v,l])=>(
                <div key={l} style={{background:'#f8fafc',borderRadius:9,padding:'8px 4px',border:'1px solid #e5e7eb'}}>
                  <div>{e}</div>
                  <div style={{fontWeight:700,fontSize:15,marginTop:2,color:'#111'}}>{v}</div>
                  <div style={{fontSize:10,color:'#9ca3af'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar: white, compact, clean ── */}
      <div id="tb">
        {/* Brand */}
        <div style={{display:'flex',alignItems:'center',gap:7,flexShrink:0,marginRight:4}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>🏙</div>
          <span className="desk-only" style={{fontWeight:800,fontSize:14,letterSpacing:'-.3px',color:'#111',whiteSpace:'nowrap'}}>NCR Realty</span>
        </div>

        {/* Mode switch pill */}
        <div className="tb-modes">
          <button className={tab==='explore'?'tb-mode on':'tb-mode'}
            onClick={()=>setTab('explore')}>
            🔍 Explore
          </button>
          <button className={tab==='contribute'?'tb-mode on':'tb-mode'}
            style={tab==='contribute'?{color:'#e85d26'}:{}}
            onClick={()=>setTab('contribute')}>
            📍 Contribute
          </button>
        </div>

        {/* Filter */}
        <button onClick={()=>setShowF(f=>!f)} className={'tb-btn'+(anyFilter?' on':'')}
          style={anyFilter?{borderColor:'#f97316',background:'#fff7ed',color:'#ea580c'}:{}}>
          ⊟<span className="desk-only"> Filter</span>
          {anyFilter&&<span style={{background:'#ea580c',color:'#fff',borderRadius:99,padding:'1px 6px',fontSize:10,fontWeight:700,marginLeft:2}}>{fPins.length}</span>}
        </button>

        {/* Metro toggle */}
        <button onClick={()=>setMetro(m=>!m)} className={'tb-btn'+(showMetro?' on':'')}>
          🚇<span className="desk-only"> Metro</span>
        </button>

        {/* Live stats — desktop only, subtle */}
        {pins.length>0&&(
          <div className="desk-only" style={{display:'flex',gap:10,alignItems:'center',fontSize:12,color:'#6b7280',marginLeft:4,flexShrink:0}}>
            <span style={{color:'#d1d5db'}}>|</span>
            <span style={{fontWeight:600,color:'#374151'}}>📍 {pins.length}</span>
            {avgRentVal>0&&<span style={{color:'#16a34a',fontWeight:600}}>avg {fmtR(avgRentVal)}</span>}
            {availCount>0&&<span style={{color:'#059669',fontWeight:600}}>✅ {availCount}</span>}
          </div>
        )}

        {/* Right actions */}
        <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center'}}>
          {/* Desktop: browse toggle */}
          {!isMobile&&tab==='explore'&&(
            <button onClick={()=>setShowE(e=>!e)} className={'tb-btn'+(showExplore?' on':'')}
              style={showExplore?{borderColor:'#0f172a',background:'#0f172a',color:'#fff'}:{}}>
              ≡<span className="desk-only"> Browse</span>
            </button>
          )}
          {/* Contribute quick-add */}
          {tab==='contribute'&&(
            <>
              <button onClick={()=>openForm('rent')} style={{padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',border:'none',background:'#e85d26',color:'#fff',whiteSpace:'nowrap'}}>+ Rent</button>
              <button onClick={()=>openForm('buy')}  style={{padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',border:'none',background:'#2563eb',color:'#fff',whiteSpace:'nowrap'}}>+ Buy</button>
            </>
          )}
          <button onClick={()=>setShowHow(true)} className="tb-btn" style={{padding:'6px 10px'}}>?</button>
        </div>
      </div>

      {/* ── Side action rail (desktop) ── */}
      {!isMobile&&(
        <div id="rail">
          <button className={'rail-btn'+(showExplore?' active':'')}
            data-tip="Browse data"
            onClick={()=>setShowE(e=>!e)}>≡</button>

          <button className="rail-btn"
            data-tip={tab==='contribute'?'Add rent pin':'Switch to Contribute'}
            onClick={()=>{ if(tab!=='contribute') setTab('contribute'); else openForm('rent'); }}>
            📍
          </button>

          <button className="rail-btn"
            data-tip="Find Flat or Tenants"
            onClick={()=>setShowFH(true)}>
            🏠
          </button>

          <button className={'rail-btn'+(showWizard?' active':'')}
            data-tip="Best areas for budget"
            onClick={()=>setWizard(w=>!w)}>
            🎯
          </button>

          <button className={'rail-btn'+(showCalc?' active':'')}
            data-tip="Hidden cost calculator"
            onClick={()=>{setCalcPin(null);setShowCalc(c=>!c);}}>
            🧮
          </button>

          <button className={'rail-btn'+(showMetro?' active':'')}
            data-tip="Toggle metro lines"
            onClick={()=>setMetro(m=>!m)}>
            🚇
          </button>

          <button className="rail-btn"
            data-tip="How it works"
            onClick={()=>setShowHow(true)}>
            ?
          </button>
        </div>
      )}

      {/* ── Flat Hunt drop-mode banner ── */}
      {fhDropMode&&(
        <div className="fi" style={{position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',zIndex:700,background:'#166534',color:'#fff',borderRadius:12,padding:'12px 20px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 4px 20px rgba(22,101,52,.45)',whiteSpace:'nowrap'}}>
          <span style={{fontSize:18}}>📍</span>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>Tap the map to drop your location pin</div>
            <div style={{fontSize:12,opacity:.8,marginTop:2}}>We'll match seekers/owners within 3km of this point</div>
          </div>
          <button onClick={()=>setFhDrop(false)} style={{marginLeft:8,background:'rgba(255,255,255,.2)',border:'none',color:'#fff',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:12,fontWeight:600,flexShrink:0}}>Cancel</button>
        </div>
      )}

      {/* ── Contribute hint (mobile only) ── */}
      {isMobile&&tab==='contribute'&&(
        <div className="fi" style={{position:'fixed',bottom:80,right:12,zIndex:490,background:'#e85d26',color:'#fff',borderRadius:11,padding:'8px 13px',fontSize:12,fontWeight:700,pointerEvents:'none',boxShadow:'0 3px 12px rgba(232,93,38,.4)'}}>
          ✛ Tap map to drop pin
        </div>
      )}

      {/* ── Legend ── */}
      <div className="legend" style={{bottom:legendBottom,left:legendLeft,zIndex:490,transition:'left .2s'}}>
        <div style={{fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:5,fontSize:9}}>Rent range</div>
        {[['< ₹20K','#16a34a'],['₹20–40K','#ca8a04'],['₹40–70K','#ea580c'],['> ₹70K','#dc2626']].map(([l,c])=>(
          <div key={l} style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:c,flexShrink:0}}/>
            <span>{l}</span>
          </div>
        ))}
        <div style={{borderTop:'1px solid rgba(255,255,255,.1)',marginTop:5,paddingTop:5,color:'#6b7280',lineHeight:1.6}}>
          Solid = Society<br/>Dashed = Independent<br/>
          <span style={{color:'#4ade80',fontWeight:600}}>Filled = AVAILABLE</span>
        </div>
      </div>

      {/* ── Bottom CTA pill: Find Flat | Best Areas ── */}
      {!fhDropMode&&(
        <div style={{
          position:'fixed',
          bottom: isMobile ? 80 : 24,
          left: '50%', transform:'translateX(-50%)',
          zIndex:490,
          background:'rgba(255,255,255,.97)',border:'1.5px solid #e5e7eb',
          borderRadius:14,
          display:'flex',alignItems:'stretch',
          boxShadow:'0 4px 16px rgba(0,0,0,.12)',
          backdropFilter:'blur(8px)',
          overflow:'hidden',
          whiteSpace:'nowrap',
        }}>
          <div onClick={()=>setShowFH(true)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',cursor:'pointer',borderRight:'1px solid #e5e7eb'}}>
            <span style={{fontSize:15}}>🏠</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'#111'}}>Find Flat</div>
              <div style={{fontSize:10,color:'#9ca3af'}}>Broker-free</div>
            </div>
          </div>
          <div onClick={()=>setWizard(true)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',cursor:'pointer'}}>
            <span style={{fontSize:15}}>🎯</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'#111'}}>Best Areas</div>
              <div style={{fontSize:10,color:'#9ca3af'}}>For your budget</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading&&pins.length===0&&(
        <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:400,background:'rgba(255,255,255,.96)',border:'1px solid #e5e7eb',borderRadius:16,padding:'24px 28px',textAlign:'center',maxWidth:260,boxShadow:'0 4px 24px rgba(0,0,0,.1)',pointerEvents:'none'}}>
          <div style={{fontSize:28,marginBottom:8}}>📊</div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:5,color:'#111'}}>No pins yet</div>
          <div style={{fontSize:13,color:'#6b7280',lineHeight:1.6}}>Switch to <strong style={{color:'#e85d26'}}>Contribute</strong> and be the first to add real rent data.</div>
        </div>
      )}

      {/* ── Mobile bottom bar ── */}
      <div id="mob-bar">
        {tab==='explore'?(
          <div style={{display:'flex',gap:7,width:'100%'}}>
            <button onClick={()=>setShowE(true)} style={{flex:2,padding:'11px',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',border:'1.5px solid #e5e7eb',background:'#fff',color:'#111'}}>≡ Browse</button>
            <button onClick={()=>setShowF(f=>!f)} style={{flex:1,padding:'11px',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',border:`1.5px solid ${anyFilter?'#ea580c':'#e5e7eb'}`,background:anyFilter?'#fff7ed':'#fff',color:anyFilter?'#ea580c':'#374151'}}>⊟</button>
            <button onClick={()=>setShowHow(true)} style={{padding:'11px 13px',borderRadius:10,fontSize:14,cursor:'pointer',border:'1.5px solid #e5e7eb',background:'#fff',color:'#374151'}}>?</button>
          </div>
        ):(
          <div style={{display:'flex',gap:7,width:'100%'}}>
            <button onClick={()=>openForm('rent')} style={{flex:1,padding:'12px',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',background:'#e85d26',color:'#fff'}}>+ Rent pin</button>
            <button onClick={()=>openForm('buy')}  style={{flex:1,padding:'12px',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',background:'#2563eb',color:'#fff'}}>+ Price pin</button>
            <button onClick={()=>setShowHow(true)} style={{padding:'12px 13px',borderRadius:10,fontSize:14,cursor:'pointer',border:'1.5px solid #e5e7eb',background:'#fff',color:'#374151'}}>?</button>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast&&<ToastMsg msg={toast} onDone={()=>setToast(null)}/>}

      {/* ── Filter ── */}
      {showFilter&&<FilterFloat filters={filters} onChange={setFilters} onClose={()=>setShowF(false)} count={fPins.length}/>}

      {/* ── Modals & sheets ── */}
      {showOnboard&&<OnboardingModal onClose={()=>setOnboard(false)} onContribute={()=>{setTab('contribute');}}/>}
      {showHow     &&<HowToUse onClose={()=>setShowHow(false)}/>}
      {showFH      &&<FlatHuntSheet onClose={()=>setShowFH(false)} onRequestMapDrop={()=>{setShowFH(false);setFhDrop(true);}} pendingCoords={fhCoords} pendingAreaName={fhAreaName}/>}
      {showWizard  &&<BudgetWizard pins={pins} onClose={()=>setWizard(false)} onFlyTo={v=>setFlyTo({...v,ts:Date.now()})} onApplyFilters={f=>{setFilters(f);}}/>}
      {showCalc    &&<HiddenCostCalc onClose={()=>{setShowCalc(false);setCalcPin(null);}} prefillPin={calcPin}/>}
      {showExplore&&isMobile&&<ExplorePanel pins={pins} loading={loading} filters={filters} onPinClick={p=>{setSelPin(p);const _c=pinCoords(p);if(_c)setFlyTo({lat:_c.lat,lng:_c.lng,zoom:_c.exact?17:14,ts:Date.now()});}} onFlyTo={v=>setFlyTo({...v,ts:Date.now()})} onClose={()=>setShowE(false)} isMobile={true}/>}
      {showForm    &&<PinForm onSubmit={addPin} onClose={closeForm} defaultMode={formMode} prefLat={dropLat} prefLng={dropLng}/>}
      {selPin      &&<PinDetail pin={selPin} onClose={()=>setSelPin(null)} onUpvote={upvote} onFlyTo={p=>{setFlyTo({...p,ts:Date.now()});setSelPin(null);}} onCalc={p=>{setCalcPin(p);setShowCalc(true);}}/>}
    </>
  );
}

function ToastMsg({msg,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t);},[onDone]);
  return <div className="su" style={{position:'fixed',bottom:92,left:'50%',transform:'translateX(-50%)',zIndex:9999,background:'#111',color:'#fff',padding:'9px 18px',borderRadius:99,fontSize:13,fontWeight:500,boxShadow:'0 4px 20px rgba(0,0,0,.25)',whiteSpace:'nowrap',pointerEvents:'none'}}>{msg}</div>;
}
