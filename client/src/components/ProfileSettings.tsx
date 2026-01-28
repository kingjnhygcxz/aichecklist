import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Building, MapPin, Camera, Pencil, Check, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserProfile {
  id: number;
  fullName?: string;
  companyName?: string;
  address?: string;
  profilePictureUrl?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export function ProfileSettings() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    address: "",
    profilePictureUrl: ""
  });

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/auth/user"],
    enabled: !!localStorage.getItem('sessionId'),
  });

  // Update form data when profile data changes
  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : ""),
        companyName: profile.companyName || profile.company || "",
        address: profile.address || "",
        profilePictureUrl: profile.profilePictureUrl || ""
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "✨ Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : ""),
        companyName: profile.companyName || profile.company || "",
        address: profile.address || "",
        profilePictureUrl: profile.profilePictureUrl || ""
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="bg-muted h-32 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="bg-muted h-4 rounded w-3/4"></div>
            <div className="bg-muted h-4 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <CardContent className="p-8 relative">
          <div className="flex items-start gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20 transition-all duration-200 group-hover:ring-primary/30">
                <AvatarImage 
                  src={formData.profilePictureUrl || profile?.profilePictureUrl} 
                  alt="Profile picture"
                  className="object-cover"
                />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  {(formData.fullName || profile?.fullName || profile?.username || "U")
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => document.getElementById('profilePicture')?.focus()}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {formData.fullName || profile?.fullName || profile?.username || "User"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AIChecklist Member
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? "" : "bg-primary hover:bg-primary/90"}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>{profile?.email || "No email set"}</span>
                </div>
                {(formData.companyName || profile?.companyName || profile?.company) && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span>{formData.companyName || profile?.companyName || profile?.company}</span>
                  </div>
                )}
                {formData.address && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{formData.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form Card */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Edit Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal and business details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture URL Input */}
            <div className="space-y-2">
              <Label htmlFor="profilePicture" className="text-sm font-medium">Profile Picture URL</Label>
              <div className="flex gap-3">
                <Input
                  id="profilePicture"
                  value={formData.profilePictureUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, profilePictureUrl: e.target.value }))}
                  placeholder="https://example.com/profile.jpg"
                  className="flex-1"
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="h-11 bg-muted/50 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed in profile settings
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2 text-sm font-medium">
                <Building className="h-4 w-4 text-primary" />
                Company Name
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Enter your company or organization name"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your full address"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button 
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
                className="border-muted-foreground/20"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}