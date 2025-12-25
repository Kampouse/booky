import React from 'react';
import { Link } from 'react-router';

interface NoteEditorHeaderProps {
  demoMode: boolean;
  returnUrl: string;
  accountId: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export const NoteEditorHeader: React.FC<NoteEditorHeaderProps> = ({
  demoMode,
  returnUrl,
  accountId,
  saveStatus,
}) => {
  const returnLink = demoMode ? '/book-library?demo=true' : returnUrl;

  return (
    <div
      style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(168, 213, 162, 0.1)',
        backgroundColor: 'rgba(26, 42, 58, 0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <Link
          to={returnLink}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#a8d5a2',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            fontFamily: '"Lora", Georgia, serif',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#c5e8c0';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#a8d5a2';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          ← Back to Library
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {!accountId && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid #e8c860',
                borderRadius: '6px',
                color: '#e8c860',
                fontSize: '0.875rem',
                fontFamily: '"Lora", Georgia, serif',
              }}
            >
              ⚠️ Wallet not connected
            </div>
          )}

          {saveStatus === 'saving' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '6px',
                color: '#e8c860',
                fontSize: '0.875rem',
                fontFamily: '"Lora", Georgia, serif',
              }}
            >
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
