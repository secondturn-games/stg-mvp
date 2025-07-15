# Baltic Boardgame Marketplace - Enhanced Development Plan

**Date:** Tuesday, July 15, 2025  
**Time:** 10:46 AM EEST

## Executive Summary

The Baltic region presents a €15M+ boardgame market opportunity with 1.6M active players across Estonia, Latvia, and Lithuania. With BGG's marketplace shutdown creating a service gap and no dedicated regional platform existing, we have a clear first-mover advantage. This plan incorporates comprehensive market analysis, regulatory requirements, and technical considerations for rapid MVP deployment using Cursor's AI-assisted development.

## Table of Contents

1. [Market Opportunity & Positioning](#1-market-opportunity--positioning)
2. [MVP Feature Prioritization](#2-mvp-feature-prioritization)
3. [Technical Architecture](#3-technical-architecture)
4. [Development Roadmap](#4-development-roadmap)
5. [API Integration Strategy](#5-api-integration-strategy)
6. [Database Schema](#6-database-schema)
7. [Legal Compliance Framework](#7-legal-compliance-framework)
8. [Trust & Safety Implementation](#8-trust--safety-implementation)
9. [Shipping & Logistics Integration](#9-shipping--logistics-integration)
10. [Community Building Strategy](#10-community-building-strategy)
11. [Monetization & Revenue Model](#11-monetization--revenue-model)
12. [Mobile-First Design System](#12-mobile-first-design-system)
13. [Risk Mitigation & Contingency Planning](#13-risk-mitigation--contingency-planning)

---

## 1. Market Opportunity & Positioning

### Market Size

- **Total Population:** 6.1M across Baltic states
- **Active Players:** 1.6M (26% participation rate)
  - Lithuania: 900,000 players (32% participation)
  - Latvia: 25% annual growth rate
  - Estonia: Highest digital adoption (93% internet penetration)
- **Market Value:** Latvia alone projected at $5.32M by 2028

### Competitive Gaps to Exploit

- **BGG Marketplace:** Shut down in 2022, restored in 2025, creating user uncertainty
- **Facebook Marketplace:** Lacks specialized features, increasing scam reports
- **Brain Games:** €3.7M revenue but retail-focused, no C2C marketplace
- **International Platforms:** High shipping costs, language barriers

### Our Competitive Advantages

- First dedicated Baltic boardgame marketplace
- Native language support (Estonian, Latvian, Lithuanian)
- Integrated Baltic shipping (Omniva, DPD)
- Local payment methods
- Community features addressing BGG's trust/safety gaps
- Mobile-first design for high smartphone adoption region

---

## 2. MVP Feature Prioritization

### Phase 1: Core MVP (Weeks 1-8)

**Goal:** Launch trust-worthy marketplace addressing BGG shutdown gaps

**Essential Features:**

- **Authentication:** Multi-factor (Cursor auth templates)
- **Game Database:** Hybrid approach using BoardGameGeek.com + manual entry
- **Listing Creation:**
  - BGG integration or alternative data source
  - Photo upload with AI-powered quality checks
  - Condition grading system with visual guides
  - Automated pricing suggestions from BoardGamePrices.eu
- **Search & Discovery:**
  - Basic filters (location, price, condition)
  - Baltic language search optimization
- **Trust & Safety (CRITICAL):**
  - Seller verification (ID + bank account) [optional]
  - Escrow payment system via Stripe
  - User ratings with purchase verification
- **Communication:** In-app messaging with notification system
- **Legal Compliance:** GDPR consent, terms acceptance

### Phase 2: Enhanced Marketplace (Weeks 9-14)

**Goal:** Add features creating competitive advantage

**New Features:**

- **Advanced Search:**
  - Wishlist matching with alerts
  - Price history tracking
- **Auction System:**
  - Timed auctions with proxy bidding
  - Buy-it-now options
  - Anti-snipe extensions (5 min on late bids)
- **Shipping Integration:**
  - Omniva parcel machine selection
  - DPD pickup point maps
  - Automated label generation
  - Split shipping for multiple purchases
- **Payment Expansion:**
  - Local Baltic payment methods
  - Payment plans for high-value items
- **Mobile PWA:** Offline browsing, push notifications

### Phase 3: Community & Scale (Weeks 15-20)

**Goal:** Build sustainable community advantage

**Community Features:**

- **Forums:** Language-specific boards
- **Game Groups:** Local meetup organization
- **Collection Management:** Import from BGG
- **Trade Matching:** Want/have list algorithms
- **Reviews:** Verified purchase reviews with photos
- **Educational Content:**
  - New player guides in Baltic languages
  - Video tutorials for popular games
  - Price guides and market trends

---

## 3. Technical Architecture

### Updated Tech Stack

- **Frontend:** Next.js 14 (App Router) + TailwindCSS + shadcn/ui
- **Backend:** Next.js API Routes + Edge Functions
- **Database:** Supabase PostgreSQL with Row Level Security
- **Auth:** Clerk (possibly with Baltic bank SSO integration)
- **Storage:** Cloudflare R2 (cost-effective for images)
- **Payments:** Stripe Connect for marketplace
- **Search:** Algolia for multi-language search
- **Deployment:** Vercel with EU edge locations
- **Monitoring:** Sentry + Vercel Analytics
- **CDN:** Cloudflare for Baltic performance

### Architecture Diagram

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Next.js App       │    │   Supabase          │    │   External APIs     │
│   (Vercel EU)       │    │   (EU Region)       │    │                     │
│                     │◄──►│   - Users (RLS)     │    │ - BoardGamePrices   │
│   Features:         │    │   - Listings        │    │ - Stripe Connect    │
│   - SSR/SSG         │    │   - Messages        │    │ - Omniva/DPD        │
│   - Edge Functions  │    │   - Transactions    │    │ - Algolia Search    │
│   - i18n routing    │    │   - Reviews         │    │ - Cloudflare R2     │
│   - PWA support     │    │   - Audit logs      │    │ - BGG (if licensed) │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         ▲                           ▲
         │                           │
         ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│   Cloudflare        │    │   Monitoring        │
│   - CDN             │    │   - Sentry          │
│   - DDoS Protection │    │   - Analytics       │
│   - Image Optimize  │    │   - Uptime Robot    │
└─────────────────────┘    └─────────────────────┘
```

### Key Technical Decisions

- **Supabase RLS:** Row-level security for data protection
- **Edge Functions:** Low latency for Baltic users
- **Algolia:** Handles Estonian/Latvian/Lithuanian search nuances
- **Cloudflare R2:** 10x cheaper than S3 for image storage
- **Stripe Connect:** Handles complex marketplace payments/splits

---

## 4. Development Roadmap

### Pre-Development (Week 0)

- [ ] **BGG API License Negotiation** (Contact Daniel Karp)
- [ ] Register business entity in Latvia
- [ ] Open business bank accounts
- [ ] Legal consultation for terms of service

### Week 1-2: Foundation & Compliance

- [ ] Next.js setup with i18n routing (Cursor templates)
- [ ] Supabase schema with RLS policies
- [ ] GDPR compliance framework
- [ ] Multi-language content structure
- [ ] Design system with Baltic cultural elements

### Week 3-4: Core Marketplace

- [ ] User registration with Baltic ID verification
- [ ] Listing creation with image optimization
- [ ] Search with Algolia integration
- [ ] BoardGamePrices.eu API integration
- [ ] Basic messaging system

### Week 5-6: Trust & Payments

- [ ] Stripe Connect marketplace setup
- [ ] Escrow payment flow
- [ ] Seller verification system
- [ ] Review/rating system
- [ ] Fraud detection rules

### Week 7-8: Baltic Optimizations

- [ ] Omniva API integration
- [ ] DPD shipping integration
- [ ] Local payment methods
- [ ] VAT automation
- [ ] Mobile PWA features

### Week 9-10: Auction System

- [ ] Timed auction functionality
- [ ] Proxy bidding algorithm
- [ ] Real-time bid updates (Supabase Realtime)
- [ ] Anti-snipe mechanisms
- [ ] Auction notifications

### Week 11-12: Advanced Features

- [ ] Wishlist/collection management
- [ ] Price alerts
- [ ] Bulk listing tools
- [ ] Advanced search filters
- [ ] Analytics dashboard

### Week 13-14: Community Features

- [ ] Forum system
- [ ] Local meetup tools
- [ ] Trade matching algorithm
- [ ] Educational content CMS
- [ ] Gamification elements

### Week 15-16: Performance & Polish

- [ ] Performance optimization
- [ ] SEO implementation
- [ ] A/B testing setup
- [ ] Bug fixes from beta
- [ ] Documentation

### Week 17-18: Launch Preparation

- [ ] Marketing site
- [ ] Onboarding tutorials
- [ ] Customer support setup
- [ ] Community seeding
- [ ] PR outreach

### Week 19-20: Launch & Iterate

- [ ] Soft launch to beta users
- [ ] Community feedback integration
- [ ] Performance monitoring
- [ ] Gradual feature rollout
- [ ] Public launch

---

## 5. API Integration Strategy

### BoardGameGeek API (High Priority - Requires License)

**Current Status:** Commercial use requires case-by-case approval

**Action Items:**

1. Contact Daniel Karp via BGG GeekMail immediately
2. Prepare business case emphasizing non-competitive nature
3. Negotiate licensing terms and fees
4. Implement with required attribution

**Technical Requirements:**

- Bearer token authentication
- 5-second request delays
- XML parsing with error handling
- Comprehensive caching strategy

**Contingency Plan:**

- Build proprietary game database
- Crowdsource from community
- Partner with Baltic publishers

### BoardGamePrices.eu API (Immediate Implementation)

**Advantages:** Free commercial use with attribution

**Implementation:**

- Real-time price comparison
- Stock availability checks
- Historical price tracking
- Shipping cost estimates

**Code Example (Cursor AI-assisted):**

```typescript
// Cursor will help generate optimized caching
const getPriceData = async (gameId: string) => {
  const cached = await redis.get(`price:${gameId}`);
  if (cached) return JSON.parse(cached);

  const data = await fetch(`${BGPRICES_API}/game/${gameId}`);
  await redis.setex(`price:${gameId}`, 3600, JSON.stringify(data));
  return data;
};
```

### Shipping APIs

**Omniva Integration:**

- Parcel machine locations
- Label generation
- Tracking webhooks
- Rate calculation

**DPD Baltic Integration:**

- Pickup point selection
- Same-day delivery options
- Multi-country support
- Business account rates

### Payment Integration (Stripe Connect)

- Marketplace split payments
- Escrow functionality
- VAT calculation
- Payout automation
- Fraud prevention

---

## 6. Database Schema

### Enhanced Schema Design

```sql
-- Users table with Baltic-specific fields
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  verified_seller BOOLEAN DEFAULT FALSE,
  preferred_language TEXT CHECK (preferred_language IN ('et', 'lv', 'lt', 'en')),
  country TEXT CHECK (country IN ('EE', 'LV', 'LT')),
  bank_verified BOOLEAN DEFAULT FALSE,
  vat_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table (BGG data cache + custom)
CREATE TABLE games (
  id UUID PRIMARY KEY,
  bgg_id INTEGER UNIQUE,
  title JSONB, -- {"en": "Catan", "et": "Catan", "lv": "Katāna"}
  year_published INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  playing_time INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings with enhanced trust features
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  game_id UUID REFERENCES games(id),
  listing_type TEXT CHECK (listing_type IN ('fixed', 'auction', 'trade')),
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  condition TEXT CHECK (condition IN ('new', 'like_new', 'very_good', 'good', 'acceptable')),
  location_country TEXT,
  location_city TEXT,
  shipping_options JSONB, -- {"omniva": true, "dpd": true, "pickup": true}
  photos JSONB, -- Array of Cloudflare R2 URLs
  description JSONB, -- Multi-language
  status TEXT CHECK (status IN ('active', 'sold', 'cancelled', 'reserved')),
  verified_photos BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auctions with anti-snipe features
CREATE TABLE auctions (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  starting_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  reserve_price DECIMAL(10,2),
  bid_increment DECIMAL(10,2),
  end_time TIMESTAMPTZ,
  extension_time INTEGER DEFAULT 300, -- 5 minutes
  buy_now_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced messaging with moderation
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID,
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  content TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  moderation_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews with verification
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  reviewer_id UUID REFERENCES users(id),
  reviewed_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT TRUE,
  photos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions with escrow support
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  vat_amount DECIMAL(10,2),
  escrow_status TEXT,
  stripe_payment_intent TEXT,
  shipping_method TEXT,
  tracking_number TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping integrations
CREATE TABLE shipping_labels (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  carrier TEXT CHECK (carrier IN ('omniva', 'dpd')),
  label_url TEXT,
  tracking_number TEXT,
  pickup_point_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User collections for trade matching
CREATE TABLE user_collections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  game_id UUID REFERENCES games(id),
  status TEXT CHECK (status IN ('own', 'want', 'trade', 'sold')),
  condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Legal Compliance Framework

### GDPR Compliance (Priority 1)

**Implementation Requirements:**

- Cookie consent banner with granular controls
- Privacy policy in 4 languages
- Data processing agreements with all vendors
- User data export functionality
- Right to deletion automation
- Consent management system
- Data breach notification system (72-hour requirement)

**Cursor Implementation:**

```typescript
// GDPR consent component with Cursor AI assistance
const GDPRConsent = () => {
  // Cursor will generate compliant consent logic
  // with proper legal text in all Baltic languages
};
```

### Consumer Protection Laws

**Estonia (CPTRA oversight):**

- Seller identity verification
- 14-day withdrawal rights
- Clear terms of service
- Dispute resolution process

**Latvia (CRPC enforcement):**

- Enhanced seller verification
- Prohibited false reviews (10% revenue fines)
- Transparent pricing
- Quality guarantees

**Lithuania (State Consumer Rights Protection Authority):**

- Comprehensive seller ID
- Digital service quality standards
- Clear refund policies
- Language requirements

### Payment Services Directive 2 (PSD2)

**Strong Customer Authentication:**

- Two-factor authentication
- Biometric options
- Transaction monitoring
- Fraud prevention rules
- SCA exemptions handling

### Digital Services Act Compliance

**Platform Obligations:**

- Content moderation system
- Illegal content reporting
- Transparency reports
- Risk assessments
- User appeal process

---

## 8. Trust & Safety Implementation

### Seller Verification System

**Level 1 - Basic (Required):**

- Email verification
- Phone number verification
- Bank account verification via Stripe

**Level 2 - Trusted Seller:**

- Government ID verification
- Proof of address
- Business registration (if applicable)
- Minimum 10 successful transactions

**Level 3 - Premium Seller:**

- Video verification
- Background check
- Insurance coverage
- Priority support

### Fraud Prevention

**AI-Powered Detection (Cursor ML features):**

- Unusual pricing patterns
- Suspicious message content
- Rapid account creation
- Geographic anomalies
- Payment pattern analysis

**Manual Review Triggers:**

- First-time sellers >€500
- Rapid listing creation
- Reported users
- Unusual shipping patterns

### Escrow System

**Transaction Flow:**

1. Buyer pays to escrow
2. Seller ships with tracking
3. Buyer confirms receipt (3-day window)
4. Funds released to seller
5. Automatic release after 7 days

**Dispute Resolution:**

- In-platform mediation
- Photo/video evidence
- Community moderators
- Escalation to support
- Chargeback protection

### Community Moderation

**Automated Systems:**

- Keyword filtering in 4 languages
- Image recognition for inappropriate content
- Spam detection
- Price manipulation alerts

**Human Moderation:**

- Community volunteers (rewards program)
- Professional moderators for disputes
- Cultural sensitivity training
- 24-hour response SLA

---

## 9. Shipping & Logistics Integration

### Omniva Integration (Estonia, Latvia, Lithuania)

**Features:**

- 1,300+ parcel machines
- API for machine selection
- Label printing
- Track & trace webhooks
- Competitive rates via business account

**Implementation:**

```typescript
// Omniva parcel machine selector
const OmnivaSelector = () => {
  // Cursor generates map integration
  // with machine availability
};
```

### DPD Baltic Integration

**Features:**

- Home delivery
- 42,000+ pickup points
- Same-day delivery (major cities)
- International shipping
- Business rates

### Shipping Optimization

**Smart Routing:**

- Cheapest option calculation
- Fastest delivery prediction
- Carbon footprint display
- Multi-item consolidation
- Seller shipping profiles

**Buyer Benefits:**

- Real-time rate comparison
- Delivery time estimates
- Insurance options
- Package consolidation
- Tracking aggregation

---

## 10. Community Building Strategy

### Launch Community Initiatives

**Ambassador Program:**

- Recruit 10 ambassadors per country
- Exclusive features access
- Commission bonuses
- Event organization support
- Co-marketing opportunities

**Content Creation:**

- Baltic language rule translations
- Video reviews by locals
- Beginner guides
- Strategy articles
- Designer interviews

### Engagement Features

**Gamification:**

- Achievement badges
- Seller levels
- Buyer rewards
- Referral program
- Collection milestones

**Social Features:**

- Follow favorite sellers
- Share wishlists
- Trade circles
- Local group formation
- Event calendar

### Partnerships

**Local Game Stores:**

- Inventory integration
- Event cross-promotion
- Fulfillment partnerships
- Demo space access

**Baltic Publishers:**

- KADABRA
- Brain Games
- Tactic Games
- Early access releases
- Exclusive editions

**Gaming Events:**

- BaltiCon sponsorship
- Local convention presence
- Demo tables
- Tournament organization
- Designer meet-ups

---

## 11. Monetization & Revenue Model

### Transaction-Based Revenue

**Commission Structure:**

- 3-5% on successful sales (competitive with BGG's 3%)
- No listing fees (growth focus)
- Reduced fees for verified sellers (2.5%)
- Volume discounts (>€1000/month)

### Premium Features

**Seller Plus (€9.99/month):**

- Unlimited listings
- Advanced analytics
- Bulk listing tools
- Priority support
- Featured placement

**Buyer Plus (€4.99/month):**

- Price drop alerts
- Advanced search filters
- Early access to deals
- Wishlist matching
- No buyer fees

### Additional Revenue Streams

**Promoted Listings:**

- Homepage features (€5/day)
- Category placement (€3/day)
- Search boosts (€1/day)
- Newsletter inclusion (€10)

**Advertising:**

- Publisher spotlights
- New release promotions
- Event announcements
- Affiliate commissions

**Data & Analytics:**

- Market reports for publishers
- Pricing trends API
- Inventory planning tools
- Anonymous analytics

### Financial Projections

**Year 1 Targets:**

- 10,000 active users
- €500,000 GMV
- €20,000 monthly revenue
- 15% month-over-month growth

---

## 12. Mobile-First Design System

### Design Principles

**Baltic Cultural Elements:**

- Color palette inspired by Baltic amber (refer to brand_book_design_system.md)
- Clean Scandinavian-influenced layouts
- High contrast for outdoor use
- Large touch targets for cold weather

**Performance Optimization:**

- <3 second load time
- Offline browsing capability
- Progressive image loading
- Skeleton screens
- Optimistic UI updates

### Progressive Web App Features

**Core Functionality:**

- Install prompts
- Push notifications
- Offline game browsing
- Camera integration for listings
- Share API for wishlists

**Native App Features (Phase 3):**

- Barcode scanning
- Bluetooth for local trades
- AR for size visualization
- Biometric authentication

### Responsive Design

**Breakpoints:**

- Mobile: 320-767px (priority)
- Tablet: 768-1023px
- Desktop: 1024px+

**Mobile-Specific Features:**

- Swipe gestures
- Bottom navigation
- Pull-to-refresh
- Voice search
- One-handed operation

---

## 13. Risk Mitigation & Contingency Planning

### Technical Risks

**BGG API Denial:**

- **Mitigation:** Develop proprietary database
- **Contingency:** Partner with BoardGamePrices.eu for data
- **Timeline Impact:** +4 weeks

**Scaling Issues:**

- **Mitigation:** Vercel auto-scaling + Cloudflare
- **Contingency:** Multi-region deployment
- **Cost Impact:** +€500/month at scale

### Business Risks

**Competitor Entry:**

- **Mitigation:** Fast execution + community lock-in
- **Contingency:** Acquisition discussions
- **Response:** Feature acceleration

**Regulatory Changes:**

- **Mitigation:** Legal retainer + compliance buffer
- **Contingency:** Multi-jurisdiction structure
- **Cost:** €10,000 legal reserve

### Operational Risks

**Fraud/Scams:**

- **Mitigation:** Escrow + verification
- **Contingency:** Insurance partnership
- **Budget:** 0.5% of GMV reserve

**Customer Support:**

- **Mitigation:** AI chatbot + community help
- **Contingency:** Outsourced support
- **Cost:** €2,000/month at scale

### Financial Risks

**Runway:**

- **Target:** 18 months runway
- **Burn Rate:** €15,000/month
- **Break-even:** Month 12
- **Funding:** €300,000 seed round

---

## Success Metrics

### Phase 1 KPIs (Months 1-3)

- 1,000 registered users
- 100 active listings
- 50 completed transactions
- 4.5+ star average rating
- <24 hour support response

### Phase 2 KPIs (Months 4-6)

- 5,000 registered users
- 500 active listings
- 300 monthly transactions
- 20% month-over-month growth
- 3 shipping integrations live

### Phase 3 KPIs (Months 7-12)

- 15,000 registered users
- 2,000 active listings
- €50,000 monthly GMV
- 40% repeat buyer rate
- Break-even achieved

---

## Implementation Notes for Cursor

1. **Use Cursor's AI features for:**
   - Multi-language content generation
   - GDPR-compliant code templates
   - Real-time features with WebSockets
   - Image optimization pipelines
   - SEO meta tag generation

2. **Leverage Cursor's templates for:**
   - Authentication flows
   - Payment integration
   - Admin dashboards
   - Email notifications
   - API rate limiting

3. **AI-assisted testing:**
   - Multi-language UI testing
   - Payment flow testing
   - Load testing scripts
   - Security penetration tests
   - Accessibility compliance

This enhanced plan positions the Baltic Boardgame Marketplace to capture a significant share of the underserved €15M+ regional market while building sustainable competitive advantages through community, trust, and localization.
