import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getPaste(id) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // NOTE: Calling own API in SC (Server Component) is generally not recommended 
    // for performance (extra hop), but satisfies requirements.
    const res = await fetch(`${baseUrl}/api/pastes/${id}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        return null;
    }

    return res.json();
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
