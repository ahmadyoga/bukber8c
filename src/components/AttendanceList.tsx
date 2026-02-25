'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Attendance } from '@/types';

interface AttendanceListProps {
    refreshKey?: number;
}

export default function AttendanceList({ refreshKey }: AttendanceListProps) {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Initial fetch + poll every 10 seconds for live-ish updates
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData, refreshKey]);

    const goingCount = attendances.filter((a) => a.status === 'GOING').length;
    const cancelledCount = attendances.filter((a) => a.status === 'CANCELLED').length;
    const goingAttendances = attendances.filter((a) => a.status === 'GOING');

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card" />
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Stats */}
            <div className="flex justify-center gap-4 mb-6">
                <div className="stat-badge stat-badge-going">
                    ✅ {goingCount} Hadir
                </div>
                <div className="stat-badge stat-badge-cancelled">
                    ❌ {cancelledCount} Berhalangan
                </div>
            </div>

            {/* Messages */}
            {goingAttendances.length === 0 ? (
                <p className="text-center text-cream/60 py-8">
                    Belum ada yang konfirmasi. Jadilah yang pertama! 🌟
                </p>
            ) : (
                <div className="space-y-3">
                    {goingAttendances.map((a) => (
                        <div key={a.id} className="message-card">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-gold">{a.name}</h4>
                                    {a.message && (
                                        <p className="text-cream/80 text-sm mt-1">&ldquo;{a.message}&rdquo;</p>
                                    )}
                                </div>
                                <span className="status-badge-going">Hadir</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
