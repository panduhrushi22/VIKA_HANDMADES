'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { Product } from '@/lib/store';
import { Order } from '@/lib/orders';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pRes, oRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);
      const pData = await pRes.json();
      const oData = await oRes.json();
      setProducts(Array.isArray(pData) ? pData : []);
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const topProducts = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5);

  const stats = [
    { label: 'Total Orders', value: orders.length.toString(), icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Total Products', value: products.length.toString(), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: '#10B981', bg: '#ECFDF5' },
    { label: 'Total Customers', value: new Set(orders.map(o => o.shipping_details?.phone)).size.toString(), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Dashboard...</div>;

  return (
    <>
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ backgroundColor: stat.bg, color: stat.color }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
              </div>
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.dashboardLayout}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Sales Analytics</h3>
            <div className={styles.cardAction}>Real-time</div>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.barChart}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={i} className={styles.barWrapper}>
                  <div className={styles.bar} style={{ height: '20%' }}></div>
                  <span className={styles.barLabel}>{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Top Products</h3>
          </div>
          <div style={{ padding: '0.5rem 1.5rem' }}>
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={p.id} className={styles.productItem} style={{ borderBottom: i === topProducts.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
                <img src={p.image} alt={p.name} className={styles.productImg} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=P' }} />
                <div className={styles.productMeta} style={{ flex: 1 }}>
                  <h5>{p.name}</h5>
                  <p>₹{p.price}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{p.sales || 0}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Sales</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)}
                    className={styles.btnDanger}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No products found.</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Orders</h3>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: '#6366F1' }}>{order.id}</td>
                  <td style={{ fontWeight: 500 }}>{order.shipping_details?.name || 'Guest'}</td>
                  <td>{new Date(order.created_at || 0).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>₹{order.total?.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`${styles.status} ${styles[`status${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}`]}`}>
                      <span className={styles.statusDot}></span>
                      {order.status || 'pending'}
                    </span>
                  </td>
                </tr>

              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
