import { ReactNode } from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface FeatureCardsProps {
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    icon: '📖',
    title: 'Track Reading',
    description: 'Monitor your progress chapter by chapter',
    color: '#d4af37',
  },
  {
    icon: '📝',
    title: 'Chapter Notes',
    description: 'Store thoughts and insights permanently',
    color: '#722f37',
  },
  {
    icon: '🔒',
    title: 'Forever Safe',
    description: 'Your data secured on NEAR blockchain',
    color: '#2d4a3e',
  },
];

const FeatureCards = ({ features = defaultFeatures }: FeatureCardsProps) => {
  return (
    <div className="row justify-content-center g-4">
      {features.map((feature, index) => (
        <div key={index} className="col-md-4">
          <div
            className="paper-card h-100 text-center"
            style={{ borderColor: feature.color }}
          >
            <div
              className="mb-3"
              style={{ fontSize: '50px', opacity: '0.8' }}
            >
              {feature.icon}
            </div>
            <h5
              className="mb-3"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: feature.color,
              }}
            >
              {feature.title}
            </h5>
            <p
              className="text-muted mb-0"
              style={{ fontSize: '0.95rem' }}
            >
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
