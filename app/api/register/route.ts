import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/userAuth';
import { signSharedToken, SHARED_SESSION_COOKIE, SHARED_SESSION_DURATION_MS } from '@/lib/sharedToken';
import { sharedCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Pseudo et mot de passe requis' }, { status: 400 });
    }

    const normalized = username.trim().toLowerCase();

    if (normalized.length < 2 || normalized.length > 20) {
      return NextResponse.json({ error: 'Pseudo : 2 à 20 caractères' }, { status: 400 });
    }
    if (!/^[a-z0-9_-]+$/.test(normalized)) {
      return NextResponse.json({ error: 'Pseudo : lettres, chiffres, _ et - uniquement' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Mot de passe : 6 caractères minimum' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username: normalized } });
    if (existing) {
      return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username: normalized, passwordHash },
    });

    const token = signSharedToken({
      uid: user.id,
      username: user.username,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      isHabitue: user.isHabitue,
      avatarFile: user.avatarFile,
    });

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, displayName: user.displayName, isAdmin: user.isAdmin, isHabitue: user.isHabitue, avatarFile: user.avatarFile },
    });
    response.cookies.set(SHARED_SESSION_COOKIE, token, sharedCookieOptions(SHARED_SESSION_DURATION_MS / 1000));
    return response;
  } catch (error) {
    console.error('[REGISTER] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
