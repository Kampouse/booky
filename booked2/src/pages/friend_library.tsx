import { useEffect, useState, useRef } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  useFollowedAccounts,
  useFollowAccount,
  useUnfollowAccount,
  queryKeys,
} from '@/lib/useBookyQuery';
import { useBookyContract } from '@/lib/bookyContract';
import styles from '@/styles/book-library.module.css';

interface FollowedAccount {
  account_id: string;
  followed_at: string;
}

const FriendLibrary = () => {
  // React Query hook for followed accounts
  const {
    data: followedAccounts = [],
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useFollowedAccounts();

  const followMutation = useFollowAccount();
  const unfollowMutation = useUnfollowAccount();
  const contract = useBookyContract();

  // Demo mode flag - set to true to test UI without wallet connection
  const demoMode = false;

  // Dialog refs
  const addFriendDialogRef = useRef<HTMLDialogElement>(null);
  const viewBookDialogRef = useRef<HTMLDialogElement>(null);

  // Modal states
  const [showAddFriendForm, setShowAddFriendForm] = useState(false);
  const [viewingBook, setViewingBook] = useState<{
    accountId: string;
    book: any;
  } | null>(null);

  // Demo mode state
  const [demoAccounts, setDemoAccounts] = useState<FollowedAccount[]>([]);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoFriendLibraries, setDemoFriendLibraries] = useState<
    Record<string, any[]>
  >({});
  const [demoFriendStats, setDemoFriendStats] = useState<Record<string, any>>(
    {},
  );

  // Determine which state to use based on demo mode
  const accounts = demoMode ? demoAccounts : followedAccounts;
  const loading = demoMode ? demoLoading : queryLoading;
  const error = demoMode ? demoError : queryError;

  // Show/hide add friend dialog
  useEffect(() => {
    if (showAddFriendForm) {
      addFriendDialogRef.current?.showModal();
    } else {
      addFriendDialogRef.current?.close();
    }
  }, [showAddFriendForm]);

  // Show/hide view book notes dialog
  useEffect(() => {
    if (viewingBook) {
      viewBookDialogRef.current?.showModal();
    } else {
      viewBookDialogRef.current?.close();
    }
  }, [viewingBook]);

  // Load demo accounts when demo mode is active
  useEffect(() => {
    if (demoMode) {
      loadDemoAccounts();
    }
  }, [demoMode]);

  // Use useQueries to fetch friend library and stats data dynamically
  const accountIds = accounts.map((acc) =>
    typeof acc === 'string' ? acc : acc.account_id,
  );

  const friendQueries = useQueries({
    queries:
      !demoMode && accountIds.length > 0
        ? accountIds.flatMap((accountId) => [
            {
              queryKey: queryKeys.userLibrary(accountId),
              queryFn: () => contract.getUserLibrary(accountId),
              enabled: !!accountId,
              staleTime: 5 * 60 * 1000,
            },
            {
              queryKey: queryKeys.userStats(accountId),
              queryFn: () => contract.getUserStats(accountId),
              enabled: !!accountId,
              staleTime: 5 * 60 * 1000,
            },
          ])
        : [],
  });

  // Combine query results into friendLibraries and friendStats
  const friendLibraries: Record<string, any[]> = {};
  const friendStats: Record<string, any> = {};

  if (!demoMode && friendQueries.length > 0) {
    for (let i = 0; i < accountIds.length; i++) {
      const accountId = accountIds[i];
      const libraryQuery = friendQueries[i * 2];
      const statsQuery = friendQueries[i * 2 + 1];

      if (libraryQuery.data) {
        friendLibraries[accountId] = libraryQuery.data;
      }
      if (statsQuery.data) {
        friendStats[accountId] = statsQuery.data;
      }
    }
  }

  const loadDemoAccounts = () => {
    setDemoLoading(true);
    setDemoError(null);

    // Mock followed accounts data
    const mockData: FollowedAccount[] = [
      {
        account_id: 'alice.near',
        followed_at: '2024-01-15T10:30:00.000Z',
      },
      {
        account_id: 'bob.testnet',
        followed_at: '2024-02-20T14:45:00.000Z',
      },
      {
        account_id: 'charlie.near',
        followed_at: '2024-03-10T09:15:00.000Z',
      },
    ];

    // Mock friend libraries and stats
    const mockLibraries: Record<string, any[]> = {
      'alice.near': [
        {
          isbn: '978-0-261-10335-7',
          title: 'The Pragmatic Programmer',
          author: 'Andrew Hunt and David Thomas',
          acquisition_date: '2024-01-10',
          condition: 'Good',
          personal_comments: 'Must read for developers',
          media_hash: null,
          reading_status: 'Completed',
          current_chapter: 12,
          total_chapters: 12,
          chapters_read: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          last_read_position: 'Finished',
          last_read_date: '2024-02-15T10:30:00.000Z',
          chapter_notes: {
            1: 'Great introduction about practical programming.',
            3: 'The broken windows concept applies well to technical debt.',
            7: 'Learned about tracer bullets for development.',
            12: 'Finished! This book changed my perspective.',
          },
        },
        {
          isbn: '978-0-13-235088-4',
          title: 'Clean Code',
          author: 'Robert C. Martin',
          acquisition_date: '2024-02-01',
          condition: 'Like New',
          personal_comments: 'Classic software engineering book',
          media_hash: null,
          reading_status: 'Reading',
          current_chapter: 5,
          total_chapters: 17,
          chapters_read: [1, 2, 3, 4],
          last_read_position: 'Chapter 5',
          last_read_date: new Date().toISOString(),
          chapter_notes: {
            1: 'Meaningful names are crucial.',
            2: 'Functions should be small.',
            4: 'Comments should explain WHY.',
            5: 'Working on error handling patterns.',
          },
        },
      ],
      'bob.testnet': [
        {
          isbn: '978-0-201-63361-0',
          title: 'Design Patterns',
          author: 'Erich Gamma et al.',
          acquisition_date: '2024-03-01',
          condition: 'New',
          personal_comments: 'Learning patterns systematically',
          media_hash: null,
          reading_status: 'ToRead',
          current_chapter: 0,
          total_chapters: 4,
          chapters_read: [],
          last_read_position: '0',
          last_read_date: null,
          chapter_notes: {},
        },
      ],
      'charlie.near': [
        {
          isbn: '978-0-321-12521-7',
          title: 'Refactoring',
          author: 'Martin Fowler',
          acquisition_date: '2024-03-05',
          condition: 'Good',
          personal_comments: 'Essential for code quality',
          media_hash: null,
          reading_status: 'Reading',
          current_chapter: 3,
          total_chapters: 9,
          chapters_read: [1, 2],
          last_read_position: 'Chapter 3',
          last_read_date: new Date().toISOString(),
          chapter_notes: {
            1: 'Introduction to refactoring principles.',
            2: 'The two hats principle.',
            3: 'Bad smells in code.',
          },
        },
      ],
    };

    const mockStats: Record<string, any> = {
      'alice.near': {
        total_books: 2,
        currently_reading: 1,
        completed: 1,
        to_read: 0,
        on_hold: 0,
      },
      'bob.testnet': {
        total_books: 1,
        currently_reading: 0,
        completed: 0,
        to_read: 1,
        on_hold: 0,
      },
      'charlie.near': {
        total_books: 1,
        currently_reading: 1,
        completed: 0,
        to_read: 0,
        on_hold: 0,
      },
    };

    setDemoAccounts(mockData);
    setDemoFriendLibraries(mockLibraries);
    setDemoFriendStats(mockStats);
    setDemoLoading(false);
  };

  const handleFollowSuccess = () => {
    if (demoMode) {
      loadDemoAccounts();
    } else {
      refetch();
    }
  };

  const handleUnfollow = async (accountId: string) => {
    if (!window.confirm(`Are you sure you want to unfollow ${accountId}?`)) {
      return;
    }

    if (demoMode) {
      setDemoAccounts(
        demoAccounts.filter((acc) => acc.account_id !== accountId),
      );
    } else {
      try {
        await unfollowMutation.mutateAsync(accountId);
      } catch (err) {
        console.error('Error unfollowing account:', err);
        alert('Failed to unfollow. Please try again.');
      }
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Get the correct libraries and stats based on demo mode
  const effectiveFriendLibraries = demoMode
    ? demoFriendLibraries
    : friendLibraries;
  const effectiveFriendStats = demoMode ? demoFriendStats : friendStats;

  return (
    <div className={styles.libraryContainer}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1a2a3a',
            marginBottom: '0.5rem',
          }}
        >
          Friend Library
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: '#4a3728',
            opacity: 0.8,
          }}
        >
          Follow your friends and explore their reading journeys
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

      {/* Add Friend Button */}
      <div className={styles.searchFilterBar}>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: '1rem',
              color: '#4a3728',
              fontWeight: 500,
            }}
          >
            Following {accounts.length}{' '}
            {accounts.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>
        <button
          className={styles.buttonPrimary}
          onClick={() => setShowAddFriendForm(true)}
          type="button"
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          + Follow Account
        </button>
      </div>

      {/* Loading State */}
      {loading && accounts.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>⏳</div>
          <h2 className={styles.emptyStateTitle}>Loading Friend Library...</h2>
        </div>
      )}

      {/* Error State */}
      {error && !loading && accounts.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>⚠️</div>
          <h2 className={styles.emptyStateTitle}>Error Loading Accounts</h2>
          <p className={styles.emptyStateDescription}>
            Could not load your followed accounts. Please check your connection.
          </p>
          <button
            className={styles.emptyStateButton}
            onClick={() => {
              if (demoMode) loadDemoAccounts();
              else refetch();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && accounts.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>👥</div>
          <h2 className={styles.emptyStateTitle}>No Friends Yet</h2>
          <p className={styles.emptyStateDescription}>
            Start following other readers to see their libraries and reading
            progress
          </p>
          <button
            className={styles.emptyStateButton}
            onClick={() => setShowAddFriendForm(true)}
            type="button"
          >
            Follow Your First Account
          </button>
        </div>
      )}

      {/* Friends List */}
      {!loading && !error && accounts.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          {accounts.map((account) => {
            const accountId =
              typeof account === 'string' ? account : account.account_id;
            const followedAt =
              typeof account === 'string'
                ? new Date().toISOString()
                : account.followed_at;
            const library = effectiveFriendLibraries[accountId] || [];
            const stats = effectiveFriendStats[accountId] || null;
            const bookCount = library.length;

            return (
              <div
                key={accountId}
                className={styles.bookCard}
                style={{
                  position: 'relative',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, #a8d5a2 0%, #7da87b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#1a2a3a',
                    }}
                  >
                    {accountId.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      className={styles.bookCardTitle}
                      style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        color: '#1a2a3a',
                      }}
                    >
                      {truncateAddress(accountId)}
                    </h3>
                    <p
                      style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.875rem',
                        color: '#4a3728',
                        opacity: 0.7,
                      }}
                    >
                      Following since {formatDate(followedAt)}
                    </p>
                  </div>
                  <button
                    className={styles.buttonSecondary}
                    onClick={() => handleUnfollow(accountId)}
                    disabled={unfollowMutation.isPending}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Unfollow
                  </button>
                </div>

                {/* Stats */}
                {stats && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        background: 'rgba(168, 213, 162, 0.1)',
                        borderRadius: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#1a2a3a',
                        }}
                      >
                        {stats.total_books}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#4a3728',
                          opacity: 0.7,
                        }}
                      >
                        Total
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#1a2a3a',
                        }}
                      >
                        {stats.currently_reading}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#4a3728',
                          opacity: 0.7,
                        }}
                      >
                        Reading
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        background: 'rgba(168, 213, 162, 0.15)',
                        borderRadius: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#1a2a3a',
                        }}
                      >
                        {stats.completed}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#4a3728',
                          opacity: 0.7,
                        }}
                      >
                        Done
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        background: 'rgba(74, 55, 40, 0.1)',
                        borderRadius: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#1a2a3a',
                        }}
                      >
                        {stats.to_read}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#4a3728',
                          opacity: 0.7,
                        }}
                      >
                        To Read
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Books */}
                <div>
                  <h4
                    style={{
                      margin: '0 0 0.75rem 0',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#4a3728',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Library ({bookCount} books)
                  </h4>
                  {bookCount > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      {Array.isArray(library)
                        ? library.slice(0, 3).map((book: any) => (
                            <div
                              key={book.isbn}
                              onClick={() =>
                                setViewingBook({ accountId, book })
                              }
                              role="button"
                              tabIndex={0}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setViewingBook({ accountId, book });
                                }
                              }}
                              style={{
                                padding: '0.75rem',
                                background: 'rgba(26, 42, 58, 0.03)',
                                borderRadius: '6px',
                                borderLeft: '3px solid #a8d5a2',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  'rgba(26, 42, 58, 0.08)';
                                e.currentTarget.style.transform =
                                  'translateX(4px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  'rgba(26, 42, 58, 0.03)';
                                e.currentTarget.style.transform =
                                  'translateX(0)';
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: '#1a2a3a',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                {book.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.875rem',
                                  color: '#4a3728',
                                  opacity: 0.7,
                                }}
                              >
                                {book.author}
                              </div>
                              {Array.isArray(book.chapters_read) &&
                                book.chapters_read.length > 0 && (
                                  <div
                                    style={{
                                      marginTop: '0.5rem',
                                      fontSize: '0.75rem',
                                      color: '#722f37',
                                      fontWeight: 500,
                                    }}
                                  >
                                    📖 {book.chapters_read.length} chapter
                                    {book.chapters_read.length !== 1
                                      ? 's'
                                      : ''}{' '}
                                    read
                                  </div>
                                )}
                              {book.chapter_notes &&
                                typeof book.chapter_notes === 'object' &&
                                Object.keys(book.chapter_notes).length > 0 && (
                                  <div
                                    style={{
                                      marginTop: '0.5rem',
                                      fontSize: '0.75rem',
                                      color: '#722f37',
                                      fontWeight: 500,
                                    }}
                                  >
                                    ✍️ {Object.keys(book.chapter_notes).length}{' '}
                                    note
                                    {Object.keys(book.chapter_notes).length !==
                                    1
                                      ? 's'
                                      : ''}
                                  </div>
                                )}
                            </div>
                          ))
                        : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        color: '#4a3728',
                        opacity: 0.7,
                        fontSize: '0.875rem',
                        fontStyle: 'italic',
                      }}
                    >
                      No books in library yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Friend Form Modal */}
      <dialog
        ref={addFriendDialogRef}
        className={styles.dialog}
        onClose={() => setShowAddFriendForm(false)}
        onClick={(e) => {
          if (e.target === addFriendDialogRef.current) {
            addFriendDialogRef.current?.close();
          }
        }}
      >
        {showAddFriendForm && (
          <AddFriendForm
            onClose={() => {
              addFriendDialogRef.current?.close();
            }}
            onSuccess={handleFollowSuccess}
            demoMode={demoMode}
            demoAccounts={demoAccounts}
            setDemoAccounts={setDemoAccounts}
          />
        )}
      </dialog>

      {/* View Book Notes Modal */}
      <dialog
        ref={viewBookDialogRef}
        className={styles.dialog}
        onClose={() => setViewingBook(null)}
        onClick={(e) => {
          if (e.target === viewBookDialogRef.current) {
            viewBookDialogRef.current?.close();
          }
        }}
      >
        {viewingBook && (
          <ViewBookNotes
            accountId={viewingBook.accountId}
            book={viewingBook.book}
            onClose={() => {
              viewBookDialogRef.current?.close();
            }}
          />
        )}
      </dialog>
    </div>
  );
};

