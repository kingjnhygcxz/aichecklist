import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handlers to prevent unhandled promise rejections from crashing the app
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection caught:', event.reason);
  console.error('Promise:', event.promise);
  // Prevent the error from being logged to console as an uncaught exception
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Source:', event.filename, 'Line:', event.lineno);
});

// Also handle errors on the process level if available
if (typeof process !== 'undefined' && process.on) {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Process unhandled rejection:', reason);
    console.error('Promise:', promise);
  });
}

// PWA Support - ENABLED for desktop app installation
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully:', registration.scope);
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 3600000); // 1 hour
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

console.log("React app is mounting...");
const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Root element found, rendering app...");
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found!");
}
