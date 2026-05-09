'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <main className={styles.errorContainer}>
      <div className={styles.errorCode}>500</div>
      <div className={styles.errorContent}>
        <div className={styles.illustration}>🌿</div>
        <h1 className={styles.errorTitle}>Something went wrong</h1>
        <p className={styles.errorMessage}>
          We encountered an unexpected gust of wind. Our team has been notified and we're working to fix it.
        </p>
        <div className={styles.actions}>
          <button onClick={() => reset()} className={styles.backBtn}>
            Try Again
          </button>
          <Link href="/" className={styles.retryBtn}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
