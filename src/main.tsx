import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA in production builds
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(<App />);
