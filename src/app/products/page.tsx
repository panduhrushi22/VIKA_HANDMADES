import ProductCard from '@/components/ProductCard';
import styles from '../page.module.css';
import { getProducts } from '@/lib/store';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categoryParam = params.category as string | undefined;
  const searchParam = params.search as string | undefined;
  
  const productsResult = await getProducts();
  const allProducts = productsResult.filter(p => p.category !== 'Customize');
  let filtered = allProducts;
  
  if (categoryParam && categoryParam.toLowerCase() !== 'all') {
    filtered = filtered.filter(p => {
      if (!p.category) return false;
      const productCat = p.category.toLowerCase().replace(/[\s-]/g, '');
      const paramCat = categoryParam.toLowerCase().replace(/[\s-]/g, '');
      return productCat === paramCat || productCat.startsWith(paramCat) || paramCat.startsWith(productCat);
    });
  }

  if (searchParam) {
    const searchLower = searchParam.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.category && p.category.toLowerCase().includes(searchLower))
    );
  }

  const displayTitle = searchParam 
    ? `Search Results for "${searchParam}"`
    : (categoryParam && categoryParam.toLowerCase() !== 'all' 
        ? `${categoryParam.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Collection` 
        : 'All Products');

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-lg)', textAlign: 'center', textTransform: 'capitalize' }}>
          {displayTitle}
        </h2>
        
        {filtered.length > 0 ? (
          <div className={styles.productGrid}>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
              No products available in this category
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
