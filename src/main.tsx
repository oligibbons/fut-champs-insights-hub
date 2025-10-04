import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { GameVersionProvider } from './contexts/GameVersionContext';
import { ThemeProvider } from './hooks/useTheme';
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- THE DEFINITIVE FIX ---
// This imports the base styles for all components.
import './index.css'; 
// This imports your custom styles on top of the base styles.
import './App.css';

// Create a client for react-query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <GameVersionProvider>
            <ThemeProvider>
              <App />
              <Toaster />
            </ThemeProvider>
          </GameVersionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
