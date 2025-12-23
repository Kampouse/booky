const contractPerNetwork = {
  mainnet: 'booky.near',
  testnet: 'booky.testnet',
};

export const NetworkId = 'testnet';
export const HelloNearContract = contractPerNetwork[NetworkId];
export const BookyContract = contractPerNetwork[NetworkId];

// Contract Types
export type ReadingStatus =
  | 'ToRead'
  | 'Reading'
  | 'Completed'
  | 'OnHold'
  | 'Abandoned';

export interface BookEntry {
  isbn: string;
  title: string;
  author: string;
  acquisition_date: string;
  condition: string;
  personal_comments: string;
  media_hash: string | null;
  reading_status: ReadingStatus;
  current_chapter: number;
  total_chapters: number | null;
  chapters_read: number[];
  last_read_position: string;
  last_read_date: string | null;
  chapter_notes: Record<number, string>;
}

export interface ProgressUpdate {
  current_chapter: number | null;
  chapters_completed: number[];
  last_read_position: string | null;
  last_read_date: string | null;
  reading_status: ReadingStatus | null;
}

export interface ReadingStats {
  total_books: number;
  currently_reading: number;
  completed: number;
  to_read: number;
  on_hold: number;
}
