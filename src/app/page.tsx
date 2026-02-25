'use client';

import { useState, useEffect } from 'react';
import type { EventConfig } from '@/types';
import CountdownTimer from '@/components/CountdownTimer';
import AttendanceForm from '@/components/AttendanceForm';
import AttendanceList from '@/components/AttendanceList';
import PhotoGallery from '@/components/PhotoGallery';
import ShareButtons from '@/components/ShareButtons';
import EventDetails from '@/components/EventDetails';

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);

  useEffect(() => {
    fetch('/api/event-config')
      .then((r) => r.json())
      .then((d) => setEventConfig(d.config))
      .catch(() => { });
  }, []);

  return (
    <main>
      {/* Lanterns */}
      <div className="lantern lantern-left" aria-hidden="true" />
      <div className="lantern lantern-right" aria-hidden="true" />

      {/* Hero */}
      <section className="hero fade-in">
        <span className="hero-crescent" role="img" aria-label="Crescent moon">
          🌙
        </span>
        <h1 className="hero-title">Bukber Alumni<br />8C Official</h1>
        <p className="hero-subtitle">Ramadhan 1447 H</p>
        <div className="divider" />
        <p style={{ fontSize: '0.9rem', opacity: 0.7, maxWidth: '400px', margin: '0 auto' }}>
          Mari berkumpul kembali dalam kehangatan silaturahmi dan berbagi kebahagiaan di bulan suci Ramadhan
        </p>
      </section>

      {/* Event Details */}
      <section className="section fade-in-delay-1">
        <h2 className="section-title">📋 Detail Acara</h2>
        <EventDetails />
      </section>

      {/* Countdown — only shown when isoDate is set in Firestore eventConfig/main */}
      {eventConfig?.isoDate && (
        <section className="section fade-in-delay-2">
          <h2 className="section-title">⏳ Hitung Mundur</h2>
          <CountdownTimer targetDate={eventConfig.isoDate} />
        </section>
      )}

      {/* Attendance Form */}
      <section className="section fade-in-delay-3">
        <AttendanceForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      </section>

      {/* Share */}
      <section className="section fade-in-delay-4">
        <h2 className="section-title">📤 Bagikan Undangan</h2>
        <ShareButtons />
      </section>

      {/* Photo Gallery */}
      <section className="section fade-in-delay-5">
        <h2 className="section-title">📸 Kenangan Tahun Lalu</h2>
        <PhotoGallery />
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a
            href="/gallery"
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.5rem',
              border: '1px solid rgba(212,168,67,0.4)',
              borderRadius: '999px',
              color: 'var(--color-gold)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            🖼️ Lihat Semua Foto
          </a>
        </div>
      </section>

      {/* Attendance List */}
      <section className="section fade-in-delay-6">
        <h2 className="section-title">💬 Yang Sudah Konfirmasi</h2>
        <AttendanceList refreshKey={refreshKey} />
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem 1rem 3rem', position: 'relative', zIndex: 1 }}>
        <div className="divider" />
        <p style={{ fontSize: '0.8rem', opacity: 0.4, marginTop: '1rem' }}>
          🌙 Bukber Alumni 8C Official — Ramadhan 1447 H
        </p>
        <a
          href="/attendance"
          style={{
            display: 'inline-block',
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--color-gold)',
            textDecoration: 'underline',
            opacity: 0.6,
          }}
        >
          Lihat Daftar Kehadiran Lengkap →
        </a>
      </footer>
    </main>
  );
}
