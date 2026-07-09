'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import VideoBackground from './VideoBackground';

interface HubApp {
  name: string;
  url: string | null;
  gradient: string | null;
  mono: string | null;
  image: string | null;
}

interface HubClaims {
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  avatarFile: string | null;
}

const APPS: HubApp[] = [
  { name: 'Memoss', url: 'https://memoss.nathangracia.com', gradient: 'linear-gradient(135deg, #22d3ee, #6366f1)', mono: 'M', image: '/hub/memoss.jpg' },
  { name: 'Blackjackoss', url: 'https://blackjackoss.nathangracia.com', gradient: 'linear-gradient(135deg, #a78bfa, #fbbf24)', mono: 'BJ', image: '/hub/blackjackoss.jpg' },
  { name: 'Blindtoss', url: 'https://blindtoss.nathangracia.com', gradient: 'linear-gradient(135deg, #4a90d9, #7ec8e3)', mono: 'BT', image: '/hub/blindtoss.jpg' },
  { name: 'Simulatioss', url: 'https://simulatioss.nathangracia.com', gradient: 'linear-gradient(135deg, #4ade80, #60a5fa)', mono: 'S', image: '/hub/simulatioss.jpg' },
  { name: 'Quizzoss', url: 'https://quizzoss.nathangracia.com', gradient: 'linear-gradient(135deg, #f87171, #f59e0b)', mono: 'Q', image: '/hub/quizzoss.jpg' },
  // Emplacements réservés pour les prochaines apps "-oss" — jusqu'à 12
  // cartes comme la maquette d'origine, remplies au fur et à mesure.
  { name: 'Projet 06', url: null, gradient: null, mono: null, image: null },
  { name: 'Projet 07', url: null, gradient: null, mono: null, image: null },
  { name: 'Projet 08', url: null, gradient: null, mono: null, image: null },
  { name: 'Projet 09', url: null, gradient: null, mono: null, image: null },
  { name: 'Projet 10', url: null, gradient: null, mono: null, image: null },
  { name: 'Projet 11', url: null, gradient: null, mono: null, image: null },
  { name: 'Projet 12', url: null, gradient: null, mono: null, image: null },
];

// Groupées par ligne de 4, comme la maquette.
const ROWS: HubApp[][] = [];
for (let i = 0; i < APPS.length; i += 4) ROWS.push(APPS.slice(i, i + 4));

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function Hub({ claims }: { claims: HubClaims }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = claims.displayName || claims.username;

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <VideoBackground />

      {/* Header */}
      <h1
        style={{
          position: 'absolute', top: 24, left: 40, zIndex: 10,
          fontFamily: "'Fredoka One', sans-serif", fontWeight: 400, fontSize: 28,
          color: '#ffffff', textShadow: '0 3px 0 rgba(20,90,150,0.35), 0 6px 14px rgba(0,40,90,0.25)', margin: 0,
        }}
      >
        Cooloss
      </h1>

      <div style={{ position: 'absolute', top: 24, right: 40, zIndex: 10 }}>
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
                fontFamily: "'Fredoka One', sans-serif", fontSize: 15, color: '#1a5fb0',
              }}
            >
              {initials(displayName)}
            </div>
          )}
          <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: '#ffffff' }}>{displayName}</span>
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
                style={{ display: 'block', padding: '12px 16px', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0' }}
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
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0',
              }}
            >
              Mon profil
            </Link>
            <Link
              href="/profile/edit"
              className="hub-menu-item"
              style={{
                display: 'block', padding: '12px 16px', borderTop: '1px solid #dbeefb',
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0',
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
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a5fb0',
              }}
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>

      {/* Cartes des apps */}
      <main style={{ position: 'relative', zIndex: 3, maxWidth: 1180, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 40px' }}>
        {ROWS.map((row, ri) => (
          <div key={ri} style={{ position: 'relative', marginBottom: 22 }}>
            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, padding: 32 }}>
              {row.map(app => {
                const cardStyle: CSSProperties = {
                  display: 'flex', flexDirection: 'column', aspectRatio: '100 / 78', borderRadius: 22,
                  padding: '10px 10px 12px', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 6px 8px rgba(5,40,80,0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                };
                const inner = (
                  <>
                    <div
                      className="hub-card-title"
                      style={{
                        textAlign: 'center', fontFamily: "'Fredoka One', sans-serif", fontWeight: 400, fontSize: 20,
                        textTransform: 'capitalize', letterSpacing: 0.5, padding: '2px 4px 8px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {app.name}
                    </div>
                    {app.image ? (
                      <div style={{ flex: 1, position: 'relative', minHeight: 0, borderRadius: 14, overflow: 'hidden', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.6)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={app.image}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ) : app.gradient ? (
                      <div
                        style={{
                          flex: 1, position: 'relative', minHeight: 0, borderRadius: 14, overflow: 'hidden',
                          background: app.gradient, boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Fredoka One', sans-serif", fontSize: 30, color: 'rgba(255,255,255,0.92)',
                            textShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        >
                          {app.mono}
                        </span>
                      </div>
                    ) : (
                      // Emplacement pas encore pourvu — texture rayée + pastille
                      // "IMAGE", comme le placeholder de la maquette d'origine.
                      <div
                        style={{
                          flex: 1, position: 'relative', minHeight: 0, borderRadius: 14, overflow: 'hidden',
                          background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0 14px, rgba(255,255,255,0.2) 14px 28px)',
                          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: '#ffffff',
                            background: 'rgba(255,255,255,0.25)', padding: '3px 9px', borderRadius: 20, letterSpacing: 0.5,
                          }}
                        >
                          IMAGE
                        </span>
                      </div>
                    )}
                  </>
                );

                return app.url ? (
                  <a key={app.name} className="hub-card" href={app.url} target="_blank" rel="noopener noreferrer" style={cardStyle}>
                    {inner}
                  </a>
                ) : (
                  <div key={app.name} className="hub-card" style={{ ...cardStyle, cursor: 'default' }}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
