

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    message: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setErrorMessage('Please login to send a message.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setFormData({ name: '', message: '' });
    } catch (error: any) {
      console.error('Contact form error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>Contact Us</h2>
          
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
            
            {/* Contact Information */}
            <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-playfair)', color: 'var(--color-primary-dark)' }}>Get in Touch</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)', fontSize: '1.05rem' }}>
                Whether it's a custom bouquet request or a question about your delivery, we're here to make your experience magical.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <span style={{ fontWeight: 500 }}>Support Number Coming Soon</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <span style={{ fontWeight: 500 }}>vikahandmades@gmail.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <span style={{ fontWeight: 500 }}>Hyderabad, Telangana, India</span>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Follow Our Journey</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a href="https://www.instagram.com/giftsby_vika?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'transform 0.2s' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://www.youtube.com/@Karanamgariammayi" target="_blank" rel="noopener noreferrer" style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'transform 0.2s' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                  </a>
                  <a href="mailto:vikahandmades@gmail.com" style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'transform 0.2s' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              {isLoggedIn === false ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔒</div>
                  <h4 style={{ marginBottom: '1rem', fontFamily: 'var(--font-playfair)', fontSize: '1.4rem' }}>Login Required</h4>
                  <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '280px', margin: '0 auto 2rem' }}>
                    To provide personalized support, we require users to be logged in to send messages.
                  </p>
                  <Link href="/login" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '50px' }}>Login Now</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E0E0E0' }} 
                      placeholder="Your Name" 
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      value={formData.message}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E0E0E0', resize: 'vertical' }} 
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  {status === 'success' && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.9rem', textAlign: 'center' }}>
                      Message sent successfully! We'll get back to you soon.
                    </div>
                  )}
                  
                  {status === 'error' && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFEBEE', color: '#C62828', fontSize: '0.9rem', textAlign: 'center' }}>
                      {errorMessage}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={status === 'loading'}
                    style={{ 
                      width: '100%', 
                      opacity: status === 'loading' ? 0.7 : 1,
                      cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: var(--spacing-lg) !important;
          }
          h2 { font-size: 2rem !important; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
