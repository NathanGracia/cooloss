'use client';

import { type CSSProperties } from 'react';
import VideoBackground from './VideoBackground';
import AppHeader from './AppHeader';

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

export default function Hub({ claims }: { claims: HubClaims }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Continuum', sans-serif",
      }}
    >
      <VideoBackground />
      <AppHeader claims={claims} />

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
                        textAlign: 'center', fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 20,
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
                            fontFamily: "'Continuum', sans-serif", fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.92)',
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
                            fontFamily: "'Continuum', sans-serif", fontSize: 11, fontWeight: 700, color: '#ffffff',
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
