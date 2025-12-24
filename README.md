# Ghardaar24 - Real Estate Website

A modern real estate website built with Next.js 16, TypeScript, Tailwind CSS 4, and Supabase.

## Features

- 🏠 **Public Pages**: Home, Properties listing, Property details
- 🔍 **Property Search**: Filter by city, price, type, bedrooms
- 📱 **Responsive Design**: Mobile-first approach
- 🔐 **Admin Dashboard**: Secure login, property CRUD, inquiry management
- 🖼️ **Image Gallery**: Multi-image upload with Supabase Storage
- 📧 **Contact Forms**: Property-specific inquiries saved to database
- 🗺️ **Google Maps**: Embedded location maps
- 📲 **Contact Options**: Call, WhatsApp, Email buttons

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the SQL from `supabase/schema.sql` in the SQL Editor
3. Create a Storage bucket named `property-images` (make it public)
4. Enable Email Auth and create an admin user

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout with SEO
│   ├── globals.css           # Global styles
│   ├── properties/
│   │   ├── page.tsx          # Properties listing
│   │   └── [id]/page.tsx     # Property details
│   └── admin/
│       ├── layout.tsx        # Admin layout
│       ├── login/page.tsx    # Admin login
│       ├── page.tsx          # Dashboard
│       ├── properties/       # Property management
│       └── inquiries/        # Inquiry management
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PropertyCard.tsx
│   ├── PropertyFilters.tsx
│   ├── ImageGallery.tsx
│   ├── ContactForm.tsx
│   ├── GoogleMap.tsx
│   └── AdminLayout.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── auth.tsx              # Auth context
│   ├── seo.ts                # SEO config
│   └── utils.ts              # Utilities
└── supabase/
    └── schema.sql            # Database schema + RLS
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Import project from GitHub
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

### 3. Update Supabase Settings

Add your Vercel domain to Supabase:

- Settings → Auth → Site URL
- Settings → Auth → Redirect URLs

## Admin Access

Navigate to `/admin/login` and sign in with your Supabase auth credentials.

## License

MIT
