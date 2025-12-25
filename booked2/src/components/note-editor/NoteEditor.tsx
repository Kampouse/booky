import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useBook, useAddChapterNote } from '@/lib/useBookyQuery';
import { useNoteContext } from '@/contexts';
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import { NoteEditorHeader } from './NoteEditorHeader';
import { NoteEditorContent } from './NoteEditorContent';
import { NoteEditorActions } from './NoteEditorActions';
import { SaveStatusIndicator } from './SaveStatusIndicator';

export interface NoteEditorProps {
  isbn: string;
  chapter: string;
  demoMode?: boolean;
  returnUrl?: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  isbn,
  chapter,
  demoMode = false,
  returnUrl = '/book-library',
}) => {
  const navigate = useNavigate();

  // React Query hooks with automatic caching
  const {
    data: book,
    isLoading: queryLoading,
    error: queryError,
    refetch: refetchBook,
  } = useBook(isbn);

  const addChapterNoteMutation = useAddChapterNote();

  // Wallet selector for account info
  const { signedAccountId } = useWalletSelector();

  // Note context for draft management
  const { getDraft, setDraft, clearDraft, hasChanges, markAsSaved } =
    useNoteContext();

  // Local state
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-dismiss success toast after 3 seconds
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chapterNumber = parseInt(chapter || '1');

  // Initialize note when book data loads or chapter changes
  useEffect(() => {
    if (!book) return;

    // Load actual note from book (blockchain) first
    const savedNote = book?.chapter_notes?.[chapterNumber] || '';
    console.log('[NoteEditor] Book data loaded:', {
      isbn,
      chapterNumber,
      savedNoteFromBlockchain: savedNote,
      savedNoteLength: savedNote?.length,
      allChapterNotes: book.chapter_notes,
      totalNotesInBook: Object.keys(book.chapter_notes || {}).length,
    });

    // Check if there are unsaved changes (user has modified draft)
    const hasUnsaved = hasChanges(isbn, chapterNumber);
    const existingDraft = getDraft(isbn, chapterNumber);
    console.log('[NoteEditor] Checking drafts:', {
      hasUnsavedChanges: hasUnsaved,
      hasExistingDraft: !!existingDraft,
      draftContent: existingDraft?.content,
      draftLength: existingDraft?.content?.length,
      willLoadFrom: hasUnsaved && existingDraft ? 'draft' : 'blockchain',
    });

    if (hasUnsaved && existingDraft) {
      // User has unsaved changes in draft, load that instead
      console.log(
        '[NoteEditor] Loading note from DRAFT:',
        existingDraft.content,
      );
      setNote(existingDraft.content);
      setSaveStatus('saved'); // Already auto-saved to draft
      setHasUnsavedChanges(true);
    } else {
      // No unsaved changes, load from blockchain
      console.log('[NoteEditor] Loading note from BLOCKCHAIN:', savedNote);
      setNote(savedNote);
      setHasUnsavedChanges(false);
      if (savedNote) {
        setSaveStatus('saved');
      }
    }
  }, [book, isbn, chapterNumber, getDraft, hasChanges]);

  // Handle note changes with auto-save using context
  const handleNoteChange = useCallback(
    (value: string) => {
      setNote(value);
      setHasUnsavedChanges(true);

      // Clear previous timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save to draft
      autoSaveTimeoutRef.current = setTimeout(() => {
        setDraft(isbn, chapterNumber, value);
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
      }, 1000); // Auto-save draft after 1 second of inactivity
    },
    [isbn, chapterNumber, setDraft],
  );

  // Save to blockchain using mutation
  const handleSave = useCallback(async () => {
    if (!book) return;

    // Check if wallet is connected
    if (!signedAccountId) {
      setError('Please connect your wallet to save notes to blockchain.');
      setSaveStatus('error');
      return;
    }

    setError(null);
    setSaving(true);
    setSaveStatus('saving');

    try {
      console.log('[NoteEditor] Saving to blockchain...', {
        isbn: book.isbn,
        chapter: chapterNumber,
        noteLength: note.length,
        notePreview: note.substring(0, 50) + (note.length > 50 ? '...' : ''),
      });

      await addChapterNoteMutation.mutateAsync({
        isbn: book.isbn,
        chapter: chapterNumber,
        note,
      });

      console.log('[NoteEditor] Blockchain save successful!');

      // Refetch book data to get updated notes from blockchain
      console.log('[NoteEditor] Refetching book data to get updated notes...');
      await refetchBook();
      console.log('[NoteEditor] Book refetch completed');

      setSaveStatus('saved');
      setHasUnsavedChanges(false);

      // Mark as saved in context
      markAsSaved(isbn, chapterNumber);

      // Clear draft after successful save from context
      clearDraft(isbn, chapterNumber);
    } catch (err: unknown) {
      console.error('Error saving note:', err);
      setSaveStatus('error');

      // Provide more detailed error messages
      const error = err as { message?: string; type?: string };
      if (error?.message) {
        setError(`Failed to save note: ${error.message}`);
      } else if (error?.type === 'AccountNotFound') {
        setError('Account not found. Please make sure you are logged in.');
      } else if (error?.type === 'NotEnoughBalance') {
        setError('Not enough NEAR balance to complete the transaction.');
      } else {
        setError('Failed to save note. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }, [
    book,
    isbn,
    chapterNumber,
    addChapterNoteMutation,
    note,
    markAsSaved,
    clearDraft,
    signedAccountId,
    refetchBook,
  ]);

  // Keyboard shortcut for save (Ctrl/Cmd + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !saving && signedAccountId) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, hasUnsavedChanges, handleSave, signedAccountId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const chaptersWithNotes = Object.keys(book?.chapter_notes || {})
    .map(Number)
    .sort((a, b) => a - b);

  const handleRestoreSaved = useCallback(
    (savedContent: string) => {
      const savedNote = savedContent || '';
      setNote(savedNote);
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      markAsSaved(isbn, chapterNumber);
      clearDraft(isbn, chapterNumber);
    },
    [isbn, chapterNumber, markAsSaved, clearDraft],
  );

  const handleCloseError = () => {
    setError(null);
    setSaveStatus('idle');
  };

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      setError('Failed to load book data. Please try again.');
    }
  }, [queryError]);

  // Navigation handlers
  const handleChapterChange = (newChapter: number) => {
    const url = demoMode
      ? `/note-editor/${isbn}/${newChapter}?demo=true`
      : `/note-editor/${isbn}/${newChapter}`;
    navigate(url);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Compact Header */}
      <NoteEditorHeader
        demoMode={demoMode}
        returnUrl={returnUrl}
        accountId={signedAccountId}
        saveStatus={saveStatus}
        book={book || null}
        chapterNumber={chapterNumber}
        totalChapters={book?.total_chapters || 0}
        chaptersWithNotes={chaptersWithNotes}
        onChapterChange={handleChapterChange}
      />

      {/* Editor Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 2rem 2rem 2rem',
        }}
      >
        <NoteEditorContent
          note={note}
          loading={queryLoading}
          onChange={handleNoteChange}
        />

        <NoteEditorActions
          saving={saving}
          accountId={signedAccountId}
          note={note}
          hasUnsavedChanges={hasUnsavedChanges}
          savedNoteContent={book?.chapter_notes?.[chapterNumber]}
          onSave={handleSave}
          onRestoreSaved={handleRestoreSaved}
        />
      </div>

      {/* Save Status Toast */}
      <SaveStatusIndicator
        saveStatus={saveStatus}
        error={error}
        onCloseError={handleCloseError}
      />
    </div>
  );
};
