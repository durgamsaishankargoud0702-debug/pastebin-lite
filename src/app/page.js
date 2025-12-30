'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [content, setContent] = useState('');
    const [ttl, setTtl] = useState('');
    const [maxViews, setMaxViews] = useState('');
    const [result, setResult] = useState(null); // { id, url }
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState('');

    // Fix hydration mismatch by generating URL only on client
    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const res = await fetch('/api/pastes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    ttl_seconds: ttl ? parseInt(ttl) : undefined,
                    max_views: maxViews ? parseInt(maxViews) : undefined,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
                setContent('');
                setTtl('');
                setMaxViews('');
            } else {
                setError(data.error || 'Failed to create paste');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (result) {
            const fullUrl = `${origin}${result.url}`;
            navigator.clipboard.writeText(fullUrl);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>Pastebin-Lite</h1>

            {/* Success View */}
            {result && (
                <div style={{
                    background: '#e6fffa',
                    border: '1px solid #38b2ac',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ marginTop: 0, color: '#2c7a7b' }}>✅ Paste created successfully!</h3>
                    <p>Your shareable link:</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            readOnly
                            value={`${origin}${result.url}`}
                            style={{ flex: 1, padding: '0.5rem' }}
                        />
                        <button onClick={copyToClipboard} style={{ cursor: 'pointer', padding: '0.5rem' }}>Copy Link</button>
                    </div>
                    <a href={result.url} target="_blank" style={{ color: '#3182ce', fontWeight: 'bold' }}>View Paste →</a>
                    <br />
                    <button
                        onClick={() => setResult(null)}
                        style={{
                            marginTop: '1.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                        }}
                    >
                        Create another
                    </button>
                </div>
            )}

            {/* Error View */}
            {error && (
                <div style={{
                    background: '#fff5f5',
                    border: '1px solid #e53e3e',
                    color: '#c53030',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Form */}
            {!result && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea
                        placeholder="Paste your content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={15}
                        style={{
                            padding: '1rem',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>TTL (Seconds)</label>
                            <input
                                type="number"
                                placeholder="e.g. 3600 (1 hour)"
                                value={ttl}
                                onChange={(e) => setTtl(e.target.value)}
                                min="1"
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                            <small style={{ color: '#666', fontSize: '12px' }}>Optional. Leave empty for no time limit.</small>
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Max Views</label>
                            <input
                                type="number"
                                placeholder="e.g. 5"
                                value={maxViews}
                                onChange={(e) => setMaxViews(e.target.value)}
                                min="1"
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                            <small style={{ color: '#666', fontSize: '12px' }}>Optional. Leave empty for no view limit.</small>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '1rem',
                            fontSize: '1.1rem',
                            background: '#3182ce',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Creating Paste...' : 'Create Paste'}
                    </button>
                </form>
            )}
        </main>
    );
}
