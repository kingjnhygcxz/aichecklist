import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, Suspense, lazy } from "react";

// Core pages - minimal direct imports
import NotFound from "@/pages/not-found";

// Lazy load ALL pages to reduce main bundle size
const Home = lazy(() => import("@/pages/Home"));
const Auth = lazy(() => import("@/pages/Auth").then(module => ({ default: module.Auth })));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword").then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import("@/pages/ResetPassword").then(module => ({ default: module.ResetPassword })));
const HelpPage = lazy(() => import("@/pages/HelpPage").then(module => ({ default: module.HelpPage })));

// Heavy pages - lazy load to reduce initial bundle
const Admin = lazy(() => import("@/pages/Admin"));
const AdminAnalytics = lazy(() => import("@/pages/AdminAnalytics").then(module => ({ default: module.AdminAnalytics })));
const SharedTask = lazy(() => import("@/pages/SharedTask"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const FeedbackPage = lazy(() => import("@/pages/FeedbackPage").then(module => ({ default: module.FeedbackPage })));
const Achievements = lazy(() => import("@/pages/Achievements"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const GanttChart = lazy(() => import("@/pages/GanttChart").then(module => ({ default: module.GanttChart })));
const PertChart = lazy(() => import("@/pages/PertChart").then(module => ({ default: module.PertChart })));
const ProjectCharts = lazy(() => import("@/pages/ProjectCharts").then(module => ({ default: module.ProjectCharts })));
const SharedView = lazy(() => import("@/pages/SharedView"));
const Calendar = lazy(() => import("@/pages/Calendar").then(module => ({ default: module.Calendar })));
const Settings = lazy(() => import("@/pages/Settings").then(module => ({ default: module.Settings })));
const PublicScheduling = lazy(() => import("@/pages/PublicScheduling").then(module => ({ default: module.PublicScheduling })));
const PublicReservations = lazy(() => import("@/pages/PublicReservations").then(module => ({ default: module.PublicReservations })));
const RobotDemo = lazy(() => import("@/pages/RobotDemo"));
const WaitlistLanding = lazy(() => import("@/pages/WaitlistLanding").then(module => ({ default: module.WaitlistLanding })));
const Reports = lazy(() => import("@/pages/Reports"));
const HolidayAuth = lazy(() => import("@/pages/holiday-themes/HolidayAuth").then(module => ({ default: module.HolidayAuth })));
const Extension = lazy(() => import("@/pages/Extension"));
const Inbox = lazy(() => import("@/pages/Inbox"));
const InboxThread = lazy(() => import("@/pages/InboxThread"));
// Lazy load providers and UI components
const ThemeProvider = lazy(() => import("./context/ThemeContext").then(module => ({ default: module.ThemeProvider })));
const ColorOverlayProvider = lazy(() => import("./context/ColorOverlayContext").then(module => ({ default: module.ColorOverlayProvider })));
const TabletProvider = lazy(() => import("./context/TabletContext").then(module => ({ default: module.TabletProvider })));
const ColorOverlay = lazy(() => import("@/components/ui/ColorOverlay").then(module => ({ default: module.ColorOverlay })));
const QuickAccessOverlay = lazy(() => import("@/components/ui/QuickAccessOverlay").then(module => ({ default: module.QuickAccessOverlay })));
const TabletModeManager = lazy(() => import("@/components/ui/TabletModeManager").then(module => ({ default: module.TabletModeManager })));
const AuthGuard = lazy(() => import("@/components/auth/AuthGuard").then(module => ({ default: module.AuthGuard })));
const GlobalAudioElements = lazy(() => import("@/components/audio/GlobalAudioElements").then(module => ({ default: module.GlobalAudioElements })));
const ErrorBoundary = lazy(() => import("@/components/ErrorBoundary").then(module => ({ default: module.ErrorBoundary })));
const SEOProvider = lazy(() => import("@/components/seo/SEOProvider").then(module => ({ default: module.SEOProvider })));

// Loading spinner component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  console.log("Router component rendering");
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public routes */}
        <Route path="/auth" component={Auth} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/share/:shareId" component={({params}: {params: {shareId: string}}) => <SharedTask shareId={params.shareId} />} />
        <Route path="/shared/:shareId" component={SharedView} />
        <Route path="/schedule/:slug" component={({params}: {params: {slug: string}}) => <PublicScheduling slug={params.slug} />} />
        <Route path="/reservations/:slug" component={({params}: {params: {slug: string}}) => <PublicReservations slug={params.slug} />} />
        <Route path="/help" component={HelpPage} />
        <Route path="/robots" component={RobotDemo} />
        <Route path="/waitlist" component={WaitlistLanding} />
        <Route path="/holiday" component={HolidayAuth} />
        <Route path="/extension" component={Extension} />
      
      {/* Home route - protected */}
      <Route path="/">
        <AuthGuard>
          <Home />
        </AuthGuard>
      </Route>

      {/* Protected routes */}
      <Route path="/admin">
        <AuthGuard>
          <Admin />
        </AuthGuard>
      </Route>
      <Route path="/admin/analytics">
        <AuthGuard>
          <AdminAnalytics />
        </AuthGuard>
      </Route>
      <Route path="/pricing">
        <AuthGuard>
          <Subscription />
        </AuthGuard>
      </Route>
      <Route path="/subscription">
        <AuthGuard>
          <Subscription />
        </AuthGuard>
      </Route>
      <Route path="/feedback">
        <AuthGuard>
          <FeedbackPage />
        </AuthGuard>
      </Route>
      <Route path="/achievements">
        <AuthGuard>
          <Achievements />
        </AuthGuard>
      </Route>

      <Route path="/gantt">
        <AuthGuard>
          <GanttChart />
        </AuthGuard>
      </Route>
      <Route path="/pert">
        <AuthGuard>
          <PertChart />
        </AuthGuard>
      </Route>
      <Route path="/charts">
        <AuthGuard>
          <ProjectCharts />
        </AuthGuard>
      </Route>
      <Route path="/calendar">
        <AuthGuard>
          <Calendar />
        </AuthGuard>
      </Route>
      <Route path="/settings">
        <AuthGuard>
          <Settings />
        </AuthGuard>
      </Route>
      <Route path="/reports">
        <AuthGuard>
          <Reports />
        </AuthGuard>
      </Route>
      <Route path="/aidomo/inbox">
        <AuthGuard>
          <Inbox />
        </AuthGuard>
      </Route>
      <Route path="/aidomo/inbox/thread/:threadId">
        {({params}: {params: {threadId: string}}) => (
          <AuthGuard>
            <InboxThread threadId={params.threadId} />
          </AuthGuard>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  console.log("App component rendering");
  
  useEffect(() => {
    console.log("App useEffect running");
    // Initialize text size from localStorage
    const savedTextSize = localStorage.getItem('textSize');
    if (savedTextSize) {
      document.documentElement.style.fontSize = `${savedTextSize}%`;
    }
    
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<PageLoader />}>
            <ThemeProvider>
              <Suspense fallback={<PageLoader />}>
                <TabletProvider>
                  <Suspense fallback={<PageLoader />}>
                    <ColorOverlayProvider>
                      <Suspense fallback={<PageLoader />}>
                        <SEOProvider>
                          <Router />
                        </SEOProvider>
                      </Suspense>
                      <Suspense fallback={<div className="hidden" />}>
                        <ColorOverlay />
                      </Suspense>
                      <Suspense fallback={<div className="hidden" />}>
                        <QuickAccessOverlay />
                      </Suspense>
                      <Suspense fallback={<div className="hidden" />}>
                        <GlobalAudioElements />
                      </Suspense>
                      <Suspense fallback={<div className="hidden" />}>
                        <TabletModeManager />
                      </Suspense>
                      <Toaster />
                    </ColorOverlayProvider>
                  </Suspense>
                </TabletProvider>
              </Suspense>
            </ThemeProvider>
          </Suspense>
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
}

export default App;
