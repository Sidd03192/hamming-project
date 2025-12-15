# UploadPage Component

A fully-featured file upload interface for the legal document redaction application.

## Features

- **File Upload**: Click to upload or drag-and-drop support
- **File Validation**: Validates file type (PNG, JPG, JPEG, PDF) and size (max 10MB)
- **File Preview**: Shows thumbnail preview for images and PDF icon for PDFs
- **File Information**: Displays file name, size, and dimensions (for images)
- **Loading States**: Shows spinner while processing files
- **Error Handling**: Clear error messages for validation failures
- **TypeScript**: Fully typed with proper interfaces
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Responsive Design**: Mobile-friendly layout

## Usage

```tsx
import { AppProvider } from './context/AppProvider';
import UploadPage from './components/UploadPage';

function App() {
  return (
    <AppProvider>
      <UploadPage />
    </AppProvider>
  );
}
```

## Integration Example

To integrate with the full application (with view routing):

```tsx
import { AppProvider } from './context/AppProvider';
import { useAppContext } from './context/AppContext';
import UploadPage from './components/UploadPage';
import EditorPage from './components/EditorPage'; // Your editor component

function AppContent() {
  const { state } = useAppContext();

  return (
    <>
      {state.currentView === 'upload' && <UploadPage />}
      {state.currentView === 'editor' && <EditorPage />}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
```

## Dependencies

- `useFileReader` hook from `src/hooks/useFileReader`
- `fileValidation` utilities from `src/utils/fileValidation`
- `useAppContext` from `src/context/AppContext`
- `Button` component from `src/components/UI`

## Props

The component doesn't accept any props. All state is managed internally and through the AppContext.

## State Management

The component:
1. Validates the selected file
2. Processes it using the `useFileReader` hook
3. On "Continue to Editor" button click:
   - Dispatches `SET_DOCUMENT` action with file data
   - Dispatches `SET_VIEW` action to change to 'editor' view

## Supported File Types

- Images: PNG, JPG, JPEG
- Documents: PDF
- Maximum size: 10MB

## Styling

The component uses `UploadPage.css` with a centered, clean layout featuring:
- Gradient background
- White card container with shadow
- Drag-and-drop visual feedback
- Professional color scheme
- Responsive design for mobile devices
