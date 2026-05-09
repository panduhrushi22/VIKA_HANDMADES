import styles from '../policy.module.css';

export default function PrivacyPolicy() {
  return (
    <main className={styles.policyContainer}>
      <h1>Privacy Policy</h1>
      <p className={styles.lastUpdated}>Last Updated: April 28, 2026</p>

      <section>
        <h2>Information We Collect</h2>
        <p>When you shop at VIKA, we collect essential information to process your order, including:</p>
        <ul>
          <li>Name and Contact Details</li>
          <li>Shipping and Billing Address</li>
          <li>Payment Confirmation Details</li>
          <li>Order History</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Data</h2>
        <p>Your data is used solely for:</p>
        <ul>
          <li>Fulfilling your orders and deliveries.</li>
          <li>Sending order updates via WhatsApp or Email.</li>
          <li>Improving our website and product range.</li>
          <li>Internal record keeping for accounting.</li>
        </ul>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>We take the security of your personal information seriously. We do not sell or share your data with third parties for marketing purposes. All online payments are handled via secure, encrypted payment gateways.</p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>Our website uses cookies to enhance your browsing experience, such as remembering items in your cart.</p>
      </section>
    </main>
  );
}
