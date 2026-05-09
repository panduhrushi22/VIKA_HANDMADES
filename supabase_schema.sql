-- VIKA E-commerce Supabase Schema

-- Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'USER',
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cart JSONB DEFAULT '[]',
    wishlist JSONB DEFAULT '[]'
);

-- Addresses Table
CREATE TABLE addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    label TEXT,
    name TEXT,
    phone TEXT,
    address TEXT,
    area TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    is_default BOOLEAN DEFAULT FALSE
);

-- Products Table
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0,
    image TEXT,
    images JSONB DEFAULT '[]',
    rating NUMERIC DEFAULT 5,
    sales INTEGER DEFAULT 0,
    reviews JSONB DEFAULT '[]'
);

-- Orders Table
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    coupon_code TEXT,
    total NUMERIC NOT NULL,
    shipping_details JSONB NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_screenshot TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estimated_delivery TEXT
);

-- Messages Table
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customizations Table
CREATE TABLE customizations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT,
    details JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coupons Table
CREATE TABLE coupons (
    code TEXT PRIMARY KEY,
    discount_type TEXT,
    discount_value NUMERIC,
    expiry_date TIMESTAMP WITH TIME ZONE,
    min_order_value NUMERIC DEFAULT 0
);

-- Settings Table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- OTPs Table
CREATE TABLE otps (
    identifier TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at BIGINT NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_request BIGINT,
    request_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (Optional, for now we assume service role or public for simplicity if dev)
-- For production, you should set up proper RLS policies.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- Simple Policy: Allow all for now (Can be hardened later)
CREATE POLICY "Allow all for now" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON addresses FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON products FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON customizations FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON coupons FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON otps FOR ALL USING (true);
