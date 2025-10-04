import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { GameVersionProvider } from './contexts/GameVersionContext';
import { ThemeProvider } from './hooks/useTheme.tsx'; // Corrected path
import { Toaster } from "@/components/ui/sonner";

// Correct CSS Import Order
import './index.css'; // Tailwind base styles
import './App.css'; // Your custom styles

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
