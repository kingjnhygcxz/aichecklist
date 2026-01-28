// AIDomo Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
  
  if (settings.wakePhrase) {
    document.getElementById('wake-phrase').value = settings.wakePhrase;
  }
  
  if (settings.showWaveform !== false) {
    document.getElementById('toggle-waveform').classList.add('active');
  } else {
    document.getElementById('toggle-waveform').classList.remove('active');
  }
  
  // Check connection status
  checkConnection();
  
  // Event listeners
  document.getElementById('wake-phrase').addEventListener('change', saveSettings);
  
  document.getElementById('toggle-waveform').addEventListener('click', function() {
    this.classList.toggle('active');
    saveSettings();
  });
  
  document.getElementById('btn-open').addEventListener('click', async () => {
    // Get current tab and send message to open voice bar
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleVoiceBar' });
      window.close();
    }
  });
});

async function checkConnection() {
  const statusCard = document.getElementById('status-card');
  const statusMessage = document.getElementById('status-message');
  
  try {
    const result = await chrome.runtime.sendMessage({ action: 'testConnection' });
    
    if (result.connected && result.authenticated) {
      statusCard.className = 'status-card connected';
      statusCard.querySelector('.status-title').textContent = 'Connected';
      statusMessage.textContent = `Logged in as ${result.user?.email || 'user'}`;
    } else if (result.connected) {
      statusCard.className = 'status-card disconnected';
      statusCard.querySelector('.status-title').textContent = 'Not Logged In';
      statusMessage.textContent = 'Please log in to AIChecklist.io to use voice commands';
    } else {
      statusCard.className = 'status-card disconnected';
      statusCard.querySelector('.status-title').textContent = 'Disconnected';
      statusMessage.textContent = result.message || 'Could not connect to AIChecklist.io';
    }
  } catch (error) {
    statusCard.className = 'status-card disconnected';
    statusCard.querySelector('.status-title').textContent = 'Error';
    statusMessage.textContent = 'Could not check connection status';
  }
}

async function saveSettings() {
  const settings = {
    wakePhrase: document.getElementById('wake-phrase').value || 'hey aidomo',
    showWaveform: document.getElementById('toggle-waveform').classList.contains('active'),
    apiUrl: 'https://aichecklist.io'
  };
  
  await chrome.runtime.sendMessage({ action: 'saveSettings', settings });
}
