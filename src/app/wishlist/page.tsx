'use client';

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/components/StoreProvider';
import styles from '../page.module.css';

export default function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-lg)' }}>Your Wishlist</h2>
        
        {wishlist.length === 0 ? (
          <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-xl) var(--spacing-md)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
            <svg style={{ margin: '0 auto var(--spacing-md)', color: 'var(--color-text-light)' }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Your Wishlist is Empty</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}>
              Save items you love here to buy them later.
            </p>
            <Link href="/products" className="btn btn-outline" style={{ width: '100%' }}>
              Explore Bouquets
            </Link>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
