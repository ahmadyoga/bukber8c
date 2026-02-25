'use client';

import { useEffect, useState } from 'react';

interface Photo {
    id: string;
    name: string;
    thumbnailLink: string;
}

export default function PhotoGallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<string | null>(null);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await fetch('/api/photos');
                const data = await res.json();
                setPhotos(data.photos || []);
            } catch {
                setPhotos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="skeleton-photo" />
                ))}
            </div>
        );
    }

    if (photos.length === 0) return null;

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo) => (
                    <button
                        key={photo.id}
                        onClick={() => setLightbox(photo.thumbnailLink)}
                        className="gallery-item group"
                    >
                        <img
                            src={photo.thumbnailLink}
                            alt={photo.name}
                            loading="lazy"
                            className="w-full h-40 sm:h-48 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="gallery-overlay" />
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="lightbox"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-gold transition-colors"
                        onClick={() => setLightbox(null)}
                    >
                        ✕
                    </button>
                    <img
                        src={lightbox.replace('sz=w800', 'sz=w1600')}
                        alt="Full size"
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
