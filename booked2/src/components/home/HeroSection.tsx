import { Link } from 'react-router';
import { useWalletSelector } from '@near-wallet-selector/react-hook';

interface WalletSelectorHook {
  signIn: () => void;
}

interface HeroSectionProps {
  accountId: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ accountId }) => {
  const { signIn } = useWalletSelector() as WalletSelectorHook;

  return (
    <div
      className="position-relative d-flex align-items-center"
      style={{
        background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
        color: '#fffff0',
        minHeight: '100vh',
        padding: '4rem 0',
        overflow: 'hidden',
      }}
    >
      {/* Decorative top border */}
      <div
        className="position-absolute top-0 left-0 w-100"
        style={{
          height: '4px',
          background:
            'linear-gradient(90deg, transparent 0%, #a8d5a2 20%, #a8d5a2 80%, transparent 100%)',
        }}
      />

      <div
        className="position-absolute w-100 h-100"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(45, 74, 62, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row align-items-center justify-content-center">
          <div className="col-lg-6 col-xl-5 text-center text-lg-start">
            {/* Decorative quote mark */}
            <div
              className="mb-3 d-none d-lg-block"
              style={{
                fontSize: '60px',
                color: 'rgba(168, 213, 162, 0.15)',
                fontFamily: "'Playfair Display', Georgia, serif",
                lineHeight: '1',
              }}
            ></div>

            <h1
              className="mb-4"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                lineHeight: '1.15',
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
              className="mb-5 mx-auto mx-lg-0"
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'rgba(255, 255, 240, 0.9)',
                lineHeight: '1.8',
                maxWidth: '650px',
                fontFamily: "'Lora', Georgia, serif",
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              }}
            >
              Your personal book library, forever preserved. Track chapters,
              capture insights, and cherish your reading journey on the
              blockchain.
            </p>

            {!accountId ? (
              <div
                className="alert mx-auto mx-lg-0"
                style={{
                  backgroundColor: 'rgba(255, 255, 240, 0.08)',
                  border: '1px solid rgba(168, 213, 162, 0.25)',
                  borderRadius: '12px',
                  display: 'inline-block',
                  padding: '1.25rem 2rem',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  userSelect: 'none',
                }}
                onClick={signIn}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(255, 255, 240, 0.12)';
                  e.currentTarget.style.borderColor =
                    'rgba(168, 213, 162, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 15px rgba(168, 213, 162, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(255, 255, 240, 0.08)';
                  e.currentTarget.style.borderColor =
                    'rgba(168, 213, 162, 0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <strong style={{ color: '#a8d5a2' }}>
                  🔗 Connect your wallet
                </strong>{' '}
                <span style={{ color: 'rgba(255, 255, 240, 0.9)' }}>
                  to begin curating your literary collection
                </span>
              </div>
            ) : (
              <div className="d-flex gap-3 flex-wrap justify-content-center justify-content-lg-start">
                <Link
                  to="/book-library"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: '#a8d5a2',
                    border: 'none',
                    color: '#1a2a3a',
                    fontWeight: '600',
                    padding: '1rem 2.5rem',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 15px rgba(168, 213, 162, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 20px rgba(168, 213, 162, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 15px rgba(168, 213, 162, 0.3)';
                  }}
                >
                  View Your Library
                </Link>
                <Link
                  to="/book-library"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px solid #a8d5a2',
                    color: '#a8d5a2',
                    fontWeight: '600',
                    padding: '1rem 2.5rem',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'rgba(168, 213, 162, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  ➕ Add New Book
                </Link>
              </div>
            )}
          </div>

          <div className="col-lg-6 col-xl-7 text-center mt-5 mt-lg-0">
            {/* Decorative book stack */}
            <div
              className="position-relative d-inline-block"
              style={{
                fontSize: 'clamp(150px, 25vw, 200px)',
                color: 'rgba(255, 255, 240, 0.12)',
                lineHeight: '1',
              }}
            ></div>

            <div
              className="fst-italic mt-4"
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                color: 'rgba(255, 255, 240, 0.75)',
                fontWeight: '500',
                fontFamily: '"Playfair Display", Georgia, serif',
                maxWidth: '500px',
                margin: '0 auto',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}
            >
              "A room without books is like a body without a soul."
              <br />
              <small
                className="d-block mt-3"
                style={{
                  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                  color: 'rgba(255, 255, 240, 0.55)',
                }}
              >
                — Cicero
              </small>
            </div>

            {/* Decorative bottom line */}
            <div
              className="mt-5 mx-auto"
              style={{
                width: '100px',
                height: '2px',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(168, 213, 162, 0.5) 50%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
