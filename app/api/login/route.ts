import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/userAuth';
import { signSharedToken, SHARED_SESSION_COOKIE, SHARED_SESSION_DURATION_MS } from '@/lib/sharedToken';
import { sharedCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Pseudo et mot de passe requis' }, { status: 400 });
    }

    const normalized = username.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { username: normalized } });
    if (!user) {
      return NextResponse.json({ error: 'Pseudo ou mot de passe incorrect' }, { status: 401 });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Pseudo ou mot de passe incorrect' }, { status: 401 });
    }

    const token = signSharedToken({
      uid: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      avatarFile: user.avatarFile,
    });

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, isAdmin: user.isAdmin, avatarFile: user.avatarFile },
    });
    response.cookies.set(SHARED_SESSION_COOKIE, token, sharedCookieOptions(SHARED_SESSION_DURATION_MS / 1000));
    return response;
  } catch (error) {
    console.error('[LOGIN] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
