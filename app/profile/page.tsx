import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentClaims } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import VideoBackground from '@/components/VideoBackground';

export default async function ProfilePage() {
  const claims = await getCurrentClaims();
  if (!claims) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: claims.uid }, select: { createdAt: true } });
  const displayName = claims.displayName || claims.username;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <VideoBackground />
      <div className="panel w-full max-w-sm p-8 text-center">
        {claims.avatarFile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={claims.avatarFile}
            alt=""
            style={{
              width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
              border: '3px solid #ffffff', margin: '0 auto', display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: 96, height: 96, borderRadius: '50%', margin: '0 auto',
              background: 'linear-gradient(180deg, #ffffff, #dcecf7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Fredoka One', sans-serif", fontSize: 32, color: 'var(--accent)',
            }}
          >
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <h1 className="text-2xl font-bold mt-4">{displayName}</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>@{claims.username}</p>

        {(claims.isAdmin || claims.isHabitue) && (
          <div className="flex justify-center gap-2 mt-3">
            {claims.isAdmin && (
              <span
                className="text-xs font-bold"
                style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(63,143,212,0.15)', color: 'var(--accent)' }}
              >
                Admin
              </span>
            )}
            {claims.isHabitue && (
              <span
                className="text-xs font-bold"
                style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(192,132,252,0.2)', color: '#a855f7' }}
              >
                Habitué
              </span>
            )}
          </div>
        )}

        {user && (
          <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>
            Membre depuis le {user.createdAt.toLocaleDateString('fr-FR')}
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <Link href="/profile/edit" className="btn btn-primary w-full">Modifier le profil</Link>
          <Link href="/" className="link text-sm">← Retour au hub</Link>
        </div>
      </div>
    </main>
  );
}
