import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AchievementSettings } from "@/components/AchievementSettings";
import { ProfileSettings } from "@/components/ProfileSettings";
import { AdminContent } from "@/components/AdminContent";
import { ArchiveSettings } from "@/components/settings/ArchiveSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon } from "lucide-react";
import { useState, Suspense, lazy, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

// Lazy load heavy components to improve performance
const LazyProfileSettings = lazy(() => import("@/components/ProfileSettings").then(m => ({ default: m.ProfileSettings })));
const LazyAchievementSettings = lazy(() => import("@/components/AchievementSettings").then(m => ({ default: m.AchievementSettings })));
const LazyAdminContent = lazy(() => import("@/components/AdminContent").then(m => ({ default: m.AdminContent })));
const LazyArchiveSettings = lazy(() => import("@/components/settings/ArchiveSettings").then(m => ({ default: m.ArchiveSettings })));
const LazyGeneralSettings = lazy(() => import("@/components/GeneralSettings").then(m => ({ default: m.GeneralSettings })));
const LazySchedulingSettings = lazy(() => import("@/components/SchedulingSettings").then(m => ({ default: m.SchedulingSettings })));
const LazyNotionSettings = lazy(() => import("@/components/NotionSettings").then(m => ({ default: m.NotionSettings })));
const LazyTrelloSettings = lazy(() => import("@/components/TrelloSettings").then(m => ({ default: m.TrelloSettings })));

// Loading component for better UX
const TabLoading = () => (
  <Card>
    <CardContent className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </CardContent>
  </Card>
);

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [location] = useLocation();
  
  // Check if user is admin or founder (founders have admin access)
  const { data: user } = useQuery<{ customerType?: string }>({
    queryKey: ['/api/user'],
  });
  const isAdmin = user?.customerType === 'admin' || user?.customerType === 'founder';

  // Check URL hash on mount to open specific tab
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'scheduling') {
      setActiveTab('scheduling');
    }
  }, []);

  // Scroll to block specific times section when scheduling tab becomes active from hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (activeTab === 'scheduling' && hash === 'scheduling') {
      // Wait for lazy-loaded component to render, then scroll to block specific times
      const scrollToBlockTimes = () => {
        const element = document.getElementById('block-specific-times');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Try again if element not found yet
          setTimeout(scrollToBlockTimes, 100);
        }
      };
      setTimeout(scrollToBlockTimes, 500);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 lg:px-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and application settings
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>}
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-0">
              <Suspense fallback={<TabLoading />}>
                {activeTab === "profile" && <LazyProfileSettings />}
              </Suspense>
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-0">
              <Suspense fallback={<TabLoading />}>
                {activeTab === "achievements" && <LazyAchievementSettings />}
              </Suspense>
            </TabsContent>
            
            <TabsContent value="archive" className="mt-0">
              <Suspense fallback={<TabLoading />}>
                {activeTab === "archive" && <LazyArchiveSettings />}
              </Suspense>
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="admin" className="mt-0">
                <Suspense fallback={<TabLoading />}>
                  {activeTab === "admin" && <LazyAdminContent />}
                </Suspense>
              </TabsContent>
            )}
            
            <TabsContent value="scheduling" className="mt-0">
              <Suspense fallback={<TabLoading />}>
                {activeTab === "scheduling" && <LazySchedulingSettings />}
              </Suspense>
            </TabsContent>
            
            <TabsContent value="general" className="mt-0">
              <Suspense fallback={<TabLoading />}>
                {activeTab === "general" && <LazyGeneralSettings />}
              </Suspense>
            </TabsContent>
            
            <TabsContent value="integrations" className="mt-0">
              <Suspense fallback={<TabLoading />}>
                {activeTab === "integrations" && (
                  <div className="space-y-8">
                    <LazyNotionSettings />
                    <LazyTrelloSettings />
                  </div>
                )}
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Settings;