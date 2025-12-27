import { useEffect, useState, useRef } from 'react';
import {
  useFollowedAccountsWithDetails,
  useUnfollowAccount,
} from '@/lib/useBookyQuery';
import type {
  FollowedAccountDetails,
  BookEntry,
  ReadingStats,
} from '@/utils/types';
import styles from '@/styles/book-library.module.css';
import { useDemoData } from '@/hooks/useDemoData';
import { AddFriendForm } from '@/components/AddFriendForm';
import { ViewBookNotes } from '@/components/ViewBookNotes';
import { FriendCard } from '@/components/FriendCard';

const FriendLibrary = () => {
  // React Query hook for followed accounts
  const {
    data: followedAccountDetails = [],
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useFollowedAccountsWithDetails();

  const unfollowMutation = useUnfollowAccount();

  // Demo mode flag - set to true to test UI without wallet connection
  const demoMode = false;

  // Dialog refs
  const viewBookDialogRef = useRef<HTMLDialogElement>(null);

  // Modal states
  const [showAddFriendForm, setShowAddFriendForm] = useState(false);
  const [viewingBook, setViewingBook] = useState<{
    accountId: string;
    book: BookEntry;
  } | null>(null);

  // Demo data hook
  const {
    demoAccounts,
    demoLoading,
    demoError,
    demoFriendLibraries,
    demoFriendStats,
    loadDemoAccounts,
    setDemoAccounts,
  } = useDemoData();

  // Determine which state to use based on demo mode
  const accountIds = demoMode
    ? demoAccounts.map((acc) => acc.account_id)
    : followedAccountDetails.map((d) => d.account_id);
  const loading = demoMode ? demoLoading : queryLoading;
  const error = demoMode ? demoError : queryError;

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
  }, [loadDemoAccounts]);

  // Transform batched data into Record format for easier lookup
  const friendLibraries: Record<string, BookEntry[]> = {};
  const friendStats: Record<string, ReadingStats> = {};

  if (!demoMode) {
    followedAccountDetails.forEach((details: FollowedAccountDetails) => {
      friendLibraries[details.account_id] = details.library;
      friendStats[details.account_id] = details.stats;
    });
  }

  // Get the correct libraries and stats based on demo mode
  const effectiveFriendLibraries = demoMode
    ? demoFriendLibraries
    : friendLibraries;
  const effectiveFriendStats = demoMode ? demoFriendStats : friendStats;

  const handleFollowSuccess = () => {
    if (demoMode) {
      loadDemoAccounts();
    } else {
      refetch();
    }
  };

  const handleUnfollow = async (accountId: string): Promise<void> => {
    if (demoMode) {
      setDemoAccounts(
        demoAccounts.filter((acc) => acc.account_id !== accountId),
      );
    } else {
      try {
        await unfollowMutation.mutateAsync(accountId);
      } catch {
        throw new Error('Failed to unfollow account');
      }
    }
  };

  return (
    <div className={styles.libraryContainer} style={{ minHeight: '85.9vh' }}>
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
        ></p>
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
      <div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: '1rem',
              color: '#4a3728',
              fontWeight: 500,
            }}
          ></p>
        </div>
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={() => setShowAddFriendForm(true)}
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
      {loading && accountIds.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>⏳</div>
          <h2 className={styles.emptyStateTitle}>Loading Friend Library...</h2>
        </div>
      )}

      {/* Error State */}
      {error && !loading && accountIds.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>⚠️</div>
          <h2 className={styles.emptyStateTitle}>Error Loading Accounts</h2>
          <p className={styles.emptyStateDescription}>
            Could not load your followed accounts. Please check your connection.
          </p>
          <button
            type="button"
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
      {!loading && !error && accountIds.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>👥</div>
          <h2 className={styles.emptyStateTitle}>No Friends Yet</h2>
          <p className={styles.emptyStateDescription}>
            Start following other readers to see their libraries and reading
            progress
          </p>
          <button
            type="button"
            className={styles.emptyStateButton}
            onClick={() => setShowAddFriendForm(true)}
          >
            Follow Your First Account
          </button>
        </div>
      )}

      {/* Friends List */}
      {!loading && !error && accountIds.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          {accountIds.map((accountId: string) => {
            const library = effectiveFriendLibraries[accountId] || [];
            const stats = effectiveFriendStats[accountId];

            return (
              <FriendCard
                key={accountId}
                account={accountId}
                library={library}
                stats={stats}
                onUnfollow={handleUnfollow}
                onBookClick={(acctId, book) =>
                  setViewingBook({ accountId: acctId, book })
                }
                unfollowLoading={unfollowMutation.isPending}
              />
            );
          })}
        </div>
      )}

      {/* Add Friend Form Modal */}
      {showAddFriendForm && (
        <AddFriendForm
          onClose={() => {
            setShowAddFriendForm(false);
          }}
          onSuccess={handleFollowSuccess}
          demoMode={demoMode}
          demoAccounts={demoAccounts}
          setDemoAccounts={setDemoAccounts}
        />
      )}

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
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
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

export default FriendLibrary;
