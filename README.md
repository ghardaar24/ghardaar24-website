# Ghardaar24 - Real Estate Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)

A modern, responsive real estate platform built with cutting-edge technologies.

[Live Demo](#) • [Documentation](DOCUMENTATION.md) • [Security](SECURITY.md)

</div>

---

## ✨ Features

### 🏠 Public Features
- **Property Listings** - Browse apartments, houses, villas, plots, and commercial properties
- **Advanced Search & Filters** - Filter by city, price range, property type, bedrooms, and listing type
- **Property Details** - Comprehensive property pages with image galleries, amenities, and location info
- **EMI Calculator** - Built-in mortgage calculator for quick affordability checks
- **Contact Forms** - Direct inquiry submission for properties of interest
- **Responsive Design** - Mobile-first approach with seamless experience across all devices

### 🔐 Admin Dashboard
- **Secure Authentication** - Supabase Auth integration
- **Property Management** - Full CRUD operations for listings
- **Image Upload** - Multi-image support with Supabase Storage
- **Inquiry Management** - Track and respond to customer inquiries
- **Statistics Dashboard** - Overview of listings and inquiries

### 🛠️ Technical Features
- **SEO Optimized** - Dynamic meta tags, sitemap generation, and structured data
- **Modern Animations** - Smooth transitions powered by Framer Motion
- **Type Safety** - Full TypeScript implementation
- **Row Level Security** - Secure database access with Supabase RLS policies

---

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
ghardaar24-web/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout with SEO
│   ├── globals.css               # Global styles & design system
│   ├── sitemap.ts                # Dynamic sitemap generation
│   ├── properties/
│   │   ├── page.tsx              # Property listings
│   │   └── [id]/page.tsx         # Property details
│   └── admin/
│       ├── layout.tsx            # Admin layout
│       ├── login/page.tsx        # Admin login
│       ├── page.tsx              # Dashboard
│       ├── properties/           # Property management
│       └── inquiries/            # Inquiry management
├── components/                   # Reusable React components
│   ├── Header.tsx                # Navigation header
│   ├── Footer.tsx                # Site footer
│   ├── PropertyCard.tsx          # Property listing card
│   ├── PropertyFilters.tsx       # Search filters
│   ├── ImageGallery.tsx          # Property image gallery
│   ├── ContactForm.tsx           # Inquiry form
│   ├── EMICalculator.tsx         # Mortgage calculator
│   ├── LeadCaptureForm.tsx       # Lead generation form
│   └── ...                       # Other components
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client
│   ├── auth.tsx                  # Auth context provider
│   ├── seo.ts                    # SEO configuration
│   ├── motion.tsx                # Animation utilities
│   └── utils.ts                  # Helper functions
├── supabase/
│   └── schema.sql                # Database schema + RLS policies
└── public/                       # Static assets
```

---

## 🔑 Admin Access

Navigate to `/admin/login` and sign in with your Supabase auth credentials.

---

## 📚 Documentation

For detailed documentation, see:
- [Documentation](DOCUMENTATION.md) - Complete project documentation
- [Security](SECURITY.md) - Security policies and guidelines

---

## 👨‍💻 Developer

**Ashutosh Swamy**  
[![GitHub](https://img.shields.io/badge/GitHub-ashutoshswamy-181717?style=flat-square&logo=github)](https://github.com/ashutoshswamy)

---

## 📧 Contact

For questions or support, please reach out via GitHub.

---

<div align="center">
Made by <a href="https://github.com/ashutoshswamy">Ashutosh Swamy</a>
</div>
