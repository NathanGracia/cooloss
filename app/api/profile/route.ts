import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentClaims, sharedCookieOptions } from '@/lib/session';
import { signSharedToken, SHARED_SESSION_COOKIE, SHARED_SESSION_DURATION_MS } from '@/lib/sharedToken';

export async function PATCH(request: Request) {
  try {
    const claims = await getCurrentClaims();
    if (!claims) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { displayName } = await request.json();
    const name = typeof displayName === 'string' ? displayName.trim().slice(0, 20) || null : null;
    if (name && (name.length < 2)) {
      return NextResponse.json({ error: 'Pseudo affiché : 2 caractères minimum' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: claims.uid },
      data: { displayName: name },
    });

    // Réémet un token frais, sinon l'ancien displayName resterait affiché
    // sur Blindtoss/Memoss jusqu'à expiration du token en cours.
    const token = signSharedToken({
      uid: updated.id,
      username: updated.username,
      displayName: updated.displayName,
      isAdmin: updated.isAdmin,
      avatarFile: updated.avatarFile,
    });

    const response = NextResponse.json({
      user: { id: updated.id, username: updated.username, displayName: updated.displayName, isAdmin: updated.isAdmin, avatarFile: updated.avatarFile },
    });
    response.cookies.set(SHARED_SESSION_COOKIE, token, sharedCookieOptions(SHARED_SESSION_DURATION_MS / 1000));
    return response;
  } catch (error) {
    console.error('[PROFILE] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
