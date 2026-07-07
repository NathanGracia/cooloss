import { NextResponse } from 'next/server';
import { SHARED_SESSION_COOKIE } from '@/lib/sharedToken';
import { sharedCookieOptions } from '@/lib/session';
import { safeNextUrl } from '@/lib/nextUrl';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Domain+Path doivent matcher exactement ceux posés au login, sinon le
  // navigateur crée un cookie host-only à côté au lieu de supprimer le
  // vrai — d'où l'usage du même sharedCookieOptions() partout.
  response.cookies.set(SHARED_SESSION_COOKIE, '', { ...sharedCookieOptions(0) });
  return response;
}

// Variante navigable (pas fetch) : permet à Blindtoss/Memoss de proposer un
// lien "Se déconnecter" sans CORS, puisque seul cooloss peut effacer le
// cookie avec le bon Domain — simple redirection après clear.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const safe = safeNextUrl(searchParams.get('next'));
  // safeNextUrl renvoie '/' (relatif) par défaut — le résoudre en absolu
  // pour NextResponse.redirect(), qui n'accepte pas les chemins relatifs.
  const target = safe === '/' ? new URL('/', request.url) : safe;
  const response = NextResponse.redirect(target);
  response.cookies.set(SHARED_SESSION_COOKIE, '', { ...sharedCookieOptions(0) });
  return response;
}
