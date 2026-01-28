# App Assets

This directory contains all the static assets needed for the mobile application.

## Required Assets

Before publishing to app stores, you'll need to create and add the following assets:

### App Icons
- `icon.png` - 1024x1024 px, PNG format
- `adaptive-icon.png` - 1024x1024 px, PNG format (Android adaptive icon foreground)
- `favicon.png` - 196x196 px, PNG format (for web)

### Splash Screen
- `splash.png` - 1242x2436 px, PNG format

### Sound Files
The `sounds/` directory should contain the following audio files:
- `gentle_bell.mp3` - Soft bell sound for timers
- `digital_alarm.mp3` - Digital alarm sound
- `subtle_chime.mp3` - Subtle chime notification
- `alert_tone.mp3` - Alert tone for important notifications

## Design Guidelines
- Use the app's black and green color scheme
- App icon should feature a minimalist checklist design with a glowing effect
- Maintain consistent branding between app icon, splash screen, and in-app experience
- Sound files should be properly compressed and optimized for mobile platforms

## Icon Specifications

### iOS App Icon
- 1024x1024 px with no alpha channel
- Should not include transparency
- No rounded corners (iOS will add rounding)

### Android Adaptive Icon
- 108x108 dp at full size
- 72x72 dp safe zone for the main icon content
- Should contain transparent padding around the actual icon

### Splash Screen
- Include the app logo centered in the screen
- Use the app's primary background color (#121212)
- Should look good on various device dimensions

## Generating App Icons

You can use online tools like [App Icon Generator](https://appicon.co/) or [Icon Kitchen](https://icon.kitchen/) to create all required icon sizes from your master design.