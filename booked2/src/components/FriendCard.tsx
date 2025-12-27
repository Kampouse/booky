import { useState } from 'react';
import styles from '@/styles/book-library.module.css';
import type { FollowedAccount, BookEntry, ReadingStats } from '@/utils/types';
import { FriendStats } from './FriendStats';
import { BookListItem } from './BookListItem';
import { UnfriendConfirmationModal } from './UnfriendConfirmationModal';
import { truncateAddress, formatDate } from '@/utils/formatters';

interface FriendCardProps {
  account: FollowedAccount | string;
  library: BookEntry[];
  stats: ReadingStats | null;
  onUnfollow: (accountId: string) => Promise<void> | void;
  onBookClick: (accountId: string, book: BookEntry) => void;
  unfollowLoading?: boolean;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  account,
  library,
  stats,
  onUnfollow,
  onBookClick,
  unfollowLoading = false,
}) => {
  const accountId = typeof account === 'string' ? account : account.account_id;
  const followedAt =
    typeof account === 'string'
      ? new Date().toISOString()
      : account.followed_at;
  const bookCount = library.length;
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [unfollowError, setUnfollowError] = useState<string | null>(null);

  const handleUnfollowClick = () => {
    setUnfollowError(null);
    setShowUnfollowModal(true);
  };

  const handleUnfollowConfirm = async () => {
    try {
      await onUnfollow(accountId);
    } catch {
      setUnfollowError('Failed to unfollow. Please try again.');
    }
  };

  return (
    <div className={styles.bookCard} style={{ position: 'relative' }}>
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
            background: 'linear-gradient(135deg, #a8d5a2 0%, #7da87b 100%)',
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
          type="button"
          className={styles.buttonSecondary}
          onClick={handleUnfollowClick}
          disabled={unfollowLoading}
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
      {stats && <FriendStats stats={stats} />}

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
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            {library.slice(0, 3).map((book) => (
              <BookListItem
                key={book.isbn}
                book={book}
                onClick={() => onBookClick(accountId, book)}
              />
            ))}
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

      {/* Unfollow Confirmation Modal */}
      {showUnfollowModal && (
        <UnfriendConfirmationModal
          accountId={accountId}
          onClose={() => {
            setShowUnfollowModal(false);
            setUnfollowError(null);
          }}
          onConfirm={handleUnfollowConfirm}
          loading={unfollowLoading}
          error={unfollowError}
        />
      )}
    </div>
  );
};
