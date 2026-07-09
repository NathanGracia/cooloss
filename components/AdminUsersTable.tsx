'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  isHabitue: boolean;
  avatarFile: string | null;
  createdAt: string;
}

export default function AdminUsersTable({ users, currentUserId }: { users: User[]; currentUserId: number }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const patchUser = async (user: User, patch: { isAdmin?: boolean; isHabitue?: boolean }) => {
    setError('');
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      router.refresh();
    } catch {
      setError('Erreur réseau');
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = async (user: User) => {
    if (!confirm(`Réinitialiser le mot de passe de ${user.username} ?`)) return;
    setError('');
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      alert(`Nouveau mot de passe pour ${user.username} :\n\n${data.newPassword}\n\nTransmets-le-lui — il n'est affiché qu'une fois.`);
    } catch {
      setError('Erreur réseau');
    } finally {
      setBusyId(null);
    }
  };

  // Grid plutôt que <table> : un <td> avec display:flex (nécessaire pour l'avatar + nom)
  // casse la négociation de largeur des colonnes natives du tableau, ce qui désalignait
  // les lignes selon la longueur du contenu. Des colonnes de grid explicites + nowrap sur
  // les boutons garantissent un alignement stable quelle que soit la longueur des noms.
  const gridCols = 'minmax(160px,1.4fr) 96px minmax(200px,auto) minmax(170px,auto)';

  return (
    <div>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 640 }}>
          <div
            style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12, color: 'var(--muted)' }}
            className="text-xs font-bold pb-2"
          >
            <div style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>Compte</div>
            <div style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>Créé le</div>
            <div style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>Rôle</div>
            <div />
          </div>

          {users.map(user => (
            <div
              key={user.id}
              style={{
                display: 'grid', gridTemplateColumns: gridCols, gap: 12, alignItems: 'center',
                borderTop: '1px solid var(--border)', padding: '14px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {user.avatarFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarFile}
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff', flexShrink: 0 }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center text-xs font-bold"
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#ffffff',
                      border: '2px solid #ffffff', flexShrink: 0,
                    }}
                  >
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span className="font-semibold">{user.displayName || user.username}</span>
                    {user.id === currentUserId && <span className="text-xs" style={{ color: 'var(--muted)' }}>(toi)</span>}
                  </div>
                  {user.displayName && (
                    <div className="text-xs" style={{ color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      @{user.username}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm" style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => patchUser(user, { isAdmin: !user.isAdmin })}
                  disabled={busyId === user.id || (user.id === currentUserId && user.isAdmin)}
                  className="btn btn-ghost text-xs"
                  style={{ whiteSpace: 'nowrap', ...(user.isAdmin ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) }}
                  title={user.id === currentUserId && user.isAdmin ? 'Tu ne peux pas te retirer toi-même' : undefined}
                >
                  {user.isAdmin ? 'Admin' : '+ Admin'}
                </button>
                <button
                  onClick={() => patchUser(user, { isHabitue: !user.isHabitue })}
                  disabled={busyId === user.id}
                  className="btn btn-ghost text-xs"
                  style={{ whiteSpace: 'nowrap', ...(user.isHabitue ? { borderColor: '#c084fc', color: '#c084fc' } : {}) }}
                  title="Accès à l'historique des légendes / timeline Memoss"
                >
                  {user.isHabitue ? 'Habitué' : '+ Habitué'}
                </button>
              </div>

              <div>
                <button
                  onClick={() => resetPassword(user)}
                  disabled={busyId === user.id}
                  className="btn btn-ghost text-xs"
                  style={{ whiteSpace: 'nowrap' }}
                  title="Réinitialiser le mot de passe"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
