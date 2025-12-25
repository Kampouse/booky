import React from 'react';
import { Link } from 'react-router';
import { BookEntry } from '@/config';

interface NoteEditorHeaderProps {
  demoMode: boolean;
  returnUrl: string;
  accountId: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  book: BookEntry | null;
  chapterNumber: number;
  totalChapters: number;
  chaptersWithNotes: number[];
  onChapterChange: (chapter: number) => void;
}

export const NoteEditorHeader: React.FC<NoteEditorHeaderProps> = ({
  demoMode,
  returnUrl,
  accountId,
  saveStatus,
  book,
  chapterNumber,
  totalChapters,
  chaptersWithNotes,
  onChapterChange,
}) => {
  const returnLink = demoMode ? '/book-library?demo=true' : returnUrl;

  const calculateProgress = (): number => {
    if (!book?.total_chapters || book.total_chapters === 0) return 0;
    const progress = (book.current_chapter / book.total_chapters) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div
      style={{
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid rgba(168, 213, 162, 0.15)',
        backgroundColor: 'rgba(26, 42, 58, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
        className="note-editor-header"
      >
        {/* Left: Back Button */}
        <Link
          to={returnLink}
          className="back-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#a8d5a2',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            fontFamily: '"Lora", Georgia, serif',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onFocus={(e) => {
            e.currentTarget.style.color = '#c5e8c0';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.color = '#a8d5a2';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#c5e8c0';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#a8d5a2';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          ← Back
        </Link>

        {/* Center: Book Info + Chapter Nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: 1,
            justifyContent: 'center',
          }}
          className="header-center-section"
        >
          {/* Book Title & Author */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: 1,
              minWidth: 0,
            }}
            className="book-info"
          >
            <Link
              to={returnLink}
              style={{
                color: '#fffff0',
                textDecoration: 'none',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                fontWeight: '600',
                fontFamily: '"Playfair Display", Georgia, serif',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              className="book-title-link"
              onFocus={(e) => {
                e.currentTarget.style.color = '#c5e8c0';
              }}
              onBlur={(e) => {
                e.currentTarget.style.color = '#fffff0';
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#c5e8c0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#fffff0';
              }}
            >
              {book?.title}
            </Link>
            {book?.author && (
              <span
                style={{
                  color: 'rgba(255, 255, 240, 0.5)',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontFamily: '"Lora", Georgia, serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                className="author-name"
              >
                · {book.author}
              </span>
            )}
          </div>

          {/* Chapter Dropdown */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            className="chapter-nav"
          >
            <select
              value={chapterNumber}
              onChange={(e) => onChapterChange(Number(e.target.value))}
              style={{
                padding: '0.4rem 0.75rem',
                backgroundColor: 'rgba(168, 213, 162, 0.15)',
                border: '1px solid rgba(168, 213, 162, 0.3)',
                borderRadius: '4px',
                color: '#fffff0',
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                fontWeight: '500',
                fontFamily: '"Lora", Georgia, serif',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              className="chapter-select"
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(168, 213, 162, 0.25)';
                e.currentTarget.style.borderColor = '#a8d5a2';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(168, 213, 162, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(168, 213, 162, 0.25)';
                e.currentTarget.style.borderColor = '#a8d5a2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(168, 213, 162, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
              }}
            >
              {Array.from({ length: totalChapters }, (_, i) => i + 1).map(
                (num) => (
                  <option
                    key={num}
                    value={num}
                    style={{
                      backgroundColor: '#1a2a3a',
                      color: '#fffff0',
                    }}
                  >
                    {chaptersWithNotes.includes(num) ? '📝 ' : ''}Chapter {num}
                  </option>
                ),
              )}
            </select>
            <span
              style={{
                color: 'rgba(255, 255, 240, 0.5)',
                fontSize: '0.8rem',
                fontFamily: '"Lora", Georgia, serif',
              }}
              className="chapter-total"
            >
              of {totalChapters}
            </span>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
          className="header-right-section"
        >
          {/* Progress Badge */}
          {book?.total_chapters && book.total_chapters > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.6rem',
                backgroundColor: 'rgba(168, 213, 162, 0.1)',
                border: '1px solid rgba(168, 213, 162, 0.2)',
                borderRadius: '4px',
                color: 'rgba(255, 255, 240, 0.8)',
                fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                fontFamily: '"Lora", Georgia, serif',
                whiteSpace: 'nowrap',
              }}
              className="progress-badge progress-percentage"
            >
              <span
                style={{
                  color: '#a8d5a2',
                  fontWeight: '600',
                }}
              >
                {calculateProgress().toFixed(0)}%
              </span>
              <span style={{ opacity: 0.6 }} className="notes-count">
                · {chaptersWithNotes.length} notes
              </span>
            </div>
          )}

          {/* Update Progress Link */}
          <Link
            to={`/update-progress/${book?.isbn || ''}`}
            className="update-progress-link"
            style={{
              padding: '0.35rem 0.6rem',
              backgroundColor: 'rgba(168, 213, 162, 0.15)',
              border: '1px solid rgba(168, 213, 162, 0.3)',
              borderRadius: '4px',
              color: '#a8d5a2',
              fontSize: '0.75rem',
              fontWeight: '500',
              fontFamily: '"Lora", Georgia, serif',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(168, 213, 162, 0.25)';
              e.currentTarget.style.borderColor = '#a8d5a2';
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(168, 213, 162, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(168, 213, 162, 0.25)';
              e.currentTarget.style.borderColor = '#a8d5a2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(168, 213, 162, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(168, 213, 162, 0.3)';
            }}
          >
            📊 Progress
          </Link>

          {/* Wallet Warning */}
          {!accountId && (
            <div
              className="wallet-warning"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.75rem',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '4px',
                color: '#e8c860',
                fontSize: '0.8rem',
                fontFamily: '"Lora", Georgia, serif',
                whiteSpace: 'nowrap',
              }}
            >
              ⚠️ Connect Wallet
            </div>
          )}

          {/* Save Status */}
          {saveStatus === 'saving' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.75rem',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '4px',
                color: '#e8c860',
                fontSize: '0.8rem',
                fontFamily: '"Lora", Georgia, serif',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                ●
              </span>
              Saving...
            </div>
          )}
        </div>
      </div>

      {/* Pulse animation for saving indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @media (max-width: 768px) {
          .note-editor-header {
            gap: 0.5rem !important;
          }
        }

        @media (max-width: 640px) {
          .note-editor-header {
            flex-direction: row !important;
            align-items: center;
            gap: 0.5rem !important;
          }

          .note-editor-header > div:first-child {
            justify-content: flex-start;
          }

          .note-editor-header > div:nth-child(2) {
            justify-content: center;
            flex: 1;
          }

          .note-editor-header > div:nth-child(3) {
            justify-content: flex-end;
          }
        }

        @media (max-width: 500px) {
          .note-editor-header {
            gap: 0.375rem !important;
          }

          .back-button {
            display: none !important;
          }

          .progress-percentage {
            display: none !important;
          }

          .author-name {
            display: none !important;
          }

          .chapter-total {
            display: none !important;
          }

          .progress-badge .notes-count {
            display: none !important;
          }

          .update-progress-link {
            display: flex !important;
            padding: 0.3rem 0.5rem !important;
            font-size: 0.7rem !important;
          }

          .wallet-warning {
            display: none !important;
          }

          .book-info {
            max-width: 35%;
          }

          .chapter-select {
            padding: 0.3rem 0.6rem !important;
            font-size: 0.75rem !important;
          }

          .book-title-link {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
};
