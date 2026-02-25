'use client';

import { useEffect, useRef, useState } from 'react';

interface Photo {
    id: string;
    name: string;
    thumbnailUrl: string;
    viewUrl: string;
}

interface LightboxState {
    url: string;
    index: number;
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

    // Pause on hover
    const pause = () => { if (rowRef.current) rowRef.current.style.animationPlayState = 'paused'; };
    const resume = () => { if (rowRef.current) rowRef.current.style.animationPlayState = 'running'; };

    // Duplicate photos for seamless loop
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
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);

    useEffect(() => {
        fetch('/api/photos')
            .then((r) => r.json())
            .then((d) => setPhotos(d.photos || []))
            .catch(() => setPhotos([]))
            .finally(() => setLoading(false));
    }, []);

    const openLightbox = (photo: Photo, index: number) =>
        setLightbox({ url: photo.thumbnailUrl, index });

    const navigate = (dir: 1 | -1) => {
        if (!lightbox) return;
        const next = (lightbox.index + dir + photos.length) % photos.length;
        setLightbox({ url: photos[next].thumbnailUrl, index: next });
    };

    // Keyboard nav
    useEffect(() => {
        if (!lightbox) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'ArrowLeft') navigate(-1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightbox]);

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="marquee-skeleton" />
                <div className="marquee-skeleton" />
            </div>
        );
    }

    if (photos.length === 0) return null;

    // Split into two rows
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
            {lightbox && (
                <div className="lightbox" onClick={() => setLightbox(null)}>
                    {/* Close */}
                    <button
                        className="lightbox-btn lightbox-close"
                        onClick={() => setLightbox(null)}
                        aria-label="Tutup"
                    >
                        ✕
                    </button>

                    {/* Prev */}
                    <button
                        className="lightbox-btn lightbox-prev"
                        onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                        aria-label="Sebelumnya"
                    >
                        ‹
                    </button>

                    <img
                        src={lightbox.url.replace('sz=w800', 'sz=w1600')}
                        alt="Full size"
                        className="lightbox-img"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Next */}
                    <button
                        className="lightbox-btn lightbox-next"
                        onClick={(e) => { e.stopPropagation(); navigate(1); }}
                        aria-label="Berikutnya"
                    >
                        ›
                    </button>

                    {/* Counter */}
                    <p className="lightbox-counter">
                        {lightbox.index + 1} / {photos.length}
                    </p>
                </div>
            )}
        </div>
    );
}
