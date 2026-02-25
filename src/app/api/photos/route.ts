import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

        if (!folderId || !apiKey) {
            return NextResponse.json({ photos: [], nextPageToken: null });
        }

        const { searchParams } = request.nextUrl;
        const pageToken = searchParams.get('pageToken') ?? undefined;

        const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
        const fields = 'nextPageToken,files(id,name)';

        const params = new URLSearchParams({
            q: query,
            key: apiKey,
            fields: fields,
            pageSize: '20',
            orderBy: 'modifiedTime desc',
            supportsAllDrives: 'true',
            includeItemsFromAllDrives: 'true',
        });

        if (pageToken) params.set('pageToken', pageToken);

        const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

        const response = await fetch(url, {
            headers: {
                'Referer': siteUrl,
                'Origin': siteUrl,
            },
        });

        const data = await response.json();

        if (data.error) {
            console.error('Google Drive API error:', JSON.stringify(data.error));
            return NextResponse.json({ photos: [], nextPageToken: null, error: data.error.message }, { status: 500 });
        }

        if (!data.files || data.files.length === 0) {
            return NextResponse.json({ photos: [], nextPageToken: null });
        }

        const photos = data.files.map((file: { id: string; name: string }) => ({
            id: file.id,
            name: file.name,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
            viewUrl: `https://drive.google.com/file/d/${file.id}/view`,
        }));

        return NextResponse.json({
            photos,
            nextPageToken: data.nextPageToken ?? null,
        });
    } catch (error) {
        console.error('Error fetching photos:', error);
        return NextResponse.json({ photos: [], nextPageToken: null, error: 'Failed to fetch photos' }, { status: 500 });
    }
}
