import { BrowserRouter, Routes, Route } from 'react-router';

import { Navigation } from '@/components/navigation';
import Home from '@/pages/home';
import BookLibrary from '@/pages/book_library';
import NoteEditorPage from '@/pages/note_editor';
import UpdateProgressPage from '@/pages/update_progress';
import { HelloNearContract, NetworkId, BookyContract } from '@/config';

import '@near-wallet-selector/modal-ui/styles.css';

// Wallet setups
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMeteorWalletApp } from '@near-wallet-selector/meteor-wallet-app';
import { setupHotWallet } from '@near-wallet-selector/hot-wallet';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupSender } from '@near-wallet-selector/sender';
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet';
import { setupWelldoneWallet } from '@near-wallet-selector/welldone-wallet';
import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import { setupBitgetWallet } from '@near-wallet-selector/bitget-wallet';
import { setupRamperWallet } from '@near-wallet-selector/ramper-wallet';
import { setupUnityWallet } from '@near-wallet-selector/unity-wallet';
import { setupOKXWallet } from '@near-wallet-selector/okx-wallet';
import { setupCoin98Wallet } from '@near-wallet-selector/coin98-wallet';
import { setupIntearWallet } from '@near-wallet-selector/intear-wallet';

import { WalletSelectorProvider } from '@near-wallet-selector/react-hook';
import { NoteProvider } from '@/contexts';

// Types
import type { WalletModuleFactory } from '@near-wallet-selector/core';

const walletSelectorConfig = {
  network: {
    networkId: NetworkId,
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://testnet.mynearwallet.com/',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
  },
  debug: true,
  modules: [
    setupMeteorWallet(),
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
            <Route
              path="/update-progress/:isbn"
              element={<UpdateProgressPage />}
            />
            <Route
              path="/note-editor/:isbn/:chapter"
              element={<NoteEditorPage />}
            />
          </Routes>
        </BrowserRouter>
      </NoteProvider>
    </WalletSelectorProvider>
  );
}

export default App;
