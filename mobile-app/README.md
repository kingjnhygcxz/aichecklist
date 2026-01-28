# AI Checklist - Mobile App

This is the mobile application version of the AI Checklist, a minimalist black and green checklist application with AI task assistance, a glowing logo, alarms, and countdown timers.

## Features

- Task management with categories and priority levels
- AI-powered task suggestions using Anthropic's Claude API
- Built-in timer functionality with customizable alarm sounds
- Offline support through AsyncStorage
- Dark theme with minimalist black and green design
- Cross-platform support (iOS, Android)

## Technologies Used

- React Native / Expo
- React Navigation for routing
- TanStack Query for data fetching
- Anthropic AI for intelligent task suggestions
- Expo SecureStore for sensitive data storage
- AsyncStorage for local data persistence
- Expo AV for sound playback

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Anthropic API key (for AI features)

### Installation

1. Install Expo CLI globally:
```bash
npm install -g expo-cli
```

2. Install dependencies:
```bash
cd mobile-app
npm install
```

3. Set up your Anthropic API key:
   - Go to the Settings screen in the app
   - Enter your Anthropic API key

### Running the App

#### iOS Simulator
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

#### Web (for development)
```bash
npm run web
```

## Build for App Stores

### iOS (App Store)

1. Configure app.json with your Apple developer details
2. Build the app:
```bash
expo build:ios
```
3. Submit to App Store Connect

### Android (Google Play)

1. Configure app.json with your Android keystore information
2. Build the app:
```bash
expo build:android
```
3. Submit to Google Play Console

## Project Structure

```
mobile-app/
├── assets/              # Static assets (images, sounds)
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── task/        # Task-related components
│   │   ├── timer/       # Timer-related components
│   │   └── ui/          # Generic UI components
│   ├── context/         # Global state management
│   ├── hooks/           # Custom React hooks
│   ├── screens/         # App screens
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript type definitions
├── App.tsx              # Application entry point
├── app.json             # Expo configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Differences from Web Version

- Uses React Navigation instead of wouter for routing
- Implements AsyncStorage for local data storage
- Features native mobile UI patterns and gestures
- Includes responsive design for various screen sizes
- Provides offline-first functionality
- Uses Expo Secure Store for API key storage

## Deployment and Publishing

To deploy the application to app stores:

1. Update version numbers in app.json
2. Set up the correct app identifiers (bundle ID for iOS, package name for Android)
3. Create store listings with screenshots and descriptions
4. Submit builds to respective app stores
5. Manage releases through App Store Connect and Google Play Console

## Future Improvements

- Push notifications for timer completion
- Cloud synchronization across devices
- Advanced recurring tasks
- Task analytics and insights dashboard
- Theme customization options
- In-app tutorial and onboarding