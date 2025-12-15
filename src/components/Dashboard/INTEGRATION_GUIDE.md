# BoxList Components - Quick Integration Guide

## Step-by-Step Integration

### Step 1: Import the Component

```typescript
import { BoxList } from './components/Dashboard';
// or
import BoxList from './components/Dashboard/BoxList';
```

### Step 2: Prepare State

```typescript
import { useState } from 'react';
import { RedactionBox } from './types';

function YourComponent() {
  const [boxes, setBoxes] = useState<RedactionBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
}
```

### Step 3: Filter Boxes (Optional)

```typescript
// Filter boxes based on search
const filteredBoxes = boxes.filter(box =>
  box.label.toLowerCase().includes(searchFilter.toLowerCase())
);
```

### Step 4: Implement Event Handlers

```typescript
const handleBoxFocus = (boxId: string) => {
  // 1. Set as selected
  setSelectedBoxId(boxId);

  // 2. Find the box
  const box = boxes.find(b => b.id === boxId);
  if (!box) return;

  // 3. Scroll canvas to box location
  // 4. Highlight the box on canvas
  // 5. Optional: Zoom to fit the box
};

const handleBoxEdit = (boxId: string) => {
  // 1. Find the box
  const box = boxes.find(b => b.id === boxId);
  if (!box) return;

  // 2. Open edit modal with box data
  // 3. On modal save, update the box
  setBoxes(boxes.map(b =>
    b.id === boxId ? { ...b, ...updates } : b
  ));
};

const handleBoxDelete = (boxId: string) => {
  // 1. Show confirmation dialog
  const confirmed = window.confirm('Delete this redaction box?');
  if (!confirmed) return;

  // 2. Remove from boxes array
  setBoxes(boxes.filter(b => b.id !== boxId));

  // 3. Clear selection if deleted box was selected
  if (selectedBoxId === boxId) {
    setSelectedBoxId(null);
  }
};
```

### Step 5: Render the Component

```typescript
return (
  <div className="dashboard-layout">
    <div className="box-list-container">
      <BoxList
        boxes={filteredBoxes}
        selectedBoxId={selectedBoxId}
        onBoxFocus={handleBoxFocus}
        onBoxEdit={handleBoxEdit}
        onBoxDelete={handleBoxDelete}
        isFiltered={searchFilter.length > 0}
      />
    </div>
  </div>
);
```

## Complete Example

```typescript
import React, { useState } from 'react';
import { BoxList } from './components/Dashboard';
import { RedactionBox } from './types';

function DocumentEditor() {
  const [boxes, setBoxes] = useState<RedactionBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Filter boxes based on search
  const filteredBoxes = boxes.filter(box =>
    box.label.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Focus handler: highlight and scroll to box
  const handleBoxFocus = (boxId: string) => {
    setSelectedBoxId(boxId);
    const box = boxes.find(b => b.id === boxId);
    if (box) {
      // Scroll canvas to box
      scrollCanvasToBox(box);
      // Highlight box on canvas
      highlightBoxOnCanvas(boxId);
    }
  };

  // Edit handler: open modal with box data
  const handleBoxEdit = (boxId: string) => {
    const box = boxes.find(b => b.id === boxId);
    if (box) {
      openEditModal(box);
    }
  };

  // Delete handler: remove box after confirmation
  const handleBoxDelete = (boxId: string) => {
    if (window.confirm('Delete this redaction box?')) {
      setBoxes(boxes.filter(b => b.id !== boxId));
      if (selectedBoxId === boxId) {
        setSelectedBoxId(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Document Canvas */}
      <div style={{ flex: 1 }}>
        {/* Your canvas component */}
      </div>

      {/* Box List Sidebar */}
      <div style={{ width: '400px', height: '100vh' }}>
        <BoxList
          boxes={filteredBoxes}
          selectedBoxId={selectedBoxId}
          onBoxFocus={handleBoxFocus}
          onBoxEdit={handleBoxEdit}
          onBoxDelete={handleBoxDelete}
          isFiltered={searchFilter.length > 0}
        />
      </div>
    </div>
  );
}

export default DocumentEditor;
```

## Integration with Context/Redux

### Using Context

