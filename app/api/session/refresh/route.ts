import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentClaims, sharedCookieOptions } from '@/lib/session';
import { signSharedToken, SHARED_SESSION_COOKIE, SHARED_SESSION_DURATION_MS } from '@/lib/sharedToken';

// Réémet un token frais (nouvelle expiration glissante, claims à jour depuis
// la DB) tant que la session en cours est valide. Appelé à chaque visite
// d'une page cooloss pendant qu'on est connecté — c'est la seule mécanique
// de "rafraîchissement" du système : pas de refresh cross-app depuis
// Blindtoss/Memoss, juste une session qui se prolonge quand on repasse par
// cooloss (voir §Architecture du plan pour le compromis assumé).
export async function POST() {
  const claims = await getCurrentClaims();
  if (!claims) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: claims.uid } });
  if (!user) return NextResponse.json({ error: 'Compte introuvable' }, { status: 401 });

  const token = signSharedToken({
    uid: user.id,
    username: user.username,
    displayName: user.displayName,
    isAdmin: user.isAdmin,
    avatarFile: user.avatarFile,
  });

  const response = NextResponse.json({
    user: { id: user.id, username: user.username, displayName: user.displayName, isAdmin: user.isAdmin, avatarFile: user.avatarFile },
  });
  response.cookies.set(SHARED_SESSION_COOKIE, token, sharedCookieOptions(SHARED_SESSION_DURATION_MS / 1000));
  return response;
}
