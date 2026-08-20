-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enums
DO $$
BEGIN
  BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'owner', 'admin');
  EXCEPTION WHEN duplicate_object THEN null;
  END;
  BEGIN
    CREATE TYPE equipment_status AS ENUM ('pending', 'approved', 'rejected', 'maintenance');
  EXCEPTION WHEN duplicate_object THEN null;
  END;
  BEGIN
    CREATE TYPE equipment_availability AS ENUM ('available', 'booked', 'maintenance', 'unavailable');
  EXCEPTION WHEN duplicate_object THEN null;
  END;
  BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'confirmed', 'completed');
  EXCEPTION WHEN duplicate_object THEN null;
  END;
  BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_paid');
  EXCEPTION WHEN duplicate_object THEN null;
  END;
  BEGIN
    CREATE TYPE owner_request_status AS ENUM ('pending', 'approved', 'rejected');
  EXCEPTION WHEN duplicate_object THEN null;
  END;
  BEGIN
    CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'deposit', 'commission', 'payout');
  EXCEPTION WHEN duplicate_object THEN null;
  END;
END $$;


-- Utility function for timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    address TEXT,
    district TEXT,
    state TEXT,
    profile_image TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. EQUIPMENT
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sub_category TEXT,
    brand TEXT,
    model TEXT,
    year INTEGER,
    fuel_type TEXT,
    condition TEXT,
    working_status TEXT,
    horsepower INTEGER,
    working_hours INTEGER,
    hourly_price NUMERIC(10, 2),
    daily_price NUMERIC(10, 2),
    weekly_price NUMERIC(10, 2),
    monthly_price NUMERIC(10, 2),
    deposit NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    availability equipment_availability DEFAULT 'unavailable' NOT NULL,
    status equipment_status DEFAULT 'pending' NOT NULL,
    insurance_status TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_equipment_owner_id ON equipment(owner_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category_id ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_district ON equipment(district);

-- 4. EQUIPMENT IMAGES
CREATE TABLE IF NOT EXISTS equipment_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_equipment_images_equipment_id ON equipment_images(equipment_id);

-- 5. RENTALS
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
DROP TRIGGER IF EXISTS update_rentals_updated_at ON rentals;
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. RENTAL ITEMS
CREATE TABLE IF NOT EXISTS rental_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE RESTRICT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number TEXT NOT NULL UNIQUE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE RESTRICT NOT NULL,
    customer_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    booking_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    pricing JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    booking_status booking_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK (end_time > start_time)
);

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_equipment_id ON bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);

-- 8. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    customer_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    payment_method TEXT,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    transaction_id TEXT,
    gateway TEXT,
    gateway_payment_id TEXT,
    gateway_order_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);

-- 9. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    owner_response TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (booking_id) -- One review per booking
);

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_reviews_equipment_id ON reviews(equipment_id);

