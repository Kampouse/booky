import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router';
import { BookEntry, ProgressUpdate, ReadingStatus } from '@/config';
import {
  useBook,
  useUpdateReadingProgress,
  useMarkCompleted,
} from '@/lib/useBookyQuery';
const UpdateProgressPage: React.FC = () => {
  const { isbn } = useParams<{ isbn: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    data: book,
    isLoading: loading,
    error: bookError,
    refetch: refetchBook,
  } = useBook(isbn!);
  const updateProgressMutation = useUpdateReadingProgress();
  const markCompletedMutation = useMarkCompleted();

  const demoMode = searchParams.get('demo') === 'true';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [progressData, setProgressData] = useState<ProgressUpdate>({
    current_chapter: 0,
    chapters_completed: [],
    last_read_position: '0',
    last_read_date: new Date().toISOString(),
    reading_status: 'Reading' as ReadingStatus,
  });

  // Sync progress data when book is loaded via React Query
  useEffect(() => {
    if (book && !demoMode) {
      setProgressData({
        current_chapter: book.current_chapter,
        chapters_completed: book.chapters_read || [],
        last_read_position: book.last_read_position || '0',
        last_read_date: book.last_read_date || new Date().toISOString(),
        reading_status: book.reading_status,
      });
    }
  }, [book, demoMode]);

  const [newCompletedChapter, setNewCompletedChapter] = useState<string>('');

  // Demo mode: Load book from localStorage when demo mode is active
  useEffect(() => {
    if (demoMode && isbn) {
      loadDemoBook();
    }
  }, [demoMode, isbn]);

  const loadDemoBook = async () => {
    try {
      setError(null);

      const demoBooksJson = localStorage.getItem('bookyDemoBooks');
      if (demoBooksJson) {
        const demoBooks: BookEntry[] = JSON.parse(demoBooksJson);
        const bookData = demoBooks.find((b) => b.isbn === isbn!) || null;
        if (!bookData) {
          throw new Error('Book not found in demo library');
        }
        setProgressData({
          current_chapter: bookData.current_chapter,
          chapters_completed: bookData.chapters_read || [],
          last_read_position: bookData.last_read_position || '0',
          last_read_date: bookData.last_read_date || new Date().toISOString(),
          reading_status: bookData.reading_status,
        });
      } else {
        throw new Error('No demo books found');
      }
    } catch (err) {
      setError('Failed to load book. Please try again.');
      console.error('Error loading book:', err);
    }
  };

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
      setSubmitting(true);

      if (demoMode) {
        // In demo mode, update localStorage
        const demoBooksJson = localStorage.getItem('bookyDemoBooks');
        if (demoBooksJson) {
          const demoBooks: BookEntry[] = JSON.parse(demoBooksJson);
          const updatedBooks = demoBooks.map((b) => {
            if (b.isbn === isbn!) {
              return {
                ...b,
                current_chapter: progressData.current_chapter ?? 0,
                chapters_read: progressData.chapters_completed,
                last_read_position: progressData.last_read_position ?? '0',
                last_read_date:
                  progressData.last_read_date ?? new Date().toISOString(),
                reading_status: (progressData.reading_status ??
                  b.reading_status) as ReadingStatus,
              };
            }
            return b;
          });
          localStorage.setItem('bookyDemoBooks', JSON.stringify(updatedBooks));
        }
      } else {
        // Normal mode: React Query mutation - automatically handles caching and invalidation
        await updateProgressMutation.mutateAsync({
          isbn: isbn!,
          progress: progressData,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        const noteUrl = demoMode
          ? `/note-editor/${isbn}/${progressData.current_chapter}?demo=true`
          : `/note-editor/${isbn}/${progressData.current_chapter}`;
        navigate(noteUrl);
      }, 2000);
    } catch (err) {
      setError('Failed to update progress. Please try again.');
      console.error('Error updating reading progress:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async () => {
    setError(null);

    try {
      setSubmitting(true);

      if (demoMode) {
        // In demo mode, update localStorage
        const demoBooksJson = localStorage.getItem('bookyDemoBooks');
        if (demoBooksJson) {
          const demoBooks: BookEntry[] = JSON.parse(demoBooksJson);
          const updatedBooks = demoBooks.map((b) => {
            if (b.isbn === isbn!) {
              return {
                ...b,
                last_read_date: new Date().toISOString(),
                reading_status: 'Completed' as ReadingStatus,
              };
            }
            return b;
          });
          localStorage.setItem('bookyDemoBooks', JSON.stringify(updatedBooks));
        }
      } else {
        // Normal mode: React Query mutation - automatically handles caching and invalidation
        await markCompletedMutation.mutateAsync(isbn!);
      }

      setSuccess(true);
      setTimeout(() => {
        const libraryUrl = demoMode
          ? '/book-library?demo=true'
          : '/book-library';
        navigate(libraryUrl);
      }, 2000);
    } catch (err) {
      setError('Failed to mark as completed. Please try again.');
      console.error('Error marking book as completed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = book?.total_chapters
    ? Math.min(
        ((progressData.current_chapter ?? 0) / book.total_chapters) * 100,
        100,
      )
    : 0;

  if (error && !book) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
          padding: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(114, 47, 55, 0.1)',
            border: '1px solid #722f37',
            borderRadius: '10px',
            padding: '1.5rem',
            maxWidth: '450px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: '#722f37',
              fontFamily: "'Playfair Display', Georgia, serif",
              marginBottom: '0.75rem',
              fontSize: '1.5rem',
            }}
          >
            Error
          </h2>
          <p
            style={{
              color: '#1a2a3a',
              marginBottom: '1rem',
              fontSize: '0.95rem',
            }}
          >
            {error}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              justifyContent: 'center',
            }}
          >
            <Link
              to={
                demoMode
                  ? `/note-editor/${isbn}/${progressData.current_chapter}?demo=true`
                  : `/note-editor/${isbn}/${progressData.current_chapter}`
              }
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.25rem',
                background: 'transparent',
                border: '1px solid rgba(168, 213, 162, 0.3)',
                color: '#a8d5a2',
                borderRadius: '6px',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              ← Back to Note
            </Link>
            <Link
              to={demoMode ? '/book-library?demo=true' : '/book-library'}
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.25rem',
                background: 'linear-gradient(135deg, #a8d5a2 0%, #88b882 100%)',
                color: '#1a2a3a',
                borderRadius: '6px',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(168, 213, 162, 0.1)',
            border: '1px solid #a8d5a2',
            borderRadius: '10px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2.5rem',
              marginBottom: '0.5rem',
            }}
          >
            ✓
          </div>
          <h2
            style={{
              color: '#a8d5a2',
              fontFamily: "'Playfair Display', Georgia, serif",
              marginBottom: '0.5rem',
              fontSize: '1.5rem',
            }}
          >
            Success!
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 240, 0.85)',
              marginBottom: '0',
              fontSize: '0.9rem',
            }}
          >
            Redirecting back to note...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
        padding: '1rem 0',
      }}
    >
      <div className="container">
        {/* Header */}
        <div
          style={{
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to={
              demoMode
                ? `/note-editor/${isbn}/${progressData.current_chapter}?demo=true`
                : `/note-editor/${isbn}/${progressData.current_chapter}`
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#a8d5a2',
              textDecoration: 'none',
              fontSize: '0.95rem',
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
            ← Back to Note
          </Link>
        </div>

        {/* Main Content */}
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {/* Page Title */}

          {/* Form Card */}
          <div
            style={{
              backgroundColor: '#3d3a36',
              border: '1px solid rgba(168, 213, 162, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
          >
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.5rem 0',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(168, 213, 162, 0.2)',
                    borderTopColor: '#a8d5a2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <div
                  style={{
                    color: '#fffff0',
                    fontSize: '1rem',
                    fontFamily: '"Lora", Georgia, serif',
                  }}
                >
                  Loading...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Error Alert */}
                {error && (
                  <div
                    style={{
                      padding: '10px 14px',
                      marginBottom: '1rem',
                      backgroundColor: 'rgba(114, 47, 55, 0.2)',
                      border: '1px solid #722f37',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Progress Overview */}
                {book?.total_chapters && book.total_chapters > 0 && (
                  <div
                    style={{
                      marginBottom: '1.25rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(168, 213, 162, 0.08)',
                      borderRadius: '8px',
                      border: '1px solid rgba(168, 213, 162, 0.15)',
                    }}
                  >
                    <div
                      style={{
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          height: '12px',
                          backgroundColor: 'rgba(168, 213, 162, 0.1)',
                          borderRadius: '6px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            background:
                              'linear-gradient(90deg, #3d6b5a 0%, #a8d5a2 100%)',
                            borderRadius: '6px',
                            transition: 'width 0.6s ease',
                            width: `${progressPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ color: '#e8e0d5', fontSize: '0.95rem' }}>
                        <span style={{ opacity: 0.7 }}>Current:</span>{' '}
                        <strong>
                          {progressData.current_chapter ?? 0} /{' '}
                          {book.total_chapters}
                        </strong>{' '}
                        chapters
                      </span>
                      <span
                        style={{
                          color: '#a8d5a2',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                        }}
                      >
                        {progressPercentage.toFixed(0)}% complete
                      </span>
                    </div>
                  </div>
                )}

                {/* Current Chapter */}
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor="current_chapter"
                    style={{
                      display: 'block',
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '0.4rem',
                      fontSize: '0.95rem',
                    }}
                  >
                    Current Chapter
                  </label>
                  <input
                    type="number"
                    id="current_chapter"
                    name="current_chapter"
                    value={progressData.current_chapter || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.875rem',
                      backgroundColor: 'rgba(255, 255, 240, 0.05)',
                      border: '1px solid rgba(168, 213, 162, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontFamily: '"Lora", Georgia, serif',
                      transition: 'all 0.3s ease',
                    }}
                    placeholder="Current chapter number"
                    min="0"
                    max={book?.total_chapters || undefined}
                    disabled={submitting}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a8d5a2';
                      e.currentTarget.style.boxShadow =
                        '0 0 0 3px rgba(168, 213, 162, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        'rgba(168, 213, 162, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Reading Status */}
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor="reading_status"
                    style={{
                      display: 'block',
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '0.4rem',
                      fontSize: '0.95rem',
                    }}
                  >
                    Reading Status
                  </label>
                  <select
                    id="reading_status"
                    name="reading_status"
                    value={progressData.reading_status ?? 'ToRead'}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.875rem',
                      backgroundColor: 'rgba(255, 255, 240, 0.05)',
                      border: '1px solid rgba(168, 213, 162, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontFamily: '"Lora", Georgia, serif',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    disabled={submitting}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a8d5a2';
                      e.currentTarget.style.boxShadow =
                        '0 0 0 3px rgba(168, 213, 162, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        'rgba(168, 213, 162, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="ToRead">To Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Completed">Completed</option>
                    <option value="OnHold">On Hold</option>
                    <option value="Abandoned">Abandoned</option>
                  </select>
                </div>

                {/* Chapters Completed */}
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      display: 'block',
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '0.4rem',
                      fontSize: '0.95rem',
                    }}
                  >
                    Chapters Completed ({progressData.chapters_completed.length}
                    )
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <input
                      type="number"
                      value={newCompletedChapter}
                      onChange={(e) => setNewCompletedChapter(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.875rem',
                        backgroundColor: 'rgba(255, 255, 240, 0.05)',
                        border: '1px solid rgba(168, 213, 162, 0.2)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontFamily: '"Lora", Georgia, serif',
                        transition: 'all 0.3s ease',
                      }}
                      placeholder="Chapter number"
                      min="1"
                      max={book?.total_chapters || undefined}
                      disabled={submitting}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#a8d5a2';
                        e.currentTarget.style.boxShadow =
                          '0 0 0 3px rgba(168, 213, 162, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          'rgba(168, 213, 162, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCompletedChapter}
                      disabled={submitting || !newCompletedChapter}
                      style={{
                        padding: '0.6rem 1.25rem',
                        backgroundColor:
                          'linear-gradient(135deg, #a8d5a2 0%, #88b882 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#1a2a3a',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        fontFamily: '"Lora", Georgia, serif',
                        cursor:
                          submitting || !newCompletedChapter
                            ? 'not-allowed'
                            : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: submitting || !newCompletedChapter ? 0.5 : 1,
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {progressData.chapters_completed.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(168, 213, 162, 0.05)',
                        borderRadius: '6px',
                      }}
                    >
                      {progressData.chapters_completed.map((chapter) => (
                        <span
                          key={chapter}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.3rem 0.7rem',
                            backgroundColor: 'rgba(168, 213, 162, 0.2)',
                            color: '#a8d5a2',
                            borderRadius: '16px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            fontFamily: '"Lora", Georgia, serif',
                          }}
                        >
                          Chapter {chapter}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveCompletedChapter(chapter)
                            }
                            style={{
                              marginLeft: '0.4rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              color: '#a8d5a2',
                              padding: '0',
                              lineHeight: 1,
                              opacity: 0.7,
                              transition: 'opacity 0.2s ease',
                            }}
                            disabled={submitting}
                            onFocus={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.opacity = '0.7';
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.opacity = '0.7';
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Last Read Position */}
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor="last_read_position"
                    style={{
                      display: 'block',
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '0.4rem',
                      fontSize: '0.95rem',
                    }}
                  >
                    Last Read Position
                  </label>
                  <input
                    type="text"
                    id="last_read_position"
                    name="last_read_position"
                    value={progressData.last_read_position || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.875rem',
                      backgroundColor: 'rgba(255, 255, 240, 0.05)',
                      border: '1px solid rgba(168, 213, 162, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontFamily: '"Lora", Georgia, serif',
                      transition: 'all 0.3s ease',
                    }}
                    placeholder="Page number, chapter, or section"
                    disabled={submitting}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a8d5a2';
                      e.currentTarget.style.boxShadow =
                        '0 0 0 3px rgba(168, 213, 162, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        'rgba(168, 213, 162, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Last Read Date */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    htmlFor="last_read_date"
                    style={{
                      display: 'block',
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '0.5rem',
                      fontSize: '1.05rem',
                    }}
                  >
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
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      backgroundColor: 'rgba(255, 255, 240, 0.05)',
                      border: '1px solid rgba(168, 213, 162, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontFamily: '"Lora", Georgia, serif',
                      transition: 'all 0.3s ease',
                    }}
                    disabled={submitting}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a8d5a2';
                      e.currentTarget.style.boxShadow =
                        '0 0 0 3px rgba(168, 213, 162, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        'rgba(168, 213, 162, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(168, 213, 162, 0.1)',
                  }}
                >
                  <Link
                    to={
                      demoMode
                        ? `/note-editor/${isbn}/${progressData.current_chapter}?demo=true`
                        : `/note-editor/${isbn}/${progressData.current_chapter}`
                    }
                    style={{
                      padding: '0.65rem 1.5rem',
                      background: 'rgba(168, 213, 162, 0.1)',
                      border: '1px solid rgba(168, 213, 162, 0.3)',
                      borderRadius: '6px',
                      color: '#a8d5a2',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(168, 213, 162, 0.15)';
                      e.currentTarget.style.borderColor = '#a8d5a2';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(168, 213, 162, 0.1)';
                      e.currentTarget.style.borderColor =
                        'rgba(168, 213, 162, 0.3)';
                    }}
                  >
                    ← Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '0.65rem 1.75rem',
                      background:
                        'linear-gradient(135deg, #a8d5a2 0%, #88b882 100%)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#1a2a3a',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: submitting ? 0.5 : 1,
                    }}
                  >
                    {submitting ? 'Updating...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Add spinner animation keyframes */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default UpdateProgressPage;
