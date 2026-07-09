'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import VideoBackground from '@/components/VideoBackground';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Une erreur est survenue');
      return;
    }

    if (next) {
      window.location.href = next;
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <VideoBackground />
      <div className="panel w-full max-w-sm p-8">
        <h1 className="text-xl font-bold mb-6">Se connecter</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5 font-semibold" style={{ color: 'var(--muted)' }}>Pseudo</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5 font-semibold" style={{ color: 'var(--muted)' }}>Mot de passe</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>
          Pas de compte ?{' '}
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="link">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
