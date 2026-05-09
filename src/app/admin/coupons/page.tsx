'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    expiryDate: '',
    usageLimit: ''
  });
  const [error, setError] = useState('');
  const [editingDate, setEditingDate] = useState<{ id: string, date: string } | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    setCoupons(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });

      if (res.ok) {
        setNewCoupon({
          code: '',
          type: 'percentage',
          value: '',
          minOrderAmount: '',
          expiryDate: '',
          usageLimit: ''
        });
        setShowAddForm(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create coupon');
      }
    } catch (error) {
      setError('An error occurred.');
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    const res = await fetch(`/api/coupons?id=${code}`, { method: 'DELETE' });
    if (res.ok) {
      fetchCoupons();
    }
  };


  const handleUpdateExpiry = async (code: string, newDate: string) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: code, expiryDate: newDate })
      });
      
      if (res.ok) {
        setEditingDate(null);
        fetchCoupons();
      } else {
        alert('Failed to update expiry date');
      }
    } catch (err) {
      alert('Error updating date');
    }
  };

  if (isLoading) return <div>Loading coupons...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Active Discount Coupons</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: 'var(--color-primary-dark)', 
            color: 'white', 
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {showAddForm ? 'Cancel' : '+ Create New Coupon'}
        </button>
      </div>

      {showAddForm && (
        <div className={styles.card} style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Create New Coupon</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Coupon Code*</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: '4px' }}
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  placeholder="SAVE20"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Discount Type*</label>
                <select 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: '4px' }}
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Value*</label>
                <input 
                  type="number" 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: '4px' }}
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                  placeholder={newCoupon.type === 'percentage' ? '20' : '100'}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Min Order Amount (₹)</label>
                <input 
                  type="number" 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: '4px' }}
                  value={newCoupon.minOrderAmount}
                  onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: e.target.value})}
                  placeholder="500"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Expiry Date</label>
                <input 
                  type="date" 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: '4px' }}
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Usage Limit</label>
                <input 
                  type="number" 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: '4px' }}
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({...newCoupon, usageLimit: e.target.value})}
                  placeholder="100"
                />
              </div>
            </div>

            {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

            <button 
              type="submit"
              style={{ 
                padding: '0.75rem 2rem', 
                backgroundColor: 'var(--color-primary-dark)', 
                color: 'white', 
                borderRadius: '4px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Save Coupon
            </button>
          </form>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Expiry</th>
                <th>Usage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No active coupons found.</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.code}>
                    <td><strong style={{ letterSpacing: '1px' }}>{coupon.code}</strong></td>
                    <td>{coupon.type === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}</td>
                    <td>₹{coupon.min_order_value || coupon.minorderamount || coupon.minOrderAmount || 0}</td>
                    <td>
                      <span style={{ 
                        color: (coupon.expiry_date || coupon.expirydate || coupon.expiryDate) && new Date(coupon.expiry_date || coupon.expirydate || coupon.expiryDate!) < new Date() ? '#E53935' : 'inherit',
                        fontWeight: (coupon.expiry_date || coupon.expirydate || coupon.expiryDate) && new Date(coupon.expiry_date || coupon.expirydate || coupon.expiryDate!) < new Date() ? 'bold' : 'normal'
                      }}>
                        {coupon.expiry_date || coupon.expirydate || coupon.expiryDate ? new Date(coupon.expiry_date || coupon.expirydate || coupon.expiryDate!).toLocaleDateString() : 'Never'}
                        {(coupon.expiry_date || coupon.expirydate || coupon.expiryDate) && new Date(coupon.expiry_date || coupon.expirydate || coupon.expiryDate!) < new Date() && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.7rem', 
                            backgroundColor: '#FFEBEE', 
                            color: '#E53935', 
                            padding: '0.1rem 0.4rem', 
                            borderRadius: '4px',
                            border: '1px solid #FFCDD2'
                          }}>
                            EXPIRED
                          </span>
                        )}
                      </span>
                    </td>
                    <td>{coupon.usage_count || coupon.usagecount || coupon.usageCount || 0} / {coupon.usage_limit || coupon.usagelimit || coupon.usageLimit || '∞'}</td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {editingDate && editingDate.id === coupon.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="date" 
                              value={editingDate.date}
                              onChange={(e) => setEditingDate({ ...editingDate, date: e.target.value })}
                              style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #DDD' }}
                            />
                            <button 
                              onClick={() => handleUpdateExpiry(coupon.code, editingDate.date)}
                              style={{ color: 'var(--color-success)', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', fontWeight: 'bold' }}
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingDate(null)}
                              style={{ color: '#666', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setEditingDate({ id: coupon.code, date: coupon.expiry_date || coupon.expirydate || coupon.expiryDate || '' })}
                            style={{ color: 'var(--color-primary-dark)', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
                          >
                            Extend
                          </button>

                        )}
                        <button 
                          onClick={() => handleDelete(coupon.code)}
                          style={{ color: '#E53935', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
