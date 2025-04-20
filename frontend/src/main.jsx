import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { useThemeStore } from './store/useThemeStore';

// ✅ Component to sync theme with <html data-theme="">
function ThemeListener() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null; // no UI
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeListener />
      <App />
    </BrowserRouter>
  </StrictMode>
);
