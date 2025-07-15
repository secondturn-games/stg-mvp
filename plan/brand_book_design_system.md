# 📘 Brand Book & Design System

## 🎨 Color Palette

### ✅ Brand Colors

| Name        | HEX       | RGB           | Use Case                         |
| ----------- | --------- | ------------- | -------------------------------- |
| Ivory Mist  | `#E6EAD7` | 230, 234, 215 | Light backgrounds, surfaces      |
| Sun Ember   | `#D95323` | 217, 83, 35   | Primary CTA, highlights          |
| Golden Beam | `#F2C94C` | 242, 201, 76  | Secondary CTA, tags              |
| Forest Deep | `#29432B` | 41, 67, 43    | Base text, header, dark surfaces |

### 🌗 Theme Support

| Theme Mode | Background | Primary Text | Secondary Text | Accent    | CTA / Alerts |
| ---------- | ---------- | ------------ | -------------- | --------- | ------------ |
| Light      | `#E6EAD7`  | `#29432B`    | `#29432B99`    | `#F2C94C` | `#D95323`    |
| Dark       | `#29432B`  | `#E6EAD7`    | `#E6EAD799`    | `#F2C94C` | `#D95323`    |

---

## 🖋 Typography

| Role           | Font       | Style    | Example Use                    |
| -------------- | ---------- | -------- | ------------------------------ |
| Headings       | Geist Bold | 24–32px  | Section headers, modals        |
| Body Text      | Geist      | 14–16px  | Paragraphs, form labels        |
| Small Labels   | Geist Mono | 12–13px  | Metadata, tags                 |
| Logo (Display) | Adumu      | Stylized | Brand name, home screen banner |

---

## 📱 Layout & Spacing

### Mobile-First Grid

| Device  | Max Width  | Columns | Gutter | Padding |
| ------- | ---------- | ------- | ------ | ------- |
| Mobile  | 375–768px  | 4       | 16px   | 16px    |
| Tablet  | 768–1024px | 6       | 20px   | 24px    |
| Desktop | 1024px+    | 12      | 24px   | 32px    |

### Spacing Tokens

| Token | Value | Use Case             |
| ----- | ----- | -------------------- |
| `xs`  | 4px   | Icon spacing         |
| `sm`  | 8px   | Between text + input |
| `md`  | 16px  | Card padding         |
| `lg`  | 24px  | Section spacing      |
| `xl`  | 32px  | Modal / Header gaps  |

---

## 🔘 Component Styles

### Buttons

| Type      | Bg Color    | Text Color | Border Radius | Example Use             |
| --------- | ----------- | ---------- | ------------- | ----------------------- |
| Primary   | `#D95323`   | `#E6EAD7`  | 12–16px       | Main actions (Buy/Sell) |
| Secondary | `#F2C94C`   | `#29432B`  | 12px          | Sub-actions (Edit, etc) |
| Ghost     | transparent | `#29432B`  | 12px          | Cancel, Back            |

### Cards

- **Background:** Light – `#FFFFFF` or `#E6EAD7`; Dark – `#29432B`
- **Shadow:** subtle 2–4px blur in light mode, none or 1px border in dark mode
- **Radius:** 16px

---

## 🧱 Iconography

- Use consistent **line-based icons** from Lucide or Feather
- Icon size: 24px standard
- Color follows theme text:
  - Light mode: `#29432B`
  - Dark mode: `#E6EAD7`

---

## 🪧 Logo Usage

- **Minimum padding:** 1.5× logo height on all sides
- **Color Usage:**
  - Light background → use `#29432B` or full color logo
  - Dark background → use `#E6EAD7` or white logo version

---

## 🧑‍🎨 UI Token Reference (CSS Custom Properties)

```css
:root {
  --color-bg-light: #e6ead7;
  --color-bg-dark: #29432b;
  --color-text-primary-light: #29432b;
  --color-text-primary-dark: #e6ead7;
  --color-accent: #f2c94c;
  --color-cta: #d95323;
  --radius-base: 16px;
  --font-primary: "Geist", sans-serif;
  --font-display: "Adumu", display;
}
```
