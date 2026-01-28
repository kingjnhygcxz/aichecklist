// AIDomo Content Script
// Injects voice bar UI into all pages

(function() {
  'use strict';
  
  // Prevent double injection
  if (window.__aidomoInjected) return;
  window.__aidomoInjected = true;
  
  // State
  let isOpen = false;
  let isDetached = false;
  let mode = 'idle'; // idle, listening, thinking, speaking
  let partialTranscript = '';
  let finalTranscript = '';
  let lastResponse = null;
  let speechSupported = false;
  let recognition = null;
  let audioContext = null;
  let analyser = null;
  let mediaStream = null;
  let animationFrame = null;
  let dragOffset = { x: 0, y: 0 };
  let barPosition = { x: window.innerWidth / 2 - 240, y: 100 };
  
  const WAKE_PHRASE = 'hey aidomo';
  
  // Check speech support
  speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  
  // Create root element
  const root = document.createElement('div');
  root.id = 'aidomo-root';
  document.body.appendChild(root);
  
  // Helper function to create elements with optional class and text
  function createElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) {
      if (Array.isArray(className)) {
        el.className = className.filter(Boolean).join(' ');
      } else {
        el.className = className;
      }
    }
    if (textContent !== undefined && textContent !== null) {
      el.textContent = textContent;
    }
    return el;
  }
  
  // Render UI using safe DOM methods
  function render() {
    // Clear existing content safely
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    
    if (!isOpen) {
      root.appendChild(renderWakePill());
    } else {
      root.appendChild(renderVoiceBar());
    }
    attachEventListeners();
  }
  
  function renderWakePill() {
    const button = createElement('button', 'aidomo-wake-pill');
    button.id = 'aidomo-wake-btn';
    
    const label = createElement('span', null, 'AIDomo');
    const shortcut = createElement('span', 'shortcut', '⌘K');
    
    button.appendChild(label);
    button.appendChild(shortcut);
    
    return button;
  }
  
  function renderVoiceBar() {
    const statusClass = mode === 'listening' ? 'listening' : 
                        mode === 'thinking' ? 'thinking' : 
                        mode === 'speaking' ? 'speaking' : '';
    
    const statusText = mode === 'listening' ? 'Listening' : 
                       mode === 'thinking' ? 'Thinking' : 
                       mode === 'speaking' ? 'Speaking' : 'Ready';
    
    const hint = mode === 'listening' ? 'Listening… say "hey aidomo" or speak your command' :
                 mode === 'thinking' ? 'Processing your command…' :
                 mode === 'speaking' ? 'AIDomo is responding…' :
                 'Press the button to start listening';
    
    const transcript = partialTranscript || finalTranscript;
    
    // Main container
    const bar = createElement('div', ['aidomo-voice-bar', isDetached ? 'detached' : '']);
    bar.id = 'aidomo-bar';
    if (isDetached) {
      bar.style.left = barPosition.x + 'px';
      bar.style.top = barPosition.y + 'px';
    }
    
    // Inner container
    const barInner = createElement('div', 'aidomo-bar-inner');
    const barContent = createElement('div', 'aidomo-bar-content');
    
    // Header section
    const header = createElement('div', 'aidomo-header');
    
    // Logo section
    const logoSection = createElement('div', 'aidomo-logo-section');
    const avatar = createElement('div', 'aidomo-avatar', 'AD');
    
    const titleSection = createElement('div', 'aidomo-title-section');
    const titleRow = createElement('div', 'aidomo-title-row');
    
    const title = createElement('span', 'aidomo-title', 'AIDomo');
    const statusBadge = createElement('span', ['aidomo-status-badge', statusClass], statusText);
    
    titleRow.appendChild(title);
    titleRow.appendChild(statusBadge);
    
    if (!speechSupported) {
      const warning = createElement('span', 'aidomo-warning', 'Speech not supported');
      titleRow.appendChild(warning);
    }
    
    const hintEl = createElement('span', 'aidomo-hint', hint);
    
    titleSection.appendChild(titleRow);
    titleSection.appendChild(hintEl);
    
    logoSection.appendChild(avatar);
    logoSection.appendChild(titleSection);
    
    // Controls section
    const controls = createElement('div', 'aidomo-controls');
    
    const detachBtn = createElement('button', 'aidomo-btn', isDetached ? 'Dock' : 'Detach');
    detachBtn.id = 'aidomo-detach-btn';
    controls.appendChild(detachBtn);
    
    if (mode === 'idle') {
      const listenBtn = createElement('button', ['aidomo-btn', 'primary'], 'Listen');
      listenBtn.id = 'aidomo-listen-btn';
      controls.appendChild(listenBtn);
    }
    
    if (mode === 'listening') {
      const stopBtn = createElement('button', 'aidomo-btn', 'Stop');
      stopBtn.id = 'aidomo-stop-btn';
      controls.appendChild(stopBtn);
    }
    
    const closeBtn = createElement('button', 'aidomo-btn', 'Close');
    closeBtn.id = 'aidomo-close-btn';
    controls.appendChild(closeBtn);
    
    header.appendChild(logoSection);
    header.appendChild(controls);
    
    // Main section
    const main = createElement('div', 'aidomo-main');
    
    // Waveform
    const waveform = createElement('div', 'aidomo-waveform');
    waveform.id = 'aidomo-waveform';
    
    const waveformBars = createElement('div', 'aidomo-waveform-bars');
    waveformBars.id = 'aidomo-waveform-bars';
    
    for (let i = 0; i < 18; i++) {
      const waveBar = createElement('div', 'aidomo-waveform-bar');
      waveBar.style.height = '6px';
      waveformBars.appendChild(waveBar);
    }
    
    waveform.appendChild(waveformBars);
    
    // Transcript section
    const transcriptSection = createElement('div', 'aidomo-transcript');
    const transcriptBox = createElement('div', 'aidomo-transcript-box');
    const transcriptText = createElement('div', ['aidomo-transcript-text', !transcript ? 'placeholder' : '']);
    transcriptText.textContent = transcript || 'Speak now… or say "hey aidomo" after starting';
    
    transcriptBox.appendChild(transcriptText);
    
    const tips = createElement('div', 'aidomo-tips');
    tips.appendChild(document.createTextNode('Tip: Press '));
    
    const kbd1 = createElement('kbd', null, '⌘K');
    tips.appendChild(kbd1);
    tips.appendChild(document.createTextNode(' to start, '));
    
    const kbd2 = createElement('kbd', null, 'Esc');
    tips.appendChild(kbd2);
    tips.appendChild(document.createTextNode(' to close'));
    
    transcriptSection.appendChild(transcriptBox);
    transcriptSection.appendChild(tips);
    
    main.appendChild(waveform);
    main.appendChild(transcriptSection);
    
    // Build content
    barContent.appendChild(header);
    barContent.appendChild(main);
    
    // Response section
    if (lastResponse) {
      barContent.appendChild(renderResponse());
    }
    
    // Auth prompt
    if (lastResponse?.needsAuth) {
      barContent.appendChild(renderAuthPrompt());
    }
    
    barInner.appendChild(barContent);
    bar.appendChild(barInner);
    
    return bar;
  }
  
  function renderResponse() {
    const isError = !lastResponse.ok || lastResponse.intent === 'ERROR';
    
    const responseDiv = createElement('div', 'aidomo-response');
    const responseText = createElement('div', ['aidomo-response-text', isError ? 'error' : 'success']);
    responseText.textContent = lastResponse.reply || 'Command processed.';
    
    responseDiv.appendChild(responseText);
    return responseDiv;
  }
  
  function renderAuthPrompt() {
    const authPrompt = createElement('div', 'aidomo-auth-prompt');
    
    const authText = createElement('span', 'aidomo-auth-text', 'Log in to AIChecklist.io to use voice commands');
    
    const authLink = createElement('a', 'aidomo-auth-link', 'Log In');
    authLink.href = 'https://aichecklist.io/auth';
    authLink.target = '_blank';
    
    authPrompt.appendChild(authText);
    authPrompt.appendChild(authLink);
    
    return authPrompt;
  }
  
  function attachEventListeners() {
    // Wake pill
    const wakePill = document.getElementById('aidomo-wake-btn');
    if (wakePill) {
      wakePill.addEventListener('click', openVoiceBar);
    }
    
    // Voice bar controls
    const closeBtn = document.getElementById('aidomo-close-btn');
    const detachBtn = document.getElementById('aidomo-detach-btn');
    const listenBtn = document.getElementById('aidomo-listen-btn');
    const stopBtn = document.getElementById('aidomo-stop-btn');
    const bar = document.getElementById('aidomo-bar');
    
    if (closeBtn) closeBtn.addEventListener('click', closeVoiceBar);
    if (detachBtn) detachBtn.addEventListener('click', toggleDetach);
    if (listenBtn) listenBtn.addEventListener('click', startListening);
    if (stopBtn) stopBtn.addEventListener('click', stopListening);
    
    // Dragging for detached mode
    if (bar && isDetached) {
      bar.addEventListener('mousedown', startDrag);
    }
  }
  
  // Voice bar actions
  function openVoiceBar() {
    isOpen = true;
    mode = 'idle';
    lastResponse = null;
    render();
    startListening();
  }
  
  function closeVoiceBar() {
    stopListening();
    stopMicrophone();
    isOpen = false;
    isDetached = false;
    mode = 'idle';
    partialTranscript = '';
    finalTranscript = '';
    lastResponse = null;
    render();
  }
  
  function toggleDetach() {
    isDetached = !isDetached;
    if (isDetached) {
      barPosition = { x: window.innerWidth / 2 - 240, y: 100 };
    }
    render();
  }
  
  // Dragging
  function startDrag(e) {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
    
    const bar = document.getElementById('aidomo-bar');
    if (!bar) return;
    
    const rect = bar.getBoundingClientRect();
    dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  }
  
  function onDrag(e) {
    barPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    const bar = document.getElementById('aidomo-bar');
    if (bar) {
      bar.style.left = barPosition.x + 'px';
      bar.style.top = barPosition.y + 'px';
    }
  }
  
  function stopDrag() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
  }
  
  // Speech recognition
  function startListening() {
    if (!speechSupported) {
      lastResponse = { ok: false, reply: 'Speech recognition is not supported in this browser.' };
      render();
      return;
    }
    
    mode = 'listening';
    partialTranscript = '';
    finalTranscript = '';
    lastResponse = null;
    render();
    
    startMicrophone();
    startSpeechRecognition();
  }
  
  function stopListening() {
    mode = 'idle';
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
      recognition = null;
    }
    render();
  }
  
  function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        
        if (result.isFinal) {
          final += (final ? ' ' : '') + text;
        } else {
          interim += (interim ? ' ' : '') + text;
        }
      }
      
      if (interim) {
        partialTranscript = interim;
        render();
        
        // Check for wake phrase in interim
        if (interim.toLowerCase().includes(WAKE_PHRASE)) {
          console.log('[AIDomo] Wake phrase detected!');
        }
      }
      
      if (final) {
        finalTranscript += (finalTranscript ? ' ' : '') + final;
        partialTranscript = '';
        render();
        
        // Process command after a short delay (to allow for more speech)
        clearTimeout(window.__aidomoCommandTimeout);
        window.__aidomoCommandTimeout = setTimeout(() => {
          if (finalTranscript.trim()) {
            processCommand(finalTranscript.trim());
          }
        }, 1500);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('[AIDomo] Speech error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition
        if (mode === 'listening') {
          try { recognition.start(); } catch(e) {}
        }
      }
    };
    
    recognition.onend = () => {
      // Restart if still in listening mode
      if (mode === 'listening') {
        try { recognition.start(); } catch(e) {}
      }
    };
    
    try {
      recognition.start();
    } catch(e) {
      console.error('[AIDomo] Could not start recognition:', e);
    }
  }
  
  // Microphone for waveform
  function startMicrophone() {
    if (mediaStream) return;
    
    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true }
    }).then(stream => {
      mediaStream = stream;
      
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      
      animateWaveform();
    }).catch(err => {
      console.error('[AIDomo] Microphone error:', err);
    });
  }
  
  function stopMicrophone() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }
    if (audioContext) {
      try { audioContext.close(); } catch(e) {}
      audioContext = null;
    }
    analyser = null;
  }
  
  function animateWaveform() {
    if (!analyser) return;
    
    const data = new Uint8Array(analyser.fftSize);
    
    function tick() {
      if (!analyser) return;
      
      analyser.getByteTimeDomainData(data);
      
      // Calculate RMS amplitude
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const amplitude = Math.min(1, Math.max(0, rms * 2.5));
      
      // Update bars
      const barsContainer = document.getElementById('aidomo-waveform-bars');
      if (barsContainer) {
        const bars = barsContainer.children;
        const time = Date.now() * 0.004;
        
        for (let i = 0; i < bars.length; i++) {
          const phase = (time + i * 0.5) % (Math.PI * 2);
          const wave = (Math.sin(phase) + 1) / 2;
          const drive = mode === 'speaking' ? 0.65 : amplitude;
          const base = mode === 'listening' || mode === 'speaking' ? 0.2 : 0.1;
          const height = 6 + Math.round(22 * (base + drive * wave));
          bars[i].style.height = height + 'px';
        }
      }
      
      animationFrame = requestAnimationFrame(tick);
    }
    
    tick();
  }
  
  // Process voice command
  async function processCommand(text) {
    mode = 'thinking';
    render();
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'executeCommand',
        text: text,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      lastResponse = response;
      mode = 'idle';
      finalTranscript = '';
      
      if (response.ok) {
        mode = 'speaking';
        render();
        
        // Simulate speaking animation
        await new Promise(r => setTimeout(r, 1500));
        mode = 'idle';
      }
      
      render();
    } catch (error) {
      console.error('[AIDomo] Command error:', error);
      lastResponse = {
        ok: false,
        reply: 'Could not process command. Please try again.'
      };
      mode = 'idle';
      render();
    }
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K to toggle
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isOpen) {
        closeVoiceBar();
      } else {
        openVoiceBar();
      }
    }
    
    // Escape to close
    if (e.key === 'Escape' && isOpen) {
      closeVoiceBar();
    }
  });
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleVoiceBar') {
      if (isOpen) {
        closeVoiceBar();
      } else {
        openVoiceBar();
      }
      sendResponse({ success: true });
    }
  });
  
  // Initial render
  render();
  
  console.log('[AIDomo] Content script loaded');
})();
