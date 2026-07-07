import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminClaims } from '@/lib/session';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await requireAdminClaims();
  if (!claims) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) return NextResponse.json({ error: 'id invalide' }, { status: 400 });

  const { isAdmin } = await request.json();
  if (typeof isAdmin !== 'boolean') {
    return NextResponse.json({ error: 'isAdmin (boolean) requis' }, { status: 400 });
  }

  // Un admin ne peut pas se retirer lui-même son propre accès — évite de se
  // retrouver bloqué dehors si c'est le seul admin restant.
  if (userId === claims.uid && !isAdmin) {
    return NextResponse.json({ error: 'Tu ne peux pas retirer ton propre accès admin' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isAdmin },
    select: { id: true, username: true, isAdmin: true },
  });

  return NextResponse.json({ user: updated });
}
