# Agrirent Database Architecture

This directory contains the Supabase database migrations, seed data, and schema definitions for the Agrirent marketplace.

## Tables & Relationships
We use 15 core tables, all interconnected via `UUID` foreign keys.

1. **`profiles`**: Tied 1-to-1 with `auth.users(id)`. Manages profile information and Roles (customer, owner, admin).
2. **`categories`**: Taxonomy for equipment (e.g., Tractors, Harvesters).
3. **`equipment`**: Core inventory table, linked to `profiles` (as owner) and `categories`.
4. **`equipment_images`**: 1-to-N relation with `equipment` for media handling.
5. **`rentals`** & **`rental_items`**: Groupings for multi-item checkouts (parent-child relationship).
6. **`bookings`**: The central reservation ledger connecting `customer_id`, `owner_id`, and `equipment_id`.
7. **`payments`**: Payment ledger linking `booking_id` and `customer_id` for gateway integrations (Stripe/Razorpay).
8. **`reviews`**: 1-to-1 relation with `bookings`, linked to `equipment` and `customer`.
9. **`favorites`**: Many-to-many relationship mapping customers to equipment bookmarks.
10. **`notifications`**: Generic system alerts linked to `profiles`.
11. **`owner_requests`**: Applications from customers to become owners.
12. **`transactions`**: Internal financial ledger for payouts, commissions, and refunds.
13. **`activity_logs`**: System audit trailing.
14. **`contact_messages`**: Public-facing contact form submissions.

## Roles & Row Level Security (RLS)
The system leverages 3 primary roles: **Customer**, **Owner**, and **Admin**. These are enforced via RLS policies directly on the PostgreSQL tables:

- **Public**: Can only view approved equipment, active categories, and published reviews.
- **Customer**: Can manage their own profile, bookmarks, payments, bookings, and create reviews.
- **Owner**: Elevated privileges over their specific `equipment`, `equipment_images`, and can accept/reject `bookings` targeted at them.
- **Admin**: Full access across all tables via the `'admin'` role flag.

*Note: Role is stored in `profiles.role` and accessed in RLS policies via a subquery against `auth.uid()`.*

### Authentication & Creating the First Admin
Authentication is handled entirely via Supabase Auth (Email & Google OAuth). We do not store passwords in the `profiles` table.
When a user signs up, the `on_auth_user_created` Postgres trigger automatically provisions a `profiles` record and securely defaults the role to `'customer'`.

**To assign the very first Admin:**
For security reasons, users cannot select "Admin" during signup. The first admin must be promoted manually by someone with database access:
1. Go to the Supabase Dashboard -> SQL Editor (or connect via CLI).
2. Run the following command (replace with the admin's email):
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'admin@agrirent.com';
   ```

## Storage Buckets
1. **`equipment-images`**: Public read. Authenticated owners can upload/update/delete images.
2. **`profile-images`**: Public read. Authenticated users can manage their own avatars.
3. **`owner-documents`**: **Private**. Only accessible by the document owner and Admins (used for identity verification).

## How to Run Migrations

If you are using the Supabase CLI locally:
1. Initialize the project (if not already): `npx supabase init`
2. Start the local database: `npx supabase start`
3. The migrations inside `supabase/migrations/` will automatically apply.
4. To apply seed data: `npx supabase db reset` (resets DB and applies `seed.sql`)

## How to Verify the Database
- Connect to your Supabase project dashboard (or local Studio at `http://127.0.0.1:54323`).
- Navigate to the **Table Editor** to see all 15 tables created.
- Check the **Authentication** > Policies tab to ensure RLS policies are active for every table.
- Go to the **Storage** section to ensure the 3 buckets are created and their policies are configured.
