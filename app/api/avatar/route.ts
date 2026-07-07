import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getCurrentClaims } from '@/lib/session';
import { signSharedToken, SHARED_SESSION_COOKIE, SHARED_SESSION_DURATION_MS } from '@/lib/sharedToken';
import { sharedCookieOptions } from '@/lib/session';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

export async function POST(request: Request) {
  try {
    const claims = await getCurrentClaims();
    if (!claims) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format accepté : JPG, PNG, WebP' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Taille max : 5 Mo' }, { status: 400 });
    }

    const ext = file.type === 'image/webp' ? '.webp' : file.type === 'image/png' ? '.png' : '.jpg';
    const fileName = `user-${claims.uid}-${Date.now()}${ext}`;
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    const filePath = path.join(avatarsDir, fileName);

    await mkdir(avatarsDir, { recursive: true });

    const existing = await prisma.user.findUnique({ where: { id: claims.uid }, select: { avatarFile: true } });
    if (existing?.avatarFile) {
      // avatarFile peut être une URL absolue (comptes migrés) ou un chemin
      // relatif /avatars/... (comptes créés ici) — on ne tente de
      // supprimer que les fichiers locaux.
      if (existing.avatarFile.startsWith('/avatars/')) {
        const oldPath = path.join(process.cwd(), 'public', existing.avatarFile);
        await unlink(oldPath).catch(() => {});
      }
    }

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const avatarFile = `/avatars/${fileName}`;
    const updated = await prisma.user.update({
      where: { id: claims.uid },
      data: { avatarFile },
    });

    // Réémet un token frais avec le nouvel avatar, sinon l'ancien avatar
    // resterait affiché sur Blindtoss/Memoss jusqu'à expiration du token.
    const token = signSharedToken({
      uid: updated.id,
      username: updated.username,
      isAdmin: updated.isAdmin,
      avatarFile: updated.avatarFile,
    });

    const response = NextResponse.json({
      user: { id: updated.id, username: updated.username, isAdmin: updated.isAdmin, avatarFile: updated.avatarFile },
    });
    response.cookies.set(SHARED_SESSION_COOKIE, token, sharedCookieOptions(SHARED_SESSION_DURATION_MS / 1000));
    return response;
  } catch (error) {
    console.error('[AVATAR] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
