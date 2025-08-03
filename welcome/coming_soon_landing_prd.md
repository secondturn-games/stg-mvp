# Product Requirements Document (PRD)

## Project: Second Turn – Coming Soon Landing Page

---

### ✅ Overview

A mobile-first landing page to announce the upcoming launch of Second Turn – a marketplace for used board games in the Baltics. It should reflect the brand style, collect email signups for notifications, and comply with EU data regulations.

---

## 🎯 Goals

- Create hype around the upcoming launch
- Collect user email addresses (newsletter/notification signup)
- Maintain brand consistency
- Ensure GDPR compliance

---

## 📱 Target Platform

- Mobile-first responsive web app
- Hosted on [Vercel](https://vercel.com/) under `https://secondturn.games`

---

## 📐 Design Requirements

### Brand Alignment

- Use brand colors from style guide:
  - Light Beige `#E6EAD7` (background)
  - Vibrant Orange `#D95323` (CTA buttons)
  - Warm Yellow `#F2C94C` (accent/highlights)
  - Dark Green `#29432B` (headings/text)
- Fonts: Geist (primary), Adumu (title/logo only)
- Logo: Full logo for header, icon logo for favicon
- UI: TailwindCSS + `shadcn/ui`
- Spacing: Generous padding (p-4+)
- Border radius: `rounded-2xl`
- CTA button styles:
  - Primary: Filled orange
  - Disabled: Beige with grey text

### Content Sections

1. **Header**

   - Logo (top center or left)
   - Meta tags and favicon

2. **Hero Section**

   - Headline: “Second Turn is almost ready to roll!”
   - Subheadline: “A community marketplace for used board games in the Baltics is coming soon.”
   - Email signup input + CTA: “Be the first to know!”
   - Success/Failure feedback (toast or inline message)

3. **Extra Section (Optional)**

   - Tagline: “Give your games a second life.”
   - Teaser Image: Illustration or real-life photo of people playing board games

4. **Footer**

   - Socials (if available)
   - Contact email
   - Legal links (Privacy Policy, Cookie Policy, Terms)

5. **Animation (Optional)**

   - Page fade-in using `framer-motion`
   - Input form slide/fade on mount

---

## 🔐 Email Capture

### Option A: Supabase (Preferred)

**Table Schema:**

```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Client:** Use Supabase client SDK to submit emails securely.

- Validate email on client before submission
- Handle duplicate emails
- Display confirmation message

### Option B: External Provider (Fallback)

- Use Mailchimp, ConvertKit, or Beehiiv
- Embed GDPR-compliant form snippet
- Export data later to Supabase if needed

---

## 📄 Legal Requirements

### Required Documents (EU Compliant):

1. **Privacy Policy** – Details data handling, email storage, Supabase use
2. **Cookie Policy** – Outline use of any tracking scripts or cookies (even if none yet)
3. **Terms of Service** – Generic version to define site use until full launch

### Action Items for Legal

- Add legal document links in footer
- Provide routes (e.g., `/privacy`, `/cookies`, `/terms`)
- Can be static markdown or integrated via CMS later

Let me know if you'd like drafts of these policies for use with the landing page.

---

## ✨ Stretch Goals

- Add countdown or launch estimate
- "Refer a friend" viral loop or sharing buttons
- Support for multiple languages (Latvian/Estonian/Lithuanian)

---

## ✅ Deliverables

- Responsive Next.js landing page with TailwindCSS
- Supabase integration for email signup
- Static legal documents in `/pages` or Markdown
- Mobile-first performance tested on Lighthouse
- Deployed to `https://secondturn.games`

---

Let me know when you're ready to implement and I can generate the full code scaffold.

