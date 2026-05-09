'use client';

import styles from './error.module.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className={styles.errorContainer}>
          <div className={styles.errorCode}>ERR</div>
          <div className={styles.errorContent}>
            <h1 className={styles.errorTitle}>A Critical Error Occurred</h1>
            <p className={styles.errorMessage}>
              The application encountered a serious issue. Please try refreshing the page.
            </p>
            <button onClick={() => reset()} className={styles.backBtn}>
              Refresh Application
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
