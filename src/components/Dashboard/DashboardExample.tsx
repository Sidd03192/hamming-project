import React, { useState } from 'react';
import { Controls, SearchBar } from './index';

/**
 * Example component demonstrating the usage of Dashboard components
 * This is a reference implementation showing how to integrate
 * Controls and SearchBar components in a real application.
 */
const DashboardExample: React.FC = () => {
  // State for UI mode
  const [uiMode, setUiMode] = useState<'default' | 'findNearest'>('default');

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // State for application data (example)
  const [appData, setAppData] = useState<any>({
    documents: [],
    redactions: [],
    settings: {},
  });

  /**
   * Handle export functionality
   * Downloads application data as JSON file
   */
  const handleExport = () => {
    try {
      const jsonString = JSON.stringify(appData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `redaction-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      console.log('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  /**
   * Handle import functionality
   * Parses and validates imported JSON data
   */
  const handleImport = (jsonString: string) => {
    try {
      const importedData = JSON.parse(jsonString);

      // Validate the imported data structure
      if (typeof importedData !== 'object' || importedData === null) {
        throw new Error('Invalid data format');
      }

      // You can add more specific validation here
      if (!importedData.documents && !importedData.redactions) {
        throw new Error('Missing required data fields');
      }

      setAppData(importedData);
      console.log('Data imported successfully:', importedData);
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert(
        error instanceof Error
          ? `Failed to import data: ${error.message}`
          : 'Failed to import data. Please ensure the file contains valid JSON.'
      );
    }
  };

  /**
   * Handle reset functionality
   * Clears all application data
   */
  const handleReset = () => {
    setAppData({
      documents: [],
      redactions: [],
      settings: {},
    });
    setSearchQuery('');
    setUiMode('default');
    console.log('Application data reset');
  };

  /**
   * Handle UI mode change
   */
  const handleModeChange = (mode: 'default' | 'findNearest') => {
    setUiMode(mode);
    console.log('UI mode changed to:', mode);

    // You can add additional logic here based on the mode
    // For example, enabling/disabling certain features
  };

  /**
   * Handle search query change
   * This is called after the debounce delay (300ms)
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);

    // Implement your search/filter logic here
    // For example:
    // - Filter documents by query
    // - Filter redactions by query
    // - Update displayed results
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Example</h1>

      {/* Controls Component */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Controls</h2>
        <Controls
          uiMode={uiMode}
          onModeChange={handleModeChange}
          onExport={handleExport}
          onImport={handleImport}
          onReset={handleReset}
        />
      </div>

      {/* SearchBar Component */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Search</h2>
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
      </div>

      {/* Display current state */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Current State</h2>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <p><strong>UI Mode:</strong> {uiMode}</p>
          <p><strong>Search Query:</strong> {searchQuery || '(empty)'}</p>
          <p><strong>Documents:</strong> {appData.documents?.length || 0}</p>
          <p><strong>Redactions:</strong> {appData.redactions?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardExample;
