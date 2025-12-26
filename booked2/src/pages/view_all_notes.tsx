import { useParams, useNavigate } from 'react-router';
import { useBook, useAllChapterNotes } from '@/lib/useBookyQuery';
import styles from '@/styles/view-all-notes.module.css';

const ViewAllNotes: React.FC = () => {
  const { isbn } = useParams<{ isbn: string }>();
  const navigate = useNavigate();

  const {
    data: book,
    isLoading: bookLoading,
    error: bookError,
  } = useBook(isbn || '');

  const {
    data: notes,
    isLoading: notesLoading,
    error: notesError,
  } = useAllChapterNotes(isbn || '');
  const notesData = notes || {};

  if (!isbn) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.errorText}>No ISBN provided</p>
        <button
          onClick={() => navigate('/book-library')}
          type="button"
          className={styles.minimalButton}
        >
          ← Library
        </button>
      </div>
    );
  }

  if (bookLoading || notesLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (bookError || notesError || !book) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.errorText}>
          {bookError ? 'Failed to load book' : 'Failed to load notes'}
        </p>
        <button
          onClick={() => navigate('/book-library')}
          type="button"
          className={styles.minimalButton}
        >
          ← Library
        </button>
      </div>
    );
  }

  const sortedChapters = Object.keys(notesData)
    .map(Number)
    .sort((a, b) => a - b);
  const hasNotes = sortedChapters.length > 0;

  const calculateProgress = (): number => {
    if (!book.total_chapters || book.total_chapters === 0) return 0;
    const progress = (book.current_chapter / book.total_chapters) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleEditNote = (chapter: number) => {
    navigate(`/note-editor/${isbn}/${chapter}`);
  };

  return (
    <div className={styles.container}>
      {/* Minimal Header */}
      <header className={styles.header}>
        <button
          onClick={() => navigate(-1)}
          type="button"
          className={styles.backButton}
          aria-label="Go back"
        >
          ←
        </button>

        <div className={styles.headerContent}>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>{book.author}</p>

          {book.total_chapters && book.total_chapters > 0 && (
            <div className={styles.progressWrapper}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {sortedChapters.length}{' '}
                {sortedChapters.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Notes List */}
      <main className={styles.mainContent}>
        {hasNotes ? (
          <div className={styles.notesList}>
            {sortedChapters.map((chapter) => (
              <article key={chapter} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <span className={styles.chapterLabel}>Chapter {chapter}</span>
                  <button
                    onClick={() => handleEditNote(chapter)}
                    type="button"
                    className={styles.editButton}
                    aria-label={`Edit note for chapter ${chapter}`}
                  >
                    Edit
                  </button>
                </div>
                <div className={styles.noteBody}>
                  {/* eslint-disable react/no-array-index-key */}
                  {notesData[chapter]
                    ?.split('\n')
                    .filter((line) => line.trim())
                    .map((line, i) => {
                      const lineKey = line.slice(0, 100);
                      return (
                        <p
                          key={`${chapter}-${i}-${lineKey}`}
                          className={styles.noteLine}
                        >
                          {line}
                        </p>
                      );
                    })}
                  {/* eslint-enable react/no-array-index-key */}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✍️</span>
            <h3 className={styles.emptyTitle}>No notes yet</h3>
            <p className={styles.emptyDescription}>
              Start capturing your thoughts as you read
            </p>
            <button
              onClick={() => handleEditNote(book.current_chapter || 1)}
              type="button"
              className={styles.primaryButton}
            >
              Add First Note
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button for existing notes */}
      {hasNotes && (
        <button
          onClick={() => handleEditNote(book.current_chapter || 1)}
          type="button"
          className={styles.fab}
          aria-label="Add note for current chapter"
        >
          +
        </button>
      )}
    </div>
  );
};

export default ViewAllNotes;
