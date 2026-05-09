'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/store';

export interface CartItem extends Product {
  quantity: number;
}

export interface Settings {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
  clearWishlist: () => void;
  settings: Settings;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState<Settings>({ deliveryFee: 50, freeDeliveryThreshold: 1000 });
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Load settings and initialize store
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        // 1. Fetch settings
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (isMounted) setSettings(settingsData);
        }

        // 2. Check auth status
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (!isMounted) return;
        
        const loggedIn = authData.success;
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          // 3a. If logged in, fetch from database API
          const storeRes = await fetch('/api/user/store');
          if (storeRes.ok) {
            const storeData = await storeRes.json();
            if (isMounted) {
              setCart(storeData.cart || []);
              setWishlist(storeData.wishlist || []);
            }
          }
        } else {
          // 3b. If NOT logged in, use localStorage
          const savedCart = localStorage.getItem('vika_cart');
          const savedWishlist = localStorage.getItem('vika_wishlist');
          if (!isMounted) return;

          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) setCart(parsed);
          }
          if (savedWishlist) {
            const parsed = JSON.parse(savedWishlist);
            if (Array.isArray(parsed)) setWishlist(parsed);
          }
        }
      } catch (error) {
        console.error('Store initialization error:', error);
      } finally {
        if (isMounted) setIsInitialized(true);
      }
    };

    init();
    return () => { isMounted = false; };
  }, []);

  // Save to persistence on changes
  useEffect(() => {
    if (!isInitialized) return;

    const syncStore = async () => {
      if (isLoggedIn) {
        // Sync to database
        await fetch('/api/user/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, wishlist }),
        });
      } else {
        // Sync to localStorage for guests
        localStorage.setItem('vika_cart', JSON.stringify(cart));
        localStorage.setItem('vika_wishlist', JSON.stringify(wishlist));
      }
    };

    syncStore();
  }, [cart, wishlist, isInitialized, isLoggedIn]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const addToWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.some((item) => item.id === product.id)) return prevWishlist;
      return [...prevWishlist, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearCart,
        clearWishlist,
        settings,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
