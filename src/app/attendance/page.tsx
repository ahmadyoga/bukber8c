'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminDeleteModal from '@/components/AdminDeleteModal';
import type { Attendance } from '@/types';
import Link from 'next/link';

export default function AttendancePage() {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'GOING' | 'ALL'>('GOING');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/attendance');
            const data = await res.json();
            setAttendances(data.attendances || []);
        } catch {
            setAttendances([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch + poll every 10 seconds
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const filtered =
        filter === 'ALL'
            ? attendances
            : attendances.filter((a) => a.status === 'GOING');

    const goingCount = attendances.filter((a) => a.status === 'GOING').length;
    const cancelledCount = attendances.filter((a) => a.status === 'CANCELLED').length;

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '-';
        }
    };

    return (
        <main>
            <div className="lantern lantern-left" aria-hidden="true" />
            <div className="lantern lantern-right" aria-hidden="true" />

            <section className="hero" style={{ paddingBottom: '1rem' }}>
                <Link href="/" className="back-link">
                    ← Kembali ke Undangan
                </Link>
                <h1 className="hero-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginTop: '1rem' }}>
                    Daftar Kehadiran
                </h1>
                <div className="divider" />
            </section>

            <section className="section fade-in">
                {/* Stats */}
                <div className="flex justify-center gap-4 mb-6">
                    <div className="stat-badge stat-badge-going">✅ {goingCount} Hadir</div>
                    <div className="stat-badge stat-badge-cancelled">❌ {cancelledCount} Berhalangan</div>
                </div>

                {/* Filter */}
                <div className="filter-toggle mb-6">
                    <button
                        onClick={() => setFilter('GOING')}
                        className={`filter-button ${filter === 'GOING' ? 'filter-button-active' : ''}`}
                    >
                        Hadir Saja
                    </button>
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`filter-button ${filter === 'ALL' ? 'filter-button-active' : ''}`}
                    >
                        Semua
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton-card" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem 0' }}>
                        Belum ada data kehadiran.
                    </p>
                ) : (
                    <>
                        {/* Mobile: Cards */}
                        <div className="block md:hidden space-y-3">
                            {filtered.map((a) => (
                                <div key={a.id} className="attendance-card">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 style={{ fontWeight: 700, color: 'var(--color-gold)' }}>{a.name}</h3>
                                            {a.message && (
                                                <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.25rem' }}>
                                                    &ldquo;{a.message}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                        <span className={a.status === 'GOING' ? 'status-badge-going' : 'status-badge-cancelled'}>
                                            {a.status === 'GOING' ? 'Hadir' : 'Tidak'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>
                                            {formatDate(a.createdAt)}
                                        </span>
                                        <button
                                            onClick={() => setDeleteTarget({ id: a.id, name: a.name })}
                                            className="delete-button"
                                        >
                                            🗑 Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: Table */}
                        <div className="hidden md:block" style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(212, 168, 67, 0.1)' }}>
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Pesan</th>
                                        <th>Status</th>
                                        <th>Waktu</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a) => (
                                        <tr key={a.id}>
                                            <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{a.name}</td>
                                            <td style={{ opacity: 0.7, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {a.message || '-'}
                                            </td>
                                            <td>
                                                <span className={a.status === 'GOING' ? 'status-badge-going' : 'status-badge-cancelled'}>
                                                    {a.status === 'GOING' ? 'Hadir' : 'Tidak'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', opacity: 0.5 }}>{formatDate(a.createdAt)}</td>
                                            <td>
                                                <button
                                                    onClick={() => setDeleteTarget({ id: a.id, name: a.name })}
                                                    className="delete-button"
                                                >
                                                    🗑 Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>

            {/* Admin Delete Modal */}
            <AdminDeleteModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                documentId={deleteTarget?.id ?? ''}
                name={deleteTarget?.name ?? ''}
                onDeleted={() => {
                    setAttendances((prev) => prev.filter((a) => a.id !== deleteTarget?.id));
                    setDeleteTarget(null);
                }}
            />
        </main>
    );
}
