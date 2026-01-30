import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BowlerProvider } from './contexts/BowlerContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BowlerProvider>
      <App />
    </BowlerProvider>
  </StrictMode>
);
