'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Product, Review } from '@/lib/store';

export default function AdminReviewsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const allReviews = products.flatMap(p => 
    (p.reviews || []).map(r => ({ ...r, productName: p.name, productId: p.id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div className="container" style={{ padding: '2rem 0' }}>
        <h1 style={{ marginBottom: '2rem', color: '#1E293B' }}>Review Management</h1>

        {loading ? (
          <p>Loading reviews...</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allReviews.length > 0 ? (
                  allReviews.map((review) => (
                    <tr key={review.id}>
                      <td style={{ fontWeight: '500' }}>{review.productName}</td>
                      <td>{review.userName}</td>
                      <td>
                        <div style={{ color: '#FFB800' }}>
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px', fontStyle: 'italic' }}>"{review.comment}"</td>
                      <td>{review.date}</td>
                      <td>
                        <button 
                          className={styles.btnDanger}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px' }}
                          onClick={async () => {
                            if (!confirm('Are you sure you want to delete this review?')) return;
                            try {
                              const res = await fetch(`/api/reviews?productId=${review.productId}&reviewId=${review.id}`, {
                                method: 'DELETE'
                              });
                              if (res.ok) {
                                setProducts(prev => prev.map(p => {
                                  if (p.id === review.productId) {
                                    return { ...p, reviews: (p.reviews || []).filter(r => r.id !== review.id) };
                                  }
                                  return p;
                                }));
                              } else {
                                alert('Failed to delete review');
                              }
                            } catch (err) {
                              console.error(err);
                              alert('Delete error');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>No reviews found across products.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
