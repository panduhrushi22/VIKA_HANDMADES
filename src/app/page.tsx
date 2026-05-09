import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { getProducts } from '@/lib/store';

export default async function Home() {
  const productsResult = await getProducts();
  const allProducts = productsResult.filter(p => p.category !== 'Customize');
  const products = allProducts.slice(0, 4);

  return (
    <main className={styles.main}>
      
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>


            <h1 className={styles.heroTitle}>
              Handmade Hampers & Elegant Bouquets for Every Occasion
            </h1>




            <p className={styles.heroDescription}>
              Made with love, delivered with care.
            </p>

            <div className={styles.heroActions}>
              <Link href="/products" className="btn btn-primary" style={{ minWidth: '160px' }}>Shop Now</Link>
            </div>

          </div>
        </div>
      </section>


      <div className={`${styles.features} fade-in`}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <div className={styles.featureText}>
            <h4>Hand Made with Love</h4>
            <p>Unique & Premium Quality</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22.5 12 18.5 4 22.5 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
          </div>
          <div className={styles.featureText}>
            <h4>Personalised Just for You</h4>
            <p>Custom Hampers for every occasion</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <div className={styles.featureText}>
            <h4>Same Day Delivery</h4>
            <p>Fast & Reliable Delivery</p>
          </div>
        </div>
      </div>

      <section className={`${styles.trustBar} fade-in`}>
        <div className={`container ${styles.trustGrid}`}>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Secure Payment</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>Quality Guaranteed</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>Handmade with Love</span>
          </div>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>On-time Delivery</span>
          </div>
        </div>
      </section>

      <section className={`${styles.section} fade-in`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Shop by Category</h3>
          </div>
          <div className={styles.categoryGrid}>
            <Link href="/products?category=vvtrends" className={styles.categoryCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.categoryImage}>
                <img src="/images/lehanga.png" alt="VV.Trends" />
              </div>
              <h4 className={styles.categoryTitle}>VV.Trends</h4>
            </Link>
            <Link href="/products?category=hampers" className={styles.categoryCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.categoryImage}>
                <img src="/images/hampers.png" alt="Personalised Hampers" />
              </div>
              <h4 className={styles.categoryTitle}>Personalised Hampers</h4>
            </Link>
            <Link href="/products?category=bouquets" className={styles.categoryCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.categoryImage}>
                <img src="/images/bouquets.png" alt="Elegant Bouquets" />
              </div>
              <h4 className={styles.categoryTitle}>Elegant Bouquets</h4>
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} bg-surface fade-in`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Best Selling Products</h3>
            <Link href="/products" className={styles.viewAll}>View All</Link>
          </div>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} fade-in`}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 className={styles.sectionTitle}>What Our Customers Say</h3>
          </div>
          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>★★★★★</div>
              <p>"The bouquet was absolutely stunning! Exceeded my expectations. The flowers were fresh and beautifully arranged."</p>
              <div className={styles.testimonialAuthor}>- Chakravarthy</div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>★★★★★</div>
              <p>"Perfect hampers for corporate gifting. Very professional service and the customisation options are great."</p>
              <div className={styles.testimonialAuthor}>- Virupa</div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>★★★★★</div>
              <p>"Beautifully packaged and delivered right on time. Highly recommend for any special occasion!"</p>
              <div className={styles.testimonialAuthor}>- Ded Deepya</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
