# Responsive Design Guidelines

## Breakpoint Strategy

This project uses a **1024px breakpoint** (`lg:`) for all responsive design changes.

## Breakpoint Rules

### ✅ **Always Use:**

```css
/* Mobile-first approach */
text-sm lg:text-base        /* 14px → 16px at 1024px */
text-lg lg:text-xl          /* 18px → 20px at 1024px */
p-3 lg:p-4                  /* 12px → 16px at 1024px */
w-5 h-5 lg:w-6 lg:h-6       /* 20px → 24px at 1024px */
max-h-64 lg:max-h-96        /* 256px → 384px at 1024px */
```

### ❌ **Never Use:**

```css
/* Default Tailwind breakpoints */
sm: (640px)   /* Too early */
md: (768px)   /* Too early */
xl: (1280px)  /* Too late */
2xl: (1536px) /* Too late */
```

## Typography Scale

### Text Sizes

| Element    | Mobile           | Desktop (1024px+)  |
| ---------- | ---------------- | ------------------ |
| Body text  | `text-sm` (14px) | `text-base` (16px) |
| Headings   | `text-lg` (18px) | `text-xl` (20px)   |
| Small text | `text-xs` (12px) | `text-sm` (14px)   |

### Spacing Scale

| Element | Mobile        | Desktop (1024px+) |
| ------- | ------------- | ----------------- |
| Padding | `p-3` (12px)  | `p-4` (16px)      |
| Margins | `m-4` (16px)  | `m-6` (24px)      |
| Gaps    | `gap-2` (8px) | `gap-4` (16px)    |

## Component Patterns

### Input Fields

```tsx
<Input
  placeholder="Search for the game you want to list"
  className="text-sm lg:text-base placeholder:text-gray-400"
/>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-lg lg:text-xl">Title</CardTitle>
  </CardHeader>
  <CardContent className="p-3 lg:p-4">
    <p className="text-sm lg:text-base">Content</p>
  </CardContent>
</Card>
```

### Buttons

```tsx
<Button className="text-sm lg:text-base px-3 lg:px-4 py-2 lg:py-3">
  Button Text
</Button>
```

### Icons

```tsx
<Icon className="w-5 h-5 lg:w-6 lg:h-6" />
```

## Implementation Checklist

### For New Components:

- [ ] Use `lg:` breakpoint for all responsive changes
- [ ] Start with mobile styles (no prefix)
- [ ] Add desktop styles with `lg:` prefix
- [ ] Test at exactly 1024px width
- [ ] Verify no changes happen at other breakpoints

### For Existing Components:

- [ ] Replace `sm:` with `lg:` where appropriate
- [ ] Replace `md:` with `lg:` where appropriate
- [ ] Remove `xl:` and `2xl:` breakpoints
- [ ] Ensure consistent text sizing
- [ ] Test responsive behavior

## Testing

### Breakpoint Testing:

1. **Mobile**: < 1024px
2. **Desktop**: ≥ 1024px
3. **Test at exactly 1024px** to ensure smooth transition

### Common Issues to Check:

- Text size changes at wrong breakpoints
- Spacing inconsistencies
- Icon size mismatches
- Layout shifts at unexpected widths

## File Locations

### Key Files to Check:

- `app/list-game/page.tsx` - Main listing form
- `app/games/page.tsx` - Games listing
- `app/game/[id]/page.tsx` - Game details
- `components/` - All reusable components

### Search Commands:

```bash
# Find all responsive classes
grep -r "sm:" app/ components/
grep -r "md:" app/ components/
grep -r "xl:" app/ components/
grep -r "2xl:" app/ components/

# Find correct usage
grep -r "lg:" app/ components/
```

## Enforcement

### Code Review Checklist:

- [ ] All responsive changes use `lg:` breakpoint
- [ ] No `sm:`, `md:`, `xl:`, or `2xl:` classes
- [ ] Consistent text sizing across components
- [ ] Mobile-first approach maintained
- [ ] Tested at 1024px breakpoint

### Linting Rules:

Consider adding ESLint rules to catch incorrect breakpoint usage:

```json
{
  "rules": {
    "no-restricted-classes": [
      "error",
      {
        "patterns": ["sm:", "md:", "xl:", "2xl:"]
      }
    ]
  }
}
```

## Examples

### ✅ Good Examples:

```tsx
// Consistent 1024px breakpoint
<div className="text-sm lg:text-base p-3 lg:p-4">
  <h2 className="text-lg lg:text-xl">Title</h2>
  <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
</div>
```

### ❌ Bad Examples:

```tsx
// Inconsistent breakpoints
<div className="text-sm md:text-base p-3 xl:p-4">
  <h2 className="text-lg sm:text-xl">Title</h2>
  <Icon className="w-5 h-5 2xl:w-6" />
</div>
```

## Maintenance

### Regular Reviews:

- Monthly audit of responsive classes
- Check for new components using wrong breakpoints
- Update this guide as patterns evolve
- Test responsive behavior across all pages

### Tools:

- Browser dev tools for breakpoint testing
- Tailwind CSS IntelliSense for class suggestions
- ESLint for automated checking
