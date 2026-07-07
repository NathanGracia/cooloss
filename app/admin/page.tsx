import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdminClaims } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import AdminUsersTable from '@/components/AdminUsersTable';

export default async function AdminPage() {
  const claims = await requireAdminClaims();
  if (!claims) redirect('/');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, username: true, isAdmin: true, avatarFile: true, createdAt: true },
  });

  return (
    <main className="min-h-screen p-6">
      <div className="panel w-full max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Comptes</h1>
          <Link href="/" className="link text-sm">← Retour</Link>
        </div>
        <AdminUsersTable
          users={users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() }))}
          currentUserId={claims.uid}
        />
      </div>
    </main>
  );
}
