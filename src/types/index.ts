export interface Attendance {
    id: string;
    name: string;
    message: string | null;
    status: 'GOING' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
}

export interface EventConfig {
    title: string;
    date: string;      // display string e.g. "Sabtu, 15 Maret 2026"
    isoDate?: string;  // ISO 8601 for countdown e.g. "2026-03-15T18:00:00+07:00" — leave empty if TBA
    time: string;
    location: string;
    mapsUrl: string;
    maxGuests: number;
    notes: string | null;
}

export interface DrivePhoto {
    id: string;
    name: string;
    thumbnailLink: string;
}
