import { Link } from 'react-router';
import { BookEntry } from '@/config';
import { getStatusBadge } from './utils';

interface RecentBooksProps {
  books: BookEntry[];
}

export const RecentBooks = ({ books }: RecentBooksProps) => {
  if (books.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#1a1a1a',
          }}
        >
          📚 Recently Added
        </h2>
        <Link
          to="/book-library"
          className="btn btn-outline-primary"
          style={{ borderColor: '#5c4033', color: '#5c4033' }}
        >
          View All Books →
        </Link>
      </div>
      <div className="row g-4">
        {books.map((book) => (
          <div key={book.isbn} className="col-md-4">
            <div
              className="paper-card h-100"
              style={{ borderColor: '#8b7355' }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5
                    className="card-title mb-0"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '1.125rem',
                      lineHeight: '1.4',
                      flex: 1,
                    }}
                  >
                    {book.title}
                  </h5>
                </div>
                <div className="mb-3">
                  <span
                    className={`badge ${getStatusBadge(book.reading_status)}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {book.reading_status}
                  </span>
                </div>
                <p className="text-muted mb-2 fst-italic">by {book.author}</p>
                <div className="d-flex gap-3 text-muted small">
                  <span>📅 {book.acquisition_date}</span>
                  <span>✓ {book.condition}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
