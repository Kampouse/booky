import { useState, useEffect } from 'react';
import { BookEntry } from '@/config';
import { useBookyContract } from '@/lib/bookyContract';
import styles from '@/styles/book-library.module.css';

interface ChapterNotesProps {
  book: BookEntry;
  onClose: () => void;
  onUpdate: () => void;
  demoMode?: boolean;
  demoBooks?: BookEntry[];
  setDemoBooks?: React.Dispatch<React.SetStateAction<BookEntry[]>>;
}

const ChapterNotes: React.FC<ChapterNotesProps> = ({
  book,
  onClose,
  onUpdate,
  demoMode = false,
  demoBooks = [],
  setDemoBooks,
}) => {
  const { addChapterNote, deleteChapterNote } = useBookyContract();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [newNoteChapter, setNewNoteChapter] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (book && book.chapter_notes) {
      setNotes(book.chapter_notes);
    }
  }, [book]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newNoteChapter || !newNoteText) {
      setError('Please provide both chapter number and note text');
      return;
    }

    const chapter = parseInt(newNoteChapter);
    if (isNaN(chapter) || chapter < 1) {
      setError('Please enter a valid chapter number');
      return;
    }

    try {
      setLoading(true);

      if (demoMode && setDemoBooks) {
        // In demo mode, update local state
        const updatedBooks = demoBooks.map((b) =>
          b.isbn === book.isbn
            ? {
                ...b,
                chapter_notes: { ...b.chapter_notes, [chapter]: newNoteText },
              }
            : b,
        );
        setDemoBooks(updatedBooks);
        setNotes((prev) => ({ ...prev, [chapter]: newNoteText }));
      } else {
        // Normal mode: call blockchain
        await addChapterNote(book.isbn, chapter, newNoteText);
        setNotes((prev) => ({ ...prev, [chapter]: newNoteText }));
      }

      setNewNoteChapter('');
      setNewNoteText('');
      onUpdate();
    } catch (err) {
      setError('Failed to add note. Please try again.');
      console.error('Error adding chapter note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (chapter: number) => {
    setError(null);

    try {
      setLoading(true);

      if (demoMode && setDemoBooks) {
        // In demo mode, update local state
        const updatedBooks = demoBooks.map((b) => {
          if (b.isbn === book.isbn) {
            const newNotes = { ...b.chapter_notes };
            delete newNotes[chapter];
            return { ...b, chapter_notes: newNotes };
          }
          return b;
        });
        setDemoBooks(updatedBooks);
        setNotes((prev) => {
          const newNotes = { ...prev };
          delete newNotes[chapter];
          return newNotes;
        });
      } else {
        // Normal mode: call blockchain
        await deleteChapterNote(book.isbn, chapter);
        setNotes((prev) => {
          const newNotes = { ...prev };
          delete newNotes[chapter];
          return newNotes;
        });
      }

      onUpdate();
    } catch (err) {
      setError('Failed to delete note. Please try again.');
      console.error('Error deleting chapter note:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedChapters = Object.keys(notes)
    .map(Number)
    .sort((a, b) => a - b);

  const hasNotes = sortedChapters.length > 0;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Chapter Notes</h2>
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
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

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

          {/* Add New Note Form */}
          <div
            style={{
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #8b7355',
            }}
          >
            <h3
              style={{
                marginBottom: '1rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1a2a3a',
              }}
            >
              Add New Note
            </h3>
            <form onSubmit={handleAddNote} className={styles.newNoteForm}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="chapter" className={styles.formLabel}>
                    Chapter *
                  </label>
                  <input
                    type="number"
                    id="chapter"
                    value={newNoteChapter}
                    onChange={(e) => setNewNoteChapter(e.target.value)}
                    className={styles.formControl}
                    placeholder="1"
                    min="1"
                    disabled={loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="note" className={styles.formLabel}>
                    Note *
                  </label>
                  <textarea
                    id="note"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className={styles.formControlText}
                    placeholder="Write your thoughts, highlights, or observations..."
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button
                  type="submit"
                  className={styles.buttonPrimary}
                  disabled={loading || !newNoteChapter || !newNoteText}
                  style={{ display: 'inline-block' }}
                >
                  {loading ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Notes List */}
          <div>
            <h3
              style={{
                marginBottom: '1rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1a2a3a',
              }}
            >
              {hasNotes
                ? `Your Notes (${sortedChapters.length})`
                : 'No Notes Yet'}
            </h3>

            {hasNotes ? (
              <ul className={styles.chapterNotesList}>
                {sortedChapters.map((chapter) => (
                  <li key={chapter} className={styles.chapterNoteItem}>
                    <div className={styles.chapterNoteHeader}>
                      <span className={styles.chapterNoteChapter}>
                        Chapter {chapter}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(chapter)}
                        className={styles.chapterNoteDelete}
                        disabled={loading}
                        aria-label={`Delete note for chapter ${chapter}`}
                      >
                        Delete
                      </button>
                    </div>
                    <p className={styles.chapterNoteText}>{notes[chapter]}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#1a2a3a',
                  opacity: 0.6,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px dashed #8b7355',
                }}
              >
                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>📚</p>
                <p style={{ fontSize: '0.875rem' }}>
                  You haven't added any notes yet. Start by adding a note above!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={styles.buttonSecondary}
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterNotes;
