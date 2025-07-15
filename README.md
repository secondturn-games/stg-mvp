# 🎯 Second Turn - Baltic Boardgame Marketplace

A trust-first, peer-to-peer marketplace for buying, selling, and trading used board games in Estonia, Latvia, and Lithuania.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Payments**: Stripe Connect
- **Search**: Algolia
- **Storage**: Cloudflare R2
- **Deployment**: Vercel

## 🎨 Design System

### Brand Colors

- **Ivory Mist**: `#E6EAD7` - Light backgrounds, surfaces
- **Sun Ember**: `#D95323` - Primary CTA, highlights
- **Golden Beam**: `#F2C94C` - Secondary CTA, tags
- **Forest Deep**: `#29432B` - Base text, header, dark surfaces

### Mobile-First Approach

- Responsive design optimized for mobile devices
- Progressive Web App (PWA) capabilities
- Touch-friendly interface

## 🌍 Multi-Language Support

- **Estonian** (et)
- **Latvian** (lv)
- **Lithuanian** (lt)
- **English** (en) - Default

## 📱 Features

### Phase 1 (Weeks 1-8) - Core MVP

- ✅ User authentication and profiles
- ✅ Game listings with image upload
- ✅ Search and discovery
- ✅ Payment processing with escrow
- ✅ Trust and safety systems
- ✅ Baltic shipping integrations

### Phase 2 (Weeks 9-14) - Enhanced Features

- 🔄 Auction system
- 🔄 Wishlist and collection management
- 🔄 Advanced analytics
- 🔄 Community features

## 🔒 Security & Compliance

- GDPR compliance with data export/deletion
- PSD2 Strong Customer Authentication
- Escrow payment protection
- Fraud detection algorithms
- Manual moderation panel

## 📊 Success Metrics

### Phase 1 Targets

- 1,000 registered users
- 100 active listings
- 50 completed transactions
- 4.5+ star average rating
- <24 hour support response time

## 🛠️ Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
└── types/              # TypeScript type definitions
```

### Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 📈 Roadmap

See [implementation-plan.md](./implementation-plan.md) for detailed development roadmap and progress tracking.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aigars Grēniņš** - [GitHub](https://github.com/secondturn-games)

---

**Status**: 🟡 In Development (Week 1)  
**Last Updated**: July 15, 2025
