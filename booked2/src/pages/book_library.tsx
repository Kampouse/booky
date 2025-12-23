import { useEffect, useState } from 'react';
import { useBookyContract } from '@/lib/bookyContract';
import { BookEntry } from '@/config';
import {
  AddBookForm,
  BookCard,
  ChapterNotes,
  UpdateProgress,
} from '@/components/book-library';
import styles from '@/styles/book-library.module.css';

const BookLibrary = () => {
  const { accountId, getLibrary, getReadingStats } = useBookyContract();

  const [books, setBooks] = useState<BookEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo mode flag - set to true to test UI without wallet connection
  const demoMode = true;

  // Modal states
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [selectedBookForNotes, setSelectedBookForNotes] =
    useState<BookEntry | null>(null);
  const [selectedBookForProgress, setSelectedBookForProgress] =
    useState<BookEntry | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (demoMode) {
      loadDemoLibrary();
    } else if (accountId) {
      loadLibrary();
    } else {
      setLoading(false);
    }
  }, [accountId]);

  const loadDemoLibrary = () => {
    setLoading(true);
    setError(null);

    // Mock book data
    const mockData: BookEntry[] = [
      {
        isbn: '978-0-261-10335-7',
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt and David Thomas',
        acquisition_date: '2024-01-15',
        condition: 'Good',
        personal_comments:
          'Excellent book on software craftsmanship. Highly recommended for all developers.',
        media_hash: null,
        reading_status: 'Reading',
        current_chapter: 8,
        total_chapters: 12,
        chapters_read: [1, 2, 3, 4, 5, 6, 7],
        last_read_position: 'Chapter 8, page 145',
        last_read_date: new Date().toISOString(),
        chapter_notes: {
          1: 'Great introduction about practical programming. The idea of investing in your knowledge base is powerful.',
          3: 'The broken windows concept applies well to technical debt.',
          7: 'Learned about the importance of tracer bullets for development.',
        },
      },
      {
        isbn: '978-0-13-235088-4',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        acquisition_date: '2024-02-01',
        condition: 'Like New',
        personal_comments: 'The bible of clean coding principles.',
        media_hash: null,
        reading_status: 'Completed',
        current_chapter: 17,
        total_chapters: 17,
        chapters_read: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        last_read_position: 'Finished',
        last_read_date: '2024-03-15T10:30:00.000Z',
        chapter_notes: {
          1: 'Meaningful names are crucial for code readability.',
          10: 'Functions should be small and do one thing.',
          17: 'Code smells and their remedies.',
        },
      },
      {
        isbn: '978-0-201-63361-0',
        title: 'Design Patterns',
        author: 'Erich Gamma et al.',
        acquisition_date: '2024-03-01',
        condition: 'New',
        personal_comments:
          'Want to learn the Gang of Four patterns systematically.',
        media_hash: null,
        reading_status: 'ToRead',
        current_chapter: 0,
        total_chapters: 4,
        chapters_read: [],
        last_read_position: '0',
        last_read_date: null,
        chapter_notes: {},
      },
    ];

    // Mock stats
    const mockStats = {
      total_books: 3,
      currently_reading: 1,
      completed: 1,
      to_read: 1,
      on_hold: 0,
    };

    setBooks(mockData);
    setStats(mockStats);
    setLoading(false);
  };

  const loadLibrary = async () => {
    setError(null);
    try {
      setLoading(true);

      let library: BookEntry[] = [];
      let statsData: any = null;

      try {
        library = await getLibrary();
        statsData = await getReadingStats();
      } catch (err) {
        console.error('Error loading library:', err);
        setError('Could not load your library. Please check your connection.');
      }

      setBooks(library);
      setStats(statsData);
    } catch (err) {
      console.error('Unexpected error loading library:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBookSuccess = () => {
    if (demoMode) {
      loadDemoLibrary();
    } else {
      loadLibrary();
    }
  };

  const handleViewNotes = (isbn: string) => {
    const book = books.find((b) => b.isbn === isbn);
    if (book) {
      setSelectedBookForNotes(book);
    }
  };

  const handleUpdateProgress = (isbn: string) => {
    const book = books.find((b) => b.isbn === isbn);
    if (book) {
      setSelectedBookForProgress(book);
    }
  };

  const handleNoteUpdate = () => {
    if (demoMode) {
      loadDemoLibrary();
    } else {
      loadLibrary();
    }
  };

  const handleProgressUpdate = () => {
    if (demoMode) {
      loadDemoLibrary();
    } else {
      loadLibrary();
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery === '' ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || book.reading_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.libraryContainer}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "Playfair Display', Georgia, serif",
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1a2a3a',
            marginBottom: '0.5rem',
          }}
        >
          Your Book Library
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: '#4a3728',
            opacity: 0.8,
          }}
        >
          Manage your reading journey, track progress, and take notes
        </p>
      </div>

      {/* Demo Mode Banner */}
      {demoMode && (
        <div
          style={{
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            background:
              'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(114, 47, 55, 0.1) 100%)',
            border: '2px dashed #a8d5a2',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🎭</span>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#722f37',
              }}
            >
              Demo Mode Active
            </h3>
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.875rem',
                color: '#1a2a3a',
                opacity: 0.8,
              }}
            >
              No wallet connection required. Data changes are temporary.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.statCard}>
            <div className={styles.statCardIcon}>📚</div>
            <div className={styles.statCardValue}>{stats.total_books}</div>
            <div className={styles.statCardLabel}>Total Books</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardIcon}>📖</div>
            <div className={styles.statCardValue}>
              {stats.currently_reading}
            </div>
            <div className={styles.statCardLabel}>Reading</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardIcon}>✅</div>
            <div className={styles.statCardValue}>{stats.completed}</div>
            <div className={styles.statCardLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardIcon}>📋</div>
            <div className={styles.statCardValue}>{stats.to_read}</div>
            <div className={styles.statCardLabel}>To Read</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardIcon}>⏸️</div>
            <div className={styles.statCardValue}>{stats.on_hold}</div>
            <div className={styles.statCardLabel}>On Hold</div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className={styles.searchFilterBar}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchInputIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.searchClearButton}
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="ToRead">To Read</option>
          <option value="Reading">Reading</option>
          <option value="Completed">Completed</option>
          <option value="OnHold">On Hold</option>
          <option value="Abandoned">Abandoned</option>
        </select>
        <button
          className={styles.buttonPrimary}
          onClick={() => setShowAddBookForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          + Add Book
        </button>
      </div>

      {/* Filter Info */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className={styles.filterInfo}>
          Showing {filteredBooks.length} of {books.length} books
          <button
            className={styles.clearFiltersButton}
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && books.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>⏳</div>
          <h2 className={styles.emptyStateTitle}>Loading Your Library...</h2>
        </div>
      )}

      {/* Books Grid */}
      {!loading && filteredBooks.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          {filteredBooks.map((book) => (
            <BookCard
              key={book.isbn}
              book={book}
              onViewNotes={handleViewNotes}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      ) : !loading && filteredBooks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📚</div>
          <h2 className={styles.emptyStateTitle}>
            {searchQuery || statusFilter !== 'all'
              ? 'No Books Match Your Filters'
              : 'Your Library is Empty'}
          </h2>
          <p className={styles.emptyStateDescription}>
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Start building your collection by adding your first book'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              className={styles.emptyStateButton}
              onClick={() => setShowAddBookForm(true)}
            >
              Add Your First Book
            </button>
          )}
          {searchQuery || statusFilter !== 'all' ? (
            <button
              className={styles.emptyStateButton}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Modals */}
      {showAddBookForm && (
        <AddBookForm
          onClose={() => setShowAddBookForm(false)}
          onSuccess={handleAddBookSuccess}
          demoMode={demoMode}
          demoBooks={books}
          setDemoBooks={setBooks}
        />
      )}

      {selectedBookForNotes && (
        <ChapterNotes
          book={selectedBookForNotes}
          onClose={() => setSelectedBookForNotes(null)}
          onUpdate={handleNoteUpdate}
          demoMode={demoMode}
          demoBooks={books}
          setDemoBooks={setBooks}
        />
      )}

      {selectedBookForProgress && (
        <UpdateProgress
          book={selectedBookForProgress}
          onClose={() => setSelectedBookForProgress(null)}
          onUpdate={handleProgressUpdate}
          demoMode={demoMode}
          demoBooks={books}
          setDemoBooks={setBooks}
        />
      )}
    </div>
  );
};

export default BookLibrary;
