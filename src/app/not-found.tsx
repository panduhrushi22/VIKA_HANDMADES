import Link from 'next/link';
import styles from './error.module.css';

export default function NotFound() {
  return (
    <main className={styles.errorContainer}>
      <div className={styles.errorCode}>404</div>
      <div className={styles.errorContent}>
        <div className={styles.illustration}>🌸</div>
        <h1 className={styles.errorTitle}>Oops! Page Not Found</h1>
        <p className={styles.errorMessage}>
          The bouquet of information you're looking for seems to have wilted or moved to a new garden. Let's get you back on track.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.backBtn}>
            Back to Home
          </Link>
          <Link href="/products" className={styles.retryBtn}>
            Explore Collection
          </Link>
        </div>
      </div>
    </main>
  );
}
