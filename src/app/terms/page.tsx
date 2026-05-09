import styles from '../policy.module.css';

export default function TermsAndConditions() {
  return (
    <main className={styles.policyContainer}>
      <h1>Terms & Conditions</h1>
      <p className={styles.lastUpdated}>Last Updated: April 28, 2026</p>

      <section>
        <h2>Agreement to Terms</h2>
        <p>By accessing or using the VIKA website, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access our services.</p>
      </section>

      <section>
        <h2>Product Representation</h2>
        <p>Since our products are handmade and use natural flowers, slight variations in color, size, and arrangement may occur. These variations are not considered defects.</p>
      </section>

      <section>
        <h2>Pricing & Payments</h2>
        <p>All prices are in Indian Rupees (INR). We reserve the right to change prices without prior notice. Payments must be cleared before an order is processed.</p>
      </section>

      <section>
        <h2>User Accounts</h2>
        <p>When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account password.</p>
      </section>

      <section>
        <h2>Governing Law</h2>
        <p>These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
      </section>
    </main>
  );
}
