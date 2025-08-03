# Second Turn Games

A community-powered marketplace for used board games in the Baltic region. Built with Next.js 14, Supabase, and Prisma.

## 🎯 Project Overview

Second Turn Games is a peer-to-peer marketplace that enables board game enthusiasts in Estonia, Latvia, and Lithuania to buy, sell, and trade used board games locally. The platform emphasizes trust, sustainability, and community.

## 🚀 Features

### MVP Features (Phase 1)

- ✅ User authentication (email + Google)
- ✅ Create and manage listings
- ✅ Search and filter games
- ✅ In-app messaging between buyers and sellers
- ✅ Mobile-first responsive design
- ✅ BGG integration for game data

### Planned Features

- 🔄 Real-time auctions
- 🔄 Payment processing
- 🔄 User verification system
- 🔄 Community features
- 🔄 Analytics dashboard

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS, Shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage / Cloudinary
- **Real-time**: Supabase Realtime
- **Hosting**: Vercel
- **Email**: Resend

## 📦 Installation

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- PostgreSQL database

### 1. Clone the repository

```bash
git clone <repository-url>
cd second-turn
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_database_url

# Email (for notifications)
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Seed with sample data
pnpm db:seed
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: User profiles, authentication, ratings
- **Games**: Board game catalog (from BGG)
- **Listings**: Marketplace listings with pricing and condition
- **Messages**: Communication between buyers and sellers
- **Reviews**: User ratings and feedback
- **Favorites**: User's favorite listings
- **Watchlist**: Saved listings for later

## 🌍 Localization

The application supports multiple languages:

- English (en)
- Estonian (et)
- Latvian (lv)
- Lithuanian (lt)

## 📱 Mobile Support

The application is built with a mobile-first approach and includes:

- Responsive design
- Progressive Web App (PWA) features
- Touch-optimized interfaces
- Offline capabilities

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data

### Code Structure

```
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
├── prisma/             # Database schema and migrations
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## 📊 CSV to Supabase Sync System

This project includes a comprehensive CSV to Supabase sync system for managing boardgame data efficiently.

### Quick Start

```bash
# Initial setup
npm run sync:csv

# Regular updates
npm run sync:csv:robust

# Monitor progress
npm run monitor:sync
```

### Documentation

- 📖 [Complete Setup Guide](docs/csv-sync-setup.md) - Detailed documentation
- 🚀 [Quick Reference](docs/sync-quick-reference.md) - Command reference

## 📧 Newsletter Subscription System

The project includes a fully automated newsletter subscription system for the coming soon page.

### Features

- ✅ Email signup form with validation
- ✅ Automatic email notifications to site owner
- ✅ Supabase webhook integration
- ✅ Resend.com email delivery
- ✅ Mobile-first responsive design

### Documentation

- 📖 [Subscription Flow Guide](docs/subscription-flow.md) - Complete setup and maintenance guide

### Features

- **Multiple sync strategies**: Full, incremental, and robust incremental
- **Live monitoring**: Real-time progress tracking
- **Error handling**: Automatic retries and rate limiting
- **Performance optimization**: Indexed queries and efficient updates

### Search Architecture

1. **Primary**: Supabase `csv_games` table (fastest)
2. **Fallback**: BGG API (for new games)
3. **Final Fallback**: CSV file (offline scenarios)

## 🎨 Design System

### Responsive Design

This project uses a consistent **1024px breakpoint** (`lg:`) for all responsive design changes.

- 📖 [Responsive Design Guidelines](docs/responsive-design-guidelines.md) - Complete guidelines
- ✅ **Mobile-first approach** with `lg:` breakpoint
- 🚫 **No `sm:`, `md:`, `xl:`, or `2xl:`** breakpoints used
- 📱 **Consistent typography and spacing** across all components

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set all required environment variables in your hosting platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@secondturn.games or create an issue in the repository.

---

Built with ❤️ for the Baltic board gaming community.
