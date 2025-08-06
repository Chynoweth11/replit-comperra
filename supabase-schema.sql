-- Supabase Database Schema for Comperra
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'professional')),
    phone TEXT,
    business_name TEXT,
    zip_code TEXT,
    material_specialties TEXT[],
    business_description TEXT,
    service_radius INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    phone TEXT,
    zip_code TEXT NOT NULL,
    material_category TEXT NOT NULL,
    project_type TEXT NOT NULL,
    budget INTEGER,
    timeline TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
    intent_score INTEGER DEFAULT 50,
    assigned_vendor_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_leads junction table for lead matching
CREATE TABLE IF NOT EXISTS vendor_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES profiles(id) NOT NULL,
    lead_id UUID REFERENCES leads(id) NOT NULL,
    match_score INTEGER DEFAULT 0,
    distance_miles INTEGER,
    contacted_at TIMESTAMP WITH TIME ZONE,
    response_status TEXT DEFAULT 'pending' CHECK (response_status IN ('pending', 'interested', 'declined', 'responded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, lead_id)
);

-- Create materials table for product comparison
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    price DECIMAL(10,2),
    specifications JSONB,
    image_url TEXT,
    description TEXT,
    availability TEXT DEFAULT 'in_stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id UUID REFERENCES materials(id),
    user_id UUID REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Profiles: Users can only see and edit their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Leads: Public read for matching, vendors can see matched leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view leads they created" ON leads
    FOR SELECT USING (
        email = (SELECT email FROM profiles WHERE id = auth.uid())
        OR 
        assigned_vendor_id = auth.uid()
    );

CREATE POLICY "Vendors can view leads in their area" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('vendor', 'professional')
        )
    );

-- Vendor leads: Vendors can only see their own lead matches
ALTER TABLE vendor_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own lead matches" ON vendor_leads
    FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own lead responses" ON vendor_leads
    FOR UPDATE USING (vendor_id = auth.uid());

-- Materials: Public read access
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view materials" ON materials
    FOR SELECT USING (true);

-- Reviews: Users can create and view reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_zip_code_idx ON profiles(zip_code);
CREATE INDEX IF NOT EXISTS leads_zip_code_idx ON leads(zip_code);
CREATE INDEX IF NOT EXISTS leads_material_category_idx ON leads(material_category);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS vendor_leads_vendor_id_idx ON vendor_leads(vendor_id);
CREATE INDEX IF NOT EXISTS vendor_leads_lead_id_idx ON vendor_leads(lead_id);
CREATE INDEX IF NOT EXISTS materials_category_idx ON materials(category);
CREATE INDEX IF NOT EXISTS materials_brand_idx ON materials(brand);
CREATE INDEX IF NOT EXISTS reviews_material_id_idx ON reviews(material_id);

-- Create functions for automated timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically create a profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''), 'customer');
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample data (optional - remove if not needed)
-- Insert some sample materials for testing
INSERT INTO materials (name, category, brand, price, specifications, description) VALUES
('Premium Porcelain Tile 12x24', 'tiles', 'Daltile', 4.99, 
 '{"size": "12x24", "thickness": "10mm", "finish": "matte", "pei_rating": 4}',
 'High-quality porcelain tile suitable for high-traffic areas'),
('Natural Stone Marble Slab', 'stone', 'MSI', 89.99, 
 '{"size": "36x36", "thickness": "3cm", "finish": "polished", "type": "marble"}',
 'Elegant natural marble slab perfect for countertops'),
('Luxury Vinyl Plank', 'vinyl', 'Shaw', 3.49, 
 '{"size": "7x48", "thickness": "5mm", "wear_layer": "20mil", "waterproof": true}',
 'Waterproof luxury vinyl plank with realistic wood grain'),
('Electric Radiant Floor Heating', 'heating', 'Warmly Yours', 12.99, 
 '{"power": "150W", "coverage": "10 sq ft", "voltage": "120V", "warranty": "25 years"}',
 'Energy-efficient electric radiant floor heating system');