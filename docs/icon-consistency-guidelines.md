# 🎨 Icon Consistency Guidelines

## **Overview**

This document establishes the standard for icon usage across the Second Turn application to ensure visual consistency and professional appearance.

## **Icon System: Lucide React**

### **Primary Icon Library**

- **Use**: `lucide-react` for all UI icons
- **Import**: `import { IconName } from 'lucide-react'`
- **Avoid**: Emojis, other icon libraries, or mixed icon systems

### **Icon Sizing Standards**

```tsx
// Small icons (inline with text)
<IconName className="w-3 h-3" />

// Standard icons (with buttons, form elements)
<IconName className="w-4 h-4" />

// Medium icons (section headers)
<IconName className="w-5 h-5" />

// Large icons (feature highlights)
<IconName className="w-6 h-6" />
```

### **Icon Colors**

```tsx
// Default (gray)
<IconName className="w-4 h-4 text-gray-400" />

// Brand colors
<IconName className="w-4 h-4 text-dark-green" />
<IconName className="w-4 h-4 text-vibrant-orange" />
<IconName className="w-4 h-4 text-warm-yellow" />

// Semantic colors
<IconName className="w-4 h-4 text-green-600" /> // Success
<IconName className="w-4 h-4 text-red-600" />   // Error
<IconName className="w-4 h-4 text-blue-600" />  // Info
```

## **Common Icon Mappings**

### **Navigation & Actions**

- **Home**: `Home`
- **Search**: `Search`
- **Settings**: `Settings`
- **Profile**: `User`
- **Logout**: `LogOut`
- **Back**: `ArrowLeft`
- **Next**: `ArrowRight`
- **Close**: `X`
- **Menu**: `Menu`

### **Content & Media**

- **Game**: `Gamepad2`
- **Image**: `Image`
- **File**: `File`
- **Link**: `ExternalLink`
- **Calendar**: `Calendar`
- **Clock**: `Clock`
- **Location**: `MapPin`

### **Status & Feedback**

- **Success**: `CheckCircle`
- **Error**: `XCircle`
- **Warning**: `AlertTriangle`
- **Info**: `Info`
- **Loading**: `Loader2`
- **Refresh**: `RefreshCw`

### **Tips & Help**

- **Lightbulb**: `Lightbulb` (for tips, suggestions, help)
- **Question**: `HelpCircle`
- **Book**: `BookOpen`

## **Implementation Examples**

### **Button with Icon**

```tsx
<Button className="flex items-center gap-2">
  <Search className="w-4 h-4" />
  Search Games
</Button>
```

### **Inline Icon with Text**

```tsx
<div className="flex items-center gap-2 text-sm text-gray-600">
  <Lightbulb className="w-4 h-4 text-gray-400" />
  <span>Helpful tip text here</span>
</div>
```

### **Icon in Alert**

```tsx
<Alert>
  <CheckCircle className="h-4 w-4 text-green-600" />
  <AlertDescription>Success message here</AlertDescription>
</Alert>
```

## **Migration Checklist**

### **✅ Completed**

- [x] `/join/verify` page - replaced emojis with Lucide icons
- [x] `bgg-search` component - replaced 💡 with `Lightbulb`
- [x] `list-game` page - replaced 💡 and 🎲 with `Lightbulb` and `Gamepad2`
- [x] `messages` page - replaced 💡 with `Lightbulb`
- [x] `how-it-works` page - replaced 🎲 with `Gamepad2`

### **🔍 Areas to Monitor**

- New component development
- Content updates
- User-generated content (if any)

## **Best Practices**

1. **Consistency First**: Always use Lucide icons for UI elements
2. **Semantic Meaning**: Choose icons that clearly represent their function
3. **Accessibility**: Ensure icons have proper `aria-label` when used without text
4. **Performance**: Import only the icons you need
5. **Maintenance**: Update this guide when adding new icon patterns

## **Common Anti-Patterns to Avoid**

❌ **Don't mix icon systems**

```tsx
// Bad - mixing emojis and icons
<div>💡 Tip: <Search className="w-4 h-4" /> Search here</div>

// Good - consistent Lucide icons
<div className="flex items-center gap-2">
  <Lightbulb className="w-4 h-4" />
  <Search className="w-4 h-4" />
  <span>Search here</span>
</div>
```

❌ **Don't use emojis for UI elements**

```tsx
// Bad
<Button>🔍 Search</Button>

// Good
<Button className="flex items-center gap-2">
  <Search className="w-4 h-4" />
  Search
</Button>
```

## **Resources**

- [Lucide Icons](https://lucide.dev/) - Official icon library
- [Icon Search](https://lucide.dev/icons) - Find the right icon
- [Icon Guidelines](https://lucide.dev/guide/packages/lucide-react) - React implementation
