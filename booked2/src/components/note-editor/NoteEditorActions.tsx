import type React from 'react';

interface NoteEditorActionsProps {
  saving: boolean;
  accountId: string | null;
  note: string;
  demoMode: boolean;
  returnUrl: string;

  onSave: () => void;
}

export const NoteEditorActions: React.FC<NoteEditorActionsProps> = ({
  saving,
  accountId,
  note,
  demoMode,
  returnUrl,
  onSave,
}) => {
  const handleCancel = () => {
    window.location.href = demoMode ? '/book-library?demo=true' : returnUrl;
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
            color: 'rgba(255, 255, 240, 0.6)',
            fontSize: '0.85rem',
            fontFamily: '"Lora", Georgia, serif',
          }}
        >
          💡 Tip: Press Ctrl/Cmd + S to save
        </span>
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
          onClick={handleCancel}
          onFocus={() => {}}
          onBlur={() => {}}
          style={{
            padding: '0.875rem 2rem',
            background: 'transparent',
            border: '2px solid rgba(168, 213, 162, 0.3)',
            borderRadius: '8px',
            color: '#a8d5a2',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: 1,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(168, 213, 162, 0.1)';
            e.currentTarget.style.borderColor = '#a8d5a2';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
          }}
        >
          Cancel
        </button>

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
    </div>
  );
};
