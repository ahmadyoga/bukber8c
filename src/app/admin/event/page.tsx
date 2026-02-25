'use client';

import { useEffect, useState } from 'react';
import type { EventConfig } from '@/types';

type FormState = Omit<EventConfig, 'title'> & { password: string };

const DEFAULT: FormState = {
    password: '',
    date: '',
    isoDate: '',
    time: '',
    location: '',
    mapsUrl: '',
    maxGuests: 0,
    notes: '',
};

export default function AdminEventPage() {
    const [form, setForm] = useState<FormState>(DEFAULT);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'unauthorized'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [loaded, setLoaded] = useState(false);

    // Load current config on mount
    useEffect(() => {
        fetch('/api/event-config')
            .then((r) => r.json())
            .then((d) => {
                if (d.config) {
                    const c: EventConfig = d.config;
                    setForm((prev) => ({
                        ...prev,
                        date: c.date === 'TBA' ? '' : (c.date ?? ''),
                        isoDate: c.isoDate ?? '',
                        time: c.time === 'TBA' ? '' : (c.time ?? ''),
                        location: c.location === 'TBA' ? '' : (c.location ?? ''),
                        mapsUrl: c.mapsUrl ?? '',
                        maxGuests: c.maxGuests ?? 0,
                        notes: c.notes ?? '',
                    }));
                }
            })
            .catch(() => { })
            .finally(() => setLoaded(true));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/event-config/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.status === 401) {
                setStatus('unauthorized');
                return;
            }

            if (!res.ok) {
                const d = await res.json();
                setErrorMsg(d.error || 'Gagal menyimpan');
                setStatus('error');
                return;
            }

            setStatus('success');
        } catch {
            setErrorMsg('Terjadi kesalahan jaringan');
            setStatus('error');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-dark)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '2rem 1rem 4rem',
        }}>
            <div style={{ width: '100%', maxWidth: '520px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚙️</p>
                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.5rem',
                        color: 'var(--color-gold)',
                        margin: 0,
                    }}>
                        Admin — Detail Acara
                    </h1>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(254,243,199,0.4)', marginTop: '0.25rem' }}>
                        Perubahan langsung tampil di halaman utama
                    </p>
                </div>

                {!loaded ? (
                    <p style={{ textAlign: 'center', color: 'rgba(254,243,199,0.5)' }}>Memuat data…</p>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Password */}
                        <Field label="Password Admin *" required>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Masukkan password admin"
                                required
                                style={inputStyle}
                            />
                        </Field>

                        <div style={{ height: '1px', background: 'rgba(212,168,67,0.15)', margin: '0.25rem 0' }} />

                        {/* Display date */}
                        <Field label="Tanggal (teks tampilan)" hint="Contoh: Sabtu, 15 Maret 2026">
                            <input
                                type="text"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                placeholder="Sabtu, 15 Maret 2026"
                                style={inputStyle}
                            />
                        </Field>

                        {/* ISO date for countdown */}
                        <Field
                            label="Tanggal & Waktu (untuk countdown)"
                            hint="Format ISO — kosongkan jika countdown belum ingin ditampilkan"
                        >
                            <input
                                type="datetime-local"
                                name="isoDate"
                                value={form.isoDate ? toLocalInputValue(form.isoDate) : ''}
                                onChange={(e) => {
                                    // Convert local datetime-local value to ISO with WIB offset
                                    const val = e.target.value; // "2026-03-15T18:00"
                                    const iso = val ? new Date(val).toISOString() : '';
                                    setForm((prev) => ({ ...prev, isoDate: iso }));
                                }}
                                style={inputStyle}
                            />
                            {form.isoDate && (
                                <p style={{ fontSize: '0.7rem', color: 'rgba(254,243,199,0.4)', marginTop: '0.25rem' }}>
                                    ISO: {form.isoDate}
                                </p>
                            )}
                        </Field>

                        {/* Time display */}
                        <Field label="Waktu (teks tampilan)" hint="Contoh: 18:00 WIB">
                            <input
                                type="text"
                                name="time"
                                value={form.time}
                                onChange={handleChange}
                                placeholder="18:00 WIB"
                                style={inputStyle}
                            />
                        </Field>

                        {/* Location */}
                        <Field label="Lokasi">
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Restoran XYZ, Jl. Contoh No. 1"
                                style={inputStyle}
                            />
                        </Field>

                        {/* Maps URL */}
                        <Field
                            label="Google Maps URL"
                            hint="Paste link share singkat dari Google Maps, contoh: https://maps.app.goo.gl/xxx — akan otomatis dikonversi ke embed"
                        >
                            <input
                                type="url"
                                name="mapsUrl"
                                value={form.mapsUrl}
                                onChange={handleChange}
                                placeholder="https://maps.app.goo.gl/..."
                                style={inputStyle}
                            />
                        </Field>

                        {/* Max guests */}
                        <Field label="Kapasitas Tamu" hint="Isi 0 jika tidak terbatas">
                            <input
                                type="number"
                                name="maxGuests"
                                value={form.maxGuests}
                                onChange={handleChange}
                                min={0}
                                style={inputStyle}
                            />
                        </Field>

                        {/* Notes */}
                        <Field label="Catatan Tambahan (opsional)">
                            <textarea
                                name="notes"
                                value={form.notes ?? ''}
                                onChange={handleChange}
                                placeholder="Info parkir, dress code, dll."
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </Field>

                        {/* Status messages */}
                        {status === 'success' && (
                            <div style={alertStyle('#065f46', '#d4a843')}>
                                ✅ Berhasil disimpan! Perubahan sudah tampil di halaman utama.
                            </div>
                        )}
                        {status === 'unauthorized' && (
                            <div style={alertStyle('#7f1d1d', '#fca5a5')}>
                                🔒 Password salah.
                            </div>
                        )}
                        {status === 'error' && (
                            <div style={alertStyle('#7f1d1d', '#fca5a5')}>
                                ❌ {errorMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: status === 'loading'
                                    ? 'rgba(212,168,67,0.4)'
                                    : 'linear-gradient(135deg, #d4a843, #b8922e)',
                                color: '#021a13',
                                fontWeight: 700,
                                fontSize: '1rem',
                                border: 'none',
                                borderRadius: '0.75rem',
                                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                marginTop: '0.5rem',
                                letterSpacing: '0.02em',
                            }}
                        >
                            {status === 'loading' ? 'Menyimpan…' : '💾 Simpan Perubahan'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// Helper: convert ISO string to datetime-local input value
function toLocalInputValue(iso: string): string {
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        // datetime-local expects "YYYY-MM-DDTHH:mm"
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return '';
    }
}

function Field({
    label,
    hint,
    required,
    children,
}: {
    label: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-gold)',
                marginBottom: '0.4rem',
                letterSpacing: '0.03em',
            }}>
                {label}{required && <span style={{ color: '#fca5a5' }}> *</span>}
            </label>
            {children}
            {hint && (
                <p style={{ fontSize: '0.7rem', color: 'rgba(254,243,199,0.35)', marginTop: '0.25rem' }}>
                    {hint}
                </p>
            )}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(10, 46, 31, 0.8)',
    border: '1px solid rgba(212, 168, 67, 0.25)',
    borderRadius: '0.625rem',
    color: 'var(--color-cream)',
    fontSize: '1rem',
    outline: 'none',
};

function alertStyle(bg: string, color: string): React.CSSProperties {
    return {
        padding: '0.75rem 1rem',
        borderRadius: '0.625rem',
        background: bg,
        color,
        fontSize: '0.875rem',
        fontWeight: 500,
    };
}
