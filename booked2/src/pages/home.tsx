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

  useEffect(() => {
    if (accountId) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [accountId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [library, reading, statsData] = await Promise.all([
        getLibrary(),
        getCurrentlyReading(),
        getReadingStats(),
      ]);

      // Get last 3 recent books
      const recent = library.slice(-3).reverse();
      setRecentBooks(recent);
      setCurrentlyReading(reading);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
              <ReadingTips />
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
