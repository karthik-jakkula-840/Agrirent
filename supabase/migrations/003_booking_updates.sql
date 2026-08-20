-- Create a sequence for booking numbers
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;

-- Function to safely create a booking with atomic overlapping check
CREATE OR REPLACE FUNCTION create_booking_atomic(
    p_equipment_id UUID,
    p_customer_id UUID,
    p_owner_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_pricing JSONB,
    p_total_amount NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_overlap_exists BOOLEAN;
    v_booking_id UUID;
    v_booking_number TEXT;
BEGIN
    -- 1. Check for overlapping bookings or active rentals
    -- A booking overlaps if:
    -- existing_start < new_end AND existing_end > new_start
    SELECT EXISTS (
        SELECT 1 FROM bookings
        WHERE equipment_id = p_equipment_id
          AND booking_status IN ('pending', 'accepted', 'confirmed')
          AND start_time < p_end_time
          AND end_time > p_start_time
        FOR UPDATE -- lock the overlapping rows if they exist, though serialization is better handled by table constraints, this gives some safety
    ) INTO v_overlap_exists;

    IF v_overlap_exists THEN
        RAISE EXCEPTION 'EQUIPMENT_UNAVAILABLE';
    END IF;

    -- Note: Ideally we'd lock the equipment row to prevent concurrent inserts from passing the EXISTS check.
    -- Let's do a SELECT FOR UPDATE on the equipment row to serialize requests for the same equipment.
    PERFORM 1 FROM equipment WHERE id = p_equipment_id FOR UPDATE;

    -- Re-check after acquiring the equipment lock to be absolutely safe from race conditions
    SELECT EXISTS (
        SELECT 1 FROM bookings
        WHERE equipment_id = p_equipment_id
          AND booking_status IN ('pending', 'accepted', 'confirmed')
          AND start_time < p_end_time
          AND end_time > p_start_time
    ) INTO v_overlap_exists;

    IF v_overlap_exists THEN
        RAISE EXCEPTION 'EQUIPMENT_UNAVAILABLE';
    END IF;

    -- 2. Generate Booking Number (e.g. AGR-2026-000001)
    v_booking_number := 'AGR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('booking_number_seq')::TEXT, 6, '0');

    -- 3. Insert Booking
    INSERT INTO bookings (
        booking_number,
        equipment_id,
        customer_id,
        owner_id,
        start_time,
        end_time,
        pricing,
        total_amount,
        booking_status,
        payment_status
    ) VALUES (
        v_booking_number,
        p_equipment_id,
        p_customer_id,
        p_owner_id,
        p_start_time,
        p_end_time,
        p_pricing,
        p_total_amount,
        'pending',
        'pending'
    ) RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$;
