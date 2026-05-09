'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { useStore } from './StoreProvider';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';

export default function Header() {
  const { cart, wishlist, clearCart, clearWishlist } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isLogoZoomed, setIsLogoZoomed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(true);
  const scrollRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = scrollRef.current;
      
      // Don't hide if at the very top (within 50px)
      if (currentScrollY <= 50) {
        setIsVisible(true);
      } 
      // Hide on scroll down, show on scroll up
      // Adding a 10px buffer to prevent jitter
      else if (Math.abs(currentScrollY - lastScrollY) > 10) {
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      
      scrollRef.current = currentScrollY;

      if (currentScrollY > 10 && isLogoZoomed) {
        setIsLogoZoomed(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check auth status and notifications
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!isMounted) return;

        if (data.success) {
          setUser(data.user);
          // Fetch notifications
          const notifRes = await fetch('/api/user/notifications');
          const notifData = await notifRes.json();
          if (isMounted) {
            setNotificationCount(notifData.count || 0);
          }
        } else {
          setUser(null);
          setNotificationCount(0);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setNotificationCount(0);
        }
      }
    };
    checkAuth();

    return () => {
      isMounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, isLogoZoomed]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Clear local state
    clearCart();
    clearWishlist();
    setUser(null);
    localStorage.removeItem('vika_cart');
    localStorage.removeItem('vika_wishlist');
    window.location.href = '/';
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogoZoomed(!isLogoZoomed);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [animateCart, setAnimateCart] = useState(false);
  const [animateWishlist, setAnimateWishlist] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    if (wishlistCount > 0) {
      setAnimateWishlist(true);
      const timer = setTimeout(() => setAnimateWishlist(false), 400);
      return () => clearTimeout(timer);
    }
  }, [wishlistCount]);

  return (
    <div className={`${styles.stickyWrapper} ${!isVisible ? styles.headerHidden : ''}`}>
      <header className={styles.header}>
        <div className={`container ${styles.headerContainer}`}>
          <div className={styles.mobileLeft}>
            <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Toggle Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12"></path>
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18"></path>
                )}
              </svg>
            </button>
            <div 
              className={`${styles.logo} ${isLogoZoomed ? styles.zoomed : ''}`} 
              onClick={toggleZoom}
            >
              <Image 
                src="/images/vika_logo.png" 
                alt="VIKA Logo" 
                className={styles.logoImage} 
                width={300} 
                height={300} 
                priority
                quality={100}
              />
            </div>
            <button className={styles.searchToggle} onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Toggle Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <form 
            className={`${styles.searchBar} ${isSearchOpen ? styles.searchActive : ''}`} 
            onSubmit={(e) => {
              e.preventDefault();
              const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
              if (query.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
              }
            }}
          >
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" name="search" placeholder="Search..." className={styles.searchInput} />
          </form>

          <div className={styles.actions}>
            <Link href="/wishlist" className={`${styles.actionItem} ${animateWishlist ? styles.bounceIcon : ''}`} style={{ position: 'relative' }}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span className={styles.actionText}>Wishlist</span>
              {mounted && wishlistCount > 0 && (
                <span className={`${styles.badge} ${animateWishlist ? styles.badgePop : ''}`} style={{ right: '15px' }}>{wishlistCount}</span>
              )}
            </Link>
            <Link href="/cart" className={`${styles.actionItem} ${animateCart ? styles.bounceIcon : ''}`} style={{ position: 'relative' }}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className={styles.actionText}>Cart</span>
              {mounted && cartCount > 0 && (
                <span className={`${styles.badge} ${animateCart ? styles.badgePop : ''}`} style={{ right: '5px' }}>{cartCount}</span>
              )}
            </Link>
            {mounted && user ? (
              <>
                <Link href="/profile" className={styles.actionItem} style={{ position: 'relative' }}>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className={styles.actionText}>Profile</span>
                  {mounted && notificationCount > 0 && (
                    <span className={`${styles.badge} ${styles.badgePop}`} style={{ right: '15px', backgroundColor: 'var(--color-danger)' }}>{notificationCount}</span>
                  )}
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className={styles.actionItem}>
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    <span className={styles.actionText}>Admin</span>
                  </Link>
                )}
                <button onClick={handleLogout} className={styles.actionItem} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span className={styles.actionText}>Logout</span>
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.actionItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span className={styles.actionText}>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <Suspense fallback={<div className={styles.navbar}></div>}>
        <NavLinks isOpen={isMenuOpen} closeMenu={() => setIsMenuOpen(false)} />
      </Suspense>
    </div>
  );
}

function NavLinks({ isOpen, closeMenu }: { isOpen: boolean; closeMenu: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/products') return pathname === '/products' && !activeCategory;
    if (href.startsWith('/products?category=')) {
      const cat = href.split('=')[1];
      return pathname === '/products' && activeCategory === cat;
    }
    return pathname === href;
  };

  return (
    <nav className={`${styles.navbar} ${isOpen ? styles.menuOpen : ''}`}>
      <Link href="/" onClick={closeMenu} className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>Home</Link>
      <Link href="/products" onClick={closeMenu} className={`${styles.navLink} ${isActive('/products') ? styles.active : ''}`}>Shop</Link>
      <Link href="/products?category=bouquets" onClick={closeMenu} className={`${styles.navLink} ${isActive('/products?category=bouquets') ? styles.active : ''}`}>Bouquets</Link>
      <Link href="/products?category=hampers" onClick={closeMenu} className={`${styles.navLink} ${isActive('/products?category=hampers') ? styles.active : ''}`}>Hampers</Link>
      <Link href="/products?category=vvtrends" onClick={closeMenu} className={`${styles.navLink} ${isActive('/products?category=vvtrends') ? styles.active : ''}`}>VV.Trends</Link>
      <Link href="/customize" onClick={closeMenu} className={`${styles.navLink} ${isActive('/customize') ? styles.active : ''}`}>Customize</Link>
      <Link href="/about" onClick={closeMenu} className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}>About Us</Link>
      <Link href="/contact" onClick={closeMenu} className={`${styles.navLink} ${isActive('/contact') ? styles.active : ''}`}>Contact Us</Link>
    </nav>
  );
}
