import { useState, useEffect, useRef } from 'react';
import { BookEntry } from '@/config';
import { useBookyContract } from '@/lib/bookyContract';
import styles from '@/styles/book-library.module.css';

interface AddBookFormProps {
  onClose: () => void;
  onSuccess: () => void;
  demoMode?: boolean;
  demoBooks?: BookEntry[];
  setDemoBooks?: React.Dispatch<React.SetStateAction<BookEntry[]>>;
}

const AddBookForm: React.FC<AddBookFormProps> = ({
  onClose,
  onSuccess,
  demoMode = false,
  demoBooks = [],
  setDemoBooks,
}) => {
  const { addBook } = useBookyContract();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<BookEntry>>({
    isbn: '',
    title: '',
    author: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    condition: 'Good',
    personal_comments: '',
    media_hash: null,
    reading_status: 'ToRead',
    current_chapter: 0,
    total_chapters: 1,
    chapters_read: [],
    last_read_position: '0',
    last_read_date: null,
    chapter_notes: {},
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.isbn || !formData.title || !formData.author) {
      setError('ISBN, Title, and Author are required fields');
      return;
    }

    if (!formData.total_chapters || formData.total_chapters < 1) {
      setError('Total Chapters is required and must be at least 1');
      return;
    }

    try {
      setLoading(true);
      const bookData: BookEntry = {
        isbn: formData.isbn!,
        title: formData.title!,
        author: formData.author!,
        acquisition_date:
          formData.acquisition_date || new Date().toISOString().split('T')[0],
        condition: formData.condition || 'Good',
        personal_comments: formData.personal_comments || '',
        media_hash: formData.media_hash || null,
        reading_status: formData.reading_status || 'ToRead',
        current_chapter: Number(formData.current_chapter) || 0,
        total_chapters: Number(formData.total_chapters)!,
        chapters_read: [],
        last_read_position: formData.last_read_position || '0',
        last_read_date: formData.last_read_date || null,
        chapter_notes: {},
      };

      if (demoMode && setDemoBooks) {
        // In demo mode, add to local state
        setDemoBooks([...demoBooks, bookData]);
      } else {
        // Normal mode: call blockchain
        await addBook(bookData);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError('Failed to add book. Please try again.');
      console.error('Error adding book:', err);
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
      aria-modal="true"
      aria-labelledby="add-book-title"
    >
      <div className={styles.dialogContent}>
        <div className={styles.modalHeader}>
          <h2 id="add-book-title" className={styles.modalTitle}>
            Add New Book
          </h2>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={handleClose}
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

            {/* ISBN */}
            <div className={styles.formGroup}>
              <label htmlFor="isbn" className={styles.formLabel}>
                ISBN *
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                className={styles.formControl}
                placeholder="e.g., 978-3-16-148410-0"
                required
                autoComplete="off"
              />
            </div>

            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.formLabel}>
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.formControl}
                placeholder="Enter book title"
                required
                autoComplete="off"
              />
            </div>

            {/* Author */}
            <div className={styles.formGroup}>
              <label htmlFor="author" className={styles.formLabel}>
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={styles.formControl}
                placeholder="Enter author name"
                required
                autoComplete="off"
              />
            </div>

            {/* Acquisition Date and Total Chapters */}
            <div className={styles.formRow}>
              <div className={styles.formGroupHalf}>
                <label htmlFor="acquisition_date" className={styles.formLabel}>
                  Acquisition Date
                </label>
                <input
                  type="date"
                  id="acquisition_date"
                  name="acquisition_date"
                  value={formData.acquisition_date}
                  onChange={handleInputChange}
                  className={styles.formControl}
                />
              </div>
              <div className={styles.formGroupHalf}>
                <label htmlFor="total_chapters" className={styles.formLabel}>
                  Total Chapters *
                </label>
                <input
                  type="number"
                  id="total_chapters"
                  name="total_chapters"
                  value={formData.total_chapters}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="e.g., 12"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Personal Comments */}
            <div className={styles.formGroup}>
              <label htmlFor="personal_comments" className={styles.formLabel}>
                Personal Comments
              </label>
              <textarea
                id="personal_comments"
                name="personal_comments"
                value={formData.personal_comments}
                onChange={handleInputChange}
                className={styles.formControlText}
                placeholder="Add your thoughts about this book..."
                rows={3}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.buttonSecondary}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={loading}
            >
              {loading ? 'Adding Book...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddBookForm;
