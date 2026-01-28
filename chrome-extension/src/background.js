// AIDomo Background Service Worker
// Handles extension lifecycle, keyboard shortcuts, and API communication

const API_BASE_URL = 'https://aichecklist.io';

// Store user authentication state
let authState = {
  isAuthenticated: false,
  userId: null,
  sessionToken: null
};

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[AIDomo] Extension installed:', details.reason);
  
  // Set default settings
  chrome.storage.sync.set({
    settings: {
      wakePhrase: 'hey aidomo',
      autoListen: false,
      showWaveform: true,
      apiUrl: API_BASE_URL
    }
  });
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  console.log('[AIDomo] Command received:', command);
  
  if (command === 'toggle_voice_bar') {
    // Send message to content script to toggle voice bar
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleVoiceBar' });
      }
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AIDomo] Message received:', message.action);
  
  switch (message.action) {
    case 'getAuthState':
      sendResponse(authState);
      break;
      
    case 'setAuthState':
      authState = { ...authState, ...message.data };
      chrome.storage.sync.set({ authState });
      sendResponse({ success: true });
      break;
      
    case 'executeCommand':
      handleVoiceCommand(message.text, message.timezone)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep channel open for async response
      
    case 'getSettings':
      chrome.storage.sync.get('settings', (data) => {
        sendResponse(data.settings || {});
      });
      return true;
      
    case 'saveSettings':
      chrome.storage.sync.set({ settings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'testConnection':
      testAPIConnection()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ error: error.message }));
      return true;
  }
});

// Handle voice command by sending to AIChecklist API
async function handleVoiceCommand(text, timezone = 'UTC') {
  const settings = await getSettings();
  const apiUrl = settings.apiUrl || API_BASE_URL;
  
  try {
    // First, try the agent command endpoint
    const response = await fetch(`${apiUrl}/api/domoai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        message: text,
        timezone: timezone
      })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          ok: false,
          intent: 'AUTH_REQUIRED',
          reply: 'Please log in to AIChecklist.io first, then try again.',
          needsAuth: true
        };
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ok: true,
      intent: data.intent || 'AIDOMO_RESPONSE',
      reply: data.response || data.reply || 'Command processed.',
      data: data
    };
  } catch (error) {
    console.error('[AIDomo] Command error:', error);
    return {
      ok: false,
      intent: 'ERROR',
      reply: 'Could not connect to AIChecklist. Please check your connection.',
      error: error.message
    };
  }
}

// Test API connection
async function testAPIConnection() {
  const settings = await getSettings();
  const apiUrl = settings.apiUrl || API_BASE_URL;
  
  try {
    const response = await fetch(`${apiUrl}/api/user`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const user = await response.json();
      return {
        connected: true,
        authenticated: true,
        user: user
      };
    } else if (response.status === 401) {
      return {
        connected: true,
        authenticated: false,
        message: 'Please log in to AIChecklist.io'
      };
    }
    
    return {
      connected: false,
      message: 'Could not connect to AIChecklist'
    };
  } catch (error) {
    return {
      connected: false,
      message: error.message
    };
  }
}

// Get settings from storage
function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('settings', (data) => {
      resolve(data.settings || { apiUrl: API_BASE_URL });
    });
  });
}

// Restore auth state on startup
chrome.storage.sync.get('authState', (data) => {
  if (data.authState) {
    authState = data.authState;
  }
});
