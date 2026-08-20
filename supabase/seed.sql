-- Seed Categories
INSERT INTO categories (id, name, description, slug, is_active) VALUES
(gen_random_uuid(), 'Tractors', 'Various sizes of tractors for farming and agriculture', 'tractors', true),
(gen_random_uuid(), 'Harvesters', 'Combine harvesters and reapers', 'harvesters', true),
(gen_random_uuid(), 'Tillage Equipment', 'Plows, harrows, and tillers', 'tillage-equipment', true),
(gen_random_uuid(), 'Seeding & Planting', 'Seed drills and planters', 'seeding-planting', true),
(gen_random_uuid(), 'Irrigation', 'Pumps, pipes, and sprinkler systems', 'irrigation', true)
ON CONFLICT (slug) DO NOTHING;

-- Since we cannot create fake auth.users records, we won't seed profiles or equipment 
-- automatically unless there's an existing owner profile to attach them to.
-- If you have a profile in the system, you can uncomment and replace the OWNER_UUID below 
-- to seed initial equipment.

/*
DO $$
DECLARE
    owner_id UUID := 'YOUR-OWNER-UUID-HERE'; -- Replace with an actual profile ID
    cat_tractor UUID;
    cat_harvester UUID;
BEGIN
    SELECT id INTO cat_tractor FROM categories WHERE slug = 'tractors' LIMIT 1;
    SELECT id INTO cat_harvester FROM categories WHERE slug = 'harvesters' LIMIT 1;

    INSERT INTO equipment (owner_id, category_id, title, description, brand, model, year, fuel_type, hourly_price, daily_price, location, address, district, state, status, availability)
    VALUES 
    (owner_id, cat_tractor, 'Mahindra 575 DI', 'Powerful 45 HP tractor suitable for all tillage applications.', 'Mahindra', '575 DI', 2021, 'Diesel', 500, 4000, 'Ludhiana', '123 Farm Road', 'Ludhiana', 'Punjab', 'approved', 'available'),
    (owner_id, cat_tractor, 'John Deere 5310', 'Premium 55 HP tractor with power steering.', 'John Deere', '5310', 2022, 'Diesel', 600, 4800, 'Amritsar', '45 Agri Village', 'Amritsar', 'Punjab', 'approved', 'available'),
    (owner_id, cat_harvester, 'Preet 987 Combine', 'Heavy duty multi-crop harvester.', 'Preet', '987', 2020, 'Diesel', 2000, 15000, 'Patiala', '78 Harvest Lane', 'Patiala', 'Punjab', 'approved', 'available');
END $$;
*/
