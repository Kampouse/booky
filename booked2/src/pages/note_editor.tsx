import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { BookEntry } from '@/config';
import { useBookyContract } from '@/lib/bookyContract';
import { useNoteContext, type NoteDraft } from '@/contexts';

const NoteEditorPage: React.FC = () => {
  const { isbn, chapter } = useParams<{ isbn: string; chapter: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const demoMode = searchParams.get('demo') === 'true';
  const returnUrl = searchParams.get('return') || '/book-library';

  const { accountId, getBook, addChapterNote } = useBookyContract();
  const { getDraft, setDraft, clearDraft, hasChanges, markAsSaved } =
    useNoteContext();

  const [book, setBook] = useState<BookEntry | null>(null);
  const [note, setNote] = useState('');
  const [lastSavedNote, setLastSavedNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

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

  // Load book and draft on mount
  useEffect(() => {
    loadBookAndDraft();
  }, [isbn, chapterNumber]);

  // Load book data and draft from context
  const loadBookAndDraft = async () => {
    try {
      setLoading(true);
      setError(null);

      let bookData: BookEntry | null = null;

      if (demoMode) {
        throw new Error('Demo mode not implemented for note editor');
      } else {
        bookData = await getBook(isbn!);
      }

      if (!bookData) {
        throw new Error('Book not found');
      }

      setBook(bookData);

      // Try to load draft from context first
      const existingDraft: NoteDraft | undefined = getDraft(
        isbn!,
        chapterNumber,
      );

      if (existingDraft) {
        setNote(existingDraft.content);
        setLastSavedNote(existingDraft.content);
        setSaveStatus('saved');
        setIsDraft(true);
        setLastSavedTime(new Date(existingDraft.timestamp));
        setHasUnsavedChanges(hasChanges(isbn!, chapterNumber));
      } else {
        // Load actual note from book
        const savedNote = bookData.chapter_notes?.[chapterNumber] || '';
        setNote(savedNote);
        setLastSavedNote(savedNote);
        setHasUnsavedChanges(false);
        setIsDraft(false);
        if (savedNote) {
          setSaveStatus('saved');
          setLastSavedTime(new Date());
        }
      }
    } catch (err) {
      setError('Failed to load book and note. Please try again.');
      console.error('Error loading:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle note changes with auto-save using context
  const handleNoteChange = useCallback(
    (value: string) => {
      setNote(value);
      setHasUnsavedChanges(true);
      setIsDraft(true);

      // Clear previous timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        // Save to context instead of localStorage
        setDraft(isbn!, chapterNumber, value);
        setLastSavedNote(value);
        setHasUnsavedChanges(false);
        setLastSavedTime(new Date());
        setSaveStatus('saved');
      }, 1000); // Auto-save after 1 second of inactivity
    },
    [isbn, chapterNumber, setDraft, lastSavedNote],
  );

  // Save to blockchain
  const handleSave = async () => {
    if (!book) return;

    // Check if wallet is connected
    if (!accountId) {
      setError('Please connect your wallet to save notes to blockchain.');
      setSaveStatus('error');
      return;
    }

    setError(null);
    setSaving(true);
    setSaveStatus('saving');

    try {
      console.log('Saving note to blockchain...', {
        isbn: book.isbn,
        chapter: chapterNumber,
      });

      const result = await addChapterNote(book.isbn, chapterNumber, note);
      console.log('Save successful:', result);

      setSaveStatus('saved');
      setLastSavedNote(note);
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date());
      setIsDraft(false);

      // Mark as saved in context
      markAsSaved(isbn!, chapterNumber);

      // Clear draft after successful save from context
      clearDraft(isbn!, chapterNumber);
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

  // Keyboard shortcut for save (Ctrl/Cmd + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !saving && accountId) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, accountId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Clear draft and revert to saved note
  const handleClearDraft = () => {
    clearDraft(isbn!, chapterNumber);
    const existingNote = book?.chapter_notes?.[chapterNumber] || '';
    setNote(existingNote);
    setLastSavedNote(existingNote);
    setHasUnsavedChanges(false);
    setSaveStatus('saved');
    setIsDraft(false);
  };

  const calculateProgress = (): number => {
    if (!book?.total_chapters || book.total_chapters === 0) return 0;
    const progress = (book.current_chapter / book.total_chapters) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatLastSavedTime = (): string => {
    if (!lastSavedTime) return '';
    const now = Date.now();
    const diff = now - lastSavedTime.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const chaptersWithNotes = Object.keys(book?.chapter_notes || {})
    .map(Number)
    .sort((a, b) => a - b);

  // Loading state is handled inline in the textarea

  // Error is handled via toast notification - no full-screen error state

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(168, 213, 162, 0.1)',
          backgroundColor: 'rgba(26, 42, 58, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <Link
            to={demoMode ? '/book-library?demo=true' : returnUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#a8d5a2',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              fontFamily: '"Lora", Georgia, serif',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#c5e8c0';
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#a8d5a2';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ← Back to Library
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {!accountId && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid #e8c860',
                  borderRadius: '6px',
                  color: '#e8c860',
                  fontSize: '0.875rem',
                  fontFamily: '"Lora", Georgia, serif',
                }}
              >
                ⚠️ Wallet not connected
              </div>
            )}

            {saveStatus === 'saved' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(168, 213, 162, 0.1)',
                  borderRadius: '6px',
                  color: '#a8d5a2',
                  fontSize: '0.875rem',
                  fontFamily: '"Lora", Georgia, serif',
                }}
              >
                ✓ {formatLastSavedTime()}
              </div>
            )}

            {saveStatus === 'saving' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '6px',
                  color: '#e8c860',
                  fontSize: '0.875rem',
                  fontFamily: '"Lora", Georgia, serif',
                }}
              >
                Saving...
              </div>
            )}
          </div>
        </div>

        {/* Book Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: '#fffff0',
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: '600',
                marginBottom: '0.5rem',
              }}
            >
              {book?.title}
            </h1>
            <p
              style={{
                color: 'rgba(255, 255, 240, 0.7)',
                fontSize: '1rem',
                fontFamily: '"Lora", Georgia, serif',
                marginBottom: '1rem',
              }}
            >
              {book?.author}
            </p>

            {/* Progress */}
            {book?.total_chapters && book.total_chapters > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      height: '8px',
                      width: '120px',
                      backgroundColor: 'rgba(168, 213, 162, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${calculateProgress()}%`,
                        background:
                          'linear-gradient(90deg, #3d6b5a 0%, #a8d5a2 100%)',
                        borderRadius: '4px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: 'rgba(255, 255, 240, 0.8)',
                      fontSize: '0.9rem',
                      fontFamily: '"Lora", Georgia, serif',
                    }}
                  >
                    {calculateProgress().toFixed(0)}%
                  </span>
                </div>

                <div
                  style={{
                    color: 'rgba(255, 255, 240, 0.7)',
                    fontSize: '0.9rem',
                    fontFamily: '"Lora", Georgia, serif',
                  }}
                >
                  Chapter {chapterNumber} · {chaptersWithNotes.length} notes
                  total
                </div>
              </div>
            )}
          </div>

          {/* Chapter Navigation */}
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
                  ? `/note-editor/${isbn}/${chapterNumber - 1}${
                      demoMode ? '?demo=true' : ''
                    }`
                  : '#'
              }
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '2px solid rgba(168, 213, 162, 0.3)',
                borderRadius: '8px',
                color:
                  chapterNumber > 1 ? '#a8d5a2' : 'rgba(168, 213, 162, 0.3)',
                fontSize: '0.95rem',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: chapterNumber > 1 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                if (chapterNumber > 1) {
                  e.currentTarget.style.backgroundColor =
                    'rgba(168, 213, 162, 0.1)';
                  e.currentTarget.style.borderColor = '#a8d5a2';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
              }}
            >
              ← Prev
            </Link>

            <select
              value={chapterNumber}
              onChange={(e) => {
                const newChapter = Number(e.target.value);
                navigate(
                  `/note-editor/${isbn}/${newChapter}${
                    demoMode ? '?demo=true' : ''
                  }`,
                );
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
              {Array.from(
                { length: book?.total_chapters || 12 },
                (_, i) => i + 1,
              ).map((ch) => (
                <option key={ch} value={ch}>
                  Chapter {ch}
                  {chaptersWithNotes.includes(ch) && ' · Note'}
                </option>
              ))}
            </select>

            <Link
              to={
                chapterNumber < (book?.total_chapters || 12)
                  ? `/note-editor/${isbn}/${chapterNumber + 1}${
                      demoMode ? '?demo=true' : ''
                    }`
                  : '#'
              }
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '2px solid rgba(168, 213, 162, 0.3)',
                borderRadius: '8px',
                color:
                  chapterNumber < (book?.total_chapters || 12)
                    ? '#a8d5a2'
                    : 'rgba(168, 213, 162, 0.3)',
                fontSize: '0.95rem',
                fontWeight: '600',
                textDecoration: 'none',
                cursor:
                  chapterNumber < (book?.total_chapters || 12)
                    ? 'pointer'
                    : 'not-allowed',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                if (chapterNumber < (book?.total_chapters || 12)) {
                  e.currentTarget.style.backgroundColor =
                    'rgba(168, 213, 162, 0.1)';
                  e.currentTarget.style.borderColor = '#a8d5a2';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
              }}
            >
              Next →
            </Link>
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
        }}
      >
        {/* Note Editor */}
        {loading ? (
          <div
            style={{
              flex: 1,
              minHeight: '400px',
              padding: '2rem',
              backgroundColor: '#3d3a36',
              border: '1px solid rgba(168, 213, 162, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: 'rgba(255, 255, 240, 0.3)',
                fontSize: '0.9rem',
                fontFamily: '"Lora", Georgia, serif',
              }}
            >
              Loading note...
            </span>
          </div>
        ) : (
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            style={{
              flex: 1,
              minHeight: '400px',
              padding: '2rem',
              backgroundColor: '#3d3a36',
              border: '1px solid rgba(168, 213, 162, 0.15)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontFamily: '"Lora", Georgia, serif',
              lineHeight: '1.8',
              resize: 'none',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            placeholder="Start writing your note for this chapter..."
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a8d5a2';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(168, 213, 162, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        )}

        {/* Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(168, 213, 162, 0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span
              style={{
                color: 'rgba(255, 255, 240, 0.6)',
                fontSize: '0.85rem',
                fontFamily: '"Lora", Georgia, serif',
              }}
            >
              💡 Tip: Press Ctrl/Cmd + S to save
            </span>
            <span
              style={{
                color: 'rgba(255, 255, 240, 0.6)',
                fontSize: '0.85rem',
                fontFamily: '"Lora", Georgia, serif',
              }}
            >
              📝 {note.length} characters
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <button
              onClick={() => {
                navigate(demoMode ? '/book-library?demo=true' : returnUrl);
              }}
              style={{
                padding: '0.875rem 2rem',
                background: 'transparent',
                border: '2px solid rgba(168, 213, 162, 0.3)',
                borderRadius: '8px',
                color: '#a8d5a2',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(168, 213, 162, 0.1)';
                e.currentTarget.style.borderColor = '#a8d5a2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !accountId}
              style={{
                padding: '0.875rem 2.5rem',
                background:
                  saving || !accountId
                    ? 'rgba(168, 213, 162, 0.3)'
                    : 'linear-gradient(135deg, #a8d5a2 0%, #88b882 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#1a2a3a',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: saving || !accountId ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: saving || !accountId ? 0.5 : 1,
              }}
              title={
                !accountId
                  ? 'Connect your wallet to save'
                  : 'Save to blockchain'
              }
              onMouseOver={(e) => {
                if (!saving && accountId) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(168, 213, 162, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {saving
                ? 'Saving...'
                : !accountId
                  ? 'Connect Wallet'
                  : 'Save Note'}
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
            {(error || saveStatus === 'error') && (
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
                <span>{error || 'Failed to save note'}</span>
                <button
                  onClick={() => {
                    setError(null);
                    setSaveStatus('idle');
                  }}
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
      </div>
    </div>
  );
};

export default NoteEditorPage;
