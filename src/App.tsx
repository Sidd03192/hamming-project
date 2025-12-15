import { AppProvider } from './context/AppProvider';
import { EditorPage } from './components/EditorPage';
import './App.css';

function AppContent() {
  return <EditorPage />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
