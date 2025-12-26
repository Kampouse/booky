import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { BookEntry } from '@/config';

interface ChapterNavigationProps {
  isbn: string;
  book: BookEntry | null;
  chapterNumber: number;
  demoMode: boolean;
  chaptersWithNotes: number[];
}

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  isbn,
  book,
  chapterNumber,
  demoMode,
  chaptersWithNotes,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalChapters = book?.total_chapters || 12;
  const demoSuffix = demoMode ? '?demo=true' : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: '2px solid rgba(168, 213, 162, 0.3)',
    borderRadius: '8px',
    color: disabled ? 'rgba(168, 213, 162, 0.3)' : '#a8d5a2',
    fontSize: '0.95rem',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
  });

  const handleMouseOver = (
    e: React.MouseEvent<HTMLAnchorElement>,
    disabled: boolean,
  ) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = 'rgba(168, 213, 162, 0.1)';
      e.currentTarget.style.borderColor = '#a8d5a2';
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <Link
        to={
          chapterNumber > 1
            ? `/note-editor/${isbn}/${chapterNumber - 1}${demoSuffix}`
            : '#'
        }
        style={linkStyle(chapterNumber <= 1)}
        onMouseOver={(e) => handleMouseOver(e, chapterNumber <= 1)}
        onMouseOut={handleMouseOut}
      >
        ← Prev
      </Link>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '0.75rem 2rem',
            background: 'rgba(255, 255, 240, 0.05)',
            border: '2px solid rgba(168, 213, 162, 0.2)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: '"Lora", Georgia, serif',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#a8d5a2';
            e.currentTarget.style.boxShadow =
              '0 0 0 3px rgba(168, 213, 162, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.2)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Chapter {chapterNumber}
          <span style={{ fontSize: '0.75rem' }}>{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '0.5rem',
              backgroundColor: 'rgba(45, 74, 62, 0.98)',
              border: '2px solid rgba(168, 213, 162, 0.3)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              minWidth: '200px',
            }}
          >
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map(
              (ch) => (
                <Link
                  key={ch}
                  to={`/note-editor/${isbn}/${ch}${demoSuffix}`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.75rem 1.5rem',
                    color: ch === chapterNumber ? '#a8d5a2' : '#ffffff',
                    textDecoration: 'none',
                    fontFamily: '"Lora", Georgia, serif',
                    fontSize: '0.9rem',
                    fontWeight: ch === chapterNumber ? '600' : '400',
                    transition: 'background 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'rgba(168, 213, 162, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Chapter {ch}
                  {chaptersWithNotes.includes(ch) && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        opacity: 0.8,
                      }}
                    >
                      · Note
                    </span>
                  )}
                </Link>
              ),
            )}
          </div>
        )}
      </div>

      <Link
        to={
          chapterNumber < totalChapters
            ? `/note-editor/${isbn}/${chapterNumber + 1}${demoSuffix}`
            : '#'
        }
        style={linkStyle(chapterNumber >= totalChapters)}
        onMouseOver={(e) => handleMouseOver(e, chapterNumber >= totalChapters)}
        onMouseOut={handleMouseOut}
      >
        Next →
      </Link>
    </div>
  );
};