// Add Friend Form Component
interface AddFriendFormProps {
  onClose: () => void;
  onSuccess: () => void;
  demoMode: boolean;
  demoAccounts: FollowedAccount[];
  setDemoAccounts: React.Dispatch<React.SetStateAction<FollowedAccount[]>>;
}

const AddFriendForm: React.FC<AddFriendFormProps> = ({
  onClose,
  onSuccess,
  demoMode,
  demoAccounts,
  setDemoAccounts,
}) => {
  const followMutation = useFollowAccount();
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!accountId.trim()) {
      setError('Account ID is required');
      return;
    }

    // Check if already following
    const alreadyFollowing = demoMode
      ? demoAccounts.some((acc) => acc.account_id === accountId)
      : false;

    if (alreadyFollowing) {
      setError('You are already following this account');
      return;
    }

    try {
      setLoading(true);
      if (demoMode) {
        // In demo mode, add to local state
        const newAccount: FollowedAccount = {
          account_id: accountId.trim(),
          followed_at: new Date().toISOString(),
        };
        setDemoAccounts([...demoAccounts, newAccount]);
      } else {
        // Normal mode: call blockchain
        await followMutation.mutateAsync(accountId.trim());
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to follow account. Please try again.');
      console.error('Error following account:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dialogContent}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Follow Account</h2>
        <button className={styles.modalCloseButton} onClick={onClose}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.modalBody}>
          {error && (
            <div className={styles.errorBanner} role="alert">
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="accountId" className={styles.formLabel}>
              NEAR Account ID *
            </label>
            <input
              type="text"
              id="accountId"
              className={styles.formInput}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="example.near"
              disabled={loading}
              autoComplete="off"
            />
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#4a3728',
                opacity: 0.7,
              }}
            >
              Enter the NEAR account ID of the user you want to follow
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.buttonPrimary}
            disabled={loading || !accountId.trim()}
          >
            {loading ? 'Following...' : 'Follow Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

// View Book Notes Component
interface ViewBookNotesProps {
  accountId: string;
  book: any;
  onClose: () => void;
}

const ViewBookNotes: React.FC<ViewBookNotesProps> = ({
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
    if (book.total_chapters === 0) return 0;
    return (book.chapters_read.length / book.total_chapters) * 100;
  };

  const progress = calculateProgress();

  return (
    <div className={styles.dialogContent}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Book Notes</h2>
        <button className={styles.modalCloseButton} onClick={onClose}>
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
          {book.total_chapters > 0 && (
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
                  {book.chapters_read.length} of {book.total_chapters} chapters
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
          <button className={styles.buttonPrimary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendLibrary;
