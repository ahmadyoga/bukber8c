'use client';

import { useEffect, useState } from 'react';
import type { EventConfig } from '@/types';

export default function EventDetails() {
    const [config, setConfig] = useState<EventConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/event-config');
                const data = await res.json();
                setConfig(data.config);
            } catch {
                setConfig({
                    title: 'Bukber Alumni 8C Official',
                    date: 'TBA',
                    time: 'TBA',
                    location: 'TBA',
                    mapsUrl: '',
                    maxGuests: 0,
                    notes: null,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    if (loading) {
        return (
            <div className="event-card">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-card" style={{ height: '48px' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!config) return null;

    const isTBA = config.date === 'TBA';

    return (
        <div className="event-card">
            <div className="event-row">
                <span className="event-icon">📅</span>
                <div>
                    <span className="event-label">Tanggal</span>
                    <p className="event-value">
                        {isTBA ? (
                            <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Segera diumumkan</span>
                        ) : (
                            config.date
                        )}
                    </p>
                </div>
            </div>

            <div className="event-row">
                <span className="event-icon">🕕</span>
                <div>
                    <span className="event-label">Waktu</span>
                    <p className="event-value">
                        {config.time === 'TBA' ? (
                            <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Segera diumumkan</span>
                        ) : (
                            config.time
                        )}
                    </p>
                </div>
            </div>

            <div className="event-row">
                <span className="event-icon">📍</span>
                <div>
                    <span className="event-label">Lokasi</span>
                    <p className="event-value">
                        {config.location === 'TBA' ? (
                            <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Segera diumumkan</span>
                        ) : (
                            config.location
                        )}
                    </p>
                </div>
            </div>

            {config.notes && (
                <div className="event-row">
                    <span className="event-icon">📝</span>
                    <div>
                        <span className="event-label">Catatan</span>
                        <p className="event-value" style={{ fontWeight: 400, fontSize: '0.9rem' }}>
                            {config.notes}
                        </p>
                    </div>
                </div>
            )}

            {config.mapsUrl && (
                <div className="maps-container">
                    <iframe
                        src={config.mapsUrl}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Event Location"
                    />
                </div>
            )}

            {config.maxGuests > 0 && (
                <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, marginTop: '0.75rem' }}>
                    Kapasitas terbatas: {config.maxGuests} orang
                </p>
            )}
        </div>
    );
}
