import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await adminDb
            .collection('attendances')
            .orderBy('createdAt', 'desc')
            .get();

        const attendances = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() ?? null,
        }));

        return NextResponse.json({ attendances });
    } catch (error) {
        console.error('Error fetching attendances:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendances' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, message, status } = body;

        if (!name || !status) {
            return NextResponse.json(
                { error: 'Name and status are required' },
                { status: 400 }
            );
        }

        if (status !== 'GOING' && status !== 'CANCELLED') {
            return NextResponse.json(
                { error: 'Status must be GOING or CANCELLED' },
                { status: 400 }
            );
        }

        // Check if name already exists (case-insensitive)
        const existing = await adminDb
            .collection('attendances')
            .where('name', '==', name.trim())
            .limit(1)
            .get();

        const now = new Date();

        if (!existing.empty) {
            // Update existing
            const docRef = existing.docs[0].ref;
            await docRef.update({
                message: message || null,
                status,
                updatedAt: now,
            });
            return NextResponse.json({
                success: true,
                action: 'updated',
                id: existing.docs[0].id,
            });
        } else {
            // Create new
            const docRef = await adminDb.collection('attendances').add({
                name: name.trim(),
                message: message || null,
                status,
                createdAt: now,
                updatedAt: now,
            });
            return NextResponse.json({
                success: true,
                action: 'created',
                id: docRef.id,
            });
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        return NextResponse.json(
            { error: 'Failed to save attendance' },
            { status: 500 }
        );
    }
}
