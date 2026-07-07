import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentClaims } from '@/lib/session';
import AvatarUploader from '@/components/AvatarUploader';
import DisplayNameEditor from '@/components/DisplayNameEditor';

export default async function ProfileEditPage() {
  const claims = await getCurrentClaims();
  if (!claims) redirect('/login');

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="panel w-full max-w-sm p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold">{claims.username}</h1>
          {claims.isAdmin && <p className="text-sm" style={{ color: 'var(--accent)' }}>Admin</p>}
        </div>
        <AvatarUploader currentAvatar={claims.avatarFile} />
        <DisplayNameEditor username={claims.username} currentDisplayName={claims.displayName} />
        <Link href="/" className="link text-sm">← Retour</Link>
      </div>
    </main>
  );
}
