# Modal Components

This directory contains reusable modal components for the legal document redaction application.

## Components

### BoxDetailsModal

A modal for creating and editing redaction boxes with form validation.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal is closed |
| `onSave` | `(data: BoxDetailsFormData) => void` | Yes | Callback when form is saved |
| `initialData` | `BoxDetailsFormData` | No | Initial form values for edit mode |
| `mode` | `'create' \| 'edit'` | Yes | Determines if creating new or editing existing |

#### BoxDetailsFormData Interface

```typescript
interface BoxDetailsFormData {
  label: string;
  sensitivity: SensitivityLevel; // 'Low' | 'Med' | 'High'
}
```

#### Features

- Label input with character counter (max 80 characters)
- Sensitivity level dropdown (Low/Med/High)
- Form validation (label required, whitespace trimmed)
- ESC key to close
- Click backdrop to close
- Focus trap for accessibility
- Accessible ARIA labels
- Character counter with warning when near limit

#### Usage Example

```tsx
import { BoxDetailsModal } from './components/Modals';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [initialData, setInitialData] = useState<BoxDetailsFormData | undefined>();

  const handleSave = (data: BoxDetailsFormData) => {
    console.log('Saved:', data);
    // Handle the saved data
  };

  return (
    <>
      <button onClick={() => {
        setMode('create');
        setInitialData(undefined);
        setIsOpen(true);
      }}>
        Create Box
      </button>

      <button onClick={() => {
        setMode('edit');
        setInitialData({ label: 'Existing Label', sensitivity: 'High' });
        setIsOpen(true);
      }}>
        Edit Box
      </button>

      <BoxDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        initialData={initialData}
        mode={mode}
      />
    </>
  );
}
```

### ConfirmDialog

A generic confirmation dialog for destructive or important actions.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | - | Controls dialog visibility |
| `onClose` | `() => void` | Yes | - | Callback when dialog is closed |
| `onConfirm` | `() => void` | Yes | - | Callback when confirmed |
| `title` | `string` | Yes | - | Dialog title |
| `message` | `string` | Yes | - | Dialog message/description |
| `confirmText` | `string` | No | `'Confirm'` | Text for confirm button |
| `cancelText` | `string` | No | `'Cancel'` | Text for cancel button |

#### Features

- Warning icon for visual emphasis
- Danger variant confirm button (red)
- ESC key to close
- Click backdrop to close
- Focus trap for accessibility
- Accessible ARIA labels
- Auto-focuses cancel button (safer default)

#### Usage Example

```tsx
import { ConfirmDialog } from './components/Modals';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    console.log('Deleted!');
    // Perform delete operation
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Delete Item
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Redaction Box"
        message="Are you sure you want to delete this redaction box? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
```

## Accessibility Features

Both modals include:

- **Keyboard Navigation**: Full keyboard support including Tab, Shift+Tab, and ESC
- **Focus Trap**: Focus is trapped within the modal while open
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Focus Management**: Auto-focuses appropriate elements on open
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

## Styling

Both components come with their own CSS files that provide:

- Modern, clean design
- Smooth animations (respects reduced motion preferences)
- Responsive layout (mobile-friendly)
- Backdrop blur effect
- Proper z-index layering

### Z-Index Layers

- BoxDetailsModal: `z-index: 1000`
- ConfirmDialog: `z-index: 1001` (appears above BoxDetailsModal if both are open)

## Browser Support

These components work in all modern browsers that support:
- CSS Grid and Flexbox
- ES6+ JavaScript features
- React 18+
- TypeScript 4.5+