```typescript
import { useAppContext } from './context/AppContext';

function DocumentEditor() {
  const { state, dispatch } = useAppContext();

  const handleBoxFocus = (boxId: string) => {
    dispatch({ type: 'SELECT_BOX', payload: boxId });
  };

  const handleBoxEdit = (boxId: string) => {
    // Open modal or navigate to edit view
  };

  const handleBoxDelete = (boxId: string) => {
    if (window.confirm('Delete this redaction box?')) {
      dispatch({ type: 'DELETE_BOX', payload: boxId });
    }
  };

  return (
    <BoxList
      boxes={state.boxes}
      selectedBoxId={state.selectedBoxId}
      onBoxFocus={handleBoxFocus}
      onBoxEdit={handleBoxEdit}
      onBoxDelete={handleBoxDelete}
    />
  );
}
```

### With Redux

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { selectBox, deleteBox } from './store/boxesSlice';

function DocumentEditor() {
  const dispatch = useDispatch();
  const boxes = useSelector(state => state.boxes.items);
  const selectedBoxId = useSelector(state => state.boxes.selectedId);

  const handleBoxFocus = (boxId: string) => {
    dispatch(selectBox(boxId));
  };

  const handleBoxDelete = (boxId: string) => {
    if (window.confirm('Delete this redaction box?')) {
      dispatch(deleteBox(boxId));
    }
  };

  return (
    <BoxList
      boxes={boxes}
      selectedBoxId={selectedBoxId}
      onBoxFocus={handleBoxFocus}
      onBoxEdit={openEditModal}
      onBoxDelete={handleBoxDelete}
    />
  );
}
```

## Styling Integration

### Container Sizing

```css
/* Sidebar layout */
.box-list-container {
  width: 400px;
  height: 100vh;
  overflow: hidden;
}

/* Or responsive */
.box-list-container {
  width: 100%;
  max-width: 500px;
  height: 100%;
  min-height: 400px;
}
```

### Custom Styling

```css
/* Override specific styles if needed */
.box-list {
  border-radius: 0; /* Remove rounded corners */
}

.box-list-item {
  margin-bottom: 0.75rem; /* Adjust spacing */
}
```

## Common Integration Patterns

### Pattern 1: Two-Panel Layout (Canvas + List)

```typescript
<div style={{ display: 'flex', height: '100vh' }}>
  <div style={{ flex: 1 }}>
    <Canvas />
  </div>
  <div style={{ width: '400px' }}>
    <BoxList {...props} />
  </div>
</div>
```

### Pattern 2: Three-Panel Layout (Toolbar + Canvas + List)

```typescript
<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
  <Toolbar />
  <div style={{ display: 'flex', flex: 1 }}>
    <Canvas />
    <BoxList {...props} />
  </div>
</div>
```

### Pattern 3: Collapsible Sidebar

```typescript
const [isOpen, setIsOpen] = useState(true);

<div style={{ width: isOpen ? '400px' : '0', transition: 'width 0.3s' }}>
  {isOpen && <BoxList {...props} />}
</div>
```

## Testing Integration

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import BoxList from './BoxList';

test('calls onBoxFocus when Focus button is clicked', () => {
  const handleFocus = jest.fn();
  const boxes = [mockBox];

  render(
    <BoxList
      boxes={boxes}
      selectedBoxId={null}
      onBoxFocus={handleFocus}
      onBoxEdit={() => {}}
      onBoxDelete={() => {}}
    />
  );

  fireEvent.click(screen.getByText('Focus'));
  expect(handleFocus).toHaveBeenCalledWith(mockBox.id);
});
```

## Troubleshooting

### Issue: Boxes not showing
**Solution:** Check that boxes array is not empty and contains valid RedactionBox objects

### Issue: Selected state not working
**Solution:** Ensure selectedBoxId matches box.id exactly (string comparison)

### Issue: Scroll not working
**Solution:** Make sure parent container has fixed height

### Issue: Buttons not responding
**Solution:** Check that event handlers are properly passed and not undefined

### Issue: Styling conflicts
**Solution:** Check CSS specificity and import order of stylesheets

## Next Steps

1. Integrate with your canvas component
2. Connect to your state management
3. Implement modal for editing
4. Add search/filter functionality
5. Test on different screen sizes
6. Add keyboard shortcuts
7. Implement accessibility features
8. Add unit tests

For more details, see:
- `BoxList.README.md` - Full API documentation
- `BoxList.example.tsx` - Working examples
- `COMPONENT_STRUCTURE.md` - Visual structure guide
