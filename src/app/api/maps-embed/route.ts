import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/maps-embed?url=https://maps.app.goo.gl/...
 *
 * Resolves a Google Maps short link server-side, extracts the place/coords,
 * and returns a safe Maps Embed API URL — API key is NEVER sent to the browser.
 */
export async function GET(req: NextRequest) {
    const embedKey = process.env.GOOGLE_MAPS_EMBED_KEY;
    if (!embedKey) {
        return NextResponse.json({ error: 'GOOGLE_MAPS_EMBED_KEY not set' }, { status: 500 });
    }

    const shortUrl = req.nextUrl.searchParams.get('url');
    if (!shortUrl) {
        return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    try {
        // Follow redirects to get the final Google Maps URL
        const response = await fetch(shortUrl, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        const finalUrl = response.url;
        const query = extractQueryFromMapsUrl(finalUrl);

        if (!query) {
            return NextResponse.json({ error: 'Could not parse Maps URL' }, { status: 422 });
        }

        const embedUrl =
            `https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=${encodeURIComponent(query)}&maptype=roadmap`;

        return NextResponse.json({ embedUrl, resolvedUrl: finalUrl });
    } catch (error) {
        console.error('maps-embed error:', error);
        return NextResponse.json({ error: 'Failed to resolve URL' }, { status: 500 });
    }
}

/**
 * Extract a search query string from a full Google Maps URL.
 * Tries (in order): place name from path → coordinates → q param.
 */
function extractQueryFromMapsUrl(url: string): string | null {
    try {
        const u = new URL(url);

        // /maps/place/DAFAM+Wonosobo/@-7.35966,109.91119,...
        const placeMatch = u.pathname.match(/\/maps\/place\/([^/@?]+)/);
        if (placeMatch) {
            return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        }

        // Coordinates from @lat,lng
        const coordMatch = u.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
            return `${coordMatch[1]},${coordMatch[2]}`;
        }

        // Fallback: ?q= parameter
        const q = u.searchParams.get('q');
        if (q) return q;

        return null;
    } catch {
        return null;
    }
}
