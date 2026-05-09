'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = redirect;
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      if (res.ok) {
        setOtpStep(2);
        setSuccess('OTP sent successfully');
        setResendTimer(30);
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
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
        body: JSON.stringify({ identifier, code: otp }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = redirect;
      } else {
        setError(data.error || 'Invalid OTP');
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
          <h1 className={styles.title}>{isOtpMode ? 'OTP Login' : 'Welcome Back'}</h1>
          <p className={styles.subtitle}>
            {isOtpMode 
              ? (otpStep === 1 ? 'Enter your identifier to receive an OTP' : `Enter the OTP sent to ${identifier}`)
              : 'Log in to your VIKA account'}
          </p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        {!isOtpMode ? (
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="identifier">Email or Phone Number</label>
              <input
                id="identifier"
                type="text"
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => {
                  const val = e.target.value;
                  // If it looks like a phone number starting with +91 or just 10 digits
                  if (/^\+91\s?\d*$/.test(val) || (/^\d+$/.test(val) && val.length <= 10)) {
                    const clean = val.replace(/\D/g, '').slice(0, 10);
                    let formatted = clean;
                    if (clean.length > 5) {
                      formatted = clean.slice(0, 5) + ' ' + clean.slice(5);
                    }
                    setIdentifier(clean.length > 0 ? '+91 ' + formatted : '');
                  } else {
                    setIdentifier(val);
                  }
                }}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password">Password</label>
                <button 
                  type="button" 
                  className={styles.forgotLink} 
                  onClick={() => {
                    setIsOtpMode(true);
                    setOtpStep(1);
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner}></span> : 'Log In'}
            </button>
            
            <button 
              type="button" 
              className={styles.otpToggleBtn}
              onClick={() => {
                setIsOtpMode(true);
                setOtpStep(1);
              }}
            >
              Login with OTP
            </button>
          </form>
        ) : (
          <div className={styles.form}>
            {otpStep === 1 ? (
              <form onSubmit={handleSendOTP}>
                <div className={styles.inputGroup}>
                  <label htmlFor="otp-identifier">Email or Phone Number</label>
                  <input
                    id="otp-identifier"
                    type="text"
                    placeholder="Enter your email or phone"
                    value={identifier}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\+91\s?\d*$/.test(val) || (/^\d+$/.test(val) && val.length <= 10)) {
                        const clean = val.replace(/\D/g, '').slice(0, 10);
                        let formatted = clean;
                        if (clean.length > 5) {
                          formatted = clean.slice(0, 5) + ' ' + clean.slice(5);
                        }
                        setIdentifier(clean.length > 0 ? '+91 ' + formatted : '');
                      } else {
                        setIdentifier(val);
                      }
                    }}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner}></span> : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPLogin}>
                <div className={styles.inputGroup}>
                  <label htmlFor="otp-code">Enter 6-Digit OTP</label>
                  <input
                    id="otp-code"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem' }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner}></span> : 'Verify & Log In'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  {resendTimer > 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Resend OTP in {resendTimer}s</p>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleSendOTP} 
                      className={styles.forgotLink}
                      style={{ fontSize: '0.875rem' }}
                    >
                      Didn't receive OTP? Resend
                    </button>
                  )}
                </div>
                <button type="button" className={styles.backBtn} onClick={() => setOtpStep(1)}>
                  Back
                </button>
              </form>
            )}
            <button 
              type="button" 
              className={styles.otpToggleBtn}
              onClick={() => setIsOtpMode(false)}
            >
              Back to Password Login
            </button>
          </div>
        )}

        <div className={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className={styles.signupLink}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
