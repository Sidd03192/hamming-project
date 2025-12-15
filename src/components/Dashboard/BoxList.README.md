# BoxList Components

Professional React components for displaying and managing redaction boxes in a legal document redaction web application.

## Components

### BoxList

The main container component that displays a list of redaction boxes with scrolling and empty states.

**Props:**
- `boxes: RedactionBox[]` - Array of redaction boxes to display
- `selectedBoxId: string | null` - ID of the currently selected box
- `onBoxFocus: (boxId: string) => void` - Callback when focus button is clicked
- `onBoxEdit: (boxId: string) => void` - Callback when edit button is clicked
- `onBoxDelete: (boxId: string) => void` - Callback when delete button is clicked
- `isFiltered?: boolean` - Optional flag to show filtered empty state

**Features:**
- Scrollable list with custom styled scrollbar
- Two empty states:
  - "No redaction boxes yet" - when no boxes exist
  - "No boxes match your search" - when filtered list is empty
- Shows count of boxes in header
- Fully responsive design
- Dark mode support

### BoxListItem

Individual redaction box display component with card-like styling.

**Props:**
- `box: RedactionBox` - The redaction box to display
- `isSelected: boolean` - Whether this box is currently selected
- `onFocus: (boxId: string) => void` - Callback when focus button is clicked
- `onEdit: (boxId: string) => void` - Callback when edit button is clicked
- `onDelete: (boxId: string) => void` - Callback when delete button is clicked

**Features:**
- Displays box label with sensitivity badge
- Shows geometry information (position and size as percentages)
- Three action buttons: Focus (with eye icon), Edit, Delete
- Highlight effect when selected
- Hover states with smooth transitions
- Sensitivity color coding:
  - **Low** - Green background (#d1fae5)
  - **Med** - Yellow background (#fef3c7)
  - **High** - Red background (#fee2e2)

## Usage

```tsx
import { BoxList } from './components/Dashboard';
import { RedactionBox } from './types';

function MyComponent() {
  const [boxes, setBoxes] = useState<RedactionBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const handleFocus = (boxId: string) => {
    setSelectedBoxId(boxId);
    // Scroll to and highlight the box on canvas
  };

  const handleEdit = (boxId: string) => {
    // Open modal to edit box details
  };

  const handleDelete = (boxId: string) => {
    // Show confirmation and delete the box
    setBoxes(boxes.filter(b => b.id !== boxId));
  };

  return (
    <div style={{ height: '600px', width: '400px' }}>
      <BoxList
        boxes={boxes}
        selectedBoxId={selectedBoxId}
        onBoxFocus={handleFocus}
        onBoxEdit={handleEdit}
        onBoxDelete={handleDelete}
      />
    </div>
  );
}
```

## Styling

Both components include their own CSS files with:
- Card-like design with borders and shadows
- Smooth transitions and hover effects
- Color-coded sensitivity badges
- Responsive breakpoints for mobile devices
- Dark mode support
- Print styles
- Accessibility features (reduced motion support)

## TypeScript

All components are fully typed with exported interfaces:
- `BoxListProps`
- `BoxListItemProps`

## Dependencies

- React
- Button component from `src/components/UI`
- RedactionBox type from `src/types`

## File Structure

```
src/components/Dashboard/
├── BoxList.tsx            # Main list container
├── BoxList.css            # List styles
├── BoxListItem.tsx        # Individual box item
├── BoxListItem.css        # Item styles
├── BoxList.example.tsx    # Usage examples
├── BoxList.README.md      # This file
└── index.ts              # Exports
```
