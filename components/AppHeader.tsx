'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HeaderClaims {
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  avatarFile: string | null;
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function AppHeader({ claims }: { claims: HeaderClaims }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = claims.displayName || claims.username;

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <>
      <Link href="/" style={{ position: 'fixed', top: 24, left: 40, zIndex: 10, textDecoration: 'none' }}>
        <h1
          style={{
            fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 28,
            color: '#ffffff', textShadow: '0 3px 0 rgba(20,90,150,0.35), 0 6px 14px rgba(0,40,90,0.25)', margin: 0,
          }}
        >
          Cooloss
        </h1>
      </Link>

      <div style={{ position: 'fixed', top: 24, right: 40, zIndex: 10 }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px',
            borderRadius: 26, background: 'linear-gradient(180deg, #6bb9e8, #3f8fd4)', border: '2px solid #ffffff',
            boxShadow: '0 4px 0 rgba(10,50,100,0.3)', cursor: 'pointer',
          }}
        >
          {claims.avatarFile ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={claims.avatarFile}
              alt=""
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff' }}
            />
          ) : (
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(180deg, #ffffff, #dcecf7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0',
              }}
            >
              {initials(displayName)}
            </div>
          )}
          <span style={{ fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 15, color: '#ffffff' }}>{displayName}</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute', top: 52, right: 0, width: 220,
              background: 'linear-gradient(180deg, #ffffff, #eaf6fb)', borderRadius: 14, border: '2px solid #ffffff',
              boxShadow: '0 8px 20px rgba(5,40,80,0.3)', overflow: 'hidden',
            }}
          >
            {claims.isAdmin && (
              <Link
                href="/admin"
                className="hub-menu-item"
                style={{ display: 'block', padding: '12px 16px', fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0' }}
              >
                Admin
              </Link>
            )}
            <Link
              href="/profile"
              className="hub-menu-item"
              style={{
                display: 'block', padding: '12px 16px',
                borderTop: claims.isAdmin ? '1px solid #dbeefb' : undefined,
                fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0',
              }}
            >
              Mon profil
            </Link>
            <Link
              href="/profile/edit"
              className="hub-menu-item"
              style={{
                display: 'block', padding: '12px 16px', borderTop: '1px solid #dbeefb',
                fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0',
              }}
            >
              Modifier le profil
            </Link>
            <button
              onClick={handleLogout}
              className="hub-menu-item"
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px',
                background: 'transparent', border: 'none', borderTop: '1px solid #dbeefb', cursor: 'pointer',
                fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0',
              }}
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </>
  );
}
