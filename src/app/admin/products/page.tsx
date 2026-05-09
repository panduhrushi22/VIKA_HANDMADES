'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { Product } from '@/lib/store';

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftUpdates, setDraftUpdates] = useState<Record<string, Partial<Product>>>({});

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    }
  };

  const handleDraftChange = (id: string, updates: Partial<Product>) => {
    setDraftUpdates(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...updates }
    }));
  };

  const handleCancel = (id: string) => {
    const newDrafts = { ...draftUpdates };
    delete newDrafts[id];
    setDraftUpdates(newDrafts);
  };

  const handleSave = async (id: string) => {
    const updates = draftUpdates[id];
    if (!updates) return;

    // Optimistic update
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
    const newDrafts = { ...draftUpdates };
    delete newDrafts[id];
    setDraftUpdates(newDrafts);

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        fetchProducts();
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      fetchProducts();
      alert('An error occurred while saving the product');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Manage Inventory</h3>
      </div>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Gallery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const draft = draftUpdates[product.id] || {};
                const currentPrice = draft.price !== undefined ? draft.price : product.price;
                const currentStock = draft.stock !== undefined ? draft.stock : product.stock;
                const isModified = draft.price !== undefined || draft.stock !== undefined;
                const imageCount = (product.images?.length || 0);

                return (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button 
                          onClick={() => handleDraftChange(product.id, { price: Math.max(0, currentPrice - 50) })}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #DDD', background: '#FFF', cursor: 'pointer' }}
                        >-</button>
                        <input 
                           type="number"
                           value={currentPrice}
                           onChange={(e) => handleDraftChange(product.id, { price: Number(e.target.value) })}
                           style={{ width: '80px', padding: '0.25rem', textAlign: 'center', border: isModified ? '1px solid #6366F1' : '1px solid #DDD', borderRadius: '4px' }}
                        />
                        <button 
                          onClick={() => handleDraftChange(product.id, { price: currentPrice + 50 })}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #DDD', background: '#FFF', cursor: 'pointer' }}
                        >+</button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button 
                          onClick={() => handleDraftChange(product.id, { stock: Math.max(0, currentStock - 1) })}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #DDD', background: '#FFF', cursor: 'pointer' }}
                        >-</button>
                        <input 
                          type="number"
                          value={currentStock}
                          onChange={(e) => handleDraftChange(product.id, { stock: Number(e.target.value) })}
                          style={{ width: '60px', padding: '0.25rem', textAlign: 'center', border: isModified ? '1px solid #6366F1' : '1px solid #DDD', borderRadius: '4px' }}
                        />
                        <button 
                          onClick={() => handleDraftChange(product.id, { stock: currentStock + 1 })}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #DDD', background: '#FFF', cursor: 'pointer' }}
                        >+</button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{imageCount} {imageCount === 1 ? 'Image' : 'Images'}</span>
                        <label className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', display: 'inline-block', width: 'fit-content', cursor: 'pointer' }}>
                          + Add Photos
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={async (e) => {
                              if (!e.target.files?.length) return;
                              const files = Array.from(e.target.files);
                              const formData = new FormData();
                              files.forEach(f => formData.append('images', f));
                              
                              try {
                                setLoading(true);
                                const res = await fetch(`/api/products/${product.id}`, {
                                  method: 'PATCH',
                                  body: formData
                                });
                                if (res.ok) {
                                  await fetchProducts();
                                } else {
                                  alert('Failed to upload images');
                                }
                              } catch (err) {
                                console.error(err);
                                alert('Upload error');
                              } finally {
                                setLoading(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isModified ? (
                          <>
                            <button 
                              onClick={() => handleSave(product.id)}
                              className={styles.btnPrimary}
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => handleCancel(product.id)}
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className={styles.btnDanger}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
