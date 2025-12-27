import type { ReadingStatus, BookEntry, ReadingStats } from '@/config';

export type { ReadingStatus, BookEntry, ReadingStats };

export interface FollowedAccount {
  account_id: string;
  followed_at: string;
}

export interface FollowedAccountDetails {
  account_id: string;
  library: BookEntry[];
  stats: ReadingStats;
}

export interface ViewingBook {
  accountId: string;
  book: BookEntry;
}
