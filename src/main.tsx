// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// --- THIS WAS THE FIX ---
// The import for ThemeProvider was using a colon (:) instead of "from".
import { ThemeProvider } from './hooks/useTheme.tsx';
// --- END FIX ---

import { AuthProvider } from './contexts/AuthContext.tsx';
import { Toaster } from "@/components/ui/sonner";
import { DataSyncProvider } from './hooks/useDataSync.tsx';
import { GameVersionProvider } from './contexts/GameVersionContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GameVersionProvider>
          <AuthProvider>
            <DataSyncProvider>
              <App />
              <Toaster />
            </DataSyncProvider>
          </AuthProvider>
        </GameVersionProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);