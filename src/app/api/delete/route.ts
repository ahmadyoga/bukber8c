import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, password } = body;

        if (!documentId || !password) {
            return NextResponse.json(
                { error: 'Document ID and password are required' },
                { status: 400 }
            );
        }

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword || password !== adminPassword) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid password' },
                { status: 401 }
            );
        }

        await adminDb.collection('attendances').doc(documentId).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        return NextResponse.json(
            { error: 'Failed to delete attendance' },
            { status: 500 }
        );
    }
}
