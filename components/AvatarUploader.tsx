'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AvatarUploader({ currentAvatar }: { currentAvatar: string | null }) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/avatar', { method: 'POST', body: formData });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Erreur lors de l\'envoi');
      return;
    }

    setPreview(data.user.avatarFile);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" style={{ width: 72, height: 72 }} className="rounded-full object-cover" />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-bold text-xl"
          style={{ width: 72, height: 72, background: 'var(--accent)' }}
        >
          ?
        </div>
      )}
      <div>
        <label className="btn btn-ghost cursor-pointer">
          {loading ? 'Envoi…' : 'Changer la photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} disabled={loading} />
        </label>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  );
}
