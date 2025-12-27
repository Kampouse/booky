const contractPerNetwork = {
  mainnet: 'jemartel.near',
  testnet: 'booky.testnet',
};

// Get network from localStorage or default to mainnet
export const getNetworkId = (): 'mainnet' | 'testnet' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('booky_network');
    return stored === 'mainnet' || stored === 'testnet' ? stored : 'mainnet';
  }
  return 'mainnet';
};

export const setNetworkId = (network: 'mainnet' | 'testnet') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('booky_network', network);
  }
};

export const NetworkId = getNetworkId();

// Network configurations
export const NetworkConfigs = {
  mainnet: {
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://app.mynearwallet.com/',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
  },
  testnet: {
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://app.testnet.near.org/',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
  },
};

export const NetworkConfig = NetworkConfigs[NetworkId];

export const HelloNearContract = contractPerNetwork[NetworkId];
export const BookyContract = contractPerNetwork[NetworkId];

// Helper function to switch networks
export const switchNetwork = (network: 'mainnet' | 'testnet') => {
  setNetworkId(network);
  // Force page reload to apply new network
  window.location.reload();
};

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
  total_chapters: number;
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
