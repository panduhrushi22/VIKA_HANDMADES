'use client';

import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, settings, appliedCoupon } = useStore();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Delivery Calculation
  const isFreeDelivery = settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;

  // Discount Calculation
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
  }

  const total = subtotal + deliveryFee - discount;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-lg)' }}>Your Cart</h2>
        
        {cart.length === 0 ? (
          <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-xl) var(--spacing-md)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
            <svg style={{ margin: '0 auto var(--spacing-md)', color: 'var(--color-text-light)' }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Your Cart is Empty</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}>
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/products" className="btn btn-primary" style={{ width: '100%' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            <style jsx>{`
              @media (max-width: 900px) {
                .cart-grid {
                  grid-template-columns: 1fr !important;
                }
              }
              @media (max-width: 600px) {
                .cart-item {
                  flex-direction: column !important;
                  align-items: flex-start !important;
                  gap: 1rem !important;
                }
                .cart-item :global(img) {
                  width: 100% !important;
                  height: 200px !important;
                }
                .item-actions {
                  width: 100% !important;
                  justify-content: space-between !important;
                }
              }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                  <div key={item.id} className="cart-item" style={{ display: 'flex', gap: '1.5rem', backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', alignItems: 'center' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{item.name}</h4>
                      <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0' }}>{item.category}</p>
                      <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="item-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', borderRadius: 'var(--radius-sm)' }}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer' }}
                        >-</button>
                        <span style={{ padding: '0 0.5rem', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer' }}
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </div>
              ))}
            </div>
            
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Delivery</span>
                {deliveryFee === 0 ? (
                  <span style={{ color: 'var(--color-success)' }}>FREE</span>
                ) : (
                  <span>₹{deliveryFee.toLocaleString('en-IN')}</span>
                )}
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--color-success)' }}>
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid #EEE' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.4rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
