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

  return (
    <div>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ color: 'var(--muted)' }}>
            <th className="pb-2 font-semibold">Compte</th>
            <th className="pb-2 font-semibold">Créé le</th>
            <th className="pb-2 font-semibold">Rôle</th>
            <th className="pb-2 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
              <td className="py-3 flex items-center gap-2">
                {user.avatarFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarFile} alt="" style={{ width: 28, height: 28 }} className="rounded-full object-cover" />
                ) : (
                  <div
                    className="rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ width: 28, height: 28, background: 'var(--accent)' }}
                  >
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span>
                  {user.displayName || user.username}
                  {user.displayName && <span style={{ color: 'var(--muted)' }}> (@{user.username})</span>}
                </span>
                {user.id === currentUserId && <span style={{ color: 'var(--muted)' }} className="text-xs">(toi)</span>}
              </td>
              <td className="py-3" style={{ color: 'var(--muted)' }}>
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="py-3">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => patchUser(user, { isAdmin: !user.isAdmin })}
                    disabled={busyId === user.id || (user.id === currentUserId && user.isAdmin)}
                    className="btn btn-ghost"
                    style={user.isAdmin ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined}
                    title={user.id === currentUserId && user.isAdmin ? 'Tu ne peux pas te retirer toi-même' : undefined}
                  >
                    {user.isAdmin ? 'Admin' : '+ Admin'}
                  </button>
                  <button
                    onClick={() => patchUser(user, { isHabitue: !user.isHabitue })}
                    disabled={busyId === user.id}
                    className="btn btn-ghost"
                    style={user.isHabitue ? { borderColor: '#c084fc', color: '#c084fc' } : undefined}
                    title="Accès à l'historique des légendes / timeline Memoss"
                  >
                    {user.isHabitue ? 'Habitué' : '+ Habitué'}
                  </button>
                </div>
              </td>
              <td className="py-3">
                <button onClick={() => resetPassword(user)} disabled={busyId === user.id} className="btn btn-ghost text-xs">
                  Réinitialiser le mot de passe
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
