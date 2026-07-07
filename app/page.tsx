import Link from 'next/link';
import { getCurrentClaims } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';

const APPS = [
  { name: 'Blindtoss', url: 'https://blindtoss.nathangracia.com' },
  { name: 'Memoss', url: 'https://memoss.nathangracia.com' },
];

export default async function Home() {
  const claims = await getCurrentClaims();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="panel w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-1">cooloss</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Compte unifié pour toutes les apps de Nathan.
        </p>

        {claims ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              {claims.avatarFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={claims.avatarFile}
                  alt=""
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  style={{ width: 48, height: 48 }}
                />
              ) : (
                <div
                  className="rounded-full flex items-center justify-center font-bold"
                  style={{ width: 48, height: 48, background: 'var(--accent)' }}
                >
                  {claims.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold">{claims.username}</div>
                {claims.isAdmin && (
                  <div className="text-xs" style={{ color: 'var(--accent)' }}>Admin</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {APPS.map((app) => (
                <a key={app.url} href={app.url} className="btn btn-ghost w-full">
                  {app.name}
                </a>
              ))}
            </div>

            <div className="flex gap-2">
              <Link href="/profile/edit" className="btn btn-ghost flex-1">Mon profil</Link>
              <div className="flex-1">
                <LogoutButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Link href="/login" className="btn btn-primary w-full">Se connecter</Link>
            <Link href="/register" className="btn btn-ghost w-full">Créer un compte</Link>
          </div>
        )}
      </div>
    </main>
  );
}
