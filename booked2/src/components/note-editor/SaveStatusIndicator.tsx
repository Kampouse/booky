import type React from 'react';

interface SaveStatusIndicatorProps {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  error: string | null;
  onCloseError: () => void;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  saveStatus,
  error,
  onCloseError,
}) => {
  if (saveStatus === 'idle' || (!error && saveStatus !== 'error')) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        backgroundColor: saveStatus === 'error' ? '#ef4444' : '#10b981',
        color: '#ffffff',
        borderRadius: '8px',
        boxShadow:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        zIndex: 1000,
      }}
    >
      {saveStatus === 'error' ? (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby="error-icon-title"
          >
            <title id="error-icon-title">Error</title>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              fill="currentColor"
            />
          </svg>
          <span>{error || 'Failed to save note'}</span>
          <button
            type="button"
            onClick={onCloseError}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '0.25rem',
              marginLeft: '0.5rem',
              fontSize: '1.25rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </>
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby="success-icon-title"
          >
            <title id="success-icon-title">Success</title>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              fill="currentColor"
            />
          </svg>
          <span>Saved successfully!</span>
        </>
      )}
    </div>
  );
};
