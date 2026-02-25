import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password, date, isoDate, time, location, mapsUrl, maxGuests, notes } = body;

        // Validate admin password server-side — never exposed to frontend
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload: Record<string, unknown> = {
            title: 'Bukber Alumni 8C Official',
            date: date?.trim() || 'TBA',
            isoDate: isoDate?.trim() || null,
            time: time?.trim() || 'TBA',
            location: location?.trim() || 'TBA',
            mapsUrl: mapsUrl?.trim() || '',
            maxGuests: Number(maxGuests) || 0,
            notes: notes?.trim() || null,
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection('eventConfig').doc('main').set(payload, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating event config:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
