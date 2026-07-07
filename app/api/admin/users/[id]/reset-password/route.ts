import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAdminClaims } from '@/lib/session';
import { hashPassword } from '@/lib/userAuth';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await requireAdminClaims();
  if (!claims) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) return NextResponse.json({ error: 'id invalide' }, { status: 400 });

  // Mot de passe temporaire à relayer à la main (pas d'email configuré) —
  // retourné une seule fois dans la réponse, jamais stocké en clair.
  const newPassword = crypto.randomBytes(9).toString('base64url');
  const passwordHash = await hashPassword(newPassword);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
    select: { id: true, username: true },
  });

  return NextResponse.json({ user: updated, newPassword });
}
