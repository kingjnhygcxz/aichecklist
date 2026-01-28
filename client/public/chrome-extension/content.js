// AIDomo Voice Assistant - Content Script v2.0
// This script loads the AIDomo voice assistant on every page

(function() {
  // Prevent double loading
  if (window.__aidomo_extension_loaded) return;
  window.__aidomo_extension_loaded = true;

  // Load the main AIDomo script from the server with cache-busting
  const script = document.createElement('script');
  const version = '2.0.' + Date.now();
  script.src = 'https://aichecklist.io/aidomo-loader.js?v=' + version;
  script.onload = function() {
    console.log('AIDomo Voice Assistant v2.0 loaded - compact bar with theme toggle');
  };
  script.onerror = function() {
    console.error('Failed to load AIDomo Voice Assistant');
  };
  document.body.appendChild(script);
})();
