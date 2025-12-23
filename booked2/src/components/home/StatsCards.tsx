import React from 'react';

interface StatsCardsProps {
  stats: {
    total_books: number;
    currently_reading: number;
    completed: number;
    to_read: number;
  } | null;
}

const statsData = [
  {
    label: 'Total Books',
    valueKey: 'total_books',
    icon: '📚',
    color: '#5c4033',
    bg: 'rgba(92, 64, 51, 0.1)',
  },
  {
    label: 'Currently Reading',
    valueKey: 'currently_reading',
    icon: '📖',
    color: '#d4af37',
    bg: 'rgba(212, 175, 55, 0.1)',
  },
  {
    label: 'Completed',
    valueKey: 'completed',
    icon: '✅',
    color: '#2d4a3e',
    bg: 'rgba(45, 74, 62, 0.1)',
  },
  {
    label: 'To Read',
    valueKey: 'to_read',
    icon: '📋',
    color: '#6b5b95',
    bg: 'rgba(107, 91, 149, 0.1)',
  },
];

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="row g-4 mb-5 fade-in">
      {statsData.map((stat) => (
        <div key={stat.valueKey} className="col-md-3 col-6">
          <div
            className="paper-card h-100"
            style={{
              borderColor: stat.color,
              padding: '1.5rem',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  background: stat.bg,
                  fontSize: '24px',
                }}
              >
                {stat.icon}
              </div>
              <span
                className="badge"
                style={{
                  background: stat.color,
                  color: '#fffff0',
                  fontSize: '0.7rem',
                }}
              >
                {stat.label.toUpperCase().replace(' ', '')}
              </span>
            </div>
            <h3
              className="mb-0 fw-bold"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: stat.color,
                fontSize: '2.5rem',
              }}
            >
              {stats[stat.valueKey as keyof typeof stats]}
            </h3>
            <small
              className="text-muted"
              style={{
                fontFamily: "Source Sans Pro', sans-serif",
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {stat.label}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};
