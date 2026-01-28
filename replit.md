# AIChecklist.io - AI-Powered Task Management Platform

## Overview
AIChecklist.io is a comprehensive task management platform integrating traditional checklists with advanced AI assistance and voice biometric authentication. It provides enterprise-grade security and productivity tools for web and mobile users, focusing on intelligent task management and robust voice-based security. The platform aims to enhance productivity and security for a broad user base.

## User Preferences
Preferred communication style: Simple, everyday language.
**IMPORTANT: Always confirm with the user before making any code changes or implementing solutions. Never proceed with actions without explicit approval.**

## System Architecture

### Frontend
The client is built with React and TypeScript, using Vite for tooling, Tailwind CSS for styling, and Radix UI/shadcn/ui components. State management utilizes TanStack Query for server state, React Hook Form for forms, and React Context for global state, with Wouter for client-side routing. Key features include drag-and-drop, Web Speech API integration, real-time timers, an achievement system, and task sharing. UI elements auto-collapse for a cleaner interface, and critical UI states are persisted across sessions using local storage and database synchronization.

### Backend
The server is built on Node.js with Express.js and TypeScript, following a RESTful API design. Drizzle ORM manages PostgreSQL database operations. It includes a session-based authentication system with role-based access control, a multi-provider AI integration layer with automatic fallback (OpenAI GPT-4o → Google Gemini), and Stripe for payment processing. A formalized tool registry system for AIDOMO commands with Zod schema validation prevents invalid tool calls from LLM hallucinations. The AIDOMO AI features an intelligent fallback system from OpenAI to Google Gemini 2.5-Pro for uninterrupted AI assistance. The system automatically detects the deployment environment (Replit or external) to configure AI providers. An AI features API exposes all platform capabilities.

### Data Storage
The primary database is PostgreSQL, hosted on Neon Database. The schema includes users, tasks, templates, achievements, and voice authentication data. Local storage is used for session persistence and offline capabilities in the mobile application. An auto-archive and retention system manages task lifecycle, allowing users to configure auto-archiving and deletion periods for completed tasks.

### Authentication and Authorization
The platform uses multi-layered security with Role-Based Access Control and database-backed UUID-based session management, allowing users to control session duration. Voice biometric authentication is disabled.

### Trial and Subscription Controls
The platform implements a tiered access system with server-side enforcement. Active subscribers and trial users have full access, while expired trial users face limited access with upgrade prompts for premium features like AIDOMO and templates.

### UI/UX
The design emphasizes a clean, minimal aesthetic with smooth animations using Framer Motion and dynamic visual elements. shadcn/ui components ensure consistency. AIDOMO features full-screen and timer panel toggles for focused interaction, and key UI states are persisted.

### Feature Specifications
Key features include a comprehensive authentication system with email code verification and "Remember Me" functionality, optimized task performance with optimistic updates and non-blocking achievement processing, two-way Google Calendar synchronization, a modern reservation system, integrated notes functionality, improved calendar styling with a clean print view, Word document export for AIDOMO conversations, and comprehensive AIDOMO conversation history management. The platform also offers 226 dynamic templates for various productivity needs.

### AIDOMO Tool Registry
The formalized tool registry (server/tools/registry.ts) includes validated commands:
- **CREATE_TASK**: Single task creation with scheduling options
- **CREATE_CHECKLIST**: Checklist with multiple items
- **ROLLING_TASKS**: Multiple tasks created in sequence
- **WEEKLY_REPORT_REQUEST**: Executive-style weekly summaries (completed/in-progress/overdue tasks, appointments, category breakdown)
- **PRINT_REQUEST**: Various print outputs (todo list, checklists, templates)
- **TEMPLATE_REQUEST**: Apply productivity templates
- **SHARE_SCHEDULE**: Share schedules with permissions
- **ADD_CONTACT**: Add a contact (auto-links if email matches existing user)
- **FIND_CONTACT**: Search contacts by name/email/title/department
- **SEND_MESSAGE**: Send message to contact or user (thread-first, auto-creates threads)
- **LIST_INBOX**: List messages with sender names and unread status
- **READ_MESSAGE**: Read and optionally mark message as read

Weekly report triggers: "weekly report", "weekly summary", "status report", "how many tasks did I complete"

### Contacts & Messaging System
The platform includes a threaded messaging system for team collaboration:
- **Contacts Table**: Store contacts with auto-linking to existing users by email
- **Message Threads**: Two-party threads for conversations (participant A ↔ participant B)
- **Messages**: Text inbox with thread support, sender display names (fullName → username fallback)
- **Notifications**: `listNotifications()` for unread messages, `getUnreadNotificationCount()` for badge counts
- **Deep Links**: `/aidomo/inbox/thread/:threadId` or `/aidomo/inbox/:messageId`

Multi-action example: "Add Sarah VP Ops sarah@company.com then ask Sarah about the weekly report"

## External Dependencies

### AI and Machine Learning Services
- **OpenAI GPT-4o**: Primary AI assistant.
- **Google Gemini 2.5-Pro**: Automatic fallback AI provider, used for Replit AI Integrations and external deployments.
- **WebLLM (Offline AI)**: Browser-based AI for offline report generation using Llama-3.2-3B.
- **Anthropic Claude**: Available but not integrated into the AIDOMO fallback chain.
- **Web Speech API**: For browser-native voice recognition.

### Payment and Communication Services
- **Stripe**: Subscription management and payment processing.
- **Resend & Nodemailer**: Multi-provider email services.
- **NeverBounce**: Email validation.
- **SendGrid**: Enterprise email delivery.

### Cloud and Infrastructure
- **Neon Database**: PostgreSQL cloud hosting.
- **Google Cloud Storage**: File storage and backups.

### Development and Build Tools
- **Vite**: Modern build tool.
- **Drizzle ORM**: Type-safe database operations.
- **TanStack Query**: Data fetching and caching.
- **@dnd-kit**: Drag-and-drop functionality.
- **Framer Motion**: Animation library.
- **docx**: Word document generation library.

### Mobile Platform Integration
- **React Native/Expo**: Cross-platform mobile development.
- **Expo AV**: Audio processing for mobile.
- **AsyncStorage**: Local data persistence for mobile.