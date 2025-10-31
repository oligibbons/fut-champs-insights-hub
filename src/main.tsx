// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { GameVersionProvider } from './contexts/GameVersionContext';
import { ThemeProvider } from './hooks/useTheme';
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- FIX: Import DataSyncProvider here ---
import { DataSyncProvider } from './hooks/useDataSync.tsx'; 
import './index.css'; 

// Create a client for react-query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <GameVersionProvider>
            <ThemeProvider>
              {/* --- FIX: Wrap the entire App in DataSyncProvider --- */}
              <DataSyncProvider>
                <App />
                <Toaster />
              </DataSyncProvider>
            </ThemeProvider>
          </GameVersionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);