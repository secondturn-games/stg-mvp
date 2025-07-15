# 🎲 Second Turn - Baltic Boardgame Marketplace

A trust-first, peer-to-peer marketplace for buying, selling, and trading used board games in Estonia, Latvia, and Lithuania.

## ✨ Features

### 🏗️ Core MVP (100% Complete)

- **User Authentication & Profiles**
  - Clerk-powered authentication
  - User profile creation and management
  - Seller verification system
  - Multi-language support (EN, ET, LV, LT)

- **Game Listings System**
  - Create and manage listings
  - Image upload with drag & drop
  - Condition grading system
  - Location and shipping preferences
  - My listings management

- **Search & Discovery**
  - Advanced filtering (condition, price, location, type)
  - Real-time search functionality
  - Sort options (relevance, price, date)
  - Individual listing detail pages
  - Image gallery with navigation

- **Marketplace Features**
  - Responsive grid layout
  - Mobile-optimized UI
  - Seller information display
  - Contact actions and modals

- **Performance & UX**
  - Optimized image loading with lazy loading
  - Error boundaries and loading states
  - Toast notifications for user feedback
  - Accessibility improvements (skip to content, ARIA labels)
  - Mobile-first responsive design

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Database**: Supabase PostgreSQL with RLS
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with custom design system
- **Image Storage**: Base64 data URLs (ready for Cloudflare R2)
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd second-turn-games-mvp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Set up the database**
   - Run the SQL schema in your Supabase project
   - Configure RLS policies as needed

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following key tables:

- **users**: User profiles and verification status
- **games**: Game catalog with multi-language titles
- **listings**: Marketplace listings with images and descriptions
- **auctions**: Auction functionality (ready for Phase 2)
- **messages**: User communication system
- **reviews**: User feedback and ratings
- **transactions**: Payment and escrow tracking

## 🎯 Current Status

### ✅ Completed (100% of Core MVP)

- User authentication and profile management
- Game listing creation and management
- Marketplace browsing with search and filters
- Individual listing detail pages
- Image upload and display
- Mobile-responsive design
- Error handling and loading states
- Accessibility improvements

### 🚀 Ready for Phase 2

- Auction system
- Payment integration (Stripe Connect)
- Messaging system
- Review and rating system
- Advanced analytics
- PWA features

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── listings/          # Listing pages
│   ├── marketplace/       # Marketplace pages
│   └── profile/           # User profile pages
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── marketplace/      # Marketplace-specific components
│   └── listings/         # Listing-specific components
└── lib/                  # Utility functions and configurations
```

### Key Components

- **ErrorBoundary**: Catches and handles unexpected errors
- **LoadingSpinner**: Consistent loading states
- **EmptyState**: Better UX for empty data states
- **OptimizedImage**: Lazy loading and error handling for images
- **ToastProvider**: User feedback notifications
- **VirtualList**: Performance optimization for large lists

## 🎨 Design System

The application uses a custom design system inspired by Baltic culture:

- **Colors**: Forest green, amber, and ivory palette
- **Typography**: Clean, readable fonts optimized for mobile
- **Components**: Consistent, accessible UI components
- **Responsive**: Mobile-first design with progressive enhancement

## 🔒 Security

- Row Level Security (RLS) on all database tables
- Clerk authentication with secure session management
- Input validation and sanitization
- XSS protection and CSRF safeguards

## 📱 Mobile Optimization

- Progressive Web App (PWA) ready
- Touch-friendly interface
- Optimized for cold weather usage
- Offline browsing capability (Phase 2)

## 🌍 Internationalization

- Multi-language support (EN, ET, LV, LT)
- Localized content and messaging
- Regional payment methods
- Baltic-specific shipping options

## 🚀 Deployment

The application is ready for deployment on Vercel:

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with automatic CI/CD

## 📈 Performance

- Optimized image loading with lazy loading
- Virtual scrolling for large lists
- Efficient database queries with proper indexing
- CDN-ready static assets
- Core Web Vitals optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the Baltic board game community**
