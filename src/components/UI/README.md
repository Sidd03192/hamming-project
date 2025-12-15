# UI Components

Reusable UI components for the legal document redaction application.

## Components

### Button

A versatile button component with multiple variants.

**Props:**
- `children`: React.ReactNode - Button content
- `onClick`: (event: React.MouseEvent<HTMLButtonElement>) => void - Click handler
- `variant`: 'primary' | 'secondary' | 'danger' - Visual style (default: 'primary')
- `disabled`: boolean - Disabled state (default: false)
- `type`: 'button' | 'submit' | 'reset' - Button type (default: 'button')
- `className`: string - Additional CSS classes

**Example:**
```tsx
import { Button } from './components/UI';

<Button variant="primary" onClick={() => console.log('Clicked')}>
  Submit
</Button>

<Button variant="danger" disabled>
  Delete Document
</Button>
```

### Input

A text input component with label, error handling, and character count.

**Props:**
- `value`: string - Input value
- `onChange`: (event: React.ChangeEvent<HTMLInputElement>) => void - Change handler
- `placeholder`: string - Placeholder text
- `maxLength`: number - Maximum character length (shows counter when set)
- `error`: string - Error message to display
- `label`: string - Input label
- `type`: 'text' | 'email' | 'password' | 'number' - Input type (default: 'text')
- `disabled`: boolean - Disabled state
- `className`: string - Additional CSS classes

**Example:**
```tsx
import { Input } from './components/UI';

const [text, setText] = useState('');
const [error, setError] = useState('');

<Input
  label="Document Name"
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Enter document name"
  maxLength={100}
  error={error}
/>
```

### Select

A dropdown select component with generic type support.

**Props:**
- `value`: T - Selected value
- `onChange`: (value: T) => void - Change handler
- `options`: SelectOption<T>[] - Array of {value, label} objects
- `label`: string - Select label
- `placeholder`: string - Placeholder option text
- `disabled`: boolean - Disabled state
- `className`: string - Additional CSS classes
- `error`: string - Error message to display

**Example:**
```tsx
import { Select, SelectOption } from './components/UI';

const statusOptions: SelectOption<string>[] = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const [status, setStatus] = useState<string>('pending');

<Select
  label="Document Status"
  value={status}
  onChange={setStatus}
  options={statusOptions}
  placeholder="Select status"
/>
```

## Styling

All components come with modern, accessible CSS styling:
- Consistent color scheme
- Hover and focus states
- Disabled states
- Error states with visual feedback
- Smooth transitions
- Accessible focus indicators

## Accessibility

These components follow accessibility best practices:
- Proper ARIA attributes
- Keyboard navigation support
- Focus indicators
- Error announcements
- Semantic HTML
