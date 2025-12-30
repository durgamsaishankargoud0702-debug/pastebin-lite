import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Paste from '@/models/Paste';

/**
 * Helper to determine "current time" for testing
 */
function getNow(req) {
    if (process.env.TEST_MODE === '1') {
        const testNow = req.headers.get('x-test-now-ms');
        if (testNow) {
            return parseInt(testNow, 10);
        }
    }
    return Date.now();
}

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const now = getNow(request);

        // 1. Check if exists
        const paste = await Paste.findById(id);

        if (!paste) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // 2. Check Time Expiry
        if (paste.expiresAt && now > paste.expiresAt) {
            return NextResponse.json({ error: 'Expired (Time)' }, { status: 404 });
        }

        // 3. Check View Limit
        if (paste.maxViews && paste.currentViews >= paste.maxViews) {
            return NextResponse.json({ error: 'Expired (Views)' }, { status: 404 });
        }

        // 4. Increment View Count (Atomic)
        await Paste.updateOne({ _id: id }, { $inc: { currentViews: 1 } });

        return NextResponse.json({
            content: paste.content,
            created_at: paste.createdAt,
            current_views: paste.currentViews + 1 // +1 because we effectively just viewed it
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
