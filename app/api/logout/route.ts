import { NextResponse } from 'next/server';
import { SHARED_SESSION_COOKIE } from '@/lib/sharedToken';
import { sharedCookieOptions } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Domain+Path doivent matcher exactement ceux posés au login, sinon le
  // navigateur crée un cookie host-only à côté au lieu de supprimer le
  // vrai — d'où l'usage du même sharedCookieOptions() partout.
  response.cookies.set(SHARED_SESSION_COOKIE, '', { ...sharedCookieOptions(0) });
  return response;
}
