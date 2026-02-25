import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const configDoc = await adminDb
            .collection('eventConfig')
            .doc('main')
            .get();

        if (!configDoc.exists) {
            return NextResponse.json({
                config: {
                    title: 'Bukber Alumni 8C Official',
                    date: 'TBA',
                    time: 'TBA',
                    location: 'TBA',
                    mapsUrl: '',
                    maxGuests: 0,
                    notes: null,
                },
            });
        }

        return NextResponse.json({ config: configDoc.data() });
    } catch (error) {
        console.error('Error fetching event config:', error);
        return NextResponse.json({
            config: {
                title: 'Bukber Alumni 8C Official',
                date: 'TBA',
                time: 'TBA',
                location: 'TBA',
                mapsUrl: '',
                maxGuests: 0,
                notes: null,
            },
        });
    }
}
