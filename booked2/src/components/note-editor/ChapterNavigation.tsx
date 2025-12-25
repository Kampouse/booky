import React from 'react';
import { Link, useNavigate } from 'react-router';
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
  const navigate = useNavigate();
  const totalChapters = book?.total_chapters || 12;
  const demoSuffix = demoMode ? '?demo=true' : '';

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

      <select
        value={chapterNumber}
        onChange={(e) => {
          const newChapter = Number(e.target.value);
          navigate(`/note-editor/${isbn}/${newChapter}${demoSuffix}`);
        }}
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
        {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
          <option key={ch} value={ch}>
            Chapter {ch}
            {chaptersWithNotes.includes(ch) && ' · Note'}
          </option>
        ))}
      </select>

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
