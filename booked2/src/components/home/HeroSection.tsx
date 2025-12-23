import { Link } from 'react-router';

interface HeroSectionProps {
  accountId: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ accountId }) => {
  return (
    <div
      className="position-relative py-5"
      style={{
        background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
        color: '#fffff0',
        padding: '6rem 0',
      }}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-7 mb-4 mb-lg-0">
            <h1
              className="mb-4"
              style={{
                fontSize: '3.5rem',
                lineHeight: '1.2',
                color: '#fffff0',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: '600',
              }}
            >
              Welcome to
              <br />
              <span style={{ color: '#a8d5a2' }}>Booky</span>
            </h1>
            <p
              className="mb-5"
              style={{
                fontSize: '1.25rem',
                color: 'rgba(255, 255, 240, 0.85)',
                lineHeight: '1.7',
                maxWidth: '600px',
                fontFamily: "'Lora', Georgia, serif",
              }}
            >
              Your personal book library, forever preserved. Track chapters,
              capture insights, and cherish your reading journey on the
              blockchain.
            </p>
            {!accountId ? (
              <div
                className="alert"
                style={{
                  backgroundColor: 'rgba(255, 255, 240, 0.1)',
                  border: '1px solid rgba(255, 255, 240, 0.3)',
                  borderRadius: '8px',
                  display: 'inline-block',
                  padding: '1rem 1.5rem',
                }}
              >
                <strong style={{ color: '#fffff0' }}>
                  🔗 Connect your wallet
                </strong>{' '}
                <span style={{ color: 'rgba(255, 255, 240, 0.85)' }}>
                  to begin curating your literary collection
                </span>
              </div>
            ) : (
              <div className="d-flex gap-3 flex-wrap">
                <Link
                  to="/book-library"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: '#a8d5a2',
                    border: 'none',
                    color: '#1a2a3a',
                    fontWeight: '600',
                    padding: '0.875rem 2rem',
                    borderRadius: '6px',
                  }}
                >
                  📚 View Your Library
                </Link>
                <Link
                  to="/book-library"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px solid #a8d5a2',
                    color: '#a8d5a2',
                    fontWeight: '600',
                    padding: '0.875rem 2rem',
                    borderRadius: '6px',
                  }}
                >
                  ➕ Add New Book
                </Link>
              </div>
            )}
          </div>
          <div className="col-lg-5 text-center d-none d-lg-block">
            <div
              className="mb-4"
              style={{
                fontSize: '120px',
                color: 'rgba(255, 255, 240, 0.15)',
              }}
            >
              📖
            </div>
            <div
              className="fst-italic"
              style={{
                fontSize: '1.125rem',
                color: 'rgba(255, 255, 240, 0.7)',
                fontWeight: '500',
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              "A room without books is like a body without a soul."
              <br />
              <small
                className="d-block mt-2"
                style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 240, 0.5)',
                }}
              >
                — Cicero
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
