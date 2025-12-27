import styles from '@/styles/book-library.module.css';
import type { BookEntry } from '@/utils/types';

interface ViewBookNotesProps {
  accountId: string;
  book: BookEntry;
  onClose: () => void;
}

export const ViewBookNotes: React.FC<ViewBookNotesProps> = ({
  accountId,
  book,
  onClose,
}) => {
  const notes = book.chapter_notes || {};
  const notesData: Record<number, string> =
    typeof notes === 'string' ? {} : notes;

  const sortedChapters = Object.keys(notesData)
    .map(Number)
    .sort((a, b) => a - b);
  const hasNotes = sortedChapters.length > 0;

  const calculateProgress = () => {
    if (!book.total_chapters || book.total_chapters === 0) return 0;
    return (book.chapters_read.length / book.total_chapters!) * 100;
  };

  const progress = calculateProgress();

  return (
    <div className={styles.dialogContent}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Book Notes</h2>
        <button
          type="button"
          className={styles.modalCloseButton}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className={styles.modalBody}>
        <div
          style={{
            maxWidth: '600px',
            flex: 1,
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        >
          {/* Book Info */}
          <div
            style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.25rem',
              color: '#1a2a3a',
              opacity: 0.9,
            }}
          >
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1a2a3a',
              }}
            >
              {book.title}
            </h3>
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: '1rem',
                color: '#4a3728',
                opacity: 0.8,
              }}
            >
              by {book.author}
            </p>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#722f37',
              }}
            >
              Owner: {accountId}
            </p>
          </div>

          {/* Reading Progress */}
          {book.total_chapters && book.total_chapters! > 0 && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(168, 213, 162, 0.1)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(168, 213, 162, 0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background:
                      'linear-gradient(90deg, #a8d5a2 0%, #7da87b 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                  color: '#1a2a3a',
                }}
              >
                <span>
                  {book.chapters_read.length} of {book.total_chapters!} chapters
                  read
                </span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {hasNotes ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                  background:
                    'linear-gradient(135deg, rgba(168, 213, 162, 0.15) 0%, rgba(125, 168, 123, 0.15) 100%)',
                  color: '#1a2a3a',
                }}
              >
                📝 {sortedChapters.length} Chapter
                {sortedChapters.length !== 1 ? 'Notes' : 'Note'}
              </div>

              <div
                style={{
                  margin: '0 0 2rem 0',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#4a3728',
                }}
              >
                {sortedChapters.map((chapter) => (
                  <div
                    key={chapter}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      padding: '1rem',
                      background: 'rgba(26, 42, 58, 0.03)',
                      borderRadius: '8px',
                      borderLeft: '4px solid #a8d5a2',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1a2a3a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Chapter {chapter}
                    </div>
                    <div
                      style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#4a3728',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {notesData[chapter]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                margin: '0 0 2rem 0',
                lineHeight: '1.6',
                padding: '1rem',
                textAlign: 'center',
                background: 'rgba(74, 55, 40, 0.05)',
                borderRadius: '8px',
                color: '#4a3728',
                opacity: 0.7,
                fontSize: '1rem',
                marginBottom: '1rem',
                fontStyle: 'italic',
              }}
            >
              No notes have been added yet for this book.
            </div>
          )}

          {/* Book Metadata */}
          <div
            style={{
              marginTop: '1rem',
              margin: '2rem 0 0 0',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#4a3728',
            }}
          >
            <div
              style={{
                margin: '0.5rem 0',
                padding: '0.75rem',
                background: 'rgba(26, 42, 58, 0.03)',
                borderRadius: '6px',
                fontSize: '1rem',
                lineHeight: '1.5',
                color: '#1a2a3a',
                fontStyle: 'italic',
              }}
            >
              "{book.personal_comments || 'No personal comments'}"
            </div>
            <div
              style={{
                margin: '1rem 0',
                padding: '0.75rem',
                background: 'rgba(168, 213, 162, 0.1)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                color: '#4a3728',
                fontStyle: 'italic',
              }}
            >
              Condition: {book.condition} • ISBN: {book.isbn}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
