'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Order } from '@/lib/orders';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    
    // Handle case with +91 already included
    if (phone.startsWith('+91 ')) {
      const suffix = phone.slice(4).replace(/\s/g, '');
      if (suffix.length > 5) {
        return '+91 ' + suffix.slice(0, 5) + ' ' + suffix.slice(5, 10);
      }
      return phone;
    }
    
    if (clean.length === 10) {
      return clean.slice(0, 5) + ' ' + clean.slice(5);
    }
    return phone;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    // Basic ID validation
    if (!id) {
      alert('Error: Missing Order ID');
      return;
    }

    setUpdatingId(id);
    try {
      console.log(`Sending PATCH request for ${id}`, updates);
      
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Update successful:', result);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
      } else {
        console.error('Update failed:', result);
        alert(`Failed to update order: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network/Request error:', error);
      alert('Error: Could not connect to server to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>All Orders</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Estimated Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} style={{ opacity: updatingId === order.id ? 0.5 : 1 }}>
                  <td><strong>{order.id}</strong></td>
                  <td>
                    <div>{order.shipping_details?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{formatPhoneNumber(order.shipping_details?.phone || '') || 'No phone'}</div>
                  </td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td>₹{order.total?.toLocaleString('en-IN') || 0}</td>
                  <td>
                    <select 
                      disabled={updatingId === order.id}
                      value={order.status} 
                      onChange={(e) => handleUpdate(order.id, { status: e.target.value })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #DDD',
                        fontSize: '0.9rem',
                        backgroundColor: '#FFF',
                        cursor: updatingId === order.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {order.payment_screenshot ? (
                      <div style={{ position: 'relative', width: '40px', height: '40px', cursor: 'pointer' }} onClick={() => window.open((order.payment_screenshot)!, '_blank')}>
                        <img 
                          src={order.payment_screenshot} 
                          alt="Payment" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #EEE' }} 
                        />
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', opacity: 0, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0'}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>{order.payment_method === 'cod' ? 'COD' : 'N/A'}</span>
                    )}
                  </td>
                  <td>
                    <input 
                      disabled={updatingId === order.id}
                      type="date" 
                      value={order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleUpdate(order.id, { estimated_delivery: e.target.value })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #DDD',
                        fontSize: '0.9rem',
                        backgroundColor: '#FFF',
                        cursor: updatingId === order.id ? 'not-allowed' : 'pointer'
                      }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className={styles.trackBtn}
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                        onClick={() => {
                          const details = order.shipping_details;
                          alert(`Details for ${order.id}: \nAddress: ${details?.address}, ${details?.city}`);
                        }}
                      >
                        Details
                      </button>

                      {order.status !== 'cancelled' && (
                        <button 
                          className={styles.trackBtn}
                          style={{ fontSize: '0.8rem', padding: '4px 8px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                          onClick={() => {
                            if (confirm(`Cancel order ${order.id}?`)) {
                              handleUpdate(order.id, { status: 'cancelled' });
                            }
                          }}
                        >
                          Cancel
                        </button>
                      )}


                      <button 
                        className={styles.btnDanger}
                        style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px' }}
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to delete order ${order.id}?`)) return;
                          try {
                            setUpdatingId(order.id);
                            const res = await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              setOrders(prev => prev.filter(o => o.id !== order.id));
                            } else {
                              alert('Failed to delete order');
                            }
                          } catch (err) {
                            console.error(err);
                            alert('Delete error');
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
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
  );
}
