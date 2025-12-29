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
- **Advanced Search & Filters** - Filter by state, city, price range, property type, bedrooms, listing type, and possession status
- **State & City Selection** - Dynamic location-based filtering with state and city dropdowns
- **Property Details** - Comprehensive property pages with image galleries, amenities, and location info
- **User Property Submission** - Authenticated users can submit properties for rent/resale
- **User Dashboard** - Track submitted properties with status (pending/approved/rejected)
- **Real Estate Guide** - Educational resource explaining real estate concepts in India
- **Financial Calculators** - Dedicated page with EMI, Mortgage, and ROI calculators
- **EMI Calculator** - Built-in mortgage calculator for quick affordability checks
- **Mortgage Calculator** - Detailed loan amortization with monthly payment breakdown
- **ROI Calculator** - Investment return analysis for rental properties
- **Services Pages** - Home Loans and Interior Design service information
- **Agent Profile** - Showcase agent details, expertise, and integrated contact form
- **Popular Localities** - Explore properties in top trending areas
- **Customer Testimonials** - Social proof with verified client reviews
- **Trust Indicators** - Badges highlighting reliability and security
- **WhatsApp Integration** - Instant floating chat button for quick inquiries
- **Contact Forms** - Direct inquiry submission for properties of interest
- **Responsive Design** - Mobile-first approach with seamless experience across all devices
- **User Authentication** - Signup and login with phone number for property access
- **Password Recovery** - Forgot password and reset password functionality
- **Social Media Links** - Connect via Instagram, Facebook, and YouTube

### 🔐 Admin Dashboard

- **Secure Admin Authentication** - Separate admin auth with Supabase integration
- **Password Recovery** - Forgot password and reset password for admin accounts
- **Property Management** - Full CRUD operations for listings
- **Property Approvals** - Review and approve/reject user-submitted properties
- **AI-Powered Descriptions** - Generate property descriptions using Google Gemini API
- **Location Management** - Manage states and cities for location-based filtering
- **Image & Brochure Upload** - Up to 25 images and 5 brochures per property
- **Inquiry Management** - Track and respond to customer inquiries
- **Leads Management** - View and manage user profiles and leads
- **WhatsApp Reminders** - Dedicated section for WhatsApp reminder management
- **Statistics Dashboard** - Overview of listings, inquiries, and pending approvals

### 🛠️ Technical Features

- **SEO Optimized** - Dynamic meta tags, sitemap generation, and structured data
- **Modern Animations** - Smooth transitions powered by Framer Motion
- **Type Safety** - Full TypeScript implementation
- **Row Level Security** - Secure database access with Supabase RLS policies
- **API Rate Limiting** - Protection against abuse with rate limiting utilities

---

## 🚀 Tech Stack

| Category           | Technology              |
| ------------------ | ----------------------- |
| **Framework**      | Next.js 16 (App Router) |
| **Language**       | TypeScript 5            |
| **Styling**        | Tailwind CSS 4          |
| **Database**       | Supabase (PostgreSQL)   |
| **Authentication** | Supabase Auth           |
| **Storage**        | Supabase Storage        |
| **Animations**     | Framer Motion           |
| **Icons**          | Lucide React            |
| **Deployment**     | Vercel                  |

---

## 📁 Project Structure

```
ghardaar24-web/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout with SEO
│   ├── globals.css               # Global styles & design system
│   ├── sitemap.ts                # Dynamic sitemap generation
│   ├── api/
│   │   └── generate-description/ # AI-powered description generation
│   ├── properties/
│   │   ├── page.tsx              # Property listings
│   │   ├── submit/page.tsx       # User property submission
│   │   └── [id]/page.tsx         # Property details
│   ├── dashboard/
│   │   └── page.tsx              # User dashboard (submitted properties)
│   ├── real-estate-guide/
│   │   └── page.tsx              # Educational real estate guide
│   ├── calculators/
│   │   └── page.tsx              # Financial calculators page
│   ├── services/
│   │   ├── home-loans/           # Home loans service page
│   │   └── interior-design/      # Interior design service page
│   ├── auth/
│   │   ├── login/page.tsx        # User login
│   │   ├── signup/page.tsx       # User signup
│   │   ├── forgot-password/      # User password reset request
│   │   └── reset-password/       # User password reset confirmation
│   └── admin/
│       ├── layout.tsx            # Admin layout
│       ├── login/page.tsx        # Admin login
│       ├── forgot-password/      # Admin password reset request
│       ├── reset-password/       # Admin password reset confirmation
│       ├── page.tsx              # Dashboard
│       ├── properties/           # Property management
│       ├── approvals/page.tsx    # User property approvals
│       ├── locations/page.tsx    # State/City management
│       ├── inquiries/            # Inquiry management
│       └── leads/                # User leads management
├── components/                   # Reusable React components
│   ├── Header.tsx                # Navigation header
│   ├── Footer.tsx                # Site footer
│   ├── PropertyCard.tsx          # Property listing card
│   ├── PropertyFilters.tsx       # Search filters with state/city
│   ├── ImageGallery.tsx          # Property image gallery
│   ├── ContactForm.tsx           # Inquiry form
│   ├── AgentProfile.tsx          # Agent details with integrated contact form
│   ├── EMICalculator.tsx         # EMI calculator widget
│   ├── MortgageCalculator.tsx    # Detailed mortgage calculator
│   ├── ROICalculator.tsx         # Investment ROI calculator
│   ├── LoginModal.tsx            # User login modal with forgot password
│   ├── PropertyAuthGuard.tsx     # Auth guard for property pages
│   └── ...                       # Other components
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client
│   ├── auth.tsx                  # User auth context provider
│   ├── admin-auth.tsx            # Admin auth context provider
│   ├── seo.ts                    # SEO configuration
│   ├── motion.tsx                # Animation utilities
│   ├── rate-limit.ts             # API rate limiting utilities
│   ├── amenityIcons.ts           # Amenity icon mappings
│   ├── indian-cities.ts          # State & city data
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
