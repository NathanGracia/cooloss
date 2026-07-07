'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DisplayNameEditor({ username, currentDisplayName }: { username: string; currentDisplayName: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(currentDisplayName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: value }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      router.refresh();
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <label className="block text-xs mb-1.5 font-semibold" style={{ color: 'var(--muted)' }}>Nom affiché</label>
      <div className="flex gap-2">
        <input
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={username}
          maxLength={20}
        />
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flexShrink: 0 }}>
          {saving ? '…' : 'OK'}
        </button>
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
        Affiché sur Blindtoss, Memoss et cooloss. Laisse vide pour utiliser @{username}.
      </p>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}
