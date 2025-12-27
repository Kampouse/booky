import { useState, useCallback } from 'react';
import { FollowedAccount, BookEntry, ReadingStats } from '@/utils/types';

export const useDemoData = () => {
  const [demoAccounts, setDemoAccounts] = useState<FollowedAccount[]>([]);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoFriendLibraries, setDemoFriendLibraries] = useState<
    Record<string, BookEntry[]>
  >({});
  const [demoFriendStats, setDemoFriendStats] = useState<
    Record<string, ReadingStats>
  >({});

  const loadDemoAccounts = useCallback(() => {
    setDemoLoading(true);
    setDemoError(null);

    // Mock followed accounts data
    const mockData: FollowedAccount[] = [
      {
        account_id: 'alice.near',
        followed_at: '2024-01-15T10:30:00.000Z',
      },
      {
        account_id: 'bob.testnet',
        followed_at: '2024-02-20T14:45:00.000Z',
      },
      {
        account_id: 'charlie.near',
        followed_at: '2024-03-10T09:15:00.000Z',
      },
    ];

    // Mock friend libraries and stats
    const mockLibraries: Record<string, BookEntry[]> = {
      'alice.near': [
        {
          isbn: '978-0-261-10335-7',
          title: 'The Pragmatic Programmer',
          author: 'Andrew Hunt and David Thomas',
          acquisition_date: '2024-01-10',
          condition: 'Good',
          personal_comments: 'Must read for developers',
          media_hash: null,
          reading_status: 'Completed',
          current_chapter: 12,
          total_chapters: 12,
          chapters_read: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          last_read_position: 'Finished',
          last_read_date: '2024-02-15T10:30:00.000Z',
          chapter_notes: {
            1: 'Great introduction about practical programming.',
            3: 'The broken windows concept applies well to technical debt.',
            7: 'Learned about tracer bullets for development.',
            12: 'Finished! This book changed my perspective.',
          },
        },
        {
          isbn: '978-0-13-235088-4',
          title: 'Clean Code',
          author: 'Robert C. Martin',
          acquisition_date: '2024-02-01',
          condition: 'Like New',
          personal_comments: 'Classic software engineering book',
          media_hash: null,
          reading_status: 'Reading',
          current_chapter: 5,
          total_chapters: 17,
          chapters_read: [1, 2, 3, 4],
          last_read_position: 'Chapter 5',
          last_read_date: new Date().toISOString(),
          chapter_notes: {
            1: 'Meaningful names are crucial.',
            2: 'Functions should be small.',
            4: 'Comments should explain WHY.',
            5: 'Working on error handling patterns.',
          },
        },
      ],
      'bob.testnet': [
        {
          isbn: '978-0-201-63361-0',
          title: 'Design Patterns',
          author: 'Erich Gamma et al.',
          acquisition_date: '2024-03-01',
          condition: 'New',
          personal_comments: 'Learning patterns systematically',
          media_hash: null,
          reading_status: 'ToRead',
          current_chapter: 0,
          total_chapters: 4,
          chapters_read: [],
          last_read_position: '0',
          last_read_date: null,
          chapter_notes: {},
        },
      ],
      'charlie.near': [
        {
          isbn: '978-0-321-12521-7',
          title: 'Refactoring',
          author: 'Martin Fowler',
          acquisition_date: '2024-03-05',
          condition: 'Good',
          personal_comments: 'Essential for code quality',
          media_hash: null,
          reading_status: 'Reading',
          current_chapter: 3,
          total_chapters: 9,
          chapters_read: [1, 2],
          last_read_position: 'Chapter 3',
          last_read_date: new Date().toISOString(),
          chapter_notes: {
            1: 'Introduction to refactoring principles.',
            2: 'The two hats principle.',
            3: 'Bad smells in code.',
          },
        },
      ],
    };

    const mockStats: Record<string, ReadingStats> = {
      'alice.near': {
        total_books: 2,
        currently_reading: 1,
        completed: 1,
        to_read: 0,
        on_hold: 0,
      },
      'bob.testnet': {
        total_books: 1,
        currently_reading: 0,
        completed: 0,
        to_read: 1,
        on_hold: 0,
      },
      'charlie.near': {
        total_books: 1,
        currently_reading: 1,
        completed: 0,
        to_read: 0,
        on_hold: 0,
      },
    };

    setDemoAccounts(mockData);
    setDemoFriendLibraries(mockLibraries);
    setDemoFriendStats(mockStats);
    setDemoLoading(false);
  }, []);

  return {
    demoAccounts,
    demoLoading,
    demoError,
    demoFriendLibraries,
    demoFriendStats,
    loadDemoAccounts,
    setDemoAccounts,
  };
};
