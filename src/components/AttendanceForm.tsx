'use client';

import { useState } from 'react';

interface AttendanceFormProps {
    onSuccess?: () => void;
}

export default function AttendanceForm({ onSuccess }: AttendanceFormProps) {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'GOING' | 'CANCELLED'>('GOING');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), message: message.trim() || null, status }),
            });

            const data = await res.json();

            if (res.ok) {
                const action = data.action === 'updated' ? 'diperbarui' : 'tercatat';
                showToast(`Kehadiran berhasil ${action}! ✅`, 'success');
                setName('');
                setMessage('');
                setStatus('GOING');
                onSuccess?.();
            } else {
                showToast(data.error || 'Terjadi kesalahan', 'error');
            }
        } catch {
            showToast('Gagal mengirim. Coba lagi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-card">
            <h2 className="section-title">📝 Konfirmasi Kehadiran</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="form-label">
                        Nama Lengkap <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama kamu"
                        required
                        className="form-input"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="message" className="form-label">
                        Pesan (opsional)
                    </label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tulis pesan atau ucapan..."
                        rows={3}
                        className="form-input resize-none"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="form-label">Kehadiran</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setStatus('GOING')}
                            disabled={loading}
                            className={`attendance-option ${status === 'GOING'
                                    ? 'attendance-option-going'
                                    : 'attendance-option-inactive'
                                }`}
                        >
                            <span className="text-xl">✅</span>
                            <span className="font-semibold">Saya Hadir</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('CANCELLED')}
                            disabled={loading}
                            className={`attendance-option ${status === 'CANCELLED'
                                    ? 'attendance-option-cancelled'
                                    : 'attendance-option-inactive'
                                }`}
                        >
                            <span className="text-xl">❌</span>
                            <span className="font-semibold">Tidak Bisa</span>
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="submit-button"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Mengirim...
                        </span>
                    ) : (
                        'Kirim Konfirmasi'
                    )}
                </button>
            </form>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
