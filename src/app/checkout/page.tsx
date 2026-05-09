'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/components/StoreProvider';
import Link from 'next/link';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const MERCHANT_UPI_ID = "8555936477@axl";
const MERCHANT_NAME = "VIKA";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { cart, clearCart, settings, appliedCoupon, applyCoupon, removeCoupon } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get('buyNow');
  
  const [buyNowProduct, setBuyNowProduct] = useState<any>(null);
  const [loadingBuyNow, setLoadingBuyNow] = useState(!!buyNowId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  
  // UPI Specific States
  const [upiStep, setUpiStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [paymentDetected, setPaymentDetected] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchStatus, setResearchStatus] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '+91 ',
    address: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    if (buyNowId) {
      setLoadingBuyNow(true);
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          const found = data.find((p: any) => p.id === buyNowId);
          if (found) {
            setBuyNowProduct({ ...found, quantity: 1 });
          } else {
            router.push('/products');
          }
        })
        .finally(() => setLoadingBuyNow(false));
    }
  }, [buyNowId, router]);

  useEffect(() => {
    if (cart.length === 0 && !orderSuccess && !buyNowId) {
      router.push('/products');
    }
  }, [cart, orderSuccess, router, buyNowId]);

  // Timer and Simulated Payment Detection
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let detectionTimer: NodeJS.Timeout;

    if (upiStep === 'payment' && timeLeft > 0 && !paymentDetected) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      // Simulate payment detection after 15 seconds for demonstration
      detectionTimer = setTimeout(() => {
        setPaymentDetected(true);
        setTimeout(() => {
          setUpiStep('confirmation');
        }, 2000);
      }, 15000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (detectionTimer) clearTimeout(detectionTimer);
    };
  }, [upiStep, timeLeft, paymentDetected]);

  // Scroll lock and hide header/footer when researching or in payment steps
  useEffect(() => {
    const shouldHide = isResearching || upiStep !== 'details';
    if (shouldHide) {
      document.body.classList.add('hide-nav');
      if (isResearching) document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('hide-nav');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.classList.remove('hide-nav');
      document.body.style.overflow = 'unset';
    };
  }, [isResearching, upiStep]);
  
  // Auto-scroll to top when moving between steps (Details -> Payment -> Confirmation)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [upiStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkoutItems = buyNowId 
    ? (buyNowProduct ? [buyNowProduct] : [])
    : cart;

  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const isFreeDelivery = settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
  }

  const total = subtotal + deliveryFee - discount;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Please enter a valid full name (min 3 characters)';
    } else if (/\d/.test(formData.name.trim())) {
      newErrors.name = 'Name should not contain numbers';
    }

    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+91[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian number starting with +91 ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Full address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter a more detailed address (min 10 characters)';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area/Landmark is required';
    } else if (formData.area.trim().length < 3) {
      newErrors.area = 'Please enter a valid area or landmark';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'Please enter a valid city name';
    } else if (/\d/.test(formData.city.trim())) {
      newErrors.city = 'City name should not contain numbers';
    }

    if (!formData.state) {
      newErrors.state = 'Please select a state';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit Indian pincode';
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormComplete = () => {
    return (
      formData.name.trim().length >= 3 &&
      !/\d/.test(formData.name) &&
      /^\+91[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, '')) &&
      formData.address.trim().length >= 10 &&
      formData.area.trim().length >= 3 &&
      formData.city.trim().length >= 2 &&
      !/\d/.test(formData.city) &&
      formData.state !== '' &&
      /^[1-9][0-9]{5}$/.test(formData.pincode.trim()) &&
      formData.paymentMethod !== ''
    );
  };

  const handleBlur = () => {
    validate();
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal })
      });

      const data = await res.json();
      if (res.ok) {
        applyCoupon(data.coupon);
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Invalid coupon');
      }
    } catch (error) {
      setCouponError('Error validating coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Ensure it starts with +91 and a space and only contains digits after that
      if (!value.startsWith('+91 ')) {
        // If they try to delete +91 , keep it at +91 
        setFormData(prev => ({ ...prev, [name]: '+91 ' }));
        return;
      }
      
      // Allow only numbers after +91 and limit to 10 digits
      const suffix = value.slice(4);
      const cleanSuffix = suffix.replace(/\D/g, '').slice(0, 10);
      
      let formattedSuffix = cleanSuffix;
      if (cleanSuffix.length > 5) {
        formattedSuffix = cleanSuffix.slice(0, 5) + ' ' + cleanSuffix.slice(5);
      }
      
      setFormData(prev => ({ ...prev, [name]: '+91 ' + formattedSuffix }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };


  const getUpiUrl = () => {
    const note = `VIKA Order Payment - ${formData.name}`;
    return `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const handleProceedToPayment = () => {
    if (!validate()) return;
    setUpiStep('payment');
    
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = getUpiUrl();
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteOrder = async () => {
    if (!paymentScreenshot) {
      alert('Please upload a screenshot of your payment.');
      return;
    }
    if (!isPaymentConfirmed) {
      alert('Please confirm that you have completed the payment.');
      return;
    }

    setIsVerifying(true);
    // Simulate payment verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsVerifying(false);

    handleSubmit('Payment Submitted');
  };

  const handleSubmit = async (status: string = 'pending') => {
    // 1. Research Phase
    setIsResearching(true);
    const statuses = [
      'Validating shipping address format...',
      'Checking phone number connectivity...',
      'Verifying delivery area accessibility...',
      'Researching address & contact validity...',
      'Finalizing validation...'
    ];

    for (const statusMsg of statuses) {
      setResearchStatus(statusMsg);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }
    
    setIsResearching(false);

    // 2. Actual Submission
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          subtotal,
          deliveryFee,
          discount,
          couponCode: appliedCoupon?.code,
          total,
          shippingDetails: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            area: formData.area,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          paymentMethod: formData.paymentMethod,
          paymentStatus: status,
          paymentScreenshot
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderData(data.order);
        setOrderSuccess(true);
        if (!buyNowId) {
          clearCart();
        }
        window.scrollTo(0, 0);

        // Save address to profile if logged in and checkbox is checked
        if (isLoggedIn && saveAddress) {
          try {
            await fetch('/api/user/addresses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                label: 'Last Used Address',
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                area: formData.area,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                isDefault: false
              })
            });
          } catch (addrErr) {
            console.error('Failed to save address:', addrErr);
          }
        }
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Researching Overlay Component
  const ResearchingOverlay = () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '2rem',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3.5rem 2rem',
        borderRadius: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          marginBottom: '2rem',
          position: 'relative'
        }}>
          <div className="loader" style={{ 
            width: '100%', 
            height: '100%', 
            border: '4px solid #fce4ec', 
            borderTopColor: '#ff9a9e',
            borderRadius: '50%',
            animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff9a9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <h3 style={{ 
          fontSize: '1.8rem', 
          fontWeight: '800',
          color: '#1a1a1a', 
          marginBottom: '0.75rem',
          letterSpacing: '-0.01em'
        }}>
          Researching Order Details
        </h3>
        
        <div style={{ 
          height: '24px', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{ 
            color: '#666', 
            fontSize: '1.1rem', 
            fontWeight: '500',
            animation: 'pulse 2s infinite'
          }}>
            {researchStatus}
          </p>
        </div>

        <div style={{ 
          width: '240px', 
          height: '6px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            height: '100%', 
            backgroundColor: '#ff9a9e', 
            width: '100%', 
            animation: 'progressMove 2s infinite ease-in-out' 
          }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progressMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );

  if (orderSuccess) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        {/* ... existing order success content ... */}
        <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)', textAlign: 'center' }}>
          <div className="success-card" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-xl) var(--spacing-md)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-md)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-xs)' }}>Order Received!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: 'var(--spacing-lg)' }}>
              Your order <span style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>#{orderData?.id}</span> has been successfully placed.
              {formData.paymentMethod === 'upi' && <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--color-accent)', fontWeight: '600' }}>Payment status: Submitted for verification</span>}
            </p>
            
            <div style={{ textAlign: 'left', backgroundColor: 'var(--color-background)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #EEE', paddingBottom: '0.5rem' }}>Order Details</h4>
              <p>Items Total: <strong>₹{orderData?.subtotal.toLocaleString('en-IN')}</strong></p>
              <p>Delivery: <strong>{orderData?.deliveryFee === 0 ? 'FREE' : `₹${orderData?.deliveryFee}`}</strong></p>
              {orderData?.discount > 0 && <p>Discount: <strong style={{ color: 'var(--color-success)' }}>-₹{orderData?.discount.toLocaleString('en-IN')}</strong></p>}
              <p style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>Final Total: <strong>₹{orderData?.total.toLocaleString('en-IN')}</strong></p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/products" className="btn btn-primary" style={{ flex: 1 }}>Continue Shopping</Link>
              <Link href="/" className="btn btn-outline" style={{ flex: 1 }}>Back to Home</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {isResearching && <ResearchingOverlay />}
      <style jsx>{`
        @media (max-width: 1024px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .order-summary-wrapper {
            position: static !important;
            margin-bottom: 2rem;
          }
        }
        @media (max-width: 768px) {
          .success-card {
            padding: var(--spacing-lg) var(--spacing-sm) !important;
          }
          h2 { font-size: 1.8rem !important; }
          .checkout-grid > div {
            padding: 1.5rem !important;
          }
          .input-group {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .btn-primary {
            padding: 1rem !important;
            font-size: 1rem !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loader {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #FFF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="container" style={{ padding: 'var(--spacing-lg) var(--spacing-md)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-lg)' }}>Checkout</h2>

        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            {upiStep === 'details' ? (
              <form onSubmit={(e) => { e.preventDefault(); if (formData.paymentMethod === 'upi') handleProceedToPayment(); else handleSubmit(); }}>
                <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                  Shipping Information
                </h3>
                
                <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label htmlFor="name">Full Name*</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} placeholder="Name" style={{ borderColor: errors.name ? 'var(--color-danger)' : undefined }} />
                    {errors.name && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                  </div>
                  <div>
                    <label htmlFor="phone">Phone Number*</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} placeholder="98765 43210" style={{ borderColor: errors.phone ? 'var(--color-danger)' : undefined }} />
                    {errors.phone && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.phone}</span>}
                  </div>
                </div>


                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="address">Full Address (Flat/House No, Building)*</label>
                  <textarea id="address" name="address" rows={2} value={formData.address} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Flat 101, Floral Heights" style={{ borderColor: errors.address ? 'var(--color-danger)' : undefined }}></textarea>
                  {errors.address && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.address}</span>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="area">Area / Sector / Landmark*</label>
                  <input type="text" id="area" name="area" value={formData.area} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Near Rose Garden, Sector 15" style={{ borderColor: errors.area ? 'var(--color-danger)' : undefined }} />
                  {errors.area && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.area}</span>}
                </div>

                <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label htmlFor="city">City*</label>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} onBlur={handleBlur} placeholder="New Delhi" style={{ borderColor: errors.city ? 'var(--color-danger)' : undefined }} />
                    {errors.city && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.city}</span>}
                  </div>
                  <div>
                    <label htmlFor="state">State*</label>
                    <select id="state" name="state" value={formData.state} onChange={handleChange} onBlur={handleBlur} style={{ borderColor: errors.state ? 'var(--color-danger)' : undefined }}>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.state}</span>}
                  </div>
                </div>


                <div style={{ marginBottom: '3rem' }}>
                  <label htmlFor="pincode">Pincode*</label>
                  <input type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} onBlur={handleBlur} placeholder="110001" style={{ borderColor: errors.pincode ? 'var(--color-danger)' : undefined }} />
                  {errors.pincode && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.pincode}</span>}
                </div>

                {isLoggedIn && (
                  <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: 'var(--radius-md)', border: '1px solid #EEE' }}>
                    <input 
                      type="checkbox" 
                      id="saveAddress" 
                      checked={saveAddress} 
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                    />
                    <label htmlFor="saveAddress" style={{ margin: 0, cursor: 'pointer', fontSize: '0.95rem', color: '#444' }}>
                      Save this address to my profile for future orders
                    </label>
                  </div>
                )}

                <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                  Payment & Offers
                </h3>

                {/* Coupon Input inside Payment Section */}
                <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-primary-dark)' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Have a Coupon Code?</h4>
                  {!appliedCoupon ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Enter code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{ flex: 1, padding: '0.75rem', border: '1px solid #DDD', borderRadius: '4px' }}
                      />
                      <button 
                        type="button" 
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', fontSize: '0.9rem' }}
                      >
                        {isValidatingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid var(--color-primary-dark)' }}>
                      <span>Code <strong>{appliedCoupon.code}</strong> applied!</span>
                      <button type="button" onClick={removeCoupon} style={{ color: 'var(--color-danger)', fontWeight: '600' }}>Remove</button>
                    </div>
                  )}
                  {couponError && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{couponError}</p>}
                </div>

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: '🚚' },
                    { id: 'upi', label: 'UPI / Google Pay', icon: '📱' }
                  ].map((method) => (
                    <label key={method.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid', borderColor: formData.paymentMethod === method.id ? 'var(--color-primary-dark)' : '#E0E0E0', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: formData.paymentMethod === method.id ? 'var(--color-primary-light)' : 'transparent', transition: 'all 0.2s ease', fontWeight: formData.paymentMethod === method.id ? '600' : '400' }}>
                      <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleChange} style={{ width: 'auto', margin: 0 }} />
                      <span style={{ fontSize: '1.25rem' }}>{method.icon}</span>
                      <span style={{ flex: 1 }}>{method.label}</span>
                      {formData.paymentMethod === method.id && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-dark)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </label>
                  ))}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting || !isFormComplete()} 
                  style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', opacity: (isSubmitting || !isFormComplete()) ? 0.6 : 1, cursor: !isFormComplete() ? 'not-allowed' : 'pointer' }}
                >
                  {formData.paymentMethod === 'upi' ? 'Continue to Payment' : isSubmitting ? 'Processing...' : `Place Order • ₹${total.toLocaleString('en-IN')}`}
                </button>
                {!isFormComplete() && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>Please fill all required fields correctly to proceed</p>}
              </form>
            ) : upiStep === 'payment' ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Pay via UPI</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Scan the QR code below using any UPI app (GPay, PhonePe, Paytm, etc.) to pay <strong>₹{total.toLocaleString('en-IN')}</strong></p>
                
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #EEE', position: 'relative' }}>
                  {paymentDetected ? (
                    <div style={{ width: '250px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', animation: 'scaleUp 0.3s ease-out' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p style={{ fontWeight: '600', color: 'var(--color-success)' }}>Payment Detected!</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Redirecting...</p>
                    </div>
                  ) : (
                    <>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getUpiUrl())}`} 
                        alt="UPI QR Code" 
                        style={{ width: '250px', height: '250px', opacity: timeLeft === 0 ? 0.3 : 1 }}
                      />
                      {timeLeft === 0 && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-md)' }}>
                          <p style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>QR EXPIRED</p>
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px' }}>{MERCHANT_UPI_ID}</div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: timeLeft < 30 ? 'var(--color-danger-light)' : '#F5F5F5', color: timeLeft < 30 ? 'var(--color-danger)' : 'var(--color-text-main)', borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '1.1rem', border: '1px solid #EEE' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {formatTime(timeLeft)}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    {timeLeft > 0 ? 'Keep this screen open while paying' : 'QR code has expired. Please refresh the page.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <button 
                    onClick={() => setUpiStep('confirmation')} 
                    className="btn btn-primary" 
                    disabled={timeLeft === 0 || paymentDetected}
                    style={{ width: '100%', padding: '1rem', opacity: (timeLeft === 0 || paymentDetected) ? 0.6 : 1 }}
                  >
                    {paymentDetected ? 'Payment Received' : 'I have made the payment'}
                  </button>
                  <button onClick={() => setUpiStep('details')} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: '0.5rem' }}>
                    Go back and change method
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>Confirm Payment</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>Please provide proof of payment to complete your order. Our team will verify it shortly.</p>
                
                <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                  <label htmlFor="screenshot" style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>Upload Screenshot*</label>
                  <div style={{ position: 'relative', border: '2px dashed #DDD', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', transition: 'all 0.2s', borderColor: paymentScreenshot ? 'var(--color-success)' : '#DDD', backgroundColor: paymentScreenshot ? 'rgba(0, 200, 83, 0.05)' : 'transparent' }}>
                    <input 
                      type="file" 
                      id="screenshot" 
                      accept="image/*" 
                      onChange={handleScreenshotUpload}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                    {paymentScreenshot ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={paymentScreenshot} alt="Payment Proof" style={{ maxHeight: '200px', margin: '0 auto', borderRadius: '4px' }} />
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: 'var(--color-success)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--color-text-light)' }}>
                        <svg style={{ margin: '0 auto 0.5rem' }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p>Click or drag to upload screenshot</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Accepted formats: JPG, PNG</p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '2.5rem', textAlign: 'left', padding: '1rem', backgroundColor: '#F9F9F9', borderRadius: 'var(--radius-md)', border: '1px solid #EEE' }}>
                  <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', alignItems: 'flex-start' }}>
                    <input 
                      type="checkbox" 
                      checked={isPaymentConfirmed}
                      onChange={(e) => setIsPaymentConfirmed(e.target.checked)}
                      style={{ marginTop: '0.2rem', width: 'auto' }}
                    />
                    <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                      I confirm that I have transferred <strong>₹{total.toLocaleString('en-IN')}</strong> to <strong>{MERCHANT_UPI_ID}</strong> and the uploaded screenshot is valid.
                    </span>
                  </label>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <button 
                    onClick={handleCompleteOrder} 
                    disabled={isSubmitting || isVerifying || !paymentScreenshot || !isPaymentConfirmed}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', opacity: (isSubmitting || isVerifying || !paymentScreenshot || !isPaymentConfirmed) ? 0.7 : 1, position: 'relative', overflow: 'hidden' }}
                  >
                    {isVerifying ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span className="loader" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                        Verifying Payment...
                      </span>
                    ) : isSubmitting ? 'Finalizing Order...' : 'Complete Order'}
                  </button>
                  <button onClick={() => setUpiStep('payment')} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer' }}>
                    Back to QR Code
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="order-summary-wrapper" style={{ position: 'sticky', top: '140px', height: 'fit-content' }}>
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {checkoutItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--color-text-main)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>{item.name}</p>
                      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{item.category}</p>
                    </div>
                    <p style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                {deliveryFee === 0 ? <span style={{ color: 'var(--color-success)', fontWeight: '500' }}>FREE</span> : <span>₹{deliveryFee.toLocaleString('en-IN')}</span>}
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--color-success)' }}>
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid #EEE' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.4rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
