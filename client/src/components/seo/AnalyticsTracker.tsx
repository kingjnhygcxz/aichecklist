import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Analytics event tracking utility
export function trackEvent(action: string, category: string = 'engagement', label?: string, value?: number) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
  
  // Also send to custom analytics endpoint for internal tracking
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      category,
      label,
      value,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  }).catch(console.error);
}

// Core Web Vitals tracking
export function trackCoreWebVitals() {
  if (typeof gtag !== 'undefined') {
    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          gtag('event', 'LCP', {
            event_category: 'Web Vitals',
            value: Math.round(entry.startTime)
          });
        }
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        gtag('event', 'FID', {
          event_category: 'Web Vitals',
          value: Math.round(entry.processingStart - entry.startTime)
        });
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Send CLS when page unloads
    addEventListener('beforeunload', () => {
      gtag('event', 'CLS', {
        event_category: 'Web Vitals',
        value: Math.round(clsValue * 1000)
      });
    });
  }
}

// Scroll depth tracking
export function trackScrollDepth() {
  let maxScroll = 0;
  let scrollTimeout: NodeJS.Timeout;

  const trackScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      // Track milestone scroll depths
      if ([25, 50, 75, 90, 100].includes(scrollPercent)) {
        trackEvent(`scroll_${scrollPercent}`, 'engagement');
      }
    }
  };

  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackScroll, 100);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}

// Time on page tracking
export function trackTimeOnPage() {
  const startTime = Date.now();
  
  const sendTimeOnPage = () => {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    trackEvent('time_on_page', 'engagement', window.location.pathname, timeOnPage);
  };

  // Track when user leaves page
  window.addEventListener('beforeunload', sendTimeOnPage);
  
  // Track at intervals for active users
  const intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
  intervals.forEach(seconds => {
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        trackEvent(`active_${seconds}s`, 'engagement');
      }
    }, seconds * 1000);
  });

  return sendTimeOnPage;
}

// Main analytics component
export function AnalyticsTracker() {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view
    trackEvent('page_view', 'navigation', location);
    
    // Initialize Core Web Vitals tracking
    trackCoreWebVitals();
    
    // Initialize scroll depth tracking
    const removeScrollListener = trackScrollDepth();
    
    // Initialize time on page tracking
    const sendTimeOnPage = trackTimeOnPage();
    
    return () => {
      removeScrollListener();
      sendTimeOnPage();
    };
  }, [location]);

  return null;
}

// Specific event trackers for common actions
export const EventTrackers = {
  taskCreated: (category: string) => trackEvent('task_created', 'tasks', category),
  taskCompleted: (category: string) => trackEvent('task_completed', 'tasks', category),
  templateUsed: (templateId: string) => trackEvent('template_used', 'templates', templateId),
  aidomoUsed: (query: string) => trackEvent('aidomo_query', 'ai', query.substring(0, 50)),
  calendarViewed: () => trackEvent('calendar_viewed', 'navigation'),
  helpViewed: () => trackEvent('help_viewed', 'support'),
  shareClicked: (type: string) => trackEvent('share_clicked', 'social', type),
  downloadStarted: () => trackEvent('download_started', 'engagement'),
  signupStarted: () => trackEvent('signup_started', 'conversion'),
  signupCompleted: () => trackEvent('signup_completed', 'conversion'),
  subscriptionStarted: () => trackEvent('subscription_started', 'revenue'),
  subscriptionCompleted: (plan: string) => trackEvent('subscription_completed', 'revenue', plan),
  errorOccurred: (error: string) => trackEvent('error', 'system', error),
  searchPerformed: (query: string) => trackEvent('search', 'navigation', query),
  feedbackSubmitted: (rating: number) => trackEvent('feedback_submitted', 'support', 'rating', rating)
};