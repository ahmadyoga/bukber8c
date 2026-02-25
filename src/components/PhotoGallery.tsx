'use client';

import { useEffect, useRef, useState } from 'react';

interface Photo {
    id: string;
    name: string;
    thumbnailUrl: string;
    viewUrl: string;
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

function MarqueeRow({
    photos,
    reverse = false,
    onPhotoClick,
}: {
    photos: Photo[];
    reverse?: boolean;
    onPhotoClick: (photo: Photo, index: number) => void;
}) {
    const rowRef = useRef<HTMLDivElement>(null);

    const pause = () => { if (rowRef.current) rowRef.current.style.animationPlayState = 'paused'; };
    const resume = () => { if (rowRef.current) rowRef.current.style.animationPlayState = 'running'; };

    const doubled = [...photos, ...photos];

    return (
        <div className="marquee-wrapper" onMouseEnter={pause} onMouseLeave={resume}>
            <div
                ref={rowRef}
                className={`marquee-track ${reverse ? 'marquee-reverse' : 'marquee-forward'}`}
            >
                {doubled.map((photo, i) => (
                    <button
                        key={`${photo.id}-${i}`}
                        onClick={() => onPhotoClick(photo, i % photos.length)}
                        className="marquee-item group"
                        aria-label={photo.name}
                    >
                        <img
                            src={photo.thumbnailUrl}
                            alt={photo.name}
                            loading="lazy"
                            className="marquee-img"
                        />
                        <div className="gallery-overlay" />
                        <div className="marquee-zoom-icon">🔍</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function PhotoGallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const swipeStartX = useRef(0);

    useEffect(() => {
        fetch('/api/photos')
            .then((r) => r.json())
            .then((d) => setPhotos(d.photos || []))
            .catch(() => setPhotos([]))
            .finally(() => setLoading(false));
    }, []);

    const openLightbox = (_photo: Photo, index: number) => setLightboxIndex(index);

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

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="marquee-skeleton" />
                <div className="marquee-skeleton" />
            </div>
        );
    }

    if (photos.length === 0) return null;

    const mid = Math.ceil(photos.length / 2);
    const row1 = photos.slice(0, mid);
    const row2 = photos.slice(mid);

    return (
        <div>
            <div className="space-y-3">
                <MarqueeRow photos={row1} onPhotoClick={openLightbox} />
                {row2.length > 0 && (
                    <MarqueeRow photos={row2} reverse onPhotoClick={openLightbox} />
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="lightbox"
                    onClick={() => setLightboxIndex(null)}
                    onPointerDown={(e) => { swipeStartX.current = e.clientX; }}
                    onPointerUp={(e) => {
                        const dx = e.clientX - swipeStartX.current;
                        if (Math.abs(dx) < 40) return;
                        navigate(dx < 0 ? 1 : -1);
                    }}
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

                    <p className="lightbox-counter">
                        {lightboxIndex + 1} / {photos.length}
                    </p>
                </div>
            )}
        </div>
    );
}

