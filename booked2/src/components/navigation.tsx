import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useWalletSelector } from '@near-wallet-selector/react-hook';

interface WalletSelectorHook {
  signedAccountId: string | null;
  signIn: () => void;
  signOut: () => void;
}

export const Navigation = () => {
  const { signedAccountId, signIn, signOut } =
    useWalletSelector() as WalletSelectorHook;

  const [action, setAction] = useState<() => void>(() => () => {});
  const [label, setLabel] = useState<string>('Loading...');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (signedAccountId) {
      setAction(() => signOut);
      setLabel('Disconnect');
    } else {
      setAction(() => signIn);
      setLabel('Connect Wallet');
    }
  }, [signedAccountId, signIn, signOut]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`navbar navbar-expand-lg sticky-top transition-all ${
        isScrolled ? 'shadow-lg' : ''
      }`}
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        letterSpacing: '0.02em',
        background: isScrolled
          ? 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)'
          : 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
        padding: isScrolled ? '0.75rem 0' : '1.25rem 0',
        transition: 'all 0.3s ease',
        boxShadow: isScrolled
          ? '0 4px 20px rgba(45, 74, 62, 0.4)'
          : '0 2px 10px rgba(45, 74, 62, 0.2)',
      }}
    >
      <div className="container">
        {/* Brand Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: '1.75rem',
            color: '#fffff0',
            letterSpacing: '-0.01em',
          }}
        >
          <span
            style={{
              fontSize: '2rem',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
            }}
          >
            📚
          </span>
          <span className="d-flex flex-column">
            <span style={{ lineHeight: 1, marginBottom: '2px' }}>Booky</span>
            <span
              style={{
                fontSize: '0.5rem',
                fontWeight: 400,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                opacity: 0.8,
                lineHeight: 1,
              }}
            >
              Literary Library
            </span>
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            color: '#fffff0',
            padding: '0.5rem 0.75rem',
          }}
        >
          {isMobileMenuOpen ? (
            <span style={{ fontSize: '1.5rem' }}>✕</span>
          ) : (
            <span style={{ fontSize: '1.5rem' }}>☰</span>
          )}
        </button>

        {/* Navigation Links */}
        <div
          className={`collapse navbar-collapse ${
            isMobileMenuOpen ? 'show' : ''
          }`}
        >
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {[
              { path: '/', label: 'Home', icon: '🏠' },
              { path: '/book-library', label: 'My Library', icon: '📖' },
              { path: '/friend-library', label: 'Friend Library', icon: '👥' },
            ].map((link) => (
              <li className="nav-item" key={link.label}>
                <Link
                  to={link.path}
                  className="nav-link d-flex align-items-center gap-2"
                  onClick={handleNavClick}
                  style={{
                    color: '#fffff0',
                    fontWeight: 500,
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Wallet Section */}
          <div className="d-flex align-items-center gap-3">
            {signedAccountId && (
              <div
                className="d-none d-md-block text-end"
                style={{ minWidth: '120px' }}
              >
                <small
                  style={{
                    color: 'rgba(255, 255, 240, 0.7)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Connected as
                </small>
                <div
                  className="fw-bold"
                  style={{
                    color: '#a8d5a2',
                    fontSize: '0.875rem',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    letterSpacing: '0.02em',
                  }}
                >
                  {truncateAddress(signedAccountId)}
                </div>
              </div>
            )}
            <button
              className="btn"
              onClick={action}
              style={{
                background: signedAccountId
                  ? 'transparent'
                  : 'linear-gradient(135deg, #a8d5a2 0%, #7da87b 100%)',
                border: signedAccountId
                  ? '2px solid rgba(255, 255, 240, 0.4)'
                  : 'none',
                color: signedAccountId ? '#fffff0' : '#1a2a3a',
                fontWeight: 600,
                padding: '0.625rem 1.25rem',
                borderRadius: '6px',
                letterSpacing: '0.02em',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!signedAccountId) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(168, 213, 162, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!signedAccountId) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {signedAccountId && (
                <span className="me-2" style={{ fontSize: '1rem' }}>
                  🔌
                </span>
              )}
              {label}
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div
        style={{
          height: '2px',
          background:
            'linear-gradient(90deg, transparent 0%, #a8d5a2 50%, transparent 100%)',
          opacity: 0.5,
        }}
      ></div>

      <style>{`
        .nav-link:hover {
          background: rgba(168, 213, 162, 0.15) !important;
          color: #a8d5a2 !important;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: '2px';
          background: #a8d5a2;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .nav-link:hover::after {
          width: 80%;
        }

        .navbar-brand:hover {
          color: #a8d5a2 !important;
        }

        @media (max-width: 991px) {
          .navbar-collapse {
            background: linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%);
            padding: 1rem 0;
            margin-top: 1rem;
            border-radius: 8px;
            border: 1px solid rgba(168, 213, 162, 0.25);
            box-shadow: 0 8px 24px rgba(45, 74, 62, 0.5);
          }

          .nav-link {
            padding: 0.75rem 1rem !important;
            color: #fffff0;
          }
        }
      `}</style>
    </nav>
  );
};
