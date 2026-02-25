import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const password = searchParams.get('password');

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword || password !== adminPassword) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid password' },
                { status: 401 }
            );
        }

        const snapshot = await adminDb
            .collection('attendances')
            .orderBy('createdAt', 'desc')
            .get();

        const rows = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
                name: d.name,
                status: d.status,
                message: d.message || '',
                createdAt: d.createdAt?.toDate?.()?.toISOString() ?? '',
                updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? '',
            };
        });

        const header = 'Name,Status,Message,Created At,Updated At\n';
        const csv =
            header +
            rows
                .map(
                    (r) =>
                        `"${r.name}","${r.status}","${r.message}","${r.createdAt}","${r.updatedAt}"`
                )
                .join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=attendance.csv',
            },
        });
    } catch (error) {
        console.error('Error exporting CSV:', error);
        return NextResponse.json(
            { error: 'Failed to export CSV' },
            { status: 500 }
        );
    }
}
