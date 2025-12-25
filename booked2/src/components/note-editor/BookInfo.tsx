import React from 'react';
import { BookEntry } from '@/config';

interface BookInfoProps {
  book: BookEntry | null;
  chapterNumber: number;
}

export const BookInfo: React.FC<BookInfoProps> = ({
  book,
  chapterNumber,
}) => {
  const chaptersWithNotes = Object.keys(book?.chapter_notes || {})
    .map(Number)
    .sort((a, b) => a - b);

  const calculateProgress = (): number => {
    if (!book?.total_chapters || book.total_chapters === 0) return 0;
    const progress = (book.current_chapter / book.total_chapters) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div>
      <h1
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          color: '#fffff0',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: '600',
          marginBottom: '0.5rem',
        }}
      >
        {book?.title}
      </h1>
      <p
        style={{
          color: 'rgba(255, 255, 240, 0.7)',
          fontSize: '1rem',
          fontFamily: '"Lora", Georgia, serif',
          marginBottom: '1rem',
        }}
      >
        {book?.author}
      </p>

      {/* Progress */}
      {book?.total_chapters && book.total_chapters > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                height: '8px',
                width: '120px',
                backgroundColor: 'rgba(168, 213, 162, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${calculateProgress()}%`,
                  background:
                    'linear-gradient(90deg, #3d6b5a 0%, #a8d5a2 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <span
              style={{
                color: 'rgba(255, 255, 240, 0.8)',
                fontSize: '0.9rem',
                fontFamily: '"Lora", Georgia, serif',
              }}
            >
              {calculateProgress().toFixed(0)}%
            </span>
          </div>

          <div
            style={{
              color: 'rgba(255, 255, 240, 0.7)',
              fontSize: '0.9rem',
              fontFamily: '"Lora", Georgia, serif',
            }}
          >
            Chapter {chapterNumber} · {chaptersWithNotes.length} notes total
          </div>
        </div>
      )}
    </div>
  );
};