-- 10. FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (customer_id, equipment_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_customer_id ON favorites(customer_id);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- 12. OWNER REQUESTS
CREATE TABLE IF NOT EXISTS owner_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    business_name TEXT NOT NULL,
    business_address TEXT NOT NULL,
    identity_document_url TEXT NOT NULL,
    address_proof_url TEXT NOT NULL,
    additional_information TEXT,
    status owner_request_status DEFAULT 'pending' NOT NULL,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS update_owner_requests_updated_at ON owner_requests;
CREATE TRIGGER update_owner_requests_updated_at BEFORE UPDATE ON owner_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_owner_requests_user_id ON owner_requests(user_id);

-- 13. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    transaction_type transaction_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false NOT NULL,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-----------------------------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-----------------------------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can manage all profiles." ON profiles;
CREATE POLICY "Admins can manage all profiles." ON profiles TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Categories Policies
DROP POLICY IF EXISTS "Categories are viewable by everyone." ON categories;
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage categories." ON categories;
CREATE POLICY "Admins can manage categories." ON categories TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Equipment Policies
DROP POLICY IF EXISTS "Approved equipment viewable by everyone." ON equipment;
CREATE POLICY "Approved equipment viewable by everyone." ON equipment FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Owners can view their own equipment." ON equipment;
CREATE POLICY "Owners can view their own equipment." ON equipment FOR SELECT USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Admins can view all equipment." ON equipment;
CREATE POLICY "Admins can view all equipment." ON equipment FOR SELECT TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
DROP POLICY IF EXISTS "Owners can insert their own equipment." ON equipment;
CREATE POLICY "Owners can insert their own equipment." ON equipment FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');
DROP POLICY IF EXISTS "Owners can update their own equipment." ON equipment;
CREATE POLICY "Owners can update their own equipment." ON equipment FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Admins can update equipment (approve/reject)." ON equipment;
CREATE POLICY "Admins can update equipment (approve/reject)." ON equipment FOR UPDATE TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Equipment Images Policies
DROP POLICY IF EXISTS "Equipment images viewable by everyone." ON equipment_images;
CREATE POLICY "Equipment images viewable by everyone." ON equipment_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners can manage images for their equipment." ON equipment_images;
CREATE POLICY "Owners can manage images for their equipment." ON equipment_images TO authenticated USING (
    EXISTS (SELECT 1 FROM equipment WHERE equipment.id = equipment_images.equipment_id AND equipment.owner_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins can manage all equipment images." ON equipment_images;
CREATE POLICY "Admins can manage all equipment images." ON equipment_images TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Bookings Policies
DROP POLICY IF EXISTS "Customers can view their bookings." ON bookings;
CREATE POLICY "Customers can view their bookings." ON bookings FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Owners can view bookings for their equipment." ON bookings;
CREATE POLICY "Owners can view bookings for their equipment." ON bookings FOR SELECT USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Customers can insert bookings." ON bookings;
CREATE POLICY "Customers can insert bookings." ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Owners can update booking status." ON bookings;
CREATE POLICY "Owners can update booking status." ON bookings FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Admins can view/manage all bookings." ON bookings;
CREATE POLICY "Admins can view/manage all bookings." ON bookings TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Rentals & Rental Items Policies
DROP POLICY IF EXISTS "Customers can view their rentals." ON rentals;
CREATE POLICY "Customers can view their rentals." ON rentals FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Customers can insert rentals." ON rentals;
CREATE POLICY "Customers can insert rentals." ON rentals FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Admins can view all rentals." ON rentals;
CREATE POLICY "Admins can view all rentals." ON rentals FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Customers can view their rental items." ON rental_items;
CREATE POLICY "Customers can view their rental items." ON rental_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM rentals WHERE rentals.id = rental_items.rental_id AND rentals.customer_id = auth.uid())
);
DROP POLICY IF EXISTS "Customers can insert rental items." ON rental_items;
CREATE POLICY "Customers can insert rental items." ON rental_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM rentals WHERE rentals.id = rental_items.rental_id AND rentals.customer_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins can view all rental items." ON rental_items;
CREATE POLICY "Admins can view all rental items." ON rental_items FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Payments Policies
DROP POLICY IF EXISTS "Customers can view their payments." ON payments;
CREATE POLICY "Customers can view their payments." ON payments FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Owners can view payments for their bookings." ON payments;
CREATE POLICY "Owners can view payments for their bookings." ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.owner_id = auth.uid())
);
DROP POLICY IF EXISTS "Customers can create payments." ON payments;
CREATE POLICY "Customers can create payments." ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Admins can view/manage all payments." ON payments;
CREATE POLICY "Admins can view/manage all payments." ON payments TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Reviews Policies
DROP POLICY IF EXISTS "Published reviews are viewable by everyone." ON reviews;
CREATE POLICY "Published reviews are viewable by everyone." ON reviews FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Customers can create reviews." ON reviews;
CREATE POLICY "Customers can create reviews." ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Owners can update their response." ON reviews;
CREATE POLICY "Owners can update their response." ON reviews FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM equipment WHERE equipment.id = reviews.equipment_id AND equipment.owner_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins can manage all reviews." ON reviews;
CREATE POLICY "Admins can manage all reviews." ON reviews TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Favorites Policies
DROP POLICY IF EXISTS "Customers can manage their favorites." ON favorites;
CREATE POLICY "Customers can manage their favorites." ON favorites TO authenticated USING (auth.uid() = customer_id);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can manage their notifications." ON notifications;
CREATE POLICY "Users can manage their notifications." ON notifications TO authenticated USING (auth.uid() = user_id);

