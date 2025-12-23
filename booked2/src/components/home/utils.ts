import { BookEntry } from '@/config';

export const getProgressPercentage = (book: BookEntry) => {
  if (!book.total_chapters) return 0;
  return Math.round((book.chapters_read.length / book.total_chapters) * 100);
};

export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, string> = {
    'To Read': 'badge-toread',
    Reading: 'badge-reading',
    Completed: 'badge-completed',
    'On Hold': 'badge-onhold',
    Abandoned: 'badge-abandoned',
  };
  return statusMap[status] || 'badge-onhold';
};
