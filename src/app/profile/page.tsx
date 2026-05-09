'use client';

import { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { Order } from '@/lib/orders';
import { Address } from '@/lib/users';
import Link from 'next/link';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'settings' | 'customizations' | 'messages'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customizations, setCustomizations] = useState<any[]>([]);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelModalCustomizationId, setCancelModalCustomizationId] = useState<string | null>(null);

  const [user, setUser] = useState<{ name: string; email: string; phone: string; avatar: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');



  // Address States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    label: 'Home',
    name: '',
    phone: '',
    address: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Password change states
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  // Scroll lock and hide header/footer when cancelling or editing address
  useEffect(() => {
    const shouldHide = !!cancelModalOrderId || !!cancelModalCustomizationId || isAddressModalOpen;
    if (shouldHide) {
      document.body.classList.add('hide-nav');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('hide-nav');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.classList.remove('hide-nav');
      document.body.style.overflow = 'unset';
    };
  }, [cancelModalOrderId, cancelModalCustomizationId, isAddressModalOpen]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        const initials = data.user.name ? data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
        setUser({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          avatar: initials
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, email: user.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Profile updated successfully!');
        fetchUserData();
      } else {
        setErrorMsg(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setErrorMsg('New passwords do not match');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(passwords.new);
    const hasNumber = /[0-9]/.test(passwords.new);
    
    if (!hasUpperCase || !hasNumber) {
      setErrorMsg('New password must contain at least one uppercase letter and one number');
      return;
    }
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: passwords.old, newPassword: passwords.new }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Password changed successfully!');
        setPasswords({ old: '', new: '', confirm: '' });
      } else {
        setErrorMsg(data.error || 'Failed to change password');
      }
    } catch (err) {
      setErrorMsg('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      const data = await res.json();
      if (res.ok) setAddresses(data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCustomizations = async () => {
      try {
        const response = await fetch('/api/customizations');
        if (response.ok) {
          const data = await response.json();
          setCustomizations(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (error) {
        console.error('Error fetching customizations:', error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setUserMessages(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchOrders();
    fetchAddresses();
    fetchCustomizations();
    fetchMessages();
  }, []);

  // Scroll lock when modal is open
  useEffect(() => {
    if (isAddressModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isAddressModalOpen]);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    
    // Handle case with +91 already included
    if (phone.startsWith('+91 ')) {
      const suffix = phone.slice(4).replace(/\s/g, ''); // remove any existing spaces
      if (suffix.length > 5) {
        return '+91 ' + suffix.slice(0, 5) + ' ' + suffix.slice(5, 10);
      }
      return phone;
    }
    
    // Handle raw 10 digit number
    if (clean.length === 10) {
      return clean.slice(0, 5) + ' ' + clean.slice(5);
    }
    
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEstimatedDelivery = (order: Order) => {
    if (order.estimatedDelivery) {
      return new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + 4); // Default 4 days for delivery
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'completed': return 4;
      default: return 1;
    }
  };

  const confirmCancelOrder = async () => {
    if (!cancelModalOrderId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${cancelModalOrderId}/cancel`, { method: 'POST' });
      if (res.ok) {
        // Refresh orders
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
        setSuccessMsg('Order cancelled successfully');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to cancel order');
      }
    } catch (err) {
      setErrorMsg('Something went wrong');
    } finally {
      setIsLoading(false);
      setCancelModalOrderId(null);
    }
  };

  const handleStayOrder = async () => {
    if (!cancelModalOrderId) return;
    setIsLoading(true);
    try {
      await fetch(`/api/orders/${cancelModalOrderId}/stay`, { method: 'POST' });
      setSuccessMsg('Thank you for choosing to stay with your order!');
    } catch (err) {
      console.error('Error staying order:', err);
    } finally {
      setIsLoading(false);
      setCancelModalOrderId(null);
    }
  };

  const confirmCancelCustomization = async () => {
    if (!cancelModalCustomizationId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customizations/${cancelModalCustomizationId}/cancel`, { method: 'POST' });
      if (res.ok) {
        const response = await fetch('/api/customizations');
        if (response.ok) {
          const data = await response.json();
          setCustomizations(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
        setSuccessMsg('Customization request cancelled successfully');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to cancel request');
      }
    } catch (err) {
      setErrorMsg('Something went wrong');
    } finally {
      setIsLoading(false);
      setCancelModalCustomizationId(null);
    }
  };

  const handleStayCustomization = async () => {
    if (!cancelModalCustomizationId) return;
    setIsLoading(true);
    try {
      await fetch(`/api/customizations/${cancelModalCustomizationId}/stay`, { method: 'POST' });
      setSuccessMsg('Thank you for choosing to stay with your request!');
    } catch (err) {
      console.error('Error staying customization:', err);
    } finally {
      setIsLoading(false);
      setCancelModalCustomizationId(null);
    }
  };

  const handleOpenAddressModal = (address: Address | null = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        label: address.label,
        name: address.name,
        phone: address.phone || '+91 ',
        address: address.address,
        area: address.area,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.is_default || (address as any).isDefault
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: 'Home',
        name: user?.name || '',
        phone: '+91 ',
        address: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}` 
        : '/api/user/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      if (res.ok) {
        setSuccessMsg(editingAddress ? 'Address updated!' : 'Address added!');
        setIsAddressModalOpen(false);
        fetchAddresses();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to save address');
      }
    } catch (err) {
      setErrorMsg('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg('Address deleted');
        fetchAddresses();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };
  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}/set-default`, { method: 'POST' });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (err) {
      console.error('Set default error:', err);
    }
  };

  if (!user) {
    return (
      <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading your profile...</p>
      </main>
    );
  }

  const handleTabChange = async (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'customizations') {
      await fetch('/api/user/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'customization' })
      });
    } else if (tab === 'messages') {
      await fetch('/api/user/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'message' })
      });
    }
  };

  return (
    <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
      
      <div className={`container ${styles.profileContainer}`}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{user.avatar}</div>
          <div className={styles.userInfo}>
            <h2>{user.name}</h2>
            <p>{user.email} • {user.phone}</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <div 
            className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            My Orders
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'addresses' ? styles.active : ''}`}
            onClick={() => handleTabChange('addresses')}
          >
            Saved Addresses
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'customizations' ? styles.active : ''}`}
            onClick={() => handleTabChange('customizations')}
          >
            My Customizations
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'messages' ? styles.active : ''}`}
            onClick={() => handleTabChange('messages')}
          >
            My Messages
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            Account Settings
          </div>
        </div>

        <div className={styles.contentSection}>
          {activeTab === 'orders' && (
            <div className={styles.ordersList}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your orders...</div>
              ) : Array.isArray(orders) && orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span className={styles.orderId}>Order #{order.id}</span>
                        <span className={styles.orderDate}>
                          {new Date(order.created_at || order.createdat || order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`${styles.orderStatus} ${styles['status-' + order.status?.toLowerCase()]}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className={styles.orderDetails}>
                      <div className={styles.orderItems}>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className={styles.itemRow}>
                            <img src={item.image} alt={item.name} className={styles.itemImage} />
                            <div className={styles.itemInfo}>
                              <h5>{item.name}</h5>
                              <p>Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.orderSummary}>
                        <div className={styles.summaryRow}>
                          <span>Subtotal</span>
                          <span>₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span>Shipping</span>
                          <span>{(order.delivery_fee || order.deliveryfee || order.deliveryFee) === 0 ? 'FREE' : `₹${(order.delivery_fee || order.deliveryfee || order.deliveryFee)}`}</span>
                        </div>
                        {(order.discount || 0) > 0 && (
                          <div className={styles.summaryRow} style={{ color: 'var(--color-success)' }}>
                            <span>Discount</span>
                            <span>-₹{(order.discount || 0).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className={styles.totalRow}>
                          <span>Total</span>
                          <span>₹{(order.total || 0).toLocaleString('en-IN')}</span>
                        </div>

                      </div>
                    </div>
                    
                    <div className={styles.orderFooter}>
                      <div className={styles.estimation}>
                        {order.status === 'cancelled' ? (
                          <span style={{ color: 'var(--color-danger)' }}>Order Cancelled</span>
                        ) : (
                          <>Estimated Delivery: <strong>{getEstimatedDelivery(order)}</strong></>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button 
                            className={styles.trackBtn}
                            onClick={() => setCancelModalOrderId(order.id)}
                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                          >
                            Cancel Order
                          </button>
                        )}
                        <button 
                          className={styles.trackBtn}
                          onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          {trackingOrderId === order.id ? 'Hide Tracking' : 'Track Order'}
                        </button>
                      </div>
                    </div>

                    {trackingOrderId === order.id && (
                      <div className={styles.trackingSection}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Order Progress</h4>
                        <div className={styles.trackingBar}>
                          {[
                            { step: 1, label: 'Placed' },
                            { step: 2, label: 'Processing' },
                            { step: 3, label: 'Shipped' },
                            { step: 4, label: 'Delivered' }
                          ].map((s) => {
                            const currentStep = getStatusStep(order.status);
                            let statusClass = '';
                            if (currentStep > s.step) statusClass = styles.completed;
                            else if (currentStep === s.step) statusClass = styles.active;
                            
                            return (
                              <div key={s.step} className={`${styles.trackStep} ${statusClass}`}>
                                <div className={styles.trackDot}></div>
                                <span className={styles.trackLabel}>{s.label}</span>
                              </div>
                            );
                          })}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                          {order.status === 'pending' ? 'We have received your order and are verifying the payment.' : 
                           order.status === 'processing' ? 'Your bouquet is being handcrafted with love.' :
                           order.status === 'shipped' ? 'Your order is on its way to you!' :
                           'Order has been successfully delivered.'}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🛍️</div>
                  <h3>No orders yet</h3>
                  <p>Looks like you haven't placed any orders yet. Start shopping to fill this up!</p>
                  <Link href="/products" className="btn btn-primary">Start Shopping</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customizations' && (
            <div className={styles.ordersList}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your your customizations...</div>
              ) : Array.isArray(customizations) && customizations.length > 0 ? (
                customizations.map((req) => (
                  <div key={req.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span className={styles.orderId}>Request #{req.id}</span>
                        <span className={styles.orderDate}> • {formatDate(req.createdat || req.createdAt)}</span>
                      </div>
                      <span className={`${styles.orderStatus} ${styles['status-' + req.status] || ''}`} style={{
                        background: req.status === 'pending' ? '#FFF3CD' : req.status === 'cancelled' ? '#FEE2E2' : '#E8F5E9',
                        color: req.status === 'pending' ? '#856404' : req.status === 'cancelled' ? '#991B1B' : '#155724'
                      }}>
                        {req.status}
                      </span>
                    </div>
                    <div className={styles.orderDetails} style={{ flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <span style={{ color: '#666' }}>Category:</span>
                        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{req.category}</span>
                        
                        {req.options && Object.entries(req.options || {}).map(([key, value]) => (
                          <div key={key} style={{ display: 'contents' }}>
                            <span style={{ color: '#666', textTransform: 'capitalize' }}>{key}:</span>
                            <span style={{ fontWeight: 500 }}>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                      
                      {(req.custominput || req.customInput) && (
                        <div style={{ marginTop: '0.5rem', background: '#fafafa', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', fontStyle: 'italic', color: '#333' }}>
                          "{req.custominput || req.customInput}"
                        </div>
                      )}

                      {(req.adminreply || req.adminReply) && (
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>ADMIN REPLY:</div>
                          <div style={{ background: '#FDF2F2', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                            {req.adminreply || req.adminReply}
                          </div>
                        </div>
                      )}
                    </div>
                    {req.status === 'pending' && (
                      <div className={styles.orderFooter} style={{ borderTop: '1px solid #eee', padding: '1.5rem', marginTop: '1rem' }}>
                        <div className={styles.estimation}></div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button 
                            className={styles.trackBtn}
                            onClick={() => setCancelModalCustomizationId(req.id)}
                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>✨</div>
                  <h3>No custom requests</h3>
                  <p>You haven't made any custom requests yet.</p>
                  <Link href="/customize" className="btn btn-primary">Start Customizing</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className={styles.ordersList}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your messages...</div>
              ) : Array.isArray(userMessages) && userMessages.length > 0 ? (
                userMessages.map((msg) => (
                  <div key={msg.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span className={styles.orderId}>Message #{msg.id}</span>
                        <span className={styles.orderDate}> • {formatDate(msg.createdat || msg.createdAt)}</span>
                      </div>
                      <span className={styles.orderStatus} style={{
                        background: (msg.adminreply || msg.adminReply) ? '#E8F5E9' : '#FFF3CD',
                        color: (msg.adminreply || msg.adminReply) ? '#155724' : '#856404'
                      }}>
                        {(msg.adminreply || msg.adminReply) ? 'Replied' : 'Pending'}
                      </span>
                    </div>
                    <div className={styles.orderDetails} style={{ flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', color: '#333' }}>
                        "{msg.message}"
                      </div>
                      
                      {(msg.adminreply || msg.adminReply) && (
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>ADMIN REPLY:</div>
                          <div style={{ background: '#FDF2F2', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                            {msg.adminreply || msg.adminReply}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))

              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>✉️</div>
                  <h3>No messages yet</h3>
                  <p>Have a question? Send us a message from the Contact page!</p>
                  <Link href="/contact" className="btn btn-primary">Contact Us</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className={styles.addressGrid}>
              {Array.isArray(addresses) && addresses.map((addr) => (

                <div key={addr.id} className={`${styles.addressCard} ${(addr.is_default || (addr as any).isDefault) ? styles.default : ''}`}>
                  {(addr.is_default || (addr as any).isDefault) && <span className={styles.defaultBadge}>Default</span>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4>{addr.label}</h4>
                    {!(addr.is_default || (addr as any).isDefault) && (
                      <button 
                        onClick={() => handleSetDefault(addr.id)}
                        style={{ fontSize: '0.7rem', color: 'var(--color-primary-dark)', cursor: 'pointer' }}
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                  <p>
                    <strong>{addr.name}</strong><br />
                    {addr.address}<br />
                    {addr.area}<br />
                    {addr.city}, {addr.state} - {addr.pincode}<br />
                    Phone: {formatPhoneNumber(addr.phone)}
                  </p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => handleOpenAddressModal(addr)}
                      style={{ color: 'var(--color-primary-dark)', fontWeight: '600', fontSize: '0.9rem' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{ color: 'var(--color-danger)', fontWeight: '600', fontSize: '0.9rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              <div 
                className={styles.addressCard} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', cursor: 'pointer' }}
                onClick={() => handleOpenAddressModal()}
              >
                <div style={{ color: 'var(--color-text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>+</span> Add New Address
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={styles.settingsForm}>
              <form onSubmit={handleUpdateProfile} style={{ marginBottom: '3rem' }}>
                <h4 className={styles.sectionTitle}>Personal Information</h4>
                
                {activeTab === 'settings' && successMsg && !passwords.old && (
                  <div className={`${styles.message} ${styles.messageSuccess}`}>{successMsg}</div>
                )}
                {activeTab === 'settings' && errorMsg && !passwords.old && (
                  <div className={`${styles.message} ${styles.messageError}`}>{errorMsg}</div>
                )}
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={user.name} 
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    placeholder="Enter your name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    placeholder="name@example.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input type="tel" value={user.phone} readOnly style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} />
                  <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>Phone number cannot be changed</p>
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                  <button type="submit" className={styles.submitBtn} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </form>

              <form onSubmit={handleChangePassword}>
                <h4 className={styles.sectionTitle}>Security</h4>
                
                {activeTab === 'settings' && successMsg && passwords.old && (
                  <div className={`${styles.message} ${styles.messageSuccess}`}>{successMsg}</div>
                )}
                {activeTab === 'settings' && errorMsg && passwords.old && (
                  <div className={`${styles.message} ${styles.messageError}`}>{errorMsg}</div>
                )}
                <div className={styles.formGroup}>
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passwords.old} 
                    onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={passwords.new} 
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    placeholder="Min 6 characters"
                  />
                  <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.4rem' }}>
                    At least one uppercase letter and one number required
                  </p>
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwords.confirm} 
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                  <button type="submit" className={styles.submitBtn} disabled={isSaving}>
                    {isSaving ? 'Updating Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
              <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #EEE' }} />
              <div className={styles.formGroup}>
                <button 
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                  className="btn btn-outline" 
                  style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleSaveAddress}>
              <div className={styles.formGroup}>
                <label>Label (Home/Office/etc.)</label>
                <input 
                  type="text" 
                  value={addressForm.label} 
                  onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Receiver Name</label>
                <input 
                  type="text" 
                  value={addressForm.name} 
                  onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={addressForm.phone} 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value.startsWith('+91 ')) {
                      setAddressForm({...addressForm, phone: '+91 '});
                      return;
                    }
                    const suffix = value.slice(4).replace(/\D/g, '').slice(0, 10);
                    let formattedSuffix = suffix;
                    if (suffix.length > 5) {
                      formattedSuffix = suffix.slice(0, 5) + ' ' + suffix.slice(5);
                    }
                    setAddressForm({...addressForm, phone: '+91 ' + formattedSuffix});
                  }}
                  required 
                />

              </div>
              <div className={styles.formGroup}>
                <label>Full Address</label>
                <textarea 
                  value={addressForm.address} 
                  onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                  required 
                  rows={2}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Area/Landmark</label>
                  <input 
                    type="text" 
                    value={addressForm.area} 
                    onChange={(e) => setAddressForm({...addressForm, area: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input 
                    type="text" 
                    value={addressForm.city} 
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input 
                    type="text" 
                    value={addressForm.state} 
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Pincode</label>
                  <input 
                    type="text" 
                    value={addressForm.pincode} 
                    onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={addressForm.isDefault} 
                  onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                <label style={{ margin: 0 }}>Set as default address</label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsAddressModalOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Cancel Order Modal */}
      {cancelModalOrderId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-danger)' }}>Cancel Order?</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
              Are you sure you want to cancel this order? We'd love to fulfill it for you!
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button 
                onClick={confirmCancelOrder}
                className="btn btn-outline"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Yes, Cancel Order'}
              </button>
              <button 
                onClick={handleStayOrder}
                className="btn btn-primary"
                disabled={isLoading}
              >
                No, Stay Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Customization Modal */}
      {cancelModalCustomizationId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-danger)' }}>Cancel Request?</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
              Are you sure you want to cancel this custom request? We'd love to fulfill it for you!
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button 
                onClick={confirmCancelCustomization}
                className="btn btn-outline"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Yes, Cancel Request'}
              </button>
              <button 
                onClick={handleStayCustomization}
                className="btn btn-primary"
                disabled={isLoading}
              >
                No, Keep Request
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
