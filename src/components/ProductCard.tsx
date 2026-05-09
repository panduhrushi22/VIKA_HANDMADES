'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/store';
import { useStore } from './StoreProvider';
import { useToast } from './ToastProvider';
import styles from '@/app/page.module.css';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const { showToast } = useToast();
  const inWishlist = isInWishlist(product.id);
  const [isAdding, setIsAdding] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
      showToast('Removed from Wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to Wishlist!', 'success');

      // Fly-to-Wishlist effect
      if (imageRef.current) {
        const img = imageRef.current;
        const rect = img.getBoundingClientRect();
        const flyer = img.cloneNode() as HTMLImageElement;
        
        flyer.style.position = 'fixed';
        flyer.style.left = `${rect.left}px`;
        flyer.style.top = `${rect.top}px`;
        flyer.style.width = `${rect.width}px`;
        flyer.style.height = `${rect.height}px`;
        flyer.style.zIndex = '10000';
        flyer.style.transition = 'all 0.8s cubic-bezier(0.42, 0, 0.58, 1)';
        flyer.style.borderRadius = '50%';
        flyer.style.pointerEvents = 'none';
        
        document.body.appendChild(flyer);

        const wishlistIcon = document.querySelector('[href="/wishlist"]');
        const targetRect = wishlistIcon?.getBoundingClientRect() || { left: window.innerWidth - 150, top: 20 };

        setTimeout(() => {
          flyer.style.left = `${targetRect.left}px`;
          flyer.style.top = `${targetRect.top}px`;
          flyer.style.width = '20px';
          flyer.style.height = '20px';
          flyer.style.opacity = '0.5';
          flyer.style.transform = 'scale(0.1) rotate(360deg)';
        }, 10);

        setTimeout(() => flyer.remove(), 800);
      }
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding) return;
    
    setIsAdding(true);
    addToCart(product);
    showToast('Added to Cart!', 'success');

    // Fly-to-Cart effect
    if (imageRef.current) {
      const img = imageRef.current;
      const rect = img.getBoundingClientRect();
      const flyer = img.cloneNode() as HTMLImageElement;
      
      flyer.style.position = 'fixed';
      flyer.style.left = `${rect.left}px`;
      flyer.style.top = `${rect.top}px`;
      flyer.style.width = `${rect.width}px`;
      flyer.style.height = `${rect.height}px`;
      flyer.style.zIndex = '10000';
      flyer.style.transition = 'all 0.8s cubic-bezier(0.42, 0, 0.58, 1)';
      flyer.style.borderRadius = '50%';
      flyer.style.pointerEvents = 'none';
      
      document.body.appendChild(flyer);

      // Target position (approximate cart icon position)
      const cartIcon = document.querySelector('[href="/cart"]');
      const targetRect = cartIcon?.getBoundingClientRect() || { left: window.innerWidth - 100, top: 20 };

      setTimeout(() => {
        flyer.style.left = `${targetRect.left}px`;
        flyer.style.top = `${targetRect.top}px`;
        flyer.style.width = '20px';
        flyer.style.height = '20px';
        flyer.style.opacity = '0.5';
        flyer.style.transform = 'rotate(360deg)';
      }, 10);

      setTimeout(() => {
        flyer.remove();
        setIsAdding(false);
      }, 800);
    } else {
      setIsAdding(false);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/checkout?buyNow=${product.id}`);
  };

  return (
    <div className={styles.productCard}>
      <button 
        className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistActive : ''}`} 
        onClick={toggleWishlist}
        style={{ color: inWishlist ? 'var(--color-danger)' : 'var(--color-text-light)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={styles.productImage}>
          <img ref={imageRef} src={product.image} alt={product.name} />
        </div>
      </Link>
      <div className={styles.productInfo}>
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h4 className={styles.productTitle}>{product.name}</h4>
        </Link>
        <p className={styles.productPrice}>₹{Number(product.price).toLocaleString('en-IN')}</p>
        <div className={styles.stars}>
          {"★".repeat(product.rating || 5)}{"☆".repeat(5 - (product.rating || 5))}
        </div>
        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.addToCartBtn} ${isAdding ? styles.addedSuccess : ''}`} 
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Added
              </span>
            ) : 'Add to Cart'}
          </button>
          <button className={styles.buyNowBtn} onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
