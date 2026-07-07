import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminClaims } from '@/lib/session';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await requireAdminClaims();
  if (!claims) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) return NextResponse.json({ error: 'id invalide' }, { status: 400 });

  const body = await request.json();
  const data: { isAdmin?: boolean; isHabitue?: boolean } = {};
  if (typeof body.isAdmin === 'boolean') data.isAdmin = body.isAdmin;
  if (typeof body.isHabitue === 'boolean') data.isHabitue = body.isHabitue;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'isAdmin ou isHabitue (boolean) requis' }, { status: 400 });
  }

  // Un admin ne peut pas se retirer lui-même son propre accès — évite de se
  // retrouver bloqué dehors si c'est le seul admin restant.
  if (userId === claims.uid && data.isAdmin === false) {
    return NextResponse.json({ error: 'Tu ne peux pas retirer ton propre accès admin' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, username: true, isAdmin: true, isHabitue: true },
  });

  return NextResponse.json({ user: updated });
}
