import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { GameVersionProvider } from './contexts/GameVersionContext';
// FIX: Corrected the import path to use the '@/' alias
import { ThemeProvider } from '@/hooks/useTheme.ts';
import './App.css';
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>
);
