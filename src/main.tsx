import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { GameVersionProvider } from './contexts/GameVersionContext';
import { ThemeProvider } from './hooks/useTheme.tsx'; // Ensure path is to .tsx file
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* This is now the single router for the entire application */}
    <BrowserRouter>
      <AuthProvider>
        <GameVersionProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </GameVersionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
