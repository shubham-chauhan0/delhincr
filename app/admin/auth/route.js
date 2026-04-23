import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const COOKIE = 'ncr_admin';

export async function POST(request) {
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: 'ADMIN_SECRET env var not set' }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  const password = formData?.get('password') ?? '';

  if (password !== ADMIN_SECRET) {
    const url = new URL('/admin?err=1', request.url);
    return NextResponse.redirect(url, 302);
  }

  const url = new URL('/admin', request.url);
  const res = NextResponse.redirect(url, 302);
  res.cookies.set(COOKIE, ADMIN_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return res;
}

export async function DELETE(request) {
  const url = new URL('/admin', request.url);
  const res = NextResponse.redirect(url, 302);
  res.cookies.delete(COOKIE);
  return res;
}