-- Owner Requests Policies
DROP POLICY IF EXISTS "Users can view their own requests." ON owner_requests;
CREATE POLICY "Users can view their own requests." ON owner_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own requests." ON owner_requests;
CREATE POLICY "Users can insert their own requests." ON owner_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage owner requests." ON owner_requests;
CREATE POLICY "Admins can manage owner requests." ON owner_requests TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Transactions Policies
DROP POLICY IF EXISTS "Admins can view all transactions." ON transactions;
CREATE POLICY "Admins can view all transactions." ON transactions FOR SELECT TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Activity Logs Policies
DROP POLICY IF EXISTS "Admins can view activity logs." ON activity_logs;
CREATE POLICY "Admins can view activity logs." ON activity_logs FOR SELECT TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Contact Messages Policies
DROP POLICY IF EXISTS "Public can insert contact messages." ON contact_messages;
CREATE POLICY "Public can insert contact messages." ON contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view/manage contact messages." ON contact_messages;
CREATE POLICY "Admins can view/manage contact messages." ON contact_messages TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-----------------------------------------------------------------------------------------------------
-- SUPABASE STORAGE CONFIGURATION
-----------------------------------------------------------------------------------------------------
-- Note: These statements assume the existence of the `storage.buckets` and `storage.objects` tables.
-- In standard Supabase environments, this requires elevated privileges, but they are standard for migrations.

INSERT INTO storage.buckets (id, name, public) VALUES 
('equipment-images', 'equipment-images', true),
('profile-images', 'profile-images', true),
('owner-documents', 'owner-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for equipment-images (Public Read, Owner Write)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for equipment-images" ON storage.objects;
CREATE POLICY "Public Access for equipment-images" ON storage.objects FOR SELECT USING (bucket_id = 'equipment-images');
DROP POLICY IF EXISTS "Authenticated users can upload equipment images" ON storage.objects;
CREATE POLICY "Authenticated users can upload equipment images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'equipment-images');
DROP POLICY IF EXISTS "Users can update their equipment images" ON storage.objects;
CREATE POLICY "Users can update their equipment images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'equipment-images' AND auth.uid() = owner);
DROP POLICY IF EXISTS "Users can delete their equipment images" ON storage.objects;
CREATE POLICY "Users can delete their equipment images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'equipment-images' AND auth.uid() = owner);

-- Storage Policies for profile-images (Public Read, Owner Write)
DROP POLICY IF EXISTS "Public Access for profile-images" ON storage.objects;
CREATE POLICY "Public Access for profile-images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
DROP POLICY IF EXISTS "Users can upload their profile image" ON storage.objects;
CREATE POLICY "Users can upload their profile image" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images' AND (auth.uid())::text = (regexp_match(name, '^([^/]+)'))[1]);
DROP POLICY IF EXISTS "Users can update their profile image" ON storage.objects;
CREATE POLICY "Users can update their profile image" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-images' AND (auth.uid())::text = (regexp_match(name, '^([^/]+)'))[1]);
DROP POLICY IF EXISTS "Users can delete their profile image" ON storage.objects;
CREATE POLICY "Users can delete their profile image" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-images' AND (auth.uid())::text = (regexp_match(name, '^([^/]+)'))[1]);

-- Storage Policies for owner-documents (Private, Owner & Admin Write/Read)
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'owner-documents' AND (auth.uid())::text = (regexp_match(name, '^([^/]+)'))[1]);
DROP POLICY IF EXISTS "Admins can view all owner documents" ON storage.objects;
CREATE POLICY "Admins can view all owner documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'owner-documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Users can upload their owner documents" ON storage.objects;
CREATE POLICY "Users can upload their owner documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'owner-documents' AND (auth.uid())::text = (regexp_match(name, '^([^/]+)'))[1]);
