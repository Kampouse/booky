import { Link } from 'react-router';
import { BookEntry, ReadingStatus } from '@/config';
import styles from '@/styles/book-library.module.css';

interface BookCardProps {
  book: BookEntry;
  demoMode?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, demoMode = false }) => {
  const getStatusBadgeClass = (status: ReadingStatus): string => {
    switch (status) {
      case 'ToRead':
        return styles.statusBadgeToRead;
      case 'Reading':
        return styles.statusBadgeReading;
      case 'Completed':
        return styles.statusBadgeCompleted;
      case 'OnHold':
        return styles.statusBadgeOnHold;
      case 'Abandoned':
        return styles.statusBadgeAbandoned;
      default:
        return styles.statusBadge;
    }
  };

  const calculateProgress = (): number => {
    if (!book.total_chapters || book.total_chapters === 0) return 0;
    const progress = (book.current_chapter / book.total_chapters) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const progress = calculateProgress();
  const hasNotes = Object.keys(book.chapter_notes || {}).length > 0;

  return (
    <div className={styles.bookCard}>
      {/* Title and Status on same line */}
      <div
        style={{
          marginBottom: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <h3 className={styles.bookCardTitle}>{book.title}</h3>
        <span
          className={`${styles.statusBadge} ${getStatusBadgeClass(book.reading_status)}`}
        >
          {book.reading_status.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      </div>

      {/* Author */}
      <div style={{ marginBottom: '1rem' }}>
        <p className={styles.bookCardAuthor}>{book.author}</p>
      </div>

      {/* Personal Comments Preview - Centered */}
      {book.personal_comments && book.personal_comments.length > 0 && (
        <div
          style={{
            marginTop: '0.75rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'bottom',
            justifyContent: 'bottom',
            minHeight: '0.1rem',
          }}
        ></div>
      )}

      {/* Action Buttons - Always visible */}
      <div className={styles.bookCardActions}>
        <Link
          to={`/note-editor/${book.isbn}/${book.current_chapter || 1}${demoMode ? '?demo=true' : ''}`}
          className={`${styles.bookCardActionButton} ${styles.bookCardActionPrimary}`}
        >
          {hasNotes ? 'Open Book Notes' : 'Start Taking Notes'}
        </Link>
        <Link
          to={`/update-progress/${book.isbn}${demoMode ? '?demo=true' : ''}`}
          className={`${styles.bookCardActionButton} ${styles.bookCardActionSecondary}`}
        >
          Progress
        </Link>
      </div>

      {/* Acquisition Date and ISBN */}
      {book.acquisition_date && (
        <div
          style={{
            paddingTop: '0.75rem',
            borderTop: '1px solid #e9ecef',
            fontSize: '0.75rem',
            color: '#6c757d',
            opacity: 0.8,
            display: 'flex',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <span>
            Added: {new Date(book.acquisition_date).toLocaleDateString()}
          </span>
          <span>ISBN: {book.isbn}</span>
        </div>
      )}
    </div>
  );
};

export default BookCard;
