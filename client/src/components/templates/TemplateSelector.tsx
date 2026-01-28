import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileText, UserCheck, ListTodo, Timer, Search, X, ListChecks, BookOpen, Lock, Star, Clock, Heart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";

interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  tasks: any[];
  usageCount: number;
  tags: string[];
  isPublic: boolean;
}

interface TemplateSelectorProps {
  onTemplateUsed?: (tasks: any[]) => void;
  defaultMode?: "template" | "checklist";
}

export function TemplateSelector({ onTemplateUsed, defaultMode = "template" }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("popular");
  const [templateMode, setTemplateMode] = useState<"template" | "checklist">(defaultMode);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Trial status check
  const { isActive: hasActiveSubscription, isExpired: trialExpired } = useTrialStatus();

  const { data: templates = [], isLoading } = useQuery<TaskTemplate[]>({
    queryKey: ['/api/templates'],
  });

  // Fetch user's favorite template IDs
  const { data: favoritesData, isLoading: favoritesLoading, isError: favoritesError } = useQuery<{ favoriteIds: number[] }>({
    queryKey: ['/api/templates/favorites'],
  });
  const favoriteIds = favoritesData?.favoriteIds || [];

  // Fetch user's template usage history
  const { data: historyData, isLoading: historyLoading, isError: historyError } = useQuery<{ history: { templateId: number; templateName: string; usedAt: string }[] }>({
    queryKey: ['/api/templates/history'],
  });
  const usageHistory = historyData?.history || [];

  // Add/remove favorite mutations
  const addFavoriteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      await apiRequest('POST', `/api/templates/favorites/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates/favorites'] });
      toast({ title: "Added to favorites" });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      await apiRequest('DELETE', `/api/templates/favorites/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates/favorites'] });
      toast({ title: "Removed from favorites" });
    },
  });

  const toggleFavorite = (templateId: number) => {
    if (favoriteIds.includes(templateId)) {
      removeFavoriteMutation.mutate(templateId);
    } else {
      addFavoriteMutation.mutate(templateId);
    }
  };

  const useTemplateMutation = useMutation({
    mutationFn: async ({ templateId, mode }: { templateId: number; mode: "template" | "checklist" }) => {
      const response = await apiRequest('POST', `/api/templates/use/${templateId}`, { mode });
      return await response.json();
    },
    onSuccess: (data: any) => {
      // Update the cache directly instead of invalidating to avoid screen flash
      queryClient.setQueryData(['/api/tasks'], (oldData: any) => {
        if (!oldData) return data.createdTasks;
        return [...data.createdTasks, ...oldData];
      });
      
      // Also update with date-specific queries if they exist
      const today = new Date().toISOString().split('T')[0];
      queryClient.setQueryData(['/api/tasks', today], (oldData: any) => {
        if (!oldData) return data.createdTasks;
        return [...data.createdTasks, ...oldData];
      });
      
      toast({
        title: "Template Applied!",
        description: data.message,
      });
      setOpen(false);
      onTemplateUsed?.(data.createdTasks);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Apply Template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates || [];
    
    const query = searchQuery.toLowerCase();
    return (templates || []).filter((template: TaskTemplate) => {
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }, [templates, searchQuery]);

  const groupedTemplates = (filteredTemplates || []).reduce((acc: Record<string, TaskTemplate[]>, template: TaskTemplate) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});

  // Get popular templates from filtered results
  const popularTemplates = (filteredTemplates || [])
    .sort((a: TaskTemplate, b: TaskTemplate) => b.usageCount - a.usageCount)
    .slice(0, 6);

  const handleUseTemplate = (templateId: number) => {
    // Check if trial is expired
    if (trialExpired && !hasActiveSubscription) {
      setOpen(false);
      setShowTrialExpiredModal(true);
      return;
    }
    useTemplateMutation.mutate({ templateId, mode: templateMode });
  };

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="p-1.5 rounded-md border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          aria-label="Use template"
          title="Use Template"
        >
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[95vh] top-[2.5%] translate-y-0">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose a Template</DialogTitle>
        </DialogHeader>
        
        {/* Template Mode Selection - Compact */}
        <div className="mb-2 p-2 bg-muted/30 rounded-md">
          <p className="text-xs font-medium mb-1 text-foreground">Apply as:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTemplateMode("template")}
              className={`p-2 rounded border transition-all duration-200 text-left ${
                templateMode === "template"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center space-x-1">
                <BookOpen className="h-3 w-3" />
                <span className="text-xs font-medium">Multiple items on TodoList</span>
              </div>
            </button>
            <button
              onClick={() => setTemplateMode("checklist")}
              className={`p-2 rounded border transition-all duration-200 text-left ${
                templateMode === "checklist"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center space-x-1">
                <ListChecks className="h-3 w-3" />
                <span className="text-xs font-medium">Single Checklist</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Switch to search results tab when typing
              if (e.target.value.trim() && activeTab !== "search") {
                setActiveTab("search");
              } else if (!e.target.value.trim() && activeTab === "search") {
                setActiveTab("popular");
              }
            }}
            className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTab("popular");
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-11 transition-all duration-200 text-xs">
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="productivity">Personal</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="executive">Executive</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="culinary">Culinary</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            {searchQuery && (
              <TabsTrigger value="search" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                Search ({filteredTemplates.length})
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {favoritesLoading ? (
                  <div className="col-span-2 text-center py-12">
                    <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium mb-2">Loading favorites...</h3>
                  </div>
                ) : favoritesError ? (
                  <div className="col-span-2 text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Unable to load favorites</h3>
                    <p className="text-muted-foreground">Please try again later</p>
                  </div>
                ) : favoriteIds.length > 0 ? (
                  templates
                    .filter((t: TaskTemplate) => favoriteIds.includes(t.id))
                    .map((template: TaskTemplate) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onUse={() => handleUseTemplate(template.id)}
                        isLoading={useTemplateMutation.isPending}
                        isFavorite={true}
                        onToggleFavorite={() => toggleFavorite(template.id)}
                      />
                    ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground">
                      Click the star icon on any template to save it as a favorite for quick access.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Recent/History Tab */}
          <TabsContent value="history" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {historyLoading ? (
                  <div className="col-span-2 text-center py-12">
                    <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium mb-2">Loading recent templates...</h3>
                  </div>
                ) : historyError ? (
                  <div className="col-span-2 text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Unable to load history</h3>
                    <p className="text-muted-foreground">Please try again later</p>
                  </div>
                ) : usageHistory.length > 0 ? (
                  // Get unique template IDs from history (most recent first)
                  [...new Set(usageHistory.map(h => h.templateId))]
                    .slice(0, 10)
                    .map(templateId => {
                      const template = templates.find((t: TaskTemplate) => t.id === templateId);
                      const historyItem = usageHistory.find(h => h.templateId === templateId);
                      if (!template) return null;
                      return (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onUse={() => handleUseTemplate(template.id)}
                          isLoading={useTemplateMutation.isPending}
                          isFavorite={favoriteIds.includes(template.id)}
                          onToggleFavorite={() => toggleFavorite(template.id)}
                          lastUsed={historyItem?.usedAt}
                        />
                      );
                    })
                    .filter(Boolean)
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No recent templates</h3>
                    <p className="text-muted-foreground">
                      Templates you use will appear here for quick access.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="popular" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {popularTemplates.map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {popularTemplates.length === 0 && searchQuery && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    No popular templates match your search
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="productivity" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {(groupedTemplates["Personal Productivity"] || []).map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {(groupedTemplates["Personal Productivity"] || []).length === 0 && searchQuery && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    No productivity templates match your search
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="projects" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ...(groupedTemplates["Project Management"] || []),
                  ...(groupedTemplates["Strategic Planning"] || [])
                ].map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {[...Object.keys(groupedTemplates)].filter(key => 
                  key === "Project Management" || key === "Strategic Planning"
                ).length === 0 && searchQuery && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    No project templates match your search
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="security" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {(groupedTemplates["Security & Compliance"] || []).map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {(groupedTemplates["Security & Compliance"] || []).length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    {isLoading ? "Loading security templates..." : "No security templates available"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="executive" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {(groupedTemplates["Executive Leadership"] || []).map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {(groupedTemplates["Executive Leadership"] || []).length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    {isLoading ? "Loading executive templates..." : "No executive templates available"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="operations" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {(groupedTemplates["Operations & Management"] || []).map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {(groupedTemplates["Operations & Management"] || []).length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    {isLoading ? "Loading operations templates..." : "No operations templates available"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="health" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {(groupedTemplates["Health & Wellness"] || []).map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {(groupedTemplates["Health & Wellness"] || []).length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    {isLoading ? "Loading health templates..." : "No health templates available"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="culinary" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {(groupedTemplates["Culinary & Cooking"] || []).map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {(groupedTemplates["Culinary & Cooking"] || []).length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    {isLoading ? "Loading culinary templates..." : "No culinary templates available"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="academic" className="mt-2">
            <ScrollArea className="h-[55vh]">
              <div className="grid gap-4 md:grid-cols-2">
                {(groupedTemplates["Academic & Research"] || []).map((template: TaskTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template.id)}
                    isLoading={useTemplateMutation.isPending}
                    isFavorite={favoriteIds.includes(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
                {(groupedTemplates["Academic & Research"] || []).length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    {isLoading ? "Loading academic templates..." : "No academic templates available"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Search Results Tab */}
          {searchQuery && (
            <TabsContent value="search" className="mt-2">
              <ScrollArea className="h-[55vh]">
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredTemplates.map((template: TaskTemplate) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUse={() => handleUseTemplate(template.id)}
                      isLoading={useTemplateMutation.isPending}
                      searchQuery={searchQuery}
                      isFavorite={favoriteIds.includes(template.id)}
                      onToggleFavorite={() => toggleFavorite(template.id)}
                    />
                  ))}
                  {filteredTemplates.length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No templates found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search terms or browse our categories above.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
        
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <div className="text-muted-foreground">Loading templates...</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* Trial Expired Modal */}
    <TrialExpiredModal
      isOpen={showTrialExpiredModal}
      onClose={() => setShowTrialExpiredModal(false)}
      feature="templates"
    />
    </>
  );
}

interface TemplateCardProps {
  template: TaskTemplate;
  onUse: () => void;
  isLoading: boolean;
  searchQuery?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  lastUsed?: string;
}

// Helper function to highlight search terms
function highlightText(text: string, searchQuery?: string) {
  if (!searchQuery) return text;
  
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
        {part}
      </mark>
    ) : part
  );
}

function TemplateCard({ template, onUse, isLoading, searchQuery, isFavorite, onToggleFavorite, lastUsed }: TemplateCardProps) {
  const formatLastUsed = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex-1">
            {highlightText(template.name, searchQuery)}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`} />
              </button>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <UserCheck className="h-3 w-3" />
              {template.usageCount}
            </div>
          </div>
        </div>
        <CardDescription className="text-sm">
          {highlightText(template.description, searchQuery)}
          {lastUsed && (
            <span className="block mt-1 text-xs text-primary">
              Last used: {formatLastUsed(lastUsed)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ListTodo className="h-3 w-3" />
            {template.tasks.length} tasks
            {template.tasks.some((task: any) => task.timer) && (
              <>
                <span>•</span>
                <Timer className="h-3 w-3" />
                Includes timers
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant={searchQuery && tag.toLowerCase().includes(searchQuery.toLowerCase()) ? "default" : "secondary"} 
                className="text-xs"
              >
                {highlightText(tag, searchQuery)}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <Button 
            onClick={onUse} 
            disabled={isLoading}
            className="w-full"
            size="sm"
          >
            {isLoading ? "Applying..." : "Use Template"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}