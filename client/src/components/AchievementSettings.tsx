import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Trophy, Database, Shield, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserPreferences {
  achievementsEnabled: boolean;
  dataCollectionConsent: boolean;
}

export function AchievementSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current user preferences
  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ['/api/user/preferences'],
  });

  const [localPreferences, setLocalPreferences] = useState<UserPreferences>({
    achievementsEnabled: preferences?.achievementsEnabled ?? true,
    dataCollectionConsent: preferences?.dataCollectionConsent ?? false,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: UserPreferences) =>
      apiRequest('PATCH', '/api/user/preferences', newPreferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      setHasChanges(false);
      toast({
        title: "Settings Updated",
        description: "Your achievement and data collection preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(localPreferences);
  };

  const handleReset = () => {
    setLocalPreferences({
      achievementsEnabled: preferences?.achievementsEnabled ?? true,
      dataCollectionConsent: preferences?.dataCollectionConsent ?? false,
    });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievement Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievement & Data Settings
        </CardTitle>
        <CardDescription>
          Customize your achievement experience and help improve our software
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Achievement Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="achievements-enabled" className="text-base font-medium">
                Enable Achievement Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show achievement celebrations and progress notifications
              </p>
            </div>
            <Switch
              id="achievements-enabled"
              checked={localPreferences.achievementsEnabled}
              onCheckedChange={(checked) => handlePreferenceChange('achievementsEnabled', checked)}
            />
          </div>

          {!localPreferences.achievementsEnabled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Achievements are disabled. You won't see achievement notifications, but your progress is still tracked.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Data Collection Consent */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="data-collection" className="text-base font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Help Improve AIChecklist
              </Label>
              <p className="text-sm text-muted-foreground">
                Share anonymized usage data to help us improve the software
              </p>
            </div>
            <Switch
              id="data-collection"
              checked={localPreferences.dataCollectionConsent}
              onCheckedChange={(checked) => handlePreferenceChange('dataCollectionConsent', checked)}
            />
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy First:</strong> We only collect anonymized behavioral data like task completion patterns 
              and feature usage. No personal information, task content, or identifying data is ever collected.
            </AlertDescription>
          </Alert>

          {localPreferences.dataCollectionConsent && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What data we collect:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Task completion patterns (category, priority, timing)</li>
                <li>Feature usage statistics (which features are used most)</li>
                <li>Achievement earning patterns</li>
                <li>General app performance metrics</li>
              </ul>
              <p className="mt-2 text-xs">
                All data is anonymized and aggregated. You can disable this at any time.
              </p>
            </div>
          )}
        </div>

        {/* Save/Reset Buttons */}
        {hasChanges && (
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={updatePreferencesMutation.isPending}
            >
              {updatePreferencesMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={updatePreferencesMutation.isPending}
            >
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}