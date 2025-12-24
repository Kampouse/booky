import { Link } from 'react-router';
import { BookEntry } from '@/config';
import { getProgressPercentage } from './utils';

interface CurrentlyReadingProps {
  currentlyReading: BookEntry[];
}

export const CurrentlyReading: React.FC<CurrentlyReadingProps> = ({
  currentlyReading,
}) => {
  if (currentlyReading.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#1a1a1a',
          }}
        >
          📖 Currently Reading
        </h2>
        <Link
          to="/book-library"
          state={{ filter: 'reading' }}
          className="btn btn-outline-primary"
          style={{ borderColor: '#5c4033', color: '#5c4033' }}
        >
          View All Books →
        </Link>
      </div>
      <div className="row g-4">
        {currentlyReading.slice(0, 3).map((book) => (
          <div key={book.isbn} className="col-md-4">
            <div
              className="paper-card h-100 position-relative"
              style={{ overflow: 'hidden' }}
            >
              {/* Ribbon Bookmark */}
              <div className="ribbon"></div>

              <div className="card-body p-4">
                <h5
                  className="card-title mb-3"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.25rem',
                    lineHeight: '1.3',
                  }}
                >
                  {book.title}
                </h5>
                <p className="text-muted mb-3 fst-italic">by {book.author}</p>
                {book.total_chapters && (
                  <>
                    <div
                      className="progress mb-3"
                      style={{ height: '6px', borderRadius: '3px' }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: `${getProgressPercentage(book)}%`,
                          background:
                            'linear-gradient(90deg, #722f37 0%, #d4af37 100%)',
                        }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <span className="fw-bold" style={{ color: '#d4af37' }}>
                          Chapter {book.current_chapter}
                        </span>{' '}
                        of {book.total_chapters}
                      </small>
                      <span
                        className="badge"
                        style={{
                          background: '#d4af37',
                          color: '#1a1a1a',
                          fontWeight: '600',
                        }}
                      >
                        {getProgressPercentage(book)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
