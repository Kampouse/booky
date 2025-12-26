import { useState, useEffect, useRef } from 'react';
import { BookEntry, ProgressUpdate, ReadingStatus } from '@/config';
import { useBookyContract } from '@/lib/bookyContract';
import styles from '@/styles/book-library.module.css';

interface UpdateProgressProps {
  book: BookEntry;
  onClose: () => void;
  onUpdate: () => void;
  demoMode?: boolean;
  demoBooks?: BookEntry[];
  setDemoBooks?: React.Dispatch<React.SetStateAction<BookEntry[]>>;
}

const UpdateProgress: React.FC<UpdateProgressProps> = ({
  book,
  onClose,
  onUpdate,
  demoMode = false,
  demoBooks = [],
  setDemoBooks,
}) => {
  const { updateReadingProgress, markCompleted } = useBookyContract();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show modal on mount
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, []);

  // Handle close when user clicks backdrop or presses ESC
  const handleClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const [progressData, setProgressData] = useState<ProgressUpdate>({
    current_chapter: book.current_chapter,
    chapters_completed: book.chapters_read || [],
    last_read_position: book.last_read_position || '0',
    last_read_date: book.last_read_date || new Date().toISOString(),
    reading_status: book.reading_status,
  });

  const [newCompletedChapter, setNewCompletedChapter] = useState<string>('');

  useEffect(() => {
    setProgressData({
      current_chapter: book.current_chapter,
      chapters_completed: book.chapters_read || [],
      last_read_position: book.last_read_position || '0',
      last_read_date: book.last_read_date || new Date().toISOString(),
      reading_status: book.reading_status,
    });
  }, [book]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProgressData((prev) => ({
      ...prev,
      [name]:
        name === 'current_chapter'
          ? value
            ? Number(value)
            : null
          : name === 'last_read_date'
            ? value
            : value,
    }));
  };

  const handleAddCompletedChapter = () => {
    const chapter = parseInt(newCompletedChapter);
    if (isNaN(chapter) || chapter < 1) {
      setError('Please enter a valid chapter number');
      return;
    }

    if (progressData.chapters_completed.includes(chapter)) {
      setError('Chapter already marked as completed');
      return;
    }

    setProgressData((prev) => ({
      ...prev,
      chapters_completed: [...prev.chapters_completed, chapter].sort(
        (a, b) => a - b,
      ),
    }));
    setNewCompletedChapter('');
    setError(null);
  };

  const handleRemoveCompletedChapter = (chapter: number) => {
    setProgressData((prev) => ({
      ...prev,
      chapters_completed: prev.chapters_completed.filter((c) => c !== chapter),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (demoMode && setDemoBooks) {
        // In demo mode, update local state
        const updatedBooks = demoBooks.map((b) => {
          if (b.isbn === book.isbn) {
            const updatedBook: BookEntry = {
              ...b,
              current_chapter: progressData.current_chapter ?? 0,
              chapters_read: progressData.chapters_completed,
              last_read_position: progressData.last_read_position ?? '0',
              last_read_date:
                progressData.last_read_date ?? new Date().toISOString(),
              reading_status: (progressData.reading_status ??
                b.reading_status) as ReadingStatus,
            };
            return updatedBook;
          }
          return b;
        });
        setDemoBooks(updatedBooks);
      } else {
        // Normal mode: call blockchain
        await updateReadingProgress(book.isbn, progressData);
      }
      onUpdate();
      onClose();
    } catch (err) {
      setError('Failed to update progress. Please try again.');
      console.error('Error updating reading progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    setError(null);

    try {
      setLoading(true);

      if (demoMode && setDemoBooks) {
        // In demo mode, update local state
        const updatedBooks = demoBooks.map((b) => {
          if (b.isbn === book.isbn) {
            const updatedBook: BookEntry = {
              ...b,
              last_read_date: new Date().toISOString(),
              reading_status: 'Completed' as ReadingStatus,
            };
            return updatedBook;
          }
          return b;
        });
        setDemoBooks(updatedBooks);
      } else {
        // Normal mode: call blockchain
        await markCompleted(book.isbn);
      }
      onUpdate();
      onClose();
    } catch (err) {
      setError('Failed to mark as completed. Please try again.');
      console.error('Error marking book as completed:', err);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = book.total_chapters
    ? Math.min(
        ((progressData.current_chapter ?? 0) / book.total_chapters) * 100,
        100,
      )
    : 0;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="update-progress-title"
    >
      <div className={styles.dialogContent}>
        <div className={styles.modalHeader}>
          <div>
            <h2 id="update-progress-title" className={styles.modalTitle}>
              Update Reading Progress
            </h2>
            <p
              style={{
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: '#1a2a3a',
                opacity: 0.7,
              }}
            >
              {book.title} by {book.author}
            </p>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: '16px',
                  backgroundColor: 'rgba(229, 62, 62, 0.1)',
                  border: '1px solid #722f37',
                  borderRadius: '8px',
                  color: '#1a2a3a',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Progress Overview */}
            {book.total_chapters && book.total_chapters > 0 && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                }}
              >
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBarWrapper}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className={styles.progressBarText}>
                  <span className={styles.progressBarLabel}>Current:</span>
                  <span>
                    <strong>{progressData.current_chapter ?? 0}</strong> /{' '}
                    {book.total_chapters} chapters
                  </span>
                  <span className={styles.progressBarPercentage}>
                    ({progressPercentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Current Chapter */}
            <div className={styles.formGroup}>
              <label htmlFor="current_chapter" className={styles.formLabel}>
                Current Chapter
              </label>
              <input
                type="number"
                id="current_chapter"
                name="current_chapter"
                value={progressData.current_chapter || ''}
                onChange={handleInputChange}
                className={styles.formControl}
                placeholder="Current chapter number"
                min="0"
                max={book.total_chapters || undefined}
                disabled={loading}
              />
            </div>

            {/* Reading Status */}
            <div className={styles.formGroup}>
              <label htmlFor="reading_status" className={styles.formLabel}>
                Reading Status
              </label>
              <select
                id="reading_status"
                name="reading_status"
                value={progressData.reading_status ?? 'ToRead'}
                onChange={handleInputChange}
                className={styles.formControl}
                disabled={loading}
              >
                <option value="ToRead">To Read</option>
                <option value="Reading">Reading</option>
                <option value="OnHold">On Hold</option>
                <option value="Abandoned">Abandoned</option>
              </select>
            </div>

            {/* Chapters Completed */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Chapters Completed ({progressData.chapters_completed.length})
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <input
                  type="number"
                  value={newCompletedChapter}
                  onChange={(e) => setNewCompletedChapter(e.target.value)}
                  className={styles.formControl}
                  placeholder="Chapter number"
                  min="1"
                  max={book.total_chapters || undefined}
                  disabled={loading}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddCompletedChapter}
                  className={styles.buttonSecondary}
                  disabled={loading || !newCompletedChapter}
                >
                  Add
                </button>
              </div>

              {progressData.chapters_completed.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                  }}
                >
                  {progressData.chapters_completed.map((chapter) => (
                    <span
                      key={chapter}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#a8d5a2',
                        color: '#2c2c2c',
                        borderRadius: '16px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Chapter {chapter}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompletedChapter(chapter)}
                        style={{
                          marginLeft: '0.5rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          color: '#2c2c2c',
                          padding: '0',
                          lineHeight: 1,
                        }}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Last Read Position */}
            <div className={styles.formGroup}>
              <label htmlFor="last_read_position" className={styles.formLabel}>
                Last Read Position
              </label>
              <input
                type="text"
                id="last_read_position"
                name="last_read_position"
                value={progressData.last_read_position || ''}
                onChange={handleInputChange}
                className={styles.formControl}
                placeholder="e.g., Page 123, Chapter 5 paragraph 3"
                disabled={loading}
              />
            </div>

            {/* Last Read Date */}
            <div className={styles.formGroup}>
              <label htmlFor="last_read_date" className={styles.formLabel}>
                Last Read Date
              </label>
              <input
                type="datetime-local"
                id="last_read_date"
                name="last_read_date"
                value={
                  progressData.last_read_date
                    ? progressData.last_read_date.slice(0, 16)
                    : ''
                }
                onChange={handleInputChange}
                className={styles.formControl}
                disabled={loading}
              />
            </div>

            {/* Mark Completed Quick Action */}
            {progressData.reading_status !== 'Completed' && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(114, 47, 55, 0.1)',
                  border: '1px solid #722f37',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#1a2a3a',
                  }}
                >
                  Finished reading this book?
                </p>
                <button
                  type="button"
                  onClick={handleMarkCompleted}
                  className={styles.buttonPrimary}
                  disabled={loading}
                  style={{
                    background:
                      'linear-gradient(135deg, #722f37 0%, #5a252c 100%)',
                    border: 'none',
                  }}
                >
                  {loading ? 'Marking...' : 'Mark as Completed'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.buttonSecondary}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default UpdateProgress;
