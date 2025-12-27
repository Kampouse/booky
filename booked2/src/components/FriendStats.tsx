import type { ReadingStats } from '@/utils/types';

interface FriendStatsProps {
  stats: ReadingStats;
}

export const FriendStats: React.FC<FriendStatsProps> = ({ stats }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: 'rgba(168, 213, 162, 0.1)',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1a2a3a',
          }}
        >
          {stats.total_books}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#4a3728',
            opacity: 0.7,
          }}
        >
          Total
        </div>
      </div>
      <div
        style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: 'rgba(212, 175, 55, 0.1)',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1a2a3a',
          }}
        >
          {stats.currently_reading}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#4a3728',
            opacity: 0.7,
          }}
        >
          Reading
        </div>
      </div>
      <div
        style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: 'rgba(168, 213, 162, 0.15)',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1a2a3a',
          }}
        >
          {stats.completed}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#4a3728',
            opacity: 0.7,
          }}
        >
          Done
        </div>
      </div>
      <div
        style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: 'rgba(74, 55, 40, 0.1)',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1a2a3a',
          }}
        >
          {stats.to_read}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#4a3728',
            opacity: 0.7,
          }}
        >
          To Read
        </div>
      </div>
    </div>
  );
};
