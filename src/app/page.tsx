'use client';

import { useState } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import AttendanceForm from '@/components/AttendanceForm';
import AttendanceList from '@/components/AttendanceList';
import PhotoGallery from '@/components/PhotoGallery';
import ShareButtons from '@/components/ShareButtons';
import EventDetails from '@/components/EventDetails';

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);

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

      {/* Countdown */}
      <section className="section fade-in-delay-2">
        <h2 className="section-title">⏳ Hitung Mundur</h2>
        <CountdownTimer targetDate="2026-03-15T18:00:00+07:00" />
        <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, marginTop: '0.75rem' }}>
          * Tanggal sementara, akan diperbarui setelah konfirmasi
        </p>
      </section>

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
