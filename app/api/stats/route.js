import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = supabaseAdmin();
    if (!db) return NextResponse.json({ stats: [] });

    const { data, error } = await db.from('area_stats').select('*').order('total_pins', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ stats: data }, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' }
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
