import type React from 'react';
import { useState } from 'react';

interface NoteEditorActionsProps {
  saving: boolean;
  accountId: string | null;
  note: string;
  hasUnsavedChanges: boolean;
  savedNoteContent?: string;

  onSave: () => void;
  onRestoreSaved: (savedContent: string) => void;
}

export const NoteEditorActions: React.FC<NoteEditorActionsProps> = ({
  saving,
  accountId,
  note,
  hasUnsavedChanges,
  savedNoteContent,
  onSave,
  onRestoreSaved,
}) => {
  const [showSavedModal, setShowSavedModal] = useState(false);

  const handleRestore = () => {
    if (savedNoteContent !== undefined) {
      onRestoreSaved(savedNoteContent);
      setShowSavedModal(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(168, 213, 162, 0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <span
          style={{
            color: 'rgba(255,255, 240, 0.6)',
            fontSize: '0.85rem',
            fontFamily: '"Lora", Georgia, serif',
          }}
        >
          💡 Ctrl/Cmd + S to save
        </span>
        {hasUnsavedChanges && (
          <>
            <span
              style={{
                color: '#e8c860',
                fontSize: '0.85rem',
                fontFamily: '"Lora", Georgia, serif',
              }}
            >
              • Unsaved
            </span>
            {savedNoteContent !== undefined && (
              <button
                type="button"
                onClick={() => setShowSavedModal(true)}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: 'rgba(168, 213, 162, 0.15)',
                  border: '1px solid rgba(168, 213, 162, 0.3)',
                  borderRadius: '6px',
                  color: '#a8d5a2',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Lora", Georgia, serif',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background =
                    'rgba(168, 213, 162, 0.25)';
                  e.currentTarget.style.borderColor =
                    'rgba(168, 213, 162, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background =
                    'rgba(168, 213, 162, 0.15)';
                  e.currentTarget.style.borderColor =
                    'rgba(168, 213, 162, 0.3)';
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background =
                    'rgba(168, 213, 162, 0.25)';
                  e.currentTarget.style.borderColor =
                    'rgba(168, 213, 162, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background =
                    'rgba(168, 213, 162, 0.15)';
                  e.currentTarget.style.borderColor =
                    'rgba(168, 213, 162, 0.3)';
                }}
              >
                View Saved
              </button>
            )}
          </>
        )}
        <span
          style={{
            color: 'rgba(255, 255, 240, 0.6)',
            fontSize: '0.85rem',
            fontFamily: '"Lora", Georgia, serif',
          }}
        >
          📝 {note.length} characters
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <button
          type="button"
          onClick={onSave}
          onFocus={() => {}}
          onBlur={() => {}}
          disabled={saving || !accountId}
          style={
            saving || !accountId
              ? {
                  padding: '0.875rem 2.5rem',
                  background: 'rgba(168, 213, 162, 0.3)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a2a3a',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  transition: 'all 0.3s ease',
                  opacity: 0.5,
                }
              : {
                  padding: '0.875rem 2.5rem',
                  background:
                    'linear-gradient(135deg, #a8d5a2 0%, #88b882 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a2a3a',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: 1,
                }
          }
          title={
            !accountId ? 'Connect your wallet to save' : 'Save to blockchain'
          }
          onMouseOver={(e) => {
            if (!saving && accountId) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(168, 213, 162, 0.3)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {saving ? 'Saving...' : !accountId ? 'Connect Wallet' : 'Save Note'}
        </button>
      </div>

      {/* Saved Content Modal */}
      {showSavedModal && savedNoteContent !== undefined && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setShowSavedModal(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSavedModal(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: '#1a2a3a',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(168, 213, 162, 0.2)',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid rgba(168, 213, 162, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3
                id="modal-title"
                style={{
                  margin: 0,
                  color: '#a8d5a2',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  fontFamily: '"Lora", Georgia, serif',
                }}
              >
                Previously Saved Version
              </h3>
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  transition: 'color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: '1.5rem',
                flex: 1,
                overflow: 'auto',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '1rem',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 240, 0.9)',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  fontFamily: '"Lora", Georgia, serif',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  border: '1px solid rgba(168, 213, 162, 0.1)',
                }}
              >
                {savedNoteContent || 'No saved content'}
              </div>
              {savedNoteContent && (
                <p
                  style={{
                    margin: '1rem 0 0 0',
                    color: 'rgba(255, 255, 240, 0.5)',
                    fontSize: '0.85rem',
                    fontFamily: '"Lora", Georgia, serif',
                  }}
                >
                  📝 {savedNoteContent.length} characters
                </p>
              )}
            </div>

            <div
              style={{
                padding: '1.5rem',
                borderTop: '1px solid rgba(168, 213, 162, 0.1)',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 240, 0.8)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Lora", Georgia, serif',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.2)';
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.2)';
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestore}
                style={{
                  padding: '0.75rem 1.5rem',
                  background:
                    'linear-gradient(135deg, #a8d5a2 0%, #88b882 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a2a3a',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Lora", Georgia, serif',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(168, 213, 162, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(168, 213, 162, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Restore Saved Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
