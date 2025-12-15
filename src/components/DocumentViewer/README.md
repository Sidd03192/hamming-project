# DocumentViewer Components

This directory contains the document viewer components for the legal document redaction application.

## Components

### DocumentViewer

The main container component that manages document display based on file type.

**Features:**
- Integrates with app context to access document state
- Conditionally renders ImageViewer for images or a placeholder for PDFs
- Centers documents within the container
- Preserves aspect ratio automatically
- Handles document dimension changes
- Provides callback for parent components to receive dimension updates

**Usage:**
```tsx
import { DocumentViewer } from './components/DocumentViewer';

function App() {
  const handleDimensionsChange = (width: number, height: number) => {
    console.log('Document dimensions:', width, height);
  };

  return (
    <DocumentViewer onDimensionsChange={handleDimensionsChange} />
  );
}
```

**Props:**
- `onDimensionsChange?: (width: number, height: number) => void` - Optional callback when document dimensions are loaded

### ImageViewer

Renders image documents with proper aspect ratio preservation.

**Features:**
- Renders images using `object-fit: contain` for aspect ratio preservation
- Tracks actual rendered dimensions using refs
- Loading state with spinner animation
- Error handling with user-friendly messages
- Callbacks for dimension updates
- Smooth loading transitions

**Usage:**
```tsx
import { ImageViewer } from './components/DocumentViewer';

function MyComponent() {
  const handleDimensionsLoaded = (width: number, height: number) => {
    console.log('Image loaded:', width, height);
  };

  return (
    <ImageViewer
      fileUrl="https://example.com/image.jpg"
      onDimensionsLoaded={handleDimensionsLoaded}
    />
  );
}
```

**Props:**
- `fileUrl: string` - URL of the image to display (required)
- `onDimensionsLoaded: (width: number, height: number) => void` - Callback when image loads with natural dimensions (required)

## Styling

Both components include their own CSS files:
- `ImageViewer.css` - Image-specific styling with loading/error states
- `DocumentViewer.css` - Container layout and PDF placeholder styling

## States

### Loading States
- ImageViewer shows a spinner while the image is loading
- Smooth opacity transition when image appears

### Error States
- User-friendly error messages in yellow warning boxes
- Graceful degradation if image fails to load

### Placeholder States
- "No document loaded" message when no file is available
- Professional PDF placeholder with icon and messaging

## Integration with App Context

The DocumentViewer component automatically integrates with the app's context:
- Reads `document.fileUrl`, `document.fileType` from state
- Updates `document.dimensions` when dimensions are loaded
- Resets dimensions when document changes

## Future Enhancements

- PDF viewer integration (using pdfjs-dist)
- Zoom controls
- Pan/scroll functionality
- Multi-page PDF support
- Document rotation
