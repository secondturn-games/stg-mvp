# Product Requirements Document (PRD)

**Product Name:** Second Turn – Baltic Boardgame Marketplace  
**Date:** July 15, 2025  
**Version:** 1.0  
**Lead Developer:** Aigars Grēniņš  
**Build Environment:** Cursor.dev  
**Target Launch:** Week 20 (Final Phase)

---

## 1. 🗺️ Product Overview

A localized, trust-first, peer-to-peer marketplace for buying, selling, and trading used board games in Estonia, Latvia, and Lithuania. MVP targets core transactional flows, seller verification, Baltic shipping/payment integrations, and legal compliance.

---

## 2. 🎯 Goals & Success Metrics

**Primary Goals:**

- Launch fully functional MVP in 8 weeks (Phase 1)
- Onboard 1,000 users and enable 50 verified transactions
- Address trust/safety gaps

**Success Metrics:**

| Metric                  | Target (3 Months) |
| ----------------------- | ----------------- |
| Registered Users        | 1,000+            |
| Listings Created        | 100+              |
| Successful Transactions | 50                |
| Avg. User Rating        | ≥ 4.5/5           |
| Support Response Time   | <24 hours         |

---

## 3. 🧩 Key Features & Requirements

### A. Authentication & User Accounts

- Clerk-based sign-up/sign-in
- Multi-factor authentication
- User roles: buyer, seller, moderator
- Account settings with preferred language

### B. Game Listings

- Create/Edit/Delete listings (fixed or trade)
- Attach images (optimize via Cloudflare R2)
- Condition grading (5-tier system)
- Location and shipping preferences
- Automated price suggestions (via BoardGamePrices.eu API)

### C. Search & Discovery

- Algolia integration with multi-language support
- Filters: price, condition, distance, type
- Mobile-friendly search UI
- Game detail pages with pricing, offers, and availability

### D. Payments & Escrow

- Stripe Connect with seller onboarding
- Escrow logic: hold until item delivered
- Platform fee
- Refund handling
- Baltic payment method compatibility

### E. Messaging & Notifications

- Supabase-powered in-app messaging
- Message moderation triggers
- Real-time alerts (new message, bid, sale, etc.)

### F. Shipping Integrations

- Omniva + DPD: API for parcel machine/pickup point selection
- Shipping label generation
- Tracking status integration
- Estimated delivery windows

### G. Trust & Safety

- Seller verification (3 levels)
- Verified purchase review system
- Fraud detection (Cursor AI ML hooks)
- Manual moderation panel

### H. Compliance

- GDPR-compliant: cookie consent, data deletion, privacy policy
- Terms & Conditions and platform ToS
- VAT OSS support (Estonia registered)
- Transaction receipts/invoices

### I. Mobile Optimization

- PWA with offline browsing and push notifications
- Responsive UI
- Swipe-based navigation and camera access

---

## 4. ⚙️ Technical Architecture (Cursor-Optimized)

| Layer        | Stack / Service                                 |
| ------------ | ----------------------------------------------- |
| Frontend     | Next.js 14 (App Router) + Tailwind + shadcn/ui  |
| Backend      | Next.js API Routes + Edge Functions (Vercel EU) |
| Database     | Supabase PostgreSQL + Row Level Security        |
| Auth         | Clerk                                           |
| File Storage | Cloudflare R2                                   |
| Payments     | Stripe Connect                                  |
| Search       | Algolia                                         |
| CDN          | Cloudflare                                      |
| Monitoring   | Sentry + Vercel Analytics                       |

---

## 5. 📋 Milestone Timeline (Condensed)

| Week     | Milestone                                        |
| -------- | ------------------------------------------------ |
| Week 0   | Business setup, legal, BGG license               |
| Week 1-2 | Next.js + Supabase + Clerk + GDPR + i18n         |
| Week 3-4 | Listings, Search, Messaging, Price API           |
| Week 5-6 | Stripe Connect, Escrow, Reviews, Fraud detection |
| Week 7-8 | Baltic shipping APIs, Local payments, PWA        |
| Week 9+  | Auction, Wishlist, Community (Phase 2 onward)    |

---

## 6. 🧪 Testing Plan

- Cursor AI-assisted unit & integration tests
- WebSocket/messaging flow testing
- GDPR consent & deletion compliance
- Escrow simulation tests
- Mobile device emulation testing

---

## 7. 📝 Deliverables

| Deliverable                             | Format / Tool      |
| --------------------------------------- | ------------------ |
| MVP Frontend (multi-language)           | Next.js (Cursor)   |
| Supabase schema with RLS                | Cursor/SQL         |
| Stripe Connect integration              | Cursor + Live keys |
| API integration with BoardGamePrices.eu | TypeScript fetch   |
| Omniva/DPD shipping integration         | Cursor + API mocks |
| GDPR Legal Docs                         | Markdown/Notion    |
| Mobile PWA                              | Next.js PWA-ready  |
| Notion Roadmap Table (Linked)           | ✅ Delivered       |

---
