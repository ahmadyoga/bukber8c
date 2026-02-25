'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Photo {
    id: string;
    name: string;
    thumbnailUrl: string;
}

interface PhotoChunk {
    photos: Photo[];
    startIndex: number;
}

function chunkPhotos(photos: Photo[]): PhotoChunk[] {
    const chunks: PhotoChunk[] = [];
    for (let i = 0; i < photos.length; i += 5) {
        chunks.push({ photos: photos.slice(i, i + 5), startIndex: i });
    }
    return chunks;
}

export default function GalleryPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/photos')
            .then((r) => r.json())
            .then((d) => {
                const list: Photo[] = d.photos || [];
                setPhotos(list.sort(() => Math.random() - 0.5));
            })
            .catch(() => setPhotos([]))
            .finally(() => setLoading(false));
    }, []);

    const navigate = (dir: 1 | -1) => {
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex + dir + photos.length) % photos.length);
    };

    useEffect(() => {
        if (lightboxIndex === null) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'ArrowLeft') navigate(-1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightboxIndex]);

    const chunks = chunkPhotos(photos);

    const photoCell = (photo: Photo, globalIndex: number, style?: React.CSSProperties) => (
        <div
            key={photo.id}
            onClick={() => setLightboxIndex(globalIndex)}
            style={{
                cursor: 'pointer',
                overflow: 'hidden',
                borderRadius: '0.5rem',
                position: 'relative',
                ...style,
            }}
        >
            <img
                src={photo.thumbnailUrl}
                alt={photo.name}
                loading="lazy"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                }}
            />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-dark)', padding: '0 0 4rem' }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: 'rgba(2,26,19,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(212,168,67,0.1)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <Link href="/" style={{
                    color: 'var(--color-gold)',
                    textDecoration: 'none',
                    fontSize: '1.3rem',
                    lineHeight: 1,
                }}>
                    ←
                </Link>
                <div>
                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.15rem',
                        color: 'var(--color-gold)',
                        margin: 0,
                        lineHeight: 1.2,
                    }}>
                        📸 Kenangan Tahun Lalu
                    </h1>
                    {!loading && (
                        <p style={{ fontSize: '0.7rem', color: 'rgba(254,243,199,0.4)', margin: 0 }}>
                            {photos.length} foto
                        </p>
                    )}
                </div>
            </div>

            {/* Mosaic Grid */}
            <div style={{ padding: '0.625rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {loading ? (
                    /* Skeleton — 2 mosaic rows */
                    [0, 1].map((ci) => (
                        <div key={ci} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', height: '62vw', maxHeight: '340px' }}>
                            <div style={{ borderRadius: '0.5rem', background: 'rgba(10,46,31,0.6)', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '0.5rem' }}>
                                {[0, 1, 2, 3].map(j => (
                                    <div key={j} style={{ borderRadius: '0.5rem', background: 'rgba(10,46,31,0.6)', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : photos.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'rgba(254,243,199,0.4)', paddingTop: '4rem' }}>
                        Belum ada foto.
                    </p>
                ) : (
                    chunks.map((chunk, ci) => {
                        const isFlipped = ci % 2 === 1;
                        const tall = chunk.photos[0];
                        const smalls = chunk.photos.slice(1);

                        // If chunk has only 1 photo, show it full width
                        if (chunk.photos.length === 1) {
                            return (
                                <div key={ci} style={{ height: '50vw', maxHeight: '280px' }}>
                                    {photoCell(tall, chunk.startIndex, { height: '100%' })}
                                </div>
                            );
                        }

                        // If chunk has 2–4 photos, show them in a simple even grid
                        if (chunk.photos.length < 5) {
                            const cols = chunk.photos.length <= 2 ? 2 : 3;
                            return (
                                <div key={ci} style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                    gap: '0.5rem',
                                    height: '40vw',
                                    maxHeight: '240px',
                                }}>
                                    {chunk.photos.map((p, pi) => photoCell(p, chunk.startIndex + pi, { height: '100%' }))}
                                </div>
                            );
                        }

                        // Full 5-photo mosaic group
                        const tallEl = photoCell(tall, chunk.startIndex, { height: '100%' });
                        const gridEl = (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gridTemplateRows: '1fr 1fr',
                                gap: '0.5rem',
                                height: '100%',
                            }}>
                                {smalls.map((p, pi) => photoCell(p, chunk.startIndex + 1 + pi, { height: '100%' }))}
                            </div>
                        );

                        return (
                            <div key={ci} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                                height: '62vw',
                                maxHeight: '340px',
                            }}>
                                {isFlipped ? [gridEl, tallEl] : [tallEl, gridEl]}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div className="lightbox" onClick={() => setLightboxIndex(null)}>
                    <button className="lightbox-btn lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Tutup">✕</button>
                    <button className="lightbox-btn lightbox-prev" onClick={(e) => { e.stopPropagation(); navigate(-1); }} aria-label="Sebelumnya">‹</button>
                    <img
                        src={photos[lightboxIndex]?.thumbnailUrl.replace('sz=w800', 'sz=w1600')}
                        alt={photos[lightboxIndex]?.name}
                        className="lightbox-img"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className="lightbox-btn lightbox-next" onClick={(e) => { e.stopPropagation(); navigate(1); }} aria-label="Berikutnya">›</button>
                    <p className="lightbox-counter">{lightboxIndex + 1} / {photos.length}</p>
                </div>
            )}
        </div>
    );
}
