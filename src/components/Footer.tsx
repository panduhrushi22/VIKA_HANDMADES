import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.footerInfo}>
          <h3 className={styles.footerLogo}>VIKA</h3>
          <p className={styles.footerDesc}>
            Personalised Hampers & Elegant Bouquets for your special moments. 
            Handmade with love and delivered with care.
          </p>
          <div className={styles.contactInfo}>
            <a href="mailto:vikahandmades@gmail.com" className={styles.emailLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              vikahandmades@gmail.com
            </a>
            <p className={styles.locationInfo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Hyderabad, Telangana, India
            </p>
          </div>
          <div className={styles.socials}>
            <a href="https://www.instagram.com/giftsby_vika?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.youtube.com/@Karanamgariammayi" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>

        <div className={styles.footerLinks}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products">Shop All</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className={styles.footerLinks}>
          <h4>Categories</h4>
          <ul>
            <li><Link href="/products?category=bouquets">Elegant Bouquets</Link></li>
            <li><Link href="/products?category=hampers">Personalised Hampers</Link></li>
            <li><Link href="/products?category=vvtrends">VV.Trends</Link></li>
            <li><Link href="/products?category=handmade">Handmade Gifts</Link></li>
          </ul>
        </div>

        <div className={styles.footerLinks}>
          <h4>Customer Service</h4>
          <ul>
            <li><Link href="/shipping-policy">Shipping Policy</Link></li>
            <li><Link href="/return-policy">Return & Refund</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} VIKA. All rights reserved. | Founder CH. DED DEEPYA</p>
          <div className={styles.paymentIcons}>
            <span>Secure Payments:</span>
            <img src="https://img.icons8.com/color/48/000000/google-pay.png" alt="Google Pay" width="24" height="24" />
            <img src="https://img.icons8.com/color/48/000000/phone-pe.png" alt="PhonePe" width="24" height="24" />
            <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" width="24" height="24" />
          </div>
        </div>
      </div>
    </footer>
  );
}
