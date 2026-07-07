import { cookies } from 'next/headers';
import { SHARED_SESSION_COOKIE, SHARED_SESSION_DOMAIN, SharedClaims, verifySharedToken } from './sharedToken';

export async function getCurrentClaims(): Promise<SharedClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SHARED_SESSION_COOKIE)?.value;
  return verifySharedToken(token);
}

// Options de cookie communes — mêmes valeurs au login, au refresh et au
// logout, sinon le navigateur ne supprime pas le bon cookie (Domain+Path
// doivent matcher exactement celui posé à l'origine).
export function sharedCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    domain: SHARED_SESSION_DOMAIN,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}
