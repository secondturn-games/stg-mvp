# Component Documentation

## Overview

This document describes all UI components used in the Second Turn Games marketplace application.

## Component Structure

### Layout Components

#### `src/components/layout/`

- **Header**: Main navigation header with user menu
- **Footer**: Site footer with links and information
- **Navigation**: Main navigation component

### Authentication Components

#### `src/components/auth/`

- **SignInButton**: Clerk sign-in button
- **UserButton**: User profile button with dropdown
- **ProtectedRoute**: Route protection wrapper

### Marketplace Components

#### `src/components/marketplace/`

- **MarketplaceWithSearch**: Main marketplace page with search and filters
- **MarketplaceListings**: Grid/list view of listings
- **MarketplaceFilters**: Search and filter controls
- **ListingCard**: Individual listing display card
- **AuctionCard**: Individual auction display card

### Listing Components

#### `src/components/listings/`

- **ListingForm**: Form for creating/editing listings
- **ListingDetail**: Detailed view of a single listing
- **ImageUpload**: Image upload component with preview
- **DeleteButton**: Delete confirmation modal
- **MyListings**: User's listings management page

### Auction Components

#### `src/components/auctions/`

- **AuctionDetail**: Detailed auction view with bidding
- **AuctionForm**: Form for creating auctions
- **BidForm**: Form for placing bids
- **AuctionTimer**: Countdown timer for auction end

### Profile Components

#### `src/components/profile/`

- **ProfileStats**: User statistics display
- **ProfileActions**: Profile action buttons
- **ProfileForm**: Profile editing form

### UI Components

#### `src/components/ui/`

- **LoadingSpinner**: Loading indicator
- **EmptyState**: Empty state display
- **OptimizedImage**: Optimized image component
- **Toast**: Toast notification component
- **ToastProvider**: Toast context provider
- **SkipToContent**: Accessibility skip link

## Component Usage Examples

### ListingForm

```tsx
import ListingForm from '@/components/listings/ListingForm'

// Create mode
<ListingForm mode="create" />

// Edit mode
<ListingForm mode="edit" initialValues={listingData} />
```

### DeleteButton

```tsx
import DeleteButton from '@/components/listings/DeleteButton';

<DeleteButton itemId='listing-id' itemType='listing' itemName='Game Title' />;
```

### MarketplaceWithSearch

```tsx
import MarketplaceWithSearch from '@/components/marketplace/MarketplaceWithSearch';

<MarketplaceWithSearch listings={listings} auctions={auctions} />;
```

### AuctionDetail

```tsx
import AuctionDetail from '@/components/auctions/AuctionDetail';

<AuctionDetail auction={auctionData} />;
```

## Component Props

### ListingForm Props

```tsx
interface ListingFormProps {
  mode?: 'create' | 'edit';
  initialValues?: Partial<ListingFormData>;
}
```

### DeleteButton Props

```tsx
interface DeleteButtonProps {
  itemId: string;
  itemType: 'listing' | 'auction';
  itemName: string;
}
```

### MarketplaceWithSearch Props

```tsx
interface MarketplaceWithSearchProps {
  listings: Listing[];
  auctions: Auction[];
}
```

## Styling

All components use Tailwind CSS for styling with consistent design tokens:

### Colors

- Primary: `blue-600`
- Success: `green-600`
- Warning: `yellow-600`
- Error: `red-600`
- Neutral: `gray-600`

### Spacing

- Container: `max-w-6xl`
- Section: `space-y-6`
- Card: `p-6`

### Typography

- Headings: `text-2xl font-bold`
- Body: `text-gray-600`
- Links: `text-blue-600 hover:text-blue-800`

## Accessibility

All components follow accessibility best practices:

- **ARIA labels**: Proper labeling for screen readers
- **Keyboard navigation**: Full keyboard support
- **Focus management**: Proper focus handling
- **Color contrast**: WCAG AA compliant
- **Skip links**: Accessibility skip navigation

## Performance

Components are optimized for performance:

- **Lazy loading**: Images and non-critical components
- **Memoization**: React.memo for expensive components
- **Code splitting**: Dynamic imports for large components
- **Image optimization**: Next.js Image component usage

## Error Handling

Components include comprehensive error handling:

- **Form validation**: Client and server-side validation
- **Error boundaries**: React error boundaries
- **Loading states**: Proper loading indicators
- **Error messages**: User-friendly error messages

## Testing

Components should be tested for:

- **Unit tests**: Individual component functionality
- **Integration tests**: Component interactions
- **Accessibility tests**: Screen reader compatibility
- **Visual tests**: UI consistency

## Best Practices

### Component Design

- Single responsibility principle
- Props interface definition
- Default prop values
- Proper TypeScript typing

### Performance

- Avoid unnecessary re-renders
- Use React.memo appropriately
- Optimize bundle size
- Implement proper loading states

### Accessibility

- Semantic HTML structure
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader compatibility

### Styling

- Consistent design system
- Responsive design
- Mobile-first approach
- Dark mode support (future)

## Future Enhancements

### Planned Components

- **RatingSystem**: User rating and review system
- **ChatComponent**: Real-time messaging
- **NotificationCenter**: User notifications
- **AdvancedFilters**: Enhanced search filters
- **MapComponent**: Location-based features

### Component Library

- **Storybook**: Component documentation
- **Design System**: Consistent design tokens
- **Icon Library**: Custom icon set
- **Animation Library**: Micro-interactions
