'use client';

import { useState } from 'react';

interface AdminDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    name: string;
    onDeleted: () => void;
}

export default function AdminDeleteModal({
    isOpen,
    onClose,
    documentId,
    name,
    onDeleted,
}: AdminDeleteModalProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (!password) {
            setError('Password harus diisi');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, password }),
            });

            if (res.ok) {
                setPassword('');
                onDeleted();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Password salah');
            }
        } catch {
            setError('Gagal menghapus. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gold mb-2">🔐 Admin Delete</h3>
                <p className="text-cream/70 text-sm mb-4">
                    Hapus data <strong className="text-cream">{name}</strong>? Masukkan password admin.
                </p>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin Password"
                    className="form-input mb-3"
                    disabled={loading}
                    onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                    autoFocus
                />

                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-cream/20 text-cream/70 hover:bg-cream/5 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}
