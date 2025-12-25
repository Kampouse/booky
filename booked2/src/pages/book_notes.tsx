import { useEffect, useState, useCallback } from 'react';
import { BookEntry } from '@/config';
import { useBookyContract } from '@/lib/bookyContract';
import { useNoteContext } from '@/contexts';
import styles from '@/styles/book-notes.module.css';

interface BookNotesProps {
  book: BookEntry;
  onBack: () => void;
  demoMode?: boolean;
  demoBooks?: BookEntry[];
  setDemoBooks?: React.Dispatch<React.SetStateAction<BookEntry[]>>;
}

const BookNotes: React.FC<BookNotesProps> = ({
  book,
  onBack,
  demoMode = false,
  demoBooks = [],
  setDemoBooks,
}) => {
  const { accountId, addChapterNote } = useBookyContract();
  const { getDraft, setDraft, clearDraft, hasChanges, markAsSaved } =
    useNoteContext();

  const [notes, setNotes] = useState<Record<number, string>>({});
  const [selectedChapter, setSelectedChapter] = useState<number>(
    book.current_chapter,
  );
  const [localNote, setLocalNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  // Auto-dismiss success toast after 3 seconds
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Load notes and check for drafts when chapter or book changes
  useEffect(() => {
    if (book?.chapter_notes) {
      setNotes(book.chapter_notes);

      // Check for existing draft first
      const existingDraft = getDraft(book.isbn, selectedChapter);

      if (existingDraft) {
        setLocalNote(existingDraft.content);
        setIsDraft(true);
        setHasUnsavedChanges(hasChanges(book.isbn, selectedChapter));
      } else {
        const savedNote = book.chapter_notes[selectedChapter] || '';
        setLocalNote(savedNote);
        setIsDraft(false);
        setHasUnsavedChanges(false);
      }
    }
  }, [book, selectedChapter, getDraft, hasChanges]);

  useEffect(() => {
    setSelectedChapter(book.current_chapter);
  }, [book.current_chapter]);

  const calculateProgress = (): number => {
    if (!book.total_chapters || book.total_chapters === 0) return 0;
    const progress = (book.current_chapter / book.total_chapters) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleSave = async () => {
    if (!selectedChapter || localNote === notes[selectedChapter]) return;

    // Check if wallet is connected (only in non-demo mode)
    if (!demoMode && !accountId) {
      setError('Please connect your wallet to save notes to blockchain.');
      return;
    }

    setError(null);
    setSaving(true);
    setSaveStatus('saving');

    try {
      console.log('Saving note to blockchain...', {
        isbn: book.isbn,
        chapter: selectedChapter,
      });
      if (demoMode && setDemoBooks) {
        const updatedBooks = demoBooks.map((b) =>
          b.isbn === book.isbn
            ? {
                ...b,
                chapter_notes: {
                  ...b.chapter_notes,
                  [selectedChapter]: localNote,
                },
              }
            : b,
        );
        setDemoBooks(updatedBooks);
        setNotes((prev) => ({ ...prev, [selectedChapter]: localNote }));

        // Mark as saved in context and clear draft
        markAsSaved(book.isbn, selectedChapter);
        clearDraft(book.isbn, selectedChapter);

        setIsDraft(false);
        setHasUnsavedChanges(false);
      } else {
        const result = await addChapterNote(
          book.isbn,
          selectedChapter,
          localNote,
        );
        console.log('Save successful:', result);
        setNotes((prev) => ({ ...prev, [selectedChapter]: localNote }));
        setSaveStatus('saved');

        // Mark as saved in context and clear draft
        markAsSaved(book.isbn, selectedChapter);
        clearDraft(book.isbn, selectedChapter);

        setIsDraft(false);
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      console.error('Error saving note:', err);
      setSaveStatus('error');

      // Provide more detailed error messages
      if (err?.message) {
        setError(`Failed to save note: ${err.message}`);
      } else if (err?.type === 'AccountNotFound') {
        setError('Account not found. Please make sure you are logged in.');
      } else if (err?.type === 'NotEnoughBalance') {
        setError('Not enough NEAR balance to complete the transaction.');
      } else {
        setError('Failed to save note. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNoteChange = useCallback(
    (value: string) => {
      setLocalNote(value);
      setHasUnsavedChanges(true);
      setIsDraft(true);

      // Auto-save to context after typing stops (debounced)
      setDraft(book.isbn, selectedChapter, value);
    },
    [book.isbn, selectedChapter, setDraft],
  );

  const handleClearDraft = useCallback(() => {
    clearDraft(book.isbn, selectedChapter);
    const savedNote = book.chapter_notes?.[selectedChapter] || '';
    setLocalNote(savedNote);
    setIsDraft(false);
    setHasUnsavedChanges(false);
  }, [book.isbn, book.chapter_notes, selectedChapter, clearDraft]);

  const chaptersWithNotes = Object.keys(notes)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className={styles.notesContainer}>
      <div className={styles.headerSection}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>

        <div className={styles.headerContent}>
          <h1 className={styles.bookTitle}>{book.title}</h1>
          <p className={styles.bookAuthor}>{book.author}</p>

          {book.total_chapters && book.total_chapters > 0 && (
            <div className={styles.progressSection}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <div className={styles.progressLabel}>
                Chapter {book.current_chapter} · {chaptersWithNotes.length}{' '}
                notes
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.editorSection}>
        <div className={styles.editorHeader}>
          <div className={styles.chapterSelector}>
            <button
              onClick={() =>
                setSelectedChapter(Math.max(1, selectedChapter - 1))
              }
              className={styles.navButton}
              disabled={selectedChapter <= 1}
            >
              ←
            </button>

            <select
              value={selectedChapter}
              onChange={(e) => {
                const newChapter = Number(e.target.value);
                setSelectedChapter(newChapter);
              }}
              className={styles.chapterDropdown}
            >
              {Array.from(
                { length: book.total_chapters || 12 },
                (_, i) => i + 1,
              ).map((chapter) => (
                <option key={chapter} value={chapter}>
                  Chapter {chapter}
                  {notes[chapter] && ' · Note'}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setSelectedChapter(
                  Math.min(book.total_chapters || 12, selectedChapter + 1),
                )
              }
              className={styles.navButton}
              disabled={selectedChapter >= (book.total_chapters || 12)}
            >
              →
            </button>
          </div>

          <div className={styles.editorActions}>
            {isDraft && (
              <button
                onClick={handleClearDraft}
                className={styles.clearDraftButton}
                title="Clear draft and revert to saved note"
              >
                Clear Draft
              </button>
            )}

            <button
              onClick={handleSave}
              className={styles.saveButton}
              disabled={saving || (!demoMode && !accountId)}
              title={
                !demoMode && !accountId
                  ? 'Connect your wallet to save'
                  : 'Save to blockchain'
              }
            >
              {saving
                ? 'Saving...'
                : !demoMode && !accountId
                  ? 'Connect Wallet'
                  : 'Save'}
            </button>

            {/* Success Toast */}
            {saveStatus === 'saved' && !saving && (
              <div
                style={{
                  position: 'fixed',
                  bottom: '2rem',
                  right: '2rem',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  borderRadius: '8px',
                  boxShadow:
                    '0 10px 15px -3px rgba(16, 185, 129, 0.2), 0 4px 6px -2px rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  zIndex: 1000,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    fill="currentColor"
                  />
                </svg>
                <span>Note saved to blockchain</span>
                <button
                  onClick={() => setSaveStatus('idle')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    marginLeft: '0.5rem',
                    fontSize: '1.25rem',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Error Toast */}
            {error && (
              <div
                style={{
                  position: 'fixed',
                  bottom: '2rem',
                  right: '2rem',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '8px',
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  zIndex: 1000,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    fill="currentColor"
                  />
                </svg>
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    marginLeft: '0.5rem',
                    fontSize: '1.25rem',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        {isDraft && (
          <div className={styles.draftIndicator}>
            💡 Draft saved locally. Changes are auto-saved.
          </div>
        )}

        <textarea
          value={localNote}
          onChange={(e) => handleNoteChange(e.target.value)}
          className={styles.noteEditor}
          placeholder="Your note for this chapter..."
          disabled={saving}
        />
      </div>
    </div>
  );
};

export default BookNotes;
