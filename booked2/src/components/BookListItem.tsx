import type { BookEntry } from '@/utils/types';

interface BookListItemProps {
  book: BookEntry;
  onClick: () => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  book,
  onClick,
}) => {
  const chaptersReadCount = Array.isArray(book.chapters_read)
    ? book.chapters_read.length
    : 0;

  const notesCount =
    book.chapter_notes && typeof book.chapter_notes === 'object'
      ? Object.keys(book.chapter_notes).length
      : 0;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyPress}
      style={{
        padding: '0.75rem',
        background: 'rgba(26, 42, 58, 0.03)',
        borderRadius: '6px',
        borderLeft: '3px solid #a8d5a2',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left',
        border: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(26, 42, 58, 0.08)';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(26, 42, 58, 0.03)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div
        style={{
          fontWeight: 600,
          color: '#1a2a3a',
          marginBottom: '0.25rem',
        }}
      >
        {book.title}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: '#4a3728',
          opacity: 0.7,
        }}
      >
        {book.author}
      </div>
      {chaptersReadCount > 0 && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#722f37',
            fontWeight: 500,
          }}
        >
          📖 {chaptersReadCount} chapter{chaptersReadCount !== 1 ? 's' : ''}{' '}
          read
        </div>
      )}
      {notesCount > 0 && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#722f37',
            fontWeight: 500,
          }}
        >
          ✍️ {notesCount} note{notesCount !== 1 ? 's' : ''}
        </div>
      )}
    </button>
  );
};
