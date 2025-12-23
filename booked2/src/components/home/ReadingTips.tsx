import React from 'react';

interface Tip {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface ReadingTipsProps {
  tips?: Tip[];
}

const defaultTips: Tip[] = [
  {
    icon: '📝',
    title: 'Take Notes',
    description:
      'Capture profound insights and memorable quotes in your chapter notes',
    color: '#722f37',
  },
  {
    icon: '🎯',
    title: 'Set Goals',
    description:
      'Track progress chapter by chapter to maintain your reading momentum',
    color: '#d4af37',
  },
  {
    icon: '🔄',
    title: 'Update Often',
    description:
      'Regular updates keep your literary journey accurate and meaningful',
    color: '#2d4a3e',
  },
];

export const ReadingTips: React.FC<ReadingTipsProps> = ({
  tips = defaultTips,
}) => {
  return (
    <div className="paper-card mb-5">
      <div className="card-body p-5">
        <h3
          className="mb-5 text-center"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#1a1a1a',
          }}
        >
          💡 Literary Wisdom
        </h3>
        <div className="row g-4">
          {tips.map((tip, index) => (
            <div key={index} className="col-md-4">
              <div
                className="d-flex align-items-start gap-3"
                style={{ padding: '1rem' }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '45px',
                    height: '45px',
                    background: tip.color + '15',
                    fontSize: '20px',
                  }}
                >
                  {tip.icon}
                </div>
                <div>
                  <h5
                    className="mb-2"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: tip.color,
                      fontSize: '1.125rem',
                    }}
                  >
                    {tip.title}
                  </h5>
                  <p
                    className="text-muted mb-0 small"
                    style={{ lineHeight: '1.6', fontSize: '0.9rem' }}
                  >
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingTips;
