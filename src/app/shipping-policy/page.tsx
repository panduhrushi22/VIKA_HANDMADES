import styles from '../policy.module.css';

export default function ShippingPolicy() {
  return (
    <main className={styles.policyContainer}>
      <h1>Shipping Policy</h1>
      <p className={styles.lastUpdated}>Last Updated: April 28, 2026</p>

      <section>
        <h2>Delivery Timeline</h2>
        <p>At VIKA, we strive to deliver your beautiful bouquets and hampers as quickly as possible. Our standard delivery timelines are:</p>
        <ul>
          <li><strong>Local (Hyderabad):</strong> Same day or next day delivery.</li>
          <li><strong>Major Cities:</strong> 2-4 business days.</li>
          <li><strong>Rest of India:</strong> 4-7 business days.</li>
        </ul>
      </section>

      <section>
        <h2>Shipping Charges</h2>
        <p>We offer free shipping on all orders above ₹1500. For orders below this amount, a flat shipping fee of ₹150 is applied at checkout.</p>
      </section>

      <section>
        <h2>Delivery Tracking</h2>
        <p>Once your order is shipped, you will receive a tracking ID via WhatsApp and Email. You can also track your order status in the "Profile" section of our website.</p>
      </section>

      <section>
        <h2>Important Notes</h2>
        <ul>
          <li>Since flowers are perishable, we recommend providing an address where someone will be available to receive the delivery.</li>
          <li>We currently deliver only within India.</li>
          <li>Delivery might be slightly delayed during public holidays or extreme weather conditions.</li>
        </ul>
      </section>
    </main>
  );
}
