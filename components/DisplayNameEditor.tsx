'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DisplayNameEditor({ username, currentDisplayName }: { username: string; currentDisplayName: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(currentDisplayName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: value }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
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
          onChange={(e) => { setValue(e.target.value); setSaved(false); }}
          placeholder={username}
          maxLength={20}
          style={saved ? { borderColor: '#4ade80' } : undefined}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn"
          style={{
            flexShrink: 0,
            background: saved ? '#4ade80' : 'var(--accent)',
            color: saved ? '#052e12' : 'white',
            transition: 'background .15s, color .15s',
          }}
        >
          {saving ? '…' : saved ? '✓ Enregistré' : 'OK'}
        </button>
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
        Affiché sur Blindtoss, Memoss et cooloss. Laisse vide pour utiliser @{username}.
      </p>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}
