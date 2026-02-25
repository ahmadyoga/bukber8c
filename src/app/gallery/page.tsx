'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

async function fetchPhotos(pageToken?: string) {
    const url = pageToken
        ? `/api/photos?pageToken=${encodeURIComponent(pageToken)}`
        : '/api/photos';
    const d = await fetch(url).then((r) => r.json());
    return {
        photos: (d.photos || []) as Photo[],
        nextPageToken: (d.nextPageToken ?? null) as string | null,
    };
}

function PhotoCell({
    photo,
    globalIndex,
    onOpen,
    style,
}: {
    photo: Photo;
    globalIndex: number;
    onOpen: (i: number) => void;
    style?: React.CSSProperties;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            onClick={() => onOpen(globalIndex)}
            style={{
                cursor: 'pointer',
                overflow: 'hidden',
                borderRadius: '0.5rem',
                position: 'relative',
                background: 'rgba(10,46,31,0.6)',
                ...style,
            }}
        >
            {/* Shimmer overlay — visible until image loads */}
            {!loaded && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '0.5rem',
                        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                        zIndex: 1,
                    }}
                />
            )}
            <img
                src={photo.thumbnailUrl}
                alt={photo.name}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />
        </div>
    );
}

function LightboxImage({ src, alt }: { src: string; alt: string }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '90vw',
                maxHeight: '82vh',
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
        >
            {/* Shimmer while high-res loads */}
            {!loaded && (
                <div
                    style={{
                        width: '70vw',
                        maxWidth: '500px',
                        height: '60vh',
                        borderRadius: '0.75rem',
                        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                    }}
                />
            )}
            <img
                key={src}
                src={src}
                alt={alt}
                draggable={false}
                onLoad={() => setLoaded(true)}
                style={{
                    position: loaded ? 'relative' : 'absolute',
                    maxWidth: '90vw',
                    maxHeight: '82vh',
                    objectFit: 'contain',
                    borderRadius: '0.75rem',
                    boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    display: 'block',
                }}
            />
        </div>
    );
}

export default function GalleryPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const nextPageTokenRef = useRef<string | null>(null);
    const loadingMoreRef = useRef(false);

    // Keep refs in sync so the observer closure always sees fresh values
    nextPageTokenRef.current = nextPageToken;
    loadingMoreRef.current = loadingMore;

    useEffect(() => {
        fetchPhotos()
            .then(({ photos, nextPageToken }) => {
                setPhotos(photos);
                setNextPageToken(nextPageToken);
            })
            .catch(() => setPhotos([]))
            .finally(() => setLoading(false));
    }, []);

    const loadMore = useCallback(() => {
        const token = nextPageTokenRef.current;
        if (!token || loadingMoreRef.current) return;
        setLoadingMore(true);
        fetchPhotos(token)
            .then(({ photos: more, nextPageToken: newToken }) => {
                setPhotos((prev) => [...prev, ...more]);
                setNextPageToken(newToken);
            })
            .finally(() => setLoadingMore(false));
    }, []);

    // Sentinel ref callback — attaches IntersectionObserver
    const sentinelCallback = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (!node) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { rootMargin: '300px' }
        );
        observer.observe(node);
        observerRef.current = observer;
    }, [loadMore]);

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
                            <div key={ci} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '0.5rem' }}>
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
                                    <PhotoCell photo={tall} globalIndex={chunk.startIndex} onOpen={setLightboxIndex} style={{ height: '100%' }} />
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
                                    minHeight: 0,
                                    overflow: 'hidden',
                                }}>
                                    {chunk.photos.map((p, pi) => (
                                        <PhotoCell key={p.id} photo={p} globalIndex={chunk.startIndex + pi} onOpen={setLightboxIndex} />
                                    ))}
                                </div>
                            );
                        }

                        // Full 5-photo mosaic group
                        const tallEl = <PhotoCell key={tall.id} photo={tall} globalIndex={chunk.startIndex} onOpen={setLightboxIndex} />;
                        const gridEl = (
                            <div key={ci} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gridTemplateRows: '1fr 1fr',
                                gap: '0.5rem',
                                minHeight: 0,
                                overflow: 'hidden',
                            }}>
                                {smalls.map((p, pi) => (
                                    <PhotoCell key={p.id} photo={p} globalIndex={chunk.startIndex + 1 + pi} onOpen={setLightboxIndex} />
                                ))}
                            </div>
                        );

                        return (
                            <div key={ci} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                                height: '62vw',
                                maxHeight: '340px',
                                minHeight: 0,
                                overflow: 'hidden',
                            }}>
                                {isFlipped ? [gridEl, tallEl] : [tallEl, gridEl]}
                            </div>
                        );
                    })
                )}

                {/* Sentinel for infinite scroll */}
                {!loading && nextPageToken && (
                    <div ref={sentinelCallback} style={{ height: '1px' }} />
                )}

                {/* Loading more indicator */}
                {loadingMore && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', height: '62vw', maxHeight: '340px' }}>
                        <div style={{ borderRadius: '0.5rem', background: 'rgba(10,46,31,0.6)', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '0.5rem' }}>
                            {[0, 1, 2, 3].map(j => (
                                <div key={j} style={{ borderRadius: '0.5rem', background: 'rgba(10,46,31,0.6)', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (() => {
                let swipeStartX = 0;

                const onPointerDown = (e: React.PointerEvent) => {
                    swipeStartX = e.clientX;
                };
                const onPointerUp = (e: React.PointerEvent) => {
                    const dx = e.clientX - swipeStartX;
                    if (Math.abs(dx) < 40) return; // not a swipe
                    navigate(dx < 0 ? 1 : -1);
                };

                return (
                    <div
                        className="lightbox"
                        onClick={() => setLightboxIndex(null)}
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                    >
                        <button
                            className="lightbox-btn lightbox-close"
                            onClick={() => setLightboxIndex(null)}
                            aria-label="Tutup"
                        >✕</button>
                        <button
                            className="lightbox-btn lightbox-prev"
                            onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); navigate(-1); }}
                            aria-label="Sebelumnya"
                        >‹</button>
                        <LightboxImage
                            src={photos[lightboxIndex]?.thumbnailUrl.replace('sz=w800', 'sz=w1600')}
                            alt={photos[lightboxIndex]?.name ?? ''}
                        />
                        <button
                            className="lightbox-btn lightbox-next"
                            onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); navigate(1); }}
                            aria-label="Berikutnya"
                        >›</button>
                        <p className="lightbox-counter">{lightboxIndex + 1} / {photos.length}</p>
                    </div>
                );
            })()}
        </div>
    );
}
