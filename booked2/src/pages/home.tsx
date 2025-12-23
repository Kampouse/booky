import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useBookyContract } from '@/lib/bookyContract';
import { BookEntry } from '@/config';
import {
  LoadingState,
  HeroSection,
  FeatureCards,
  StatsCards,
  CurrentlyReading,
  RecentBooks,
  QuickActions,
  ReadingTips,
  Footer,
} from '@/components/home';

const Home = () => {
  const { accountId, getLibrary, getCurrentlyReading, getReadingStats } =
    useBookyContract();

  const [recentBooks, setRecentBooks] = useState<BookEntry[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<BookEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountId) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [accountId]);

  const loadDashboard = async () => {
    setError(null);
    try {
      setLoading(true);

      // Load sequentially to avoid overwhelming RPC providers
      let library: BookEntry[] = [];
      let reading: BookEntry[] = [];
      let statsData: any = null;

      try {
        library = await getLibrary();
      } catch (err) {
        console.error('Error loading library:', err);
        setError('Could not load your library. Please check your connection.');
      }

      try {
        reading = await getCurrentlyReading();
      } catch (err) {
        console.error('Error loading currently reading:', err);
        if (!error)
          setError(
            'Could not load reading progress. Please check your connection.',
          );
      }

      try {
        statsData = await getReadingStats();
      } catch (err) {
        console.error('Error loading stats:', err);
        if (!error)
          setError('Could not load statistics. Please check your connection.');
      }

      // Get last 3 recent books
      const recent = library.slice(-3).reverse();
      setRecentBooks(recent);
      setCurrentlyReading(reading);
      setStats(statsData);
    } catch (error) {
      console.error('Unexpected error loading dashboard:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Hero Section - Literary Style */}
      <HeroSection accountId={accountId} />

      {accountId && (
        <div className="container my-5">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                border: '1px solid var(--burgundy, #722f37)',
                borderRadius: '8px',
                marginBottom: '2rem',
              }}
            >
              <p
                style={{
                  fontSize: '1.125rem',
                  marginBottom: '1rem',
                  color: 'var(--ink-dark, #1a1a1a)',
                }}
              >
                {error}
              </p>
              <button
                onClick={loadDashboard}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--burgundy, #722f37)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Statistics Section - Elegant Cards */}
              <StatsCards stats={stats} />

              {/* Currently Reading Section */}
              <CurrentlyReading currentlyReading={currentlyReading} />

              {/* Recent Books Section */}
              <RecentBooks books={recentBooks} />

              {/* Quick Actions Section */}
              <QuickActions />

              {/* Reading Tips Section - Elegant Cards */}
            </>
          )}
        </div>
      )}

      {/* Footer - Literary Style */}
      <Footer />
    </div>
  );
};

export default Home;
