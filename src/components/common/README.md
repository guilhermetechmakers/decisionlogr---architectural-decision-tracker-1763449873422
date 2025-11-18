# Common UI State Components

This directory contains reusable components for handling loading, success, and empty states throughout the DecisionLogr application. All components follow the design system with proper accessibility, animations, and styling.

## Components

### Loading Components

#### `LoadingSpinner`
A simple spinner component with multiple sizes and variants.

```tsx
import { LoadingSpinner } from "@/components/common";

<LoadingSpinner size="md" variant="primary" label="Loading data..." />
```

**Props:**
- `size?: "sm" | "md" | "lg" | "xl"` - Size of the spinner
- `variant?: "default" | "primary" | "muted"` - Color variant
- `label?: string` - Accessible label for screen readers
- `className?: string` - Custom classes

#### `LoadingOverlay`
Full-page or container overlay with spinner and optional message.

```tsx
import { LoadingOverlay } from "@/components/common";

<LoadingOverlay 
  message="Loading decisions..." 
  withBackdrop 
  fullPage={false}
/>
```

**Props:**
- `message?: string` - Message to display below spinner
- `withBackdrop?: boolean` - Show semi-transparent backdrop
- `spinnerSize?: "sm" | "md" | "lg" | "xl"` - Size of spinner
- `fullPage?: boolean` - Use fixed positioning for full page
- `className?: string` - Custom classes

#### `LoadingPage`
Full-page loading state for route transitions.

```tsx
import { LoadingPage } from "@/components/common";

<LoadingPage message="Loading dashboard..." />
```

**Props:**
- `message?: string` - Loading message
- `spinnerSize?: "sm" | "md" | "lg" | "xl"` - Size of spinner
- `className?: string` - Custom classes

### Skeleton Components

#### `SkeletonCard`
Skeleton loader for card content.

```tsx
import { SkeletonCard } from "@/components/common";

<SkeletonCard showHeader lines={3} showFooter />
```

**Props:**
- `showHeader?: boolean` - Show header skeleton
- `lines?: number` - Number of content lines
- `showFooter?: boolean` - Show footer skeleton
- `className?: string` - Custom classes
- `style?: CSSProperties` - Custom styles

#### `SkeletonList`
Skeleton loader for list items.

```tsx
import { SkeletonList } from "@/components/common";

<SkeletonList count={5} showAvatar showSubtitle />
```

**Props:**
- `count?: number` - Number of items
- `showAvatar?: boolean` - Show avatar skeleton
- `showSubtitle?: boolean` - Show subtitle line
- `className?: string` - Custom classes

#### `SkeletonTable`
Skeleton loader for table content.

```tsx
import { SkeletonTable } from "@/components/common";

<SkeletonTable rows={10} columns={4} showHeader />
```

**Props:**
- `rows?: number` - Number of rows
- `columns?: number` - Number of columns
- `showHeader?: boolean` - Show header row
- `className?: string` - Custom classes

#### `SkeletonGrid`
Skeleton loader for card grids.

```tsx
import { SkeletonGrid } from "@/components/common";

<SkeletonGrid 
  count={6} 
  columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
  showHeader
  lines={3}
/>
```

**Props:**
- `count?: number` - Number of cards
- `columns?: string` - Tailwind grid classes
- `showHeader?: boolean` - Show header in cards
- `lines?: number` - Content lines per card
- `className?: string` - Custom classes

### Empty State Component

#### `EmptyState`
Helpful empty state with illustrations and CTAs.

```tsx
import { EmptyState } from "@/components/common";

<EmptyState
  variant="no-items"
  title="No decisions yet"
  description="Create your first decision to get started with DecisionLogr."
  action={{
    label: "Create Decision",
    onClick: () => navigate("/decisions/new"),
  }}
  secondaryAction={{
    label: "Import Template",
    onClick: () => handleImport(),
  }}
/>
```

**Props:**
- `variant?: "default" | "no-results" | "no-items" | "error" | "search" | "folder"` - Predefined icon variant
- `icon?: ReactNode` - Custom icon
- `title: string` - Title text
- `description?: string` - Description text
- `action?: { label: string; onClick: () => void; icon?: ReactNode }` - Primary action
- `secondaryAction?: { label: string; onClick: () => void; icon?: ReactNode }` - Secondary action
- `illustration?: ReactNode` - Custom illustration/image
- `className?: string` - Custom classes

## Toast Utilities

The toast utilities provide consistent success, error, and info notifications using Sonner.

```tsx
import { 
  showSuccessToast, 
  showErrorToast, 
  showInfoToast,
  showLoadingToast,
  showPromiseToast 
} from "@/lib/toast";

// Success toast
showSuccessToast("Decision created successfully!", {
  description: "Your decision has been saved.",
});

// Error toast
showErrorToast("Failed to save decision", {
  description: "Please try again.",
});

// Info toast
showInfoToast("New feature available", {
  description: "Check out our latest updates.",
});

// Loading toast
const toastId = showLoadingToast("Saving...");
// Later: dismissToast(toastId);

// Promise toast (auto-updates from loading to success/error)
showPromiseToast(
  saveDecision(data),
  {
    loading: "Saving decision...",
    success: "Decision saved!",
    error: (err) => `Failed: ${err.message}`,
  }
);
```

## Usage Examples

### Loading State in a Component

```tsx
import { useQuery } from "@tanstack/react-query";
import { LoadingOverlay, SkeletonGrid } from "@/components/common";

function DecisionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["decisions"],
    queryFn: fetchDecisions,
  });

  if (isLoading) {
    return <SkeletonGrid count={6} />;
  }

  // ... render decisions
}
```

### Empty State with Action

```tsx
import { EmptyState } from "@/components/common";

function EmptyDecisions() {
  return (
    <EmptyState
      variant="no-items"
      title="No decisions found"
      description="Get started by creating your first architectural decision."
      action={{
        label: "Create Decision",
        onClick: () => navigate("/decisions/new"),
      }}
    />
  );
}
```

### Success Toast After Action

```tsx
import { showSuccessToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";

function CreateDecisionForm() {
  const mutation = useMutation({
    mutationFn: createDecision,
    onSuccess: () => {
      showSuccessToast("Decision created!", {
        description: "Your decision has been saved successfully.",
      });
    },
  });

  // ... form implementation
}
```

## Design System Compliance

All components follow the DecisionLogr design system:

- **Colors**: Use CSS custom properties from the design system
- **Typography**: Inter font with proper weights and sizes
- **Spacing**: Consistent spacing scale (4px, 8px, 16px, 24px, 32px)
- **Animations**: Fade-in animations with stagger delays
- **Accessibility**: Proper ARIA labels, roles, and screen reader support
- **Responsive**: Mobile-first approach with responsive breakpoints

## Accessibility

All components include:

- Proper `role` attributes
- `aria-label` and `aria-live` for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance (WCAG AA)
