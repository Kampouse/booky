import { useState, useEffect, useRef } from 'react';
import { useFollowAccount } from '@/lib/useBookyQuery';
import type { FollowedAccount } from '@/utils/types';
import styles from '@/styles/book-library.module.css';

interface AddFriendFormProps {
  onClose: () => void;
  onSuccess: () => void;
  demoMode: boolean;
  demoAccounts: FollowedAccount[];
  setDemoAccounts: React.Dispatch<React.SetStateAction<FollowedAccount[]>>;
}

export const AddFriendForm: React.FC<AddFriendFormProps> = ({
  onClose,
  onSuccess,
  demoMode,
  demoAccounts,
  setDemoAccounts,
}) => {
  const followMutation = useFollowAccount();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [accountId, setAccountId] = useState('');
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
      handleClose();
    } catch (err) {
      setError('Failed to follow account. Please try again.');
      console.error('Error following account:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={handleClose}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      }}
      aria-modal="true"
      aria-labelledby="follow-account-title"
    >
      <div className={styles.dialogContent}>
        <div className={styles.modalHeader}>
          <h2 id="follow-account-title" className={styles.modalTitle}>
            Follow Account
          </h2>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClose();
              }
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div
                className={styles.errorBanner}
                role="alert"
                aria-live="polite"
              >
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
                className={styles.formControl}
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="example.near"
                disabled={loading}
                autoComplete="off"
                aria-describedby="accountId-help"
              />
              <p
                id="accountId-help"
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
              className={styles.buttonSecondary}
              onClick={handleClose}
              type="button"
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
    </dialog>
  );
};
