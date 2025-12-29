# Ghardaar24 Documentation

This document provides comprehensive documentation for the Ghardaar24 real estate platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Components](#components)
5. [Styling Guide](#styling-guide)
6. [Authentication](#authentication)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

Ghardaar24 follows a modern Next.js 16 architecture with the App Router pattern.

### Core Technologies

| Layer      | Technology            | Purpose                     |
| ---------- | --------------------- | --------------------------- |
| Frontend   | React 19 + Next.js 16 | UI rendering and routing    |
| Styling    | Tailwind CSS 4        | Utility-first CSS framework |
| Backend    | Supabase              | Database, Auth, and Storage |
| Animations | Framer Motion         | Smooth UI transitions       |

### Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Public     │  │  Property   │  │  Admin Dashboard    │  │
│  │  Pages      │  │  Details    │  │  (Protected)        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │  Supabase │                             │
│                    │  Client   │                             │
│                    └─────┬─────┘                             │
└──────────────────────────┼───────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
        │ PostgreSQL │ │  Auth   │ │  Storage  │
        │  Database  │ │         │ │  (Images) │
        └───────────┘ └─────────┘ └───────────┘
```

---

## Database Schema

### Properties Table

Stores all property listings with their details.

| Column              | Type        | Description                                        |
| ------------------- | ----------- | -------------------------------------------------- |
| `id`                | UUID        | Primary key                                        |
| `title`             | TEXT        | Property title                                     |
| `description`       | TEXT        | Detailed description                               |
| `price`             | BIGINT      | Price in INR                                       |
| `state`             | TEXT        | State name                                         |
| `city`              | TEXT        | City name                                          |
| `area`              | TEXT        | Area/Locality                                      |
| `address`           | TEXT        | Full address                                       |
| `bedrooms`          | INTEGER     | Number of bedrooms                                 |
| `bathrooms`         | INTEGER     | Number of bathrooms                                |
| `property_type`     | TEXT        | apartment, house, villa, plot, commercial          |
| `listing_type`      | TEXT        | sale, rent, or resale                              |
| `images`            | TEXT[]      | Array of image URLs                                |
| `amenities`         | TEXT[]      | Array of amenities                                 |
| `brochure_urls`     | TEXT[]      | Array of brochure URLs                             |
| `featured`          | BOOLEAN     | Featured listing flag                              |
| `status`            | TEXT        | active, sold, rented, inactive                     |
| `land_parcel`       | INTEGER     | Land parcel size                                   |
| `towers`            | INTEGER     | Number of towers                                   |
| `floors`            | TEXT        | Floor information                                  |
| `config`            | TEXT        | Property configuration                             |
| `carpet_area`       | TEXT        | Carpet area details                                |
| `rera_no`           | TEXT        | RERA registration number                           |
| `possession_status` | TEXT        | Current possession status                          |
| `target_possession` | TEXT        | Target possession date                             |
| `litigation`        | BOOLEAN     | Litigation flag                                    |
| `owner_name`        | TEXT        | Property owner's name (for user submissions)       |
| `owner_phone`       | TEXT        | Property owner's phone (for user submissions)      |
| `owner_email`       | TEXT        | Property owner's email (for user submissions)      |
| `approval_status`   | TEXT        | pending, approved, rejected (for user submissions) |
| `submitted_by`      | UUID        | User ID who submitted (nullable)                   |
| `submission_date`   | TIMESTAMPTZ | Date of submission                                 |
| `approval_date`     | TIMESTAMPTZ | Date of approval                                   |
| `rejection_reason`  | TEXT        | Reason for rejection (if rejected)                 |
| `created_at`        | TIMESTAMPTZ | Creation timestamp                                 |
| `updated_at`        | TIMESTAMPTZ | Last update timestamp                              |

### Inquiries Table

Stores customer inquiries submitted through contact forms.

| Column        | Type        | Description                      |
| ------------- | ----------- | -------------------------------- |
| `id`          | UUID        | Primary key                      |
| `property_id` | UUID        | Reference to property (nullable) |
| `name`        | TEXT        | Customer name                    |
| `email`       | TEXT        | Customer email                   |
| `phone`       | TEXT        | Customer phone                   |
| `message`     | TEXT        | Inquiry message                  |
| `state`       | TEXT        | Customer's state                 |
| `city`        | TEXT        | Customer's city                  |
| `created_at`  | TIMESTAMPTZ | Submission timestamp             |

### User Profiles Table

Stores registered user information.

| Column       | Type        | Description                |
| ------------ | ----------- | -------------------------- |
| `id`         | UUID        | Primary key (matches auth) |
| `name`       | TEXT        | User's full name           |
| `phone`      | TEXT        | Phone number (unique)      |
| `email`      | TEXT        | Email address (unique)     |
| `created_at` | TIMESTAMPTZ | Registration timestamp     |

### Admins Table

Stores admin login credentials (separate from user auth).

| Column       | Type        | Description        |
| ------------ | ----------- | ------------------ |
| `id`         | UUID        | Primary key        |
| `email`      | TEXT        | Admin email        |
| `name`       | TEXT        | Admin name         |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Locations Table

Stores state/city combinations for location dropdown filtering.

| Column       | Type        | Description                |
| ------------ | ----------- | -------------------------- |
| `id`         | UUID        | Primary key                |
| `state`      | TEXT        | State name                 |
| `city`       | TEXT        | City name                  |
| `is_active`  | BOOLEAN     | Whether location is active |
| `created_at` | TIMESTAMPTZ | Creation timestamp         |

> **Note**: State and city are stored together with a unique constraint on the combination.

---

## API Reference

### Supabase Client

The Supabase client is initialized in `lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Lib Utilities

| Utility         | Path                   | Description                            |
| --------------- | ---------------------- | -------------------------------------- |
| `supabase`      | `lib/supabase.ts`      | Supabase client configuration          |
| `auth`          | `lib/auth.tsx`         | User authentication context provider   |
| `admin-auth`    | `lib/admin-auth.tsx`   | Admin authentication context provider  |
| `seo`           | `lib/seo.ts`           | SEO configuration and metadata         |
| `motion`        | `lib/motion.tsx`       | Animation utilities with Framer Motion |
| `rate-limit`    | `lib/rate-limit.ts`    | API rate limiting utilities            |
| `amenityIcons`  | `lib/amenityIcons.ts`  | Amenity icon mappings                  |
| `indian-cities` | `lib/indian-cities.ts` | State and city data for India          |
| `utils`         | `lib/utils.ts`         | General helper functions               |

### Common Queries

#### Fetch All Active Properties

```typescript
const { data, error } = await supabase
  .from("properties")
  .select("*")
  .eq("status", "active")
  .order("created_at", { ascending: false });
```

#### Fetch Featured Properties

```typescript
const { data, error } = await supabase
  .from("properties")
  .select("*")
  .eq("featured", true)
  .eq("status", "active");
```

#### Fetch Property by ID

```typescript
const { data, error } = await supabase
  .from("properties")
  .select("*")
  .eq("id", propertyId)
  .single();
```

#### Submit Inquiry

```typescript
const { error } = await supabase.from("inquiries").insert({
  property_id: propertyId,
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  message: formData.message,
});
```

#### Filter Properties

```typescript
let query = supabase.from("properties").select("*").eq("status", "active");

if (area) query = query.eq("area", area);
if (propertyType) query = query.eq("property_type", propertyType);
if (listingType) query = query.eq("listing_type", listingType);
if (minPrice) query = query.gte("price", minPrice);
if (maxPrice) query = query.lte("price", maxPrice);
if (bedrooms) query = query.eq("bedrooms", bedrooms);
if (possession) query = query.ilike("possession", `%${possession}%`);

const { data, error } = await query;
```

---

## Components

### Public Components

| Component               | Path                                   | Description                                |
| ----------------------- | -------------------------------------- | ------------------------------------------ |
| `Header`                | `components/Header.tsx`                | Navigation header with mobile menu         |
| `Footer`                | `components/Footer.tsx`                | Site footer with social links              |
| `PropertyCard`          | `components/PropertyCard.tsx`          | Property listing card                      |
| `PropertyFilters`       | `components/PropertyFilters.tsx`       | Search and filter form with state/city     |
| `ImageGallery`          | `components/ImageGallery.tsx`          | Property image gallery                     |
| `ContactForm`           | `components/ContactForm.tsx`           | Inquiry submission form                    |
| `EMICalculator`         | `components/EMICalculator.tsx`         | EMI calculator widget                      |
| `MortgageCalculator`    | `components/MortgageCalculator.tsx`    | Detailed mortgage/loan calculator          |
| `ROICalculator`         | `components/ROICalculator.tsx`         | Investment ROI analysis calculator         |
| `WhyChooseUs`           | `components/WhyChooseUs.tsx`           | Value propositions                         |
| `TrustIndicators`       | `components/TrustIndicators.tsx`       | Trust badges                               |
| `FloatingWhatsApp`      | `components/FloatingWhatsApp.tsx`      | WhatsApp chat button                       |
| `AgentProfile`          | `components/AgentProfile.tsx`          | Agent details with integrated contact form |
| `PopularLocalities`     | `components/PopularLocalities.tsx`     | Grid of popular locations                  |
| `InquiryCTA`            | `components/InquiryCTA.tsx`            | Call to action for inquiries               |
| `ScrollToButton`        | `components/ScrollToButton.tsx`        | Button to scroll to specific section       |
| `LoginModal`            | `components/LoginModal.tsx`            | User login/signup modal with forgot pass   |
| `PropertyAuthGuard`     | `components/PropertyAuthGuard.tsx`     | Auth protection for property pages         |
| `PropertyDetailsClient` | `components/PropertyDetailsClient.tsx` | Client-side property details wrapper       |
| `HomeClient`            | `components/HomeClient.tsx`            | Client-side homepage components            |

### Admin Components

| Component     | Path                         | Description            |
| ------------- | ---------------------------- | ---------------------- |
| `AdminLayout` | `components/AdminLayout.tsx` | Admin dashboard layout |

### Pages

| Page                  | Path                                    | Description                                |
| --------------------- | --------------------------------------- | ------------------------------------------ |
| Home                  | `app/page.tsx`                          | Landing page with hero and features        |
| Properties            | `app/properties/page.tsx`               | Property listings with filters             |
| Property Details      | `app/properties/[id]/page.tsx`          | Individual property page                   |
| Submit Property       | `app/properties/submit/page.tsx`        | User property submission form              |
| User Dashboard        | `app/dashboard/page.tsx`                | User's submitted properties overview       |
| Real Estate Guide     | `app/real-estate-guide/page.tsx`        | Educational guide on real estate           |
| Calculators           | `app/calculators/page.tsx`              | Financial calculators (EMI, Mortgage, ROI) |
| Home Loans            | `app/services/home-loans/page.tsx`      | Home loans service information             |
| Interior Design       | `app/services/interior-design/page.tsx` | Interior design service information        |
| Admin Dashboard       | `app/admin/page.tsx`                    | Admin overview and statistics              |
| Admin Login           | `app/admin/login/page.tsx`              | Admin authentication page                  |
| Admin Forgot Password | `app/admin/forgot-password/page.tsx`    | Admin password reset request               |
| Admin Reset Password  | `app/admin/reset-password/page.tsx`     | Admin password reset confirmation          |
| Manage Properties     | `app/admin/properties/page.tsx`         | Property CRUD operations                   |
| Property Approvals    | `app/admin/approvals/page.tsx`          | Review/approve user-submitted properties   |
| Manage Locations      | `app/admin/locations/page.tsx`          | State and city management                  |
| Manage Inquiries      | `app/admin/inquiries/page.tsx`          | Inquiry management                         |
| Manage Leads          | `app/admin/leads/page.tsx`              | User leads management                      |
| User Login            | `app/auth/login/page.tsx`               | User authentication page                   |
| User Signup           | `app/auth/signup/page.tsx`              | User registration page                     |
| User Forgot Password  | `app/auth/forgot-password/page.tsx`     | User password reset request                |
| User Reset Password   | `app/auth/reset-password/page.tsx`      | User password reset confirmation           |

### API Routes

| Route                | Path                                    | Description                        |
| -------------------- | --------------------------------------- | ---------------------------------- |
| Generate Description | `app/api/generate-description/route.ts` | AI property description via Gemini |

---

## Styling Guide

### Design System

The application uses a comprehensive design system defined in `app/globals.css` with CSS variables for consistent theming.

#### Color Palette

```css
:root {
  --primary: #1a365d; /* Deep blue */
  --primary-light: #2a4a7f;
  --accent: #e53e3e; /* Coral red */
  --neutral-50: #fafafa;
  --neutral-100: #f4f4f5;
  --neutral-900: #18181b;
}
```

#### Typography

- **Headings**: Inter/System fonts with varied weights
- **Body**: Clean, readable sans-serif

#### Spacing

Consistent spacing using Tailwind's spacing scale (4px base unit).

### Responsive Breakpoints

| Breakpoint | Minimum Width | Usage         |
| ---------- | ------------- | ------------- |
| `sm`       | 640px         | Small tablets |
| `md`       | 768px         | Tablets       |
| `lg`       | 1024px        | Small laptops |
| `xl`       | 1280px        | Desktops      |
| `2xl`      | 1536px        | Large screens |

---

## Authentication

### Overview

The application uses a dual authentication system:

1. **Admin Authentication** - Supabase Auth for admin users with separate `admins` table verification
2. **User Authentication** - Phone-based signup/login for customers with `user_profiles` table

### Admin Auth Context

The admin auth context (`lib/admin-auth.tsx`) provides admin authentication:

```typescript
import { useAdminAuth } from "@/lib/admin-auth";

function AdminComponent() {
  const { admin, loading, signIn, signOut } = useAdminAuth();

  if (loading) return <LoadingSpinner />;
  if (!admin) return <AdminLoginForm />;

  return <AdminDashboard admin={admin} />;
}
```

### User Auth Context

The user auth context (`lib/auth.tsx`) provides customer authentication:

```typescript
import { useAuth } from "@/lib/auth";

function MyComponent() {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginForm />;

  return <Dashboard user={user} />;
}
```

### Protected Routes

Admin routes are protected using the `AdminLayout` component which checks authentication status.

---

## Troubleshooting

### Common Issues

#### Images Not Loading

1. Verify Supabase Storage bucket is public
2. Check that image URLs are correctly formatted
3. Ensure storage policies allow public read access

#### Authentication Errors

1. Verify environment variables are set correctly
2. Check Supabase Auth settings
3. Ensure redirect URLs are configured

#### Database Queries Failing

1. Check RLS policies are correctly configured
2. Verify user has appropriate permissions
3. Check network connectivity to Supabase

#### Build Errors

1. Run `npm run lint` to check for errors
2. Ensure all dependencies are installed
3. Check TypeScript types are correct

### Getting Help

For additional support:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Open an issue on GitHub

---

## Changelog

### v1.2.0 (December 2024)

- Forgot Password / Reset Password functionality for users and admins
- Services pages (Home Loans, Interior Design)
- Rate limiting on API endpoints
- Enhanced password complexity requirements
- Security improvements with Content-Security-Policy headers
- Owner details collection for user property submissions

### v1.1.0 (December 2024)

- User property submission feature
- Admin property approvals panel
- User dashboard for tracking submitted properties
- State and city-based location filtering
- AI-powered property description generation (Google Gemini)
- Admin locations management page
- Enhanced responsive design across all pages
- Premium UI polish with improved animations and effects
- Lucide icons throughout the application

### v1.0.0 (December 2024)

- Property listing and details pages
- Real Estate Guide page with educational content
- Calculators page with EMI, Mortgage, and ROI calculators
- Admin dashboard with CRUD operations
- Contact form with inquiry management
- Supabase integration for database and storage
- Mobile-first responsive design with Tailwind CSS
- SEO optimized for all pages

---

## 👨‍💻 Developer

**Ashutosh Swamy**  
[![GitHub](https://img.shields.io/badge/GitHub-ashutoshswamy-181717?style=flat-square&logo=github)](https://github.com/ashutoshswamy)

---

<div align="center">
Made by <a href="https://github.com/ashutoshswamy">Ashutosh Swamy</a>
</div>
