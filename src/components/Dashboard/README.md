# Dashboard Components

This directory contains the Dashboard components for the legal document redaction web application.

## Components

### Controls

A control panel component that provides UI mode toggling, data import/export, and reset functionality.

**Props:**
- `uiMode`: `'default' | 'findNearest'` - Current UI mode
- `onModeChange`: `(mode: 'default' | 'findNearest') => void` - Callback when mode changes
- `onExport`: `() => void` - Callback to export data as JSON
- `onImport`: `(data: string) => void` - Callback to import JSON data
- `onReset`: `() => void` - Callback to reset all data

**Features:**
- Toggle button for "Find Nearest" mode with visual indicator
- Export button to download data as JSON
- Import button with hidden file input for JSON uploads
- Reset button with confirmation dialog
- Responsive layout
- Fully typed with TypeScript

**Example:**
```tsx
import { Controls } from './components/Dashboard';

function App() {
  const [mode, setMode] = useState<'default' | 'findNearest'>('default');

  const handleExport = () => {
    const data = JSON.stringify(myData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      // Process imported data
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

  const handleReset = () => {
    // Reset application state
  };

  return (
    <Controls
      uiMode={mode}
      onModeChange={setMode}
      onExport={handleExport}
      onImport={handleImport}
      onReset={handleReset}
    />
  );
}
```

### SearchBar

A filter input component with debounced search functionality.

**Props:**
- `value`: `string` - Current search value
- `onChange`: `(value: string) => void` - Callback when search value changes (debounced)

**Features:**
- Search icon for visual clarity
- Debounced input (300ms delay) to prevent excessive updates
- Clear button that appears when text is entered
- Visual feedback while searching
- Accessible with proper ARIA labels
- Responsive design
- Fully typed with TypeScript

**Example:**
```tsx
import { SearchBar } from './components/Dashboard';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // This will be called after 300ms of no typing
    // Use this to filter your data
  };

  return (
    <SearchBar
      value={searchQuery}
      onChange={handleSearchChange}
    />
  );
}
```

## Usage

Import both components:

```tsx
import { Controls, SearchBar } from './components/Dashboard';
// or
import Controls from './components/Dashboard/Controls';
import SearchBar from './components/Dashboard/SearchBar';
```

## Styling

Both components include their own CSS files:
- `Controls.css` - Styling for the control panel
- `SearchBar.css` - Styling for the search bar

The components use the existing UI components (`Button` and `Input`) from `src/components/UI` for consistency.

## TypeScript

All components are fully typed with TypeScript interfaces:
- `ControlsProps` - Props interface for Controls component
- `SearchBarProps` - Props interface for SearchBar component

## Accessibility

Both components follow accessibility best practices:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader support
- Semantic HTML
