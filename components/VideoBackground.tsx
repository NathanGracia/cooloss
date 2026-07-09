'use client';

export default function VideoBackground({ overlay = 'rgba(15,60,110,0.12)' }: { overlay?: string }) {
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }}
      >
        <source src="/wallpaper.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'fixed', inset: 0, background: overlay, zIndex: -1 }} />
    </>
  );
}
