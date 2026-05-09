'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/StoreProvider';
import { useToast } from '@/components/ToastProvider';
import { Product } from '@/lib/store';
import styles from './page.module.css';

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useStore();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          const found = data.find((p) => p.id === id);
          setProduct(found || null);
          if (found) setActiveImage(found.image);
        } else {
          setProduct(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setLoading(false);
        }
      });

    const handleScroll = () => {
      if (window.scrollY > 50 && isImageZoomed) {
        setIsImageZoomed(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      isMounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [id, isImageZoomed]);

  const handleAddToCart = () => {
    if (isAdding || !product) return;
    
    setIsAdding(true);
    addToCart(product);
    showToast('Added to Cart!', 'success');

    if (mainImageRef.current) {
      const img = mainImageRef.current;
      const rect = img.getBoundingClientRect();
      const flyer = img.cloneNode() as HTMLImageElement;
      
      flyer.style.position = 'fixed';
      flyer.style.left = `${rect.left}px`;
      flyer.style.top = `${rect.top}px`;
      flyer.style.width = `${rect.width}px`;
      flyer.style.height = `${rect.height}px`;
      flyer.style.zIndex = '10000';
      flyer.style.transition = 'all 1s cubic-bezier(0.42, 0, 0.58, 1)';
      flyer.style.borderRadius = '20px';
      flyer.style.pointerEvents = 'none';
      
      document.body.appendChild(flyer);

      const cartIcon = document.querySelector('[href="/cart"]');
      const targetRect = cartIcon?.getBoundingClientRect() || { left: window.innerWidth - 100, top: 20 };

      setTimeout(() => {
        flyer.style.left = `${targetRect.left}px`;
        flyer.style.top = `${targetRect.top}px`;
        flyer.style.width = '20px';
        flyer.style.height = '20px';
        flyer.style.opacity = '0.2';
        flyer.style.transform = 'scale(0.1) rotate(720deg)';
      }, 10);

      setTimeout(() => {
        flyer.remove();
        setIsAdding(false);
      }, 1000);
    } else {
      setIsAdding(false);
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    if (inWishlist) {
      removeFromWishlist(product.id);
      showToast('Removed from Wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to Wishlist!', 'success');

      if (mainImageRef.current) {
        const img = mainImageRef.current;
        const rect = img.getBoundingClientRect();
        const flyer = img.cloneNode() as HTMLImageElement;
        
        flyer.style.position = 'fixed';
        flyer.style.left = `${rect.left}px`;
        flyer.style.top = `${rect.top}px`;
        flyer.style.width = `${rect.width}px`;
        flyer.style.height = `${rect.height}px`;
        flyer.style.zIndex = '10000';
        flyer.style.transition = 'all 1s cubic-bezier(0.42, 0, 0.58, 1)';
        flyer.style.borderRadius = '20px';
        flyer.style.pointerEvents = 'none';
        
        document.body.appendChild(flyer);

        const wishlistIcon = document.querySelector('[href="/wishlist"]');
        const targetRect = wishlistIcon?.getBoundingClientRect() || { left: window.innerWidth - 150, top: 20 };

        setTimeout(() => {
          flyer.style.left = `${targetRect.left}px`;
          flyer.style.top = `${targetRect.top}px`;
          flyer.style.width = '20px';
          flyer.style.height = '20px';
          flyer.style.opacity = '0.2';
          flyer.style.transform = 'scale(0.1) rotate(720deg)';
        }, 10);

        setTimeout(() => flyer.remove(), 1000);
      }
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    router.push(`/checkout?buyNow=${product.id}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, ...reviewForm }),
      });
      if (response.ok) {
        const newReview = await response.json();
        if (product) {
          setProduct({
            ...product,
            reviews: [newReview, ...(product.reviews || [])]
          });
        }
        setReviewForm({ userName: '', rating: 5, comment: '' });
        showToast('Review posted successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading product details...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Product Not Found</h2>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Products</Link>
        </div>
      </main>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const allImages = [product.image, ...(product.images || [])].filter((img, idx, self) => self.indexOf(img) === idx);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <div className="container" style={{ padding: 'var(--spacing-md) var(--spacing-md)' }}>
        <div className={styles.productContainer}>
          <div className={styles.imageSection}>
            {allImages.length > 1 && (
              <div className={styles.thumbnailGallery}>
                {allImages.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`${product.name} ${idx + 1}`} 
                    className={`${styles.thumbnail} ${activeImage === img ? styles.active : ''}`}
                    onClick={() => setActiveImage(img)}
                  />
                ))}
              </div>
            )}
            <div className={`${styles.imageGallery} ${isImageZoomed ? styles.zoomed : ''}`} onClick={() => setIsImageZoomed(!isImageZoomed)} style={{ cursor: 'zoom-in' }}>
              <img ref={mainImageRef} src={activeImage || product.image} alt={product.name} className={styles.mainImage} />
            </div>
          </div>
          
          <div className={styles.productDetails}>
            <p className={styles.categoryTag}>{product.category}</p>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.productPrice}>₹{Number(product.price).toLocaleString('en-IN')}</p>
            <div className={styles.stars} style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#FFB800' }}>
              {"★".repeat(product.rating || 5)}{"☆".repeat(5 - (product.rating || 5))}
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>
            <p className={styles.productDescription}>
              Experience the elegance of our {product.name}. Carefully crafted for special moments, this {product.category.toLowerCase()} is designed to impress and delight. 
            </p>
            
            <div className={styles.actions} style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className={`btn btn-primary ${isAdding ? styles.addedSuccess : ''}`} 
                style={{ flex: 1, padding: '1rem', position: 'relative', overflow: 'hidden' }}
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Added to Cart
                  </span>
                ) : 'Add to Cart'}
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--color-primary-dark)' }}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
              <button 
                className={`btn btn-outline ${inWishlist ? styles.wishlistActive : ''}`} 
                style={{ width: '60px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                onClick={toggleWishlist}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={inWishlist ? "var(--color-danger)" : "none"} stroke={inWishlist ? "var(--color-danger)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2>Customer Reviews</h2>
          </div>

          <div className={styles.reviewList}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewerName}>{review.userName}</span>
                    <span className={styles.reviewDate}>{review.date}</span>
                  </div>
                  <div className={styles.stars} style={{ fontSize: '0.9rem', color: '#FFB800', marginBottom: '0.5rem' }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '3rem 0' }}>No reviews yet. Be the first to review this product!</p>
            )}
          </div>

          <div className={styles.reviewForm}>
            <h3>Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.inputGroup}>
                  <label>Your Name</label>
                  <input 
                    type="text" 
                    value={reviewForm.userName} 
                    onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                    required
                    placeholder="Enter your name"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="star-btn"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          padding: 0, 
                          cursor: 'pointer',
                          fontSize: '1.8rem',
                          color: star <= reviewForm.rating ? '#FFB800' : '#E2E8F0',
                          transition: 'color 0.2s',
                        }}
                        aria-label={`Rate ${star} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <style jsx>{`
                    .star-btn:hover {
                      color: #FFB800 !important;
                      transform: scale(1.1);
                    }
                  `}</style>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Comment</label>
                <textarea 
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ marginTop: '1rem', width: '200px' }}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
