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
    date: string;
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
