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

| Column          | Type        | Description                               |
| --------------- | ----------- | ----------------------------------------- |
| `id`            | UUID        | Primary key                               |
| `title`         | TEXT        | Property title                            |
| `description`   | TEXT        | Detailed description                      |
| `price`         | BIGINT      | Price in INR                              |
| `city`          | TEXT        | City location                             |
| `address`       | TEXT        | Full address                              |
| `bedrooms`      | INTEGER     | Number of bedrooms                        |
| `bathrooms`     | INTEGER     | Number of bathrooms                       |
| `area_sqft`     | INTEGER     | Area in square feet                       |
| `property_type` | TEXT        | apartment, house, villa, plot, commercial |
| `listing_type`  | TEXT        | sale or rent                              |
| `images`        | TEXT[]      | Array of image URLs                       |
| `amenities`     | TEXT[]      | Array of amenities                        |
| `featured`      | BOOLEAN     | Featured listing flag                     |
| `status`        | TEXT        | active, sold, rented, inactive            |
| `possession`    | TEXT        | Immediate, 2025, 2026, etc.               |
| `created_at`    | TIMESTAMPTZ | Creation timestamp                        |
| `updated_at`    | TIMESTAMPTZ | Last update timestamp                     |

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
| `is_read`     | BOOLEAN     | Read status                      |
| `created_at`  | TIMESTAMPTZ | Submission timestamp             |

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

if (city) query = query.eq("city", city);
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

| Component             | Path                                 | Description                              |
| --------------------- | ------------------------------------ | ---------------------------------------- |
| `Header`              | `components/Header.tsx`              | Navigation header with mobile menu       |
| `Footer`              | `components/Footer.tsx`              | Site footer with links                   |
| `PropertyCard`        | `components/PropertyCard.tsx`        | Property listing card                    |
| `PropertyFilters`     | `components/PropertyFilters.tsx`     | Search and filter form                   |
| `ImageGallery`        | `components/ImageGallery.tsx`        | Property image gallery                   |
| `ContactForm`         | `components/ContactForm.tsx`         | Inquiry submission form                  |
| `EMICalculator`       | `components/EMICalculator.tsx`       | EMI calculator widget                    |
| `MortgageCalculator`  | `components/MortgageCalculator.tsx`  | Detailed mortgage/loan calculator        |
| `ROICalculator`       | `components/ROICalculator.tsx`       | Investment ROI analysis calculator       |
| `LeadCaptureForm`     | `components/LeadCaptureForm.tsx`     | Lead generation form                     |
| `WhyChooseUs`         | `components/WhyChooseUs.tsx`         | Value propositions                       |
| `TrustIndicators`     | `components/TrustIndicators.tsx`     | Trust badges                             |
| `FloatingWhatsApp`    | `components/FloatingWhatsApp.tsx`    | WhatsApp chat button                     |
| `AgentProfile`        | `components/AgentProfile.tsx`        | Agent details and expertise section      |
| `PopularLocalities`   | `components/PopularLocalities.tsx`   | Grid of popular locations                |
| `InquiryCTA`          | `components/InquiryCTA.tsx`          | Call to action for inquiries             |
| `ScrollToButton`      | `components/ScrollToButton.tsx`      | Button to scroll to specific section     |

### Admin Components

| Component     | Path                         | Description            |
| ------------- | ---------------------------- | ---------------------- |
| `AdminLayout` | `components/AdminLayout.tsx` | Admin dashboard layout |

### Pages

| Page                | Path                              | Description                            |
| ------------------- | --------------------------------- | -------------------------------------- |
| Home                | `app/page.tsx`                    | Landing page with hero and features    |
| Properties          | `app/properties/page.tsx`         | Property listings with filters         |
| Property Details    | `app/properties/[id]/page.tsx`    | Individual property page               |
| Real Estate Guide   | `app/real-estate-guide/page.tsx`  | Educational guide on real estate       |
| Calculators         | `app/calculators/page.tsx`        | Financial calculators (EMI, Mortgage, ROI) |
| Admin Dashboard     | `app/admin/page.tsx`              | Admin overview and statistics          |
| Admin Login         | `app/admin/login/page.tsx`        | Admin authentication page              |
| Manage Properties   | `app/admin/properties/page.tsx`   | Property CRUD operations               |
| Manage Inquiries    | `app/admin/inquiries/page.tsx`    | Inquiry management                     |

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

Authentication is handled by Supabase Auth with email/password login for admin users.

### Auth Context

The auth context (`lib/auth.tsx`) provides authentication state throughout the application:

```typescript
import { useAuth } from "@/lib/auth";

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

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
