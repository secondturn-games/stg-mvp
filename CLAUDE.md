# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run check-all` - Run all checks (lint, format, type-check)

### Development Workflow

Always run `npm run check-all` after making changes to ensure code quality. This runs linting, formatting checks, and TypeScript type checking.

## Project Architecture

### Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Clerk
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with custom design system (Baltic-inspired colors)

### Key Directory Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/            # API endpoints (/api/listings, /api/auctions, etc.)
│   ├── listings/       # Listing pages (create, edit, detail)
│   ├── marketplace/    # Marketplace browsing
│   └── profile/        # User profile pages
├── components/         # Reusable React components
│   ├── ui/            # Base UI components (LoadingSpinner, EmptyState, etc.)
│   ├── marketplace/   # Marketplace-specific components
│   ├── listings/      # Listing-specific components
│   └── auctions/      # Auction-specific components
├── lib/               # Utility functions and configurations
│   ├── supabase.ts    # Supabase client and database types
│   ├── database.ts    # Database operations
│   └── clerk.ts       # Clerk authentication utilities
└── types/             # TypeScript type definitions
```

### Database Schema

The application uses Supabase with these key tables:

- `users` - User profiles with Baltic region support (EE, LV, LT)
- `games` - Game catalog with multi-language titles
- `listings` - Marketplace listings with photos and descriptions
- `auctions` - Auction functionality (ready for Phase 2)
- `bids` - Auction bidding system

### Authentication Flow

Uses Clerk for authentication with middleware protection. User profiles are stored in Supabase and synced with Clerk user data.

### Path Aliases

- `@/*` - Points to `src/*`
- `@/components/*` - Points to `src/components/*`
- `@/lib/*` - Points to `src/lib/*`
- `@/types/*` - Points to `src/types/*`
- `@/app/*` - Points to `src/app/*`

## Development Patterns

### Component Structure

- Use TypeScript interfaces for all props
- Follow the component pattern: UI components in `/ui`, feature components in feature directories
- Use Tailwind CSS classes, following the custom design system (forestDeep, sunEmber, goldenBeam, ivory colors)
- Implement proper error boundaries and loading states

### API Route Structure

All API routes are in `src/app/api/` and follow RESTful conventions:

- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Include `export const dynamic = 'force-dynamic'` for dynamic routes
- Return consistent JSON responses with proper error handling

### Database Operations

- Use the functions in `src/lib/database.ts` for all database operations
- Follow RLS policies - users can only access their own data
- Use proper TypeScript types from `src/lib/supabase.ts`

### Styling Guidelines

- Use Tailwind CSS with the custom design system
- Mobile-first responsive design
- Dark mode support is configured but not implemented
- Custom colors: forestDeep (#29432B), sunEmber (#D95323), goldenBeam (#F2C94C), ivory (#E6EAD7)

## Environment Variables

Required for development:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

## Deployment

The project is configured for Vercel deployment with:

- Automatic preview deployments on PRs
- Production deployments from main branch
- Frankfurt region (`fra1`) for optimal Baltic region performance
- API route timeout of 30 seconds

## Testing Strategy

Currently no test framework is configured. When implementing tests:

- Use the database functions in `src/lib/database.ts`
- Test API routes with proper authentication
- Test component rendering with proper props
- Test form validation and error handling
