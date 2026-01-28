# AIDomo Chrome Extension

Voice-enabled AI assistant that integrates with your AIChecklist.io account. Add tasks, schedule events, and manage checklists using voice commands from any webpage.

## Features

- **Voice Bar** - Floating voice interface that slides down from the top of any page
- **Voice Commands** - Speak naturally to create tasks, schedule events, and more
- **Wake Phrase** - Say "Hey AIDomo" to activate
- **Docked/Detached Modes** - Keep the bar at the top or drag it anywhere
- **Waveform Visualizer** - Visual feedback while speaking
- **Keyboard Shortcuts** - `Cmd/Ctrl+K` to toggle voice bar

## Installation

### For Development

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

### For Production

The extension will be available on the Chrome Web Store once published.

## Usage

1. Click the AIDomo pill button in the top-right corner of any page (or press `Cmd/Ctrl+K`)
2. Grant microphone permission when prompted
3. Speak your command, such as:
   - "Add buy groceries to my todo list"
   - "Schedule meeting with John tomorrow at 3pm"
   - "Put finish report on my checklist"
   - "What appointments do I have this week?"

4. AIDomo will process your command and sync it to your AIChecklist.io account

## Requirements

- Chrome browser (version 88 or later)
- An AIChecklist.io account
- Microphone permission

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Toggle voice bar |
| `Escape` | Close voice bar |

## Troubleshooting

### Voice bar doesn't appear
- Make sure the extension is enabled in `chrome://extensions/`
- Try reloading the page

### Voice recognition not working
- Check that you've granted microphone permission
- Try in a quiet environment
- Speak clearly and at a normal pace

### Not connected to AIChecklist
- Open AIChecklist.io in a new tab and log in
- The extension uses your browser session for authentication

## Development

### Project Structure

```
chrome-extension/
├── manifest.json          # Extension manifest (v3)
├── src/
│   ├── background.js      # Service worker
│   ├── content.js         # Content script (voice bar UI)
│   └── styles.css         # Voice bar styles
├── popup/
│   ├── popup.html         # Settings popup
│   └── popup.js           # Popup logic
└── icons/                 # Extension icons
```

### Building for Production

1. Update version in `manifest.json`
2. Create a zip of the `chrome-extension` folder
3. Upload to Chrome Web Store Developer Dashboard

## Privacy

- Voice data is processed using Chrome's Web Speech API (no audio is sent to AIChecklist servers)
- Commands are sent to AIChecklist.io for processing
- No data is stored locally beyond your settings preferences

## License

Proprietary - AIChecklist.io
