import { BrowserRouter, Routes, Route } from 'react-router';

import { Navigation } from '@/components/navigation';
import Home from '@/pages/home';
import BookLibrary from '@/pages/book_library';
import FriendLibrary from '@/pages/friend_library';
import NoteEditorPage from '@/pages/note_editor';
import UpdateProgressPage from '@/pages/update_progress';
import ViewAllNotes from '@/pages/view_all_notes';
import { HelloNearContract, NetworkId, BookyContract } from '@/config';

import '@near-wallet-selector/modal-ui/styles.css';

// Wallet setups
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMeteorWalletApp } from '@near-wallet-selector/meteor-wallet-app';
import { setupHotWallet } from '@near-wallet-selector/hot-wallet';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupSender } from '@near-wallet-selector/sender';
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet';
import { WalletSelectorProvider } from '@near-wallet-selector/react-hook';
import { NoteProvider } from '@/contexts';

// Types
import type { WalletModuleFactory } from '@near-wallet-selector/core';

const walletSelectorConfig = {
  network: {
    networkId: NetworkId,
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://app.mynearwallet.com/',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
  },
  debug: true,
  modules: [
    setupMeteorWallet(),
    setupLedger(),
    setupSender(),
    setupNearMobileWallet(),
    setupMeteorWalletApp({ contractId: HelloNearContract }),
    setupHotWallet(),
  ] as WalletModuleFactory[],
} as any;

function App() {
  return (
    <WalletSelectorProvider config={walletSelectorConfig}>
      <NoteProvider>
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book-library" element={<BookLibrary />} />
            <Route path="/friend-library" element={<FriendLibrary />} />
            <Route
              path="/update-progress/:isbn"
              element={<UpdateProgressPage />}
            />
            <Route
              path="/note-editor/:isbn/:chapter"
              element={<NoteEditorPage />}
            />
            <Route path="/view-all-notes/:isbn" element={<ViewAllNotes />} />
          </Routes>
        </BrowserRouter>
      </NoteProvider>
    </WalletSelectorProvider>
  );
}

export default App;
