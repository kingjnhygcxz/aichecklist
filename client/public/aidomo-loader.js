(function() {
  if (window.__aidomo) {
    window.__aidomo.toggle();
    return;
  }

  const API_BASE = 'https://aichecklist.io';
  let recognition = null;
  let isListening = false;
  let isProcessing = false;
  let wakeWordMode = true;
  let currentTheme = localStorage.getItem('aidomo-theme') || 'gold';

  const style = document.createElement('style');
  style.textContent = `
    #aidomo-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2147483647;
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, visibility 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #aidomo-overlay.visible {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
    #aidomo-bar {
      background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
      border-bottom: 3px solid #d4a914;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      transition: border-color 0.3s ease;
    }
    #aidomo-bar * { box-sizing: border-box; }
    
    /* Theme: Green */
    #aidomo-overlay.theme-green #aidomo-bar {
      border-bottom-color: #22c55e;
    }
    #aidomo-overlay.theme-green .aidomo-avatar {
      border-color: rgba(34, 197, 94, 0.6);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
    }
    #aidomo-overlay.theme-green .aidomo-avatar-img { display: none; }
    #aidomo-overlay.theme-green .aidomo-avatar-check { display: flex; }
    #aidomo-overlay.theme-green .aidomo-send {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    }
    #aidomo-overlay.theme-green .aidomo-send:hover {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
    }
    #aidomo-overlay.theme-green .aidomo-voice.active {
      background: #22c55e;
      border-color: #22c55e;
    }
    #aidomo-overlay.theme-green .aidomo-status.listening {
      color: #22c55e;
    }
    #aidomo-overlay.theme-green .aidomo-theme-dot {
      background: #22c55e;
    }
    
    /* Avatar */
    .aidomo-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid rgba(212, 169, 20, 0.6);
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 0 12px rgba(212, 169, 20, 0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0a;
    }
    .aidomo-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .aidomo-avatar-check {
      display: none;
      width: 22px;
      height: 22px;
      color: #22c55e;
    }
    
    /* Status */
    .aidomo-status {
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
      min-width: 80px;
      transition: color 0.2s;
    }
    .aidomo-status.listening {
      color: #d4a914;
      font-weight: 500;
    }
    .aidomo-status.processing {
      color: #eab308;
    }
    
    /* Input */
    .aidomo-input-wrap {
      flex: 1;
      min-width: 0;
    }
    .aidomo-input {
      width: 100%;
      padding: 8px 12px;
      background: #0a0a0a;
      border: 1px solid #333;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .aidomo-input:focus {
      border-color: #d4a914;
    }
    #aidomo-overlay.theme-green .aidomo-input:focus {
      border-color: #22c55e;
    }
    .aidomo-input::placeholder {
      color: #6b7280;
    }
    
    /* Buttons */
    .aidomo-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .aidomo-voice {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #333;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .aidomo-voice svg {
      width: 16px;
      height: 16px;
      color: #6b7280;
      transition: color 0.2s;
    }
    .aidomo-voice:hover {
      border-color: #d4a914;
      background: rgba(212, 169, 20, 0.1);
    }
    .aidomo-voice:hover svg { color: #d4a914; }
    .aidomo-voice.active {
      background: #d4a914;
      border-color: #d4a914;
    }
    .aidomo-voice.active svg { color: white; }
    
    .aidomo-send {
      padding: 6px 14px;
      background: linear-gradient(135deg, #d4a914 0%, #b8960f 100%);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .aidomo-send:hover {
      box-shadow: 0 2px 8px rgba(212, 169, 20, 0.4);
    }
    .aidomo-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .aidomo-theme-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #333;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .aidomo-theme-btn:hover {
      border-color: #555;
      background: rgba(255,255,255,0.05);
    }
    .aidomo-theme-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #d4a914;
      transition: background 0.3s;
    }
    
    .aidomo-close {
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid #444;
      background: #333;
      cursor: pointer;
      color: #ccc;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;
      pointer-events: auto;
    }
    .aidomo-close:hover {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    
    /* Response toast */
    .aidomo-toast {
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 10px 16px;
      color: white;
      font-size: 13px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 2147483647;
      max-width: 400px;
    }
    .aidomo-toast.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .aidomo-toast.success {
      border-color: #22c55e;
      color: #22c55e;
    }
    .aidomo-toast.error {
      border-color: #ef4444;
      color: #ef4444;
    }
  `;
  document.head.appendChild(style);

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function createSvgElement(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      el.setAttribute(key, value);
    }
    return el;
  }

  function createElement(tag, attrs, children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (key === 'className') {
        el.className = value;
      } else {
        el.setAttribute(key, value);
      }
    }
    if (children) {
      for (const child of children) {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else {
          el.appendChild(child);
        }
      }
    }
    return el;
  }

  const overlay = document.createElement('div');
  overlay.id = 'aidomo-overlay';

  const checkSvg = createSvgElement('svg', { class: 'aidomo-avatar-check', viewBox: '0 0 24 24', fill: 'none' });
  checkSvg.appendChild(createSvgElement('path', { d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z', fill: 'currentColor' }));

  const avatarImg = createElement('img', { className: 'aidomo-avatar-img', src: 'https://aichecklist.io/domoai-logo.png', alt: 'AIDOMO' });
  const avatar = createElement('div', { className: 'aidomo-avatar' }, [avatarImg, checkSvg]);

  const status = createElement('span', { className: 'aidomo-status', id: 'aidomo-status' }, ['Say "Hey Domo"']);

  const inputEl = createElement('input', { type: 'text', className: 'aidomo-input', id: 'aidomo-input', placeholder: 'Say a command or type here...' });
  const inputWrap = createElement('div', { className: 'aidomo-input-wrap' }, [inputEl]);

  const micSvg = createSvgElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' });
  micSvg.appendChild(createSvgElement('path', { d: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' }));
  micSvg.appendChild(createSvgElement('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }));
  micSvg.appendChild(createSvgElement('line', { x1: '12', y1: '19', x2: '12', y2: '23' }));

  const voiceBtn = createElement('button', { className: 'aidomo-voice', id: 'aidomo-voice', title: 'Voice input' }, [micSvg]);
  const sendBtn = createElement('button', { className: 'aidomo-send', id: 'aidomo-send' }, ['Send']);
  const themeDot = createElement('span', { className: 'aidomo-theme-dot' });
  const themeBtn = createElement('button', { className: 'aidomo-theme-btn', id: 'aidomo-theme', title: 'Switch theme' }, [themeDot]);
  const closeBtn = createElement('button', { className: 'aidomo-close', id: 'aidomo-close', title: 'Close' }, ['Close']);

  const actions = createElement('div', { className: 'aidomo-actions' }, [voiceBtn, sendBtn, themeBtn, closeBtn]);

  const bar = createElement('div', { id: 'aidomo-bar' }, [avatar, status, inputWrap, actions]);
  const toast = createElement('div', { className: 'aidomo-toast', id: 'aidomo-toast' });

  overlay.appendChild(bar);
  overlay.appendChild(toast);
  document.body.appendChild(overlay);

  const input = inputEl;
  const statusEl = status;
  const toastEl = toast;

  function show() {
    overlay.classList.add('visible');
    input.focus();
    startWakeWordListening();
  }

  function hide() {
    overlay.classList.remove('visible');
    stopListening();
  }

  function toggle() {
    if (overlay.classList.contains('visible')) {
      hide();
    } else {
      show();
    }
  }

  function setStatus(state, text) {
    statusEl.textContent = text;
    statusEl.className = 'aidomo-status ' + state;
  }

  function showToast(text, isError = false) {
    toastEl.textContent = text;
    toastEl.className = 'aidomo-toast visible ' + (isError ? 'error' : 'success');
    setTimeout(() => {
      toastEl.classList.remove('visible');
    }, 4000);
  }

  function getPageInfo() {
    return {
      url: window.location.href,
      title: document.title,
      selectedText: window.getSelection().toString().trim()
    };
  }

  function clipPage() {
    const pageInfo = getPageInfo();
    return fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: `📎 ${pageInfo.title}`,
        notes: `URL: ${pageInfo.url}\n\n${pageInfo.selectedText ? 'Selected text:\n' + pageInfo.selectedText : ''}`
      })
    });
  }

  function saveToFile() {
    const pageInfo = getPageInfo();
    const content = pageInfo.selectedText || `Page: ${pageInfo.title}\nURL: ${pageInfo.url}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageInfo.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    return Promise.resolve();
  }

  async function sendCommand(text) {
    if (!text.trim() || isProcessing) return;
    
    isProcessing = true;
    setStatus('processing', 'Processing...');
    
    const lower = text.toLowerCase();
    const pageInfo = getPageInfo();
    
    try {
      // Handle special commands
      if (lower.includes('clip') || lower.includes('bookmark') || lower.includes('save this page')) {
        await clipPage();
        showToast('Page clipped to your tasks!');
        input.value = '';
        return;
      }
      
      if (lower.includes('save to file') || lower.includes('download')) {
        await saveToFile();
        showToast('Content saved to file!');
        input.value = '';
        return;
      }

      // Send to AIDOMO
      const res = await fetch(`${API_BASE}/api/aidomo/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          message: text,
          context: {
            currentPage: pageInfo.url,
            pageTitle: pageInfo.title,
            selectedText: pageInfo.selectedText
          }
        })
      });
      
      if (!res.ok) {
        throw new Error('Please log in to AIChecklist.io first');
      }
      
      const data = await res.json();
      showToast(data.response || data.reply || 'Done!');
      input.value = '';
    } catch (e) {
      showToast(e.message || 'Error processing command', true);
    } finally {
      isProcessing = false;
      setStatus('ready', 'Say "Hey Domo"');
      startWakeWordListening();
    }
  }

  function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      showToast('Voice not supported. Use text input.', true);
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS || isSafari) {
      rec.continuous = false;
      rec.interimResults = false;
    } else {
      rec.continuous = true;
      rec.interimResults = true;
    }
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let transcript = '';
      let isFinal = false;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }
      
      const lower = transcript.toLowerCase().trim();
      
      if (wakeWordMode) {
        if (lower.includes('hey domo') || lower.includes('hey aidomo') || lower.includes('domo ai') || lower.includes('aidomo')) {
          wakeWordMode = false;
          setStatus('listening', 'Listening...');
          voiceBtn.classList.add('active');
          
          let command = lower
            .replace(/hey (ai)?domo/gi, '')
            .replace(/(ai)?domo/gi, '')
            .trim();
          
          if (command) {
            input.value = command;
            if (isFinal && command.length > 3) {
              stopListening();
              sendCommand(command);
            }
          }
        }
      } else {
        input.value = transcript;
        
        if (isFinal && transcript.length > 3) {
          stopListening();
          sendCommand(transcript);
        }
      }
    };

    rec.onerror = (event) => {
      console.log('Speech error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setStatus('ready', 'Say "Hey Domo"');
        voiceBtn.classList.remove('active');
      }
    };

    rec.onend = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isListening && !isProcessing) {
        const delay = (isIOS || isSafari) ? 300 : 0;
        setTimeout(() => {
          if (isListening && !isProcessing) {
            try {
              rec.start();
            } catch (e) {}
          }
        }, delay);
      }
    };

    return rec;
  }

  function startWakeWordListening() {
    if (!recognition) {
      recognition = initSpeechRecognition();
    }
    if (!recognition) return;

    wakeWordMode = true;
    isListening = true;
    setStatus('ready', 'Say "Hey Domo"');
    voiceBtn.classList.remove('active');
    
    try {
      recognition.start();
    } catch (e) {}
  }

  function startActiveListening() {
    if (!recognition) {
      recognition = initSpeechRecognition();
    }
    if (!recognition) return;

    wakeWordMode = false;
    isListening = true;
    setStatus('listening', 'Listening...');
    voiceBtn.classList.add('active');
    
    try {
      recognition.start();
    } catch (e) {}
  }

  function stopListening() {
    isListening = false;
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  }

  // Event handlers
  closeBtn.onclick = hide;
  sendBtn.onclick = () => sendCommand(input.value);
  
  // Theme toggle
  function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('aidomo-theme', theme);
    if (theme === 'green') {
      overlay.classList.add('theme-green');
    } else {
      overlay.classList.remove('theme-green');
    }
  }
  
  if (currentTheme === 'green') {
    setTheme('green');
  }
  
  themeBtn.onclick = () => {
    setTheme(currentTheme === 'gold' ? 'green' : 'gold');
  };
  
  voiceBtn.onclick = () => {
    if (voiceBtn.classList.contains('active')) {
      stopListening();
      setStatus('ready', 'Say "Hey Domo"');
    } else {
      startActiveListening();
    }
  };

  input.onkeydown = (e) => {
    if (e.key === 'Enter') sendCommand(input.value);
    if (e.key === 'Escape') hide();
  };

  // Global Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      hide();
    }
  });

  window.__aidomo = { show, hide, toggle, clipPage, saveToFile, setTheme };

  setTimeout(show, 100);
})();
