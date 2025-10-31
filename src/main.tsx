// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// --- THIS IS THE FIX (Part 1) ---
// Import the QueryClient and provider from TanStack React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './hooks/useTheme.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { Toaster } from "@/components/ui/sonner";
import { DataSyncProvider } from './hooks/useDataSync.tsx';
import { GameVersionProvider } from './contexts/GameVersionContext.tsx';

// --- THIS IS THE FIX (Part 2) ---
// Create a new instance of the QueryClient
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* --- THIS IS THE FIX (Part 3) --- */}
      {/* Wrap your application with the QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);