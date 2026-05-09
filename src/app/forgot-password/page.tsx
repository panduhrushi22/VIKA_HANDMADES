'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../signup/signup.module.css'; // Reuse signup styles

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    identifier: '',
    otp: '',
  });

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.identifier }),
      });

      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier,
          code: formData.otp,
        }),
      });

      if (res.ok) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>OTP Login</h1>
          <p className={styles.subtitle}>
            {step === 1 ? 'Enter your email or phone to receive an OTP' : 'Enter the OTP code'}
          </p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div style={{ color: '#059669', background: '#ecfdf5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>{success}</div>}

        {step === 1 && (
          <form className={styles.form} onSubmit={handleSendOTP}>
            <div className={styles.inputGroup}>
              <label htmlFor="identifier">Email or Phone Number</label>
              <input
                id="identifier"
                type="text"
                placeholder="Enter your email or phone"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                required
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner}></span> : 'Send OTP'}
            </button>
            <div className={styles.footer}>
              <Link href="/login" className={styles.loginLink}>Back to Login</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className={styles.form} onSubmit={handleOTPLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="otp">OTP Code</label>
              <input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem' }}
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                required
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner}></span> : 'Verify & Log In'}
            </button>
            <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
              Change Email/Phone
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
