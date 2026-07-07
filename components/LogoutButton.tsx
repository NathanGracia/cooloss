'use client';

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <button onClick={handleLogout} className="btn btn-ghost w-full">
      Se déconnecter
    </button>
  );
}
