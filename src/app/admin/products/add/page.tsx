'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';

export default function AddProduct() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Bouquets',
    stock: '',
    fallbackImage: ''
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      
      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock);
      
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          submitData.append('images', file);
        });
      } else if (formData.fallbackImage) {
        submitData.append('fallbackImage', formData.fallbackImage);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add product');
      }

      setSuccess('Product added successfully!');
      setFormData({ name: '', price: '', category: 'Bouquets', stock: '', fallbackImage: '' });
      setImageFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      router.refresh();
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 style={{ marginBottom: '1.5rem', color: '#1E293B' }}>Add New Product</h2>
      
      {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
      {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Product Name (Auto-generated)</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Name will be set automatically (e.g. Product 10)"
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price (₹)</label>
            <input 
              type="number" 
              id="price" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
              min="0" 
              step="1" 
              placeholder="0"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="stock">Initial Stock</label>
            <input 
              type="number" 
              id="stock" 
              name="stock" 
              value={formData.stock} 
              onChange={handleChange} 
              required 
              min="0"
              placeholder="100"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <select 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            required
          >
            <option value="Bouquets">Bouquets</option>
            <option value="Hampers">Hampers</option>
            <option value="VV.Trends">VV.Trends</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="imageFiles" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Upload Images from Device (Multiple)</span>
            {imageFiles.length > 0 && <span style={{ color: 'var(--color-success)', fontSize: '0.8rem' }}>{imageFiles.length} files selected</span>}
          </label>
          <input 
            type="file" 
            id="imageFiles" 
            name="images" 
            accept="image/*"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ padding: '0.5rem', background: '#F8FAFC', cursor: 'pointer' }}
          />
          
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {previews.map((preview, idx) => (
                <div key={idx} style={{ position: 'relative', minWidth: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <img src={preview} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="fallbackImage">Or Image URL (Optional)</label>
          <input 
            type="url" 
            id="fallbackImage" 
            name="fallbackImage" 
            value={formData.fallbackImage} 
            onChange={handleChange} 
            placeholder="https://example.com/image.jpg"
            disabled={imageFiles.length > 0}
          />
          {imageFiles.length > 0 && <small style={{ color: '#64748B', display: 'block', marginTop: '0.25rem' }}>URL input disabled while local files are selected.</small>}
        </div>

        <div style={{ marginTop: '3rem', borderTop: '1px solid #E2E8F0', paddingTop: '2rem' }}>
          <button 
            type="submit" 
            className={styles.btnPrimary} 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '1.25rem', 
              fontSize: '1.1rem',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add Product to Store</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
