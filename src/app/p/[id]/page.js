import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

import dbConnect from '@/lib/db';
import Paste from '@/models/Paste';

async function getPaste(id) {
    await dbConnect();

    try {
        const paste = await Paste.findById(id);

        if (!paste) return null;

        // Check if expired by time
        if (paste.expiresAt && new Date() > new Date(paste.expiresAt)) {
            return null;
        }

        // Check if expired by views
        if (paste.maxViews && paste.currentViews >= paste.maxViews) {
            return null;
        }

        // Increment view count
        // Note: In strict React Server Components, mutations like this in GET are sometimes discouraged, 
        // but for this simple app it ensures the link works exactly like the API.
        paste.currentViews += 1;
        await paste.save();

        // Convert to plain object to pass to component
        return {
            content: paste.content,
            current_views: paste.currentViews
        };
    } catch (error) {
        console.error("Error fetching paste:", error);
        return null;
    }
}

export default async function PastePage({ params }) {
    const { id } = await params;
    const paste = await getPaste(id);

    if (!paste) {
        notFound();
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Paste: {id}</h1>
            <div style={{
                background: '#f4f4f4',
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
                marginTop: '1rem'
            }}>
                <pre style={{ margin: 0 }}>
                    <code>{paste.content}</code>
                </pre>
            </div>
            <p style={{ marginTop: '1rem', color: '#666' }}>
                Views: {paste.current_views}
            </p>
        </main>
    );
}
