import styles from '../policy.module.css';

export default function ReturnPolicy() {
  return (
    <main className={styles.policyContainer}>
      <h1>Return & Refund Policy</h1>
      <p className={styles.lastUpdated}>Last Updated: April 28, 2026</p>

      <section>
        <h2>Perishable Goods (Flowers)</h2>
        <p>Due to the perishable nature of flowers, we do not accept returns on floral bouquets once delivered. However, if you receive a damaged or wilted product, please contact us within 2 hours of delivery with a photo proof.</p>
      </section>

      <section>
        <h2>Non-Perishable Goods (Hampers & Gifts)</h2>
        <p>For hampers and non-floral gifts, we accept returns within 7 days of delivery only if the product is damaged or differs significantly from the description.</p>
      </section>

      <section>
        <h2>Refund Process</h2>
        <p>If your refund is approved, it will be processed within 5-7 business days. The amount will be credited back to your original payment method or provided as a store credit, as per your preference.</p>
      </section>

      <section>
        <h2>Cancellation Policy</h2>
        <p>Orders can be cancelled up to 24 hours before the scheduled delivery date. Once the bouquet is prepared or the hamper is packed, cancellations are not permitted.</p>
      </section>

      <section>
        <h2>Contact Us for Issues</h2>
        <p>For any concerns regarding your order, please reach out to us at <strong>+91 6301291468</strong> or use the Contact Us form.</p>
      </section>
    </main>
  );
}
