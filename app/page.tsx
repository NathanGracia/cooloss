import Link from 'next/link';
import { getCurrentClaims } from '@/lib/session';
import Hub from '@/components/Hub';

export default async function Home() {
  const claims = await getCurrentClaims();

  if (!claims) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'linear-gradient(180deg, #0f6fd6 0%, #2f8fe0 22%, #58b3ec 42%, #86cdf0 58%, #b9e4f5 68%)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 380,
            background: 'linear-gradient(180deg, #ffffff, #eaf6fb)',
            borderRadius: 22,
            border: '2px solid #ffffff',
            boxShadow: '0 10px 0 rgba(10,70,130,0.2), 0 14px 24px rgba(5,40,80,0.28)',
            padding: 32,
            textAlign: 'center',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <h1 style={{ color: '#1a5fb0', margin: '0 0 6px', fontSize: 24 }}>Cooloss</h1>
          <p style={{ color: '#4a7a94', margin: '0 0 24px', fontSize: 14 }}>
            Compte unifié pour toutes les apps de Nathan.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link
              href="/login"
              style={{
                padding: 12, borderRadius: 24, border: '2px solid #ffffff', background: 'linear-gradient(180deg, #6bb9e8, #3f8fd4)',
                boxShadow: '0 4px 0 rgba(10,50,100,0.3)', fontWeight: 800, fontSize: 15, color: '#ffffff', textDecoration: 'none',
              }}
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              style={{
                padding: 12, borderRadius: 24, border: '2px solid #bfe0f5', background: 'transparent',
                fontWeight: 700, fontSize: 15, color: '#1a5fb0', textDecoration: 'none',
              }}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <Hub
      claims={{
        username: claims.username,
        displayName: claims.displayName,
        isAdmin: claims.isAdmin,
        avatarFile: claims.avatarFile,
      }}
    />
  );
}
