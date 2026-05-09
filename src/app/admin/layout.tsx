'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';
import { Order } from '@/lib/orders';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Order[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [adminUser, setAdminUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAdminUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  // Notification sound/alert simulation
  useEffect(() => {
    const checkOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) return;
        
        const orders: Order[] = await res.json();
        if (!Array.isArray(orders)) return;
        
        if (orders.length > lastOrderCount && lastOrderCount !== 0) {
          const newOrders = orders.slice(0, orders.length - lastOrderCount);
          setNotifications(prev => [...newOrders, ...prev]);
          
          // Browser Notification
          if ("Notification" in window && Notification.permission === "granted") {
            const firstOrder = newOrders[0];
            const customerName = firstOrder.shipping_details?.name || 'Customer';
            new Notification("New Order Received!", {
              body: `Order #${firstOrder.id} from ${customerName}`,
              icon: '/favicon.ico'
            });
          }
          
          console.log("New order detected! Phone notification triggered.");
        }
        setLastOrderCount(orders.length);
      } catch (err) {
        console.error('Error checking orders:', err);
      }
    };


    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(checkOrders, 10000); // Check every 10 seconds
    checkOrders();
    return () => clearInterval(interval);
  }, [lastOrderCount]);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Manage Orders', href: '/admin/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Manage Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Add Product', href: '/admin/products/add', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { name: 'Delivery Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { name: 'Manage Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { name: 'Manage Reviews', href: '/admin/reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { name: 'Customizations', href: '/admin/customizations', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
    { name: 'Customer Messages', href: '/admin/messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/admin/orders?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className={styles.adminContainer}>
      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <h2>VIKA</h2>
          <p>Administration</p>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={() => setIsSidebarOpen(false)} 
              className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.name}
            </Link>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <Link href="/" className={styles.navItem}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Store
            </Link>
          </div>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.menuToggle} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className={styles.topbarTitle}>
              {navItems.find(i => i.href === pathname)?.name || 'Admin'}
            </h1>
          </div>
          <div className={styles.topbarActions}>
            <form className={styles.searchBar} onSubmit={handleSearch}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div style={{ position: 'relative' }}>
              <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && <span className={styles.notificationDot}></span>}
              </button>
              
              {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: 0, width: '300px', backgroundColor: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100, border: '1px solid #EEE', marginTop: '0.5rem' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #EEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>Notifications</h4>
                    <button onClick={() => setNotifications([])} style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Clear</button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length > 0 ? notifications.map(n => {
                      const customerName = n.shipping_details?.name || 'Customer';
                      const orderTotal = n.total || 0;
                      return (
                        <div key={n.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F9F9F9', cursor: 'pointer' }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>New Order #{n.id}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>From {customerName}</p>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-primary)' }}>₹{orderTotal.toLocaleString('en-IN')}</p>
                          <a 
                            href={`https://wa.me/916301291468?text=${encodeURIComponent(`New Order Alert! \nID: ${n.id} \nCustomer: ${customerName} \nTotal: ₹${orderTotal}`)}`} 
                            target="_blank" 
                            style={{ fontSize: '0.7rem', color: '#25D366', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}
                          >
                            Send WhatsApp Alert
                          </a>
                        </div>
                      );
                    }) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No new notifications</div>
                    )}

                  </div>
                </div>
              )}
            </div>
            <button className={styles.profileBtn} onClick={handleLogout} title="Logout">
              <div className={styles.profileAvatar}>
                {adminUser?.name ? adminUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'AD'}
              </div>
              <span className={styles.profileName}>{adminUser?.name || 'Admin'} (Logout)</span>
            </button>
          </div>
        </header>

        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
