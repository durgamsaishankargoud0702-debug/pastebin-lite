import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import dbConnect from '@/lib/db';
import Paste from '@/models/Paste';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { content, ttl_seconds, max_views } = body;

        // Validation
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const now = Date.now(); // Creation time is always actual server time
        let expiresAt = null;

        if (ttl_seconds) {
            if (ttl_seconds < 1) return NextResponse.json({ error: 'ttl_seconds must be >= 1' }, { status: 400 });
            expiresAt = now + (ttl_seconds * 1000);
        }

        if (max_views && max_views < 1) {
            return NextResponse.json({ error: 'max_views must be >= 1' }, { status: 400 });
        }

        const id = nanoid(8); // Short 8-char ID

        const paste = await Paste.create({
            _id: id,
            content,
            createdAt: now,
            expiresAt,
            maxViews: max_views,
        });

        return NextResponse.json({
            id: paste._id,
            url: `/p/${paste._id}`
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
