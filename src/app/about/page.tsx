'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        <style jsx>{`
          @media (max-width: 768px) {
            .about-card {
              padding: var(--spacing-lg) var(--spacing-md) !important;
            }
            h2 { font-size: 1.8rem !important; }
          }
        `}</style>
        <div className="about-card" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-xl) var(--spacing-lg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-main)' }}>About VIKA</h2>
          <div style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Welcome to VIKA, your premier destination for handcrafted elegance and personalised gifting. Founded with a passion for celebrating life's most precious moments, we specialize in curating exquisite bouquets and bespoke hampers that speak volumes when words are simply not enough.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Our journey began with a simple belief: that every gift should tell a story. Whether it's the classic romance of red roses, the playful charm of a chocolate-filled arrangement, or the heartfelt touch of a polaroid memory bouquet, each of our creations is meticulously assembled by skilled artisans.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              We source only the freshest flowers and premium treats, ensuring that your gift not only looks stunning but delivers an unforgettable experience. At VIKA, we don't just sell flowers; we deliver joy, love, and memories that last a lifetime.
            </p>
          </div>
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link href="/products" className="btn btn-primary">
              Explore Our Collection
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
