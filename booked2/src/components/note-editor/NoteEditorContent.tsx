import React from 'react';

interface NoteEditorContentProps {
  note: string;
  loading: boolean;
  onChange: (value: string) => void;
}

export const NoteEditorContent: React.FC<NoteEditorContentProps> = ({
  note,
  loading,
  onChange,
}) => {
  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: '400px',
          padding: '2rem',
          backgroundColor: '#3d3a36',
          border: '1px solid rgba(168, 213, 162, 0.15)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'rgba(255, 255, 240, 0.3)',
            fontSize: '0.9rem',
            fontFamily: '"Lora", Georgia, serif',
          }}
        >
          Loading note...
        </span>
      </div>
    );
  }

  return (
    <textarea
      value={note}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        minHeight: '400px',
        padding: '2rem',
        backgroundColor: '#3d3a36',
        border: '1px solid rgba(168, 213, 162, 0.15)',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '1.1rem',
        fontFamily: '"Lora", Georgia, serif',
        lineHeight: '1.8',
        resize: 'none',
        outline: 'none',
        transition: 'all 0.3s ease',
      }}
      placeholder="Start writing your note for this chapter..."
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#a8d5a2';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 213, 162, 0.15)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.15)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
};
