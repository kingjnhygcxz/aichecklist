import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SEOHead } from './SEOHead';
import { AnalyticsTracker, EventTrackers } from './AnalyticsTracker';
import seoConfig from '../../data/seo-schemas.json';

interface SEOContextValue {
  trackEvent: typeof EventTrackers;
  updateSEO: (meta: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    canonicalUrl?: string;
    structuredData?: object;
    noIndex?: boolean;
  }) => void;
}

const SEOContext = createContext<SEOContextValue | null>(null);

export function useSEO() {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEO must be used within a SEOProvider');
  }
  return context;
}

interface SEOProviderProps {
  children: React.ReactNode;
}

export function SEOProvider({ children }: SEOProviderProps) {
  const [location] = useLocation();
  const [currentSEO, setCurrentSEO] = React.useState({
    title: "AIChecklist.io - AI-Powered Task Management & Professional Templates",
    description: "AI-powered task management platform with 121+ professional templates, AIDOMO assistant, voice authentication, and smart calendar integration.",
    keywords: "AI checklist, task management, productivity, AIDOMO, voice authentication",
    ogImage: "https://aichecklist.io/logo.png",
    canonicalUrl: `https://aichecklist.io${location}`,
    structuredData: seoConfig.schemas.organization,
    noIndex: false
  });

  const updateSEO = (meta: Partial<typeof currentSEO>) => {
    setCurrentSEO(prev => ({ ...prev, ...meta }));
  };

  // Auto-update SEO based on route
  useEffect(() => {
    const routeSEO = getRouteSEO(location);
    updateSEO(routeSEO);
  }, [location]);

  const contextValue: SEOContextValue = {
    trackEvent: EventTrackers,
    updateSEO
  };

  return (
    <SEOContext.Provider value={contextValue}>
      <SEOHead {...currentSEO} />
      <AnalyticsTracker />
      {children}
    </SEOContext.Provider>
  );
}

// Route-specific SEO configurations
function getRouteSEO(location: string): Partial<typeof currentSEO> {
  const route = location.split('/')[1] || 'home';

  const routeConfigs: Record<string, any> = {
    home: {
      title: "AIChecklist.io - AI-Powered Task Management & 226+ Professional Templates",
      description: "Transform your productivity with AIChecklist.io - featuring AIDOMO AI assistant, 226+ professional templates, voice authentication, smart calendar sync, and Gantt charts. Start free today!",
      keywords: "AI checklist, task management, productivity app, AIDOMO AI, voice authentication, project templates, team collaboration, Gantt chart, PERT chart",
      structuredData: seoConfig.schemas.organization
    },
    calendar: {
      title: "Smart AI Calendar with Task Scheduling | AIChecklist.io",
      description: "AI-powered calendar with intelligent task scheduling, Google Calendar sync, AIDOMO integration, and timezone-aware planning. Schedule tasks naturally with voice commands.",
      keywords: "AI calendar, task scheduling, smart calendar, Google Calendar sync, AIDOMO, voice scheduling, productivity calendar",
      structuredData: seoConfig.schemas.software
    },
    templates: {
      title: "226+ Professional Checklist Templates for Every Industry | AIChecklist.io",
      description: "Access 226+ ready-to-use professional checklist templates for business, startups, healthcare, education, real estate, and more. AI-powered templates with smart task management.",
      keywords: "checklist templates, business checklists, startup templates, project templates, healthcare checklists, education templates, real estate checklists",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Professional Checklist Templates",
        "description": "226+ professional checklist templates for various industries",
        "numberOfItems": 226
      }
    },
    help: {
      title: "Help Center & Support | AIChecklist.io",
      description: "Get help with AIChecklist.io features including AIDOMO AI assistant, voice authentication, calendar integration, templates, and productivity tools. Quick guides and tutorials.",
      keywords: "help, support, tutorial, AIDOMO help, voice authentication guide, FAQ, how to use",
      structuredData: seoConfig.schemas.faq
    },
    achievements: {
      title: "Gamified Achievements & Productivity Tracking | AIChecklist.io",
      description: "Track your productivity with gamified achievements, progress monitoring, streaks, and performance analytics. Unlock rewards and stay motivated with AIChecklist.io.",
      keywords: "achievements, productivity tracking, gamification, progress monitoring, productivity streaks, rewards"
    },
    reports: {
      title: "AI-Powered Productivity Reports & Analytics | AIChecklist.io",
      description: "Generate comprehensive AI-powered productivity reports with task analytics, completion trends, time tracking insights, and exportable data. Make data-driven decisions.",
      keywords: "productivity reports, task analytics, AI reports, productivity analytics, time tracking, data insights"
    },
    statistics: {
      title: "Task Statistics & Performance Dashboard | AIChecklist.io",
      description: "View detailed task statistics, completion rates, productivity trends, and performance metrics. Track your progress with beautiful charts and actionable insights.",
      keywords: "task statistics, performance dashboard, productivity metrics, completion rates, progress tracking"
    },
    gantt: {
      title: "AI-Powered Gantt Chart for Project Management | AIChecklist.io",
      description: "Create professional Gantt charts with AI assistance. Visualize project timelines, dependencies, milestones, and task scheduling. Perfect for team collaboration.",
      keywords: "Gantt chart, project management, timeline planning, task dependencies, project visualization, AI project planning"
    },
    pert: {
      title: "PERT Chart Tool for Project Analysis | AIChecklist.io",
      description: "Build PERT charts for project analysis with critical path calculation, time estimation, and dependency mapping. Optimize your project workflows with AI assistance.",
      keywords: "PERT chart, project analysis, critical path, project planning, time estimation, workflow optimization"
    },
    projects: {
      title: "Project Management & Visualization Tools | AIChecklist.io",
      description: "Complete project management suite with Gantt charts, PERT diagrams, task dependencies, and AI-powered planning. Manage complex projects with ease.",
      keywords: "project management, project charts, task visualization, project planning, team projects"
    },
    settings: {
      title: "Account Settings | AIChecklist.io",
      description: "Manage your AIChecklist.io account settings, preferences, notifications, and integrations.",
      keywords: "settings, account, preferences",
      noIndex: true
    },
    subscription: {
      title: "Subscription Plans & Pricing | AIChecklist.io",
      description: "Choose the perfect AIChecklist.io plan for your needs. Free starter plan, Pro features, and Enterprise solutions with AIDOMO AI, templates, and advanced analytics.",
      keywords: "pricing, subscription, plans, free plan, pro features, enterprise"
    },
    auth: {
      title: "Login to AIChecklist.io | Secure Access",
      description: "Securely login to your AIChecklist.io account with email, password, or voice biometric authentication. Access your tasks and AI assistant anywhere.",
      keywords: "login, sign in, authentication, voice login, secure access"
    },
    schedule: {
      title: "Book an Appointment | AIChecklist.io Scheduling",
      description: "Schedule appointments and meetings with easy online booking. Integrated with your calendar for seamless scheduling and reminders.",
      keywords: "appointment booking, online scheduling, meeting scheduler, calendar booking"
    },
    feedback: {
      title: "Share Your Feedback | AIChecklist.io",
      description: "We value your feedback! Share your suggestions, report issues, or tell us what you love about AIChecklist.io. Help us improve your productivity experience.",
      keywords: "feedback, suggestions, feature request, support, contact"
    },
    admin: {
      title: "Admin Dashboard - AIChecklist.io",
      description: "Administrative controls for AIChecklist.io platform management.",
      keywords: "admin, dashboard, management",
      noIndex: true
    }
  };

  return routeConfigs[route] || routeConfigs.home;
}