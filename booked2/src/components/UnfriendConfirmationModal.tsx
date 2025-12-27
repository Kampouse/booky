import { useEffect, useRef } from 'react';
import styles from '@/styles/book-library.module.css';

interface UnfriendConfirmationModalProps {
  accountId: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}

export const UnfriendConfirmationModal: React.FC<
  UnfriendConfirmationModalProps
> = ({ accountId, onClose, onConfirm, loading = false, error = null }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

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

  // Handle confirm action
  const handleConfirm = async () => {
    try {
      await onConfirm();
      handleClose();
    } catch {
      // Error will be handled via the error prop from parent
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
      aria-labelledby="unfriend-confirm-title"
      aria-describedby="unfriend-confirm-description"
    >
      <div className={styles.dialogContent}>
        <div className={styles.modalHeader}>
          <h2 id="unfriend-confirm-title" className={styles.modalTitle}>
            Unfollow Account
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

        <div className={styles.modalBody}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '1rem 0',
            }}
          >
            {/* Warning Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(231, 76, 60, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                border: '2px solid rgba(231, 76, 60, 0.2)',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e74c3c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>

            <p
              id="unfriend-confirm-description"
              style={{
                fontSize: '1.125rem',
                color: '#1a2a3a',
                margin: '0 0 0.5rem 0',
                fontWeight: 600,
              }}
            >
              Are you sure you want to unfollow this account?
            </p>

            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontWeight: 600,
                color: '#2d4a3e',
                wordBreak: 'break-all',
              }}
            >
              {accountId}
            </div>

            {/* Error Banner */}
            {error && (
              <div
                className={styles.errorBanner}
                role="alert"
                aria-live="polite"
                style={{
                  marginBottom: '1rem',
                  backgroundColor: 'rgba(231, 76, 60, 0.1)',
                  borderColor: '#e74c3c',
                  color: '#e74c3c',
                }}
              >
                {error}
              </div>
            )}

            <p
              style={{
                fontSize: '0.875rem',
                color: '#4a3728',
                opacity: 0.8,
                margin: '0',
              }}
            >
              This action cannot be undone. You'll need to follow this account
              again to see their books and reading progress.
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
            type="button"
            className={styles.buttonPrimary}
            onClick={handleConfirm}
            disabled={loading}
            style={{
              backgroundColor: '#e74c3c',
              borderColor: '#e74c3c',
            }}
          >
            {loading ? 'Unfollowing...' : error ? 'Retry' : 'Unfollow Account'}
          </button>
        </div>
      </div>
    </dialog>
  );
};
