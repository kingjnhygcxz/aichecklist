import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Link as LinkIcon, Check, Copy, X, ExternalLink, Plus, CalendarCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar as DatePicker } from "@/components/ui/calendar";

export function SchedulingSettings() {
  const { toast } = useToast();
  const [copiedSlug, setCopiedSlug] = useState(false);
  
  // Local state for form values
  const [formData, setFormData] = useState({
    meetingTitle: "",
    meetingDescription: "",
    slotDuration: 30,
    bookingWindowDays: 30,
    notificationEmail: "",
    showBranding: false,
    businessName: "",
    businessPhone: "",
    brandingLogoUrl: "",
    brandPrimaryColor: "#16a34a",
    brandBackgroundColor: "#ffffff",
    brandAccentColor: "#16a34a",
    reservationPageEnabled: false,
    // Regular Appointment Page Colors
    appointmentPagePrimaryColor: "#16a34a",
    appointmentPageBackgroundColor: "#ffffff",
    appointmentPageAccentColor: "#16a34a",
    // Appointment Page V2 Colors
    appointmentPageV2PrimaryColor: "#16a34a",
    appointmentPageV2BackgroundColor: "#ffffff",
    appointmentPageV2AccentColor: "#16a34a",
    appointmentPageV2CalendarBg: "blue",
    // Weekly Availability
    availability: {
      monday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      friday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] },
    },
    // Blocked Dates
    blockedDates: [],
    blockedTimeSlots: [],
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/scheduling/settings"],
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/scheduling/appointments"],
  });

  // Calendar sync status
  const { data: calendarStatus } = useQuery({
    queryKey: ["/api/calendar/status"],
  });

  const connectGoogleCalendar = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/calendar/google/auth-url");
      window.location.href = response.authUrl;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive",
      });
    },
  });

  const disconnectCalendar = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/calendar/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/status"] });
      toast({
        title: "Calendar disconnected",
        description: "Google Calendar has been disconnected",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect calendar",
        variant: "destructive",
      });
    },
  });

  const toggleCalendarSync = useMutation({
    mutationFn: async (enabled: boolean) => {
      return await apiRequest("POST", "/api/calendar/toggle-sync", { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/status"] });
      toast({
        title: "Calendar sync updated",
        description: "Your calendar sync preference has been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update calendar sync",
        variant: "destructive",
      });
    },
  });

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        meetingTitle: settings.meetingTitle || "",
        meetingDescription: settings.meetingDescription || "",
        slotDuration: settings.slotDuration || 30,
        bookingWindowDays: settings.bookingWindowDays || 30,
        notificationEmail: settings.notificationEmail || "",
        showBranding: settings.showBranding || false,
        businessName: settings.businessName || "",
        businessPhone: settings.businessPhone || "",
        brandingLogoUrl: settings.brandingLogoUrl || "",
        brandPrimaryColor: settings.user?.brandPrimaryColor || "#16a34a",
        brandBackgroundColor: settings.user?.brandBackgroundColor || "#ffffff",
        brandAccentColor: settings.user?.brandAccentColor || "#16a34a",
        reservationPageEnabled: settings.user?.reservationPageEnabled || false,
        // Regular Appointment Page Colors
        appointmentPagePrimaryColor: settings.user?.appointmentPagePrimaryColor || "#16a34a",
        appointmentPageBackgroundColor: settings.user?.appointmentPageBackgroundColor || "#ffffff",
        appointmentPageAccentColor: settings.user?.appointmentPageAccentColor || "#16a34a",
        // Appointment Page V2 Colors
        appointmentPageV2PrimaryColor: settings.user?.appointmentPageV2PrimaryColor || "#16a34a",
        appointmentPageV2BackgroundColor: settings.user?.appointmentPageV2BackgroundColor || "#ffffff",
        appointmentPageV2AccentColor: settings.user?.appointmentPageV2AccentColor || "#16a34a",
        appointmentPageV2CalendarBg: settings.user?.appointmentPageV2CalendarBg || "blue",
        // Weekly Availability
        availability: settings.availability || {
          monday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          friday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          saturday: { enabled: false, slots: [] },
          sunday: { enabled: false, slots: [] },
        },
        // Blocked Dates
        blockedDates: settings.blockedDates || [],
        blockedTimeSlots: settings.blockedTimeSlots || [],
      });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest("PUT", "/api/scheduling/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduling/settings"] });
      toast({
        title: "Settings updated",
        description: "Your scheduling settings have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update scheduling settings",
        variant: "destructive",
      });
    },
  });

  const copySchedulingLink = async () => {
    if (!settings?.slug) return;
    
    const link = `${window.location.origin}/schedule/${settings.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedSlug(true);
      toast({
        title: "Link copied!",
        description: "Your scheduling link has been copied to clipboard",
      });
      setTimeout(() => setCopiedSlug(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const toggleScheduling = async () => {
    await updateSettings.mutateAsync({
      isEnabled: !settings?.isEnabled,
    });
  };

  const handleSaveSettings = () => {
    updateSettings.mutate(formData);
  };

  const toggleDayEnabled = (day: string) => {
    const currentDay = formData.availability[day];
    const currentlyEnabled = currentDay.enabled;
    
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          enabled: !currentlyEnabled,
          // Preserve existing slots if they exist, otherwise use default
          slots: !currentlyEnabled 
            ? (currentDay.slots.length > 0 ? currentDay.slots : [{ start: "09:00", end: "17:00" }])
            : currentDay.slots, // Keep slots even when disabled so they're preserved
        },
      },
    });
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...formData.availability[day].slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          slots: newSlots,
        },
      },
    });
  };

  const toggleBlockedDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const isBlocked = formData.blockedDates.includes(dateStr);
    
    setFormData({
      ...formData,
      blockedDates: isBlocked
        ? formData.blockedDates.filter(d => d !== dateStr)
        : [...formData.blockedDates, dateStr],
    });
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return formData.blockedDates.includes(dateStr);
  };

  const addBlockedTimeSlot = (date: string, startTime: string, endTime: string) => {
    const existing = formData.blockedTimeSlots.find(slot => slot.date === date);
    
    if (existing) {
      setFormData({
        ...formData,
        blockedTimeSlots: formData.blockedTimeSlots.map(slot =>
          slot.date === date
            ? { ...slot, slots: [...slot.slots, { start: startTime, end: endTime }] }
            : slot
        )
      });
    } else {
      setFormData({
        ...formData,
        blockedTimeSlots: [...formData.blockedTimeSlots, {
          date,
          slots: [{ start: startTime, end: endTime }]
        }]
      });
    }
  };

  const removeBlockedTimeSlot = (date: string, slotIndex: number) => {
    setFormData({
      ...formData,
      blockedTimeSlots: formData.blockedTimeSlots.map(item => {
        if (item.date === date) {
          const newSlots = item.slots.filter((_, idx) => idx !== slotIndex);
          return { ...item, slots: newSlots };
        }
        return item;
      }).filter(item => item.slots.length > 0)
    });
  };

  const [selectedBlockDate, setSelectedBlockDate] = useState<string | null>(null);

  // Generate all possible time slots for a day (using slot duration from settings)
  const generateAllTimeSlots = () => {
    const slots: string[] = [];
    const slotDuration = formData.slotDuration || 30;
    
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const toggleTimeBlock = (date: string, time: string) => {
    const existing = formData.blockedTimeSlots.find(item => item.date === date);
    
    if (!existing) {
      // No blocks for this date yet, create one
      const slotDuration = formData.slotDuration || 30;
      const [hour, min] = time.split(':').map(Number);
      const endMin = min + slotDuration;
      const endHour = hour + Math.floor(endMin / 60);
      const endMinutes = endMin % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      setFormData({
        ...formData,
        blockedTimeSlots: [...formData.blockedTimeSlots, {
          date,
          slots: [{ start: time, end: endTime }]
        }]
      });
      return;
    }

    // Check if this time is already blocked
    const slotDuration = formData.slotDuration || 30;
    const [hour, min] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + min;
    
    const existingSlotIndex = existing.slots.findIndex(slot => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      return startMinutes === timeMinutes;
    });

    if (existingSlotIndex >= 0) {
      // Already blocked, remove it
      const newSlots = existing.slots.filter((_, idx) => idx !== existingSlotIndex);
      setFormData({
        ...formData,
        blockedTimeSlots: formData.blockedTimeSlots.map(item =>
          item.date === date ? { ...item, slots: newSlots } : item
        ).filter(item => item.slots.length > 0)
      });
    } else {
      // Not blocked, add it
      const endMin = min + slotDuration;
      const endHour = hour + Math.floor(endMin / 60);
      const endMinutes = endMin % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      setFormData({
        ...formData,
        blockedTimeSlots: formData.blockedTimeSlots.map(item =>
          item.date === date
            ? { ...item, slots: [...item.slots, { start: time, end: endTime }] }
            : item
        )
      });
    }
  };

  const isTimeBlocked = (date: string, time: string) => {
    const existing = formData.blockedTimeSlots.find(item => item.date === date);
    if (!existing) return false;
    
    const [hour, min] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + min;
    
    return existing.slots.some(slot => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      return startMinutes === timeMinutes;
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const schedulingLink = `${window.location.origin}/schedule/${settings?.slug || ''}`;

  return (
    <div className="space-y-6" id="scheduling">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            APPOINTMENT SCHEDULING
          </CardTitle>
          <CardDescription>
            Allow others to book appointments with you via a shareable link. Scroll down to block specific dates and times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="scheduling-enabled" className="text-base">
                Enable Scheduling
              </Label>
              <p className="text-sm text-muted-foreground">
                Make your booking page available to the public
              </p>
            </div>
            <Switch
              id="scheduling-enabled"
              checked={settings?.isEnabled || false}
              onCheckedChange={toggleScheduling}
              data-testid="toggle-scheduling"
            />
          </div>

          {settings?.isEnabled && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Regular Appointment Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={schedulingLink}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="scheduling-link"
                    />
                    <Button
                      onClick={() => window.open(schedulingLink, '_blank')}
                      variant="outline"
                      size="icon"
                      data-testid="open-link"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={copySchedulingLink}
                      variant="outline"
                      size="icon"
                      data-testid="copy-link"
                      title="Copy link"
                    >
                      {copiedSlug ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standard appointment booking page
                  </p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reservation-enabled" className="text-base">
                        Enable Appointment Page V2
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Animated 3-step flow for appointments
                      </p>
                    </div>
                    <Switch
                      id="reservation-enabled"
                      checked={formData.reservationPageEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, reservationPageEnabled: checked })
                      }
                      data-testid="toggle-reservation-page"
                    />
                  </div>

                  {formData.reservationPageEnabled && (
                    <div className="space-y-2">
                      <Label>Appointment Page V2 Link</Label>
                      <div className="flex gap-2">
                        <Input
                          value={`${window.location.origin}/reservations/${settings?.slug || ''}`}
                          readOnly
                          className="font-mono text-sm"
                          data-testid="reservation-link"
                        />
                        <Button
                          onClick={() => window.open(`${window.location.origin}/reservations/${settings?.slug}`, '_blank')}
                          variant="outline"
                          size="icon"
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(`${window.location.origin}/reservations/${settings?.slug}`);
                              toast({ title: "Link copied!", description: "Appointment page V2 link copied to clipboard" });
                            } catch (err) {
                              toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
                            }
                          }}
                          variant="outline"
                          size="icon"
                          title="Copy link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Smooth animated flow: Date → Time/Details → Confirmation
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Availability Toggle */}
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label className="text-base font-semibold">Quick Availability</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check/uncheck days you're available (configure times in settings below)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <label key={day} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.availability[day]?.enabled || false}
                          onChange={() => toggleDayEnabled(day)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 cursor-pointer accent-primary"
                          data-testid={`quick-${day}`}
                        />
                        <span className="text-sm font-medium capitalize">{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-title">Meeting Title</Label>
                <Input
                  id="meeting-title"
                  value={formData.meetingTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingTitle: e.target.value })
                  }
                  placeholder="e.g., 30-minute consultation"
                  data-testid="input-meeting-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-description">Meeting Description</Label>
                <Textarea
                  id="meeting-description"
                  value={formData.meetingDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingDescription: e.target.value })
                  }
                  placeholder="Brief description of what to expect during the meeting..."
                  rows={3}
                  data-testid="input-meeting-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={formData.notificationEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, notificationEmail: e.target.value })
                  }
                  placeholder="your-business@example.com"
                  data-testid="input-notification-email"
                />
                <p className="text-xs text-muted-foreground">
                  Email address where you'll receive booking notifications
                </p>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-branding" className="text-base">
                      Custom Branding
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display your business name, logo, and phone on the booking page
                    </p>
                  </div>
                  <Switch
                    id="show-branding"
                    checked={formData.showBranding}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, showBranding: checked })
                    }
                    data-testid="toggle-branding"
                  />
                </div>

                {formData.showBranding && (
                  <div className="space-y-4 pl-4 border-l-2 border-green-200 dark:border-green-800">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({ ...formData, businessName: e.target.value })
                        }
                        placeholder="Your Business Name"
                        data-testid="input-business-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-phone">Business Phone</Label>
                      <Input
                        id="business-phone"
                        type="tel"
                        value={formData.businessPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, businessPhone: e.target.value })
                        }
                        placeholder="(555) 123-4567"
                        data-testid="input-business-phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="branding-logo">Logo URL</Label>
                      <Input
                        id="branding-logo"
                        type="url"
                        value={formData.brandingLogoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, brandingLogoUrl: e.target.value })
                        }
                        placeholder="https://example.com/logo.png"
                        data-testid="input-branding-logo"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload your logo to a hosting service and paste the URL here
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slot-duration">Appointment Duration (minutes)</Label>
                  <Input
                    id="slot-duration"
                    type="number"
                    value={formData.slotDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, slotDuration: parseInt(e.target.value) || 30 })
                    }
                    min="15"
                    step="15"
                    data-testid="input-slot-duration"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-window">Appointment Window (days)</Label>
                  <Input
                    id="booking-window"
                    type="number"
                    value={formData.bookingWindowDays}
                    onChange={(e) =>
                      setFormData({ ...formData, bookingWindowDays: parseInt(e.target.value) || 30 })
                    }
                    min="1"
                    data-testid="input-booking-window"
                  />
                </div>
              </div>

              {/* Weekly Availability Section */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <h4 className="text-base font-semibold mb-1">Weekly Availability</h4>
                  <p className="text-sm text-muted-foreground">
                    Set your available hours for each day of the week
                  </p>
                </div>

                <div className="space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          checked={formData.availability[day]?.enabled || false}
                          onChange={() => toggleDayEnabled(day)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 cursor-pointer accent-primary"
                          data-testid={`checkbox-${day}`}
                        />
                        <Label htmlFor={`day-${day}`} className="font-medium capitalize cursor-pointer">
                          {day}
                        </Label>
                      </div>
                      
                      {formData.availability[day]?.enabled && formData.availability[day].slots.length > 0 && (
                        <div className="flex-1 space-y-2">
                          {formData.availability[day].slots.map((slot: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                                className="w-32"
                                data-testid={`time-${day}-start-${index}`}
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                                className="w-32"
                                data-testid={`time-${day}-end-${index}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!formData.availability[day]?.enabled && (
                        <span className="text-sm text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Blocked Dates Section */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <h4 className="text-base font-semibold mb-1">Block Specific Dates</h4>
                  <p className="text-sm text-muted-foreground">
                    Click on dates to block them (holidays, vacations, etc.). Blocked dates will appear in red.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <DatePicker
                      mode="multiple"
                      selected={formData.blockedDates.map(d => new Date(d + 'T00:00:00'))}
                      onSelect={(dates) => {
                        if (dates) {
                          setFormData({
                            ...formData,
                            blockedDates: (dates as Date[]).map(d => d.toISOString().split('T')[0])
                          });
                        }
                      }}
                      className="rounded-md border"
                      modifiers={{
                        blocked: formData.blockedDates.map(d => new Date(d + 'T00:00:00'))
                      }}
                      modifiersStyles={{
                        blocked: { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }
                      }}
                      data-testid="blocked-dates-calendar"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-medium">Blocked Dates ({formData.blockedDates.length})</Label>
                    <div className="border rounded-lg p-3 max-h-[300px] overflow-y-auto">
                      {formData.blockedDates.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No dates blocked. Click on the calendar to block dates.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {formData.blockedDates
                            .sort()
                            .map((date) => (
                              <div key={date} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                                <span className="text-sm font-medium">
                                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      blockedDates: formData.blockedDates.filter(d => d !== date)
                                    });
                                  }}
                                  className="h-6 w-6 p-0"
                                  data-testid={`remove-blocked-${date}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Blocked Time Slots Section */}
              <div id="block-specific-times" className="border-t pt-6 space-y-4">
                <div>
                  <h4 className="text-base font-semibold mb-1">Block Specific Times</h4>
                  <p className="text-sm text-muted-foreground">
                    Click on dates to block specific time slots (e.g., busy 1-2 PM on Nov 3rd)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Left: Calendar to pick dates */}
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    <Label className="text-sm font-medium mb-3 block">Select Date to Block Times</Label>
                    <DatePicker
                      mode="single"
                      selected={selectedBlockDate ? new Date(selectedBlockDate + 'T00:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const dateStr = date.toISOString().split('T')[0];
                          setSelectedBlockDate(dateStr);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border"
                      modifiers={{
                        hasBlocks: formData.blockedTimeSlots.map(item => new Date(item.date + 'T00:00:00'))
                      }}
                      modifiersClassNames={{
                        hasBlocks: "bg-orange-100 dark:bg-orange-900/30 font-bold"
                      }}
                    />
                  </div>

                  {/* Right: Time slot manager for selected date */}
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    {selectedBlockDate ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            {new Date(selectedBlockDate + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBlockDate(null)}
                            className="h-6 text-xs"
                          >
                            Clear
                          </Button>
                        </div>

                        {/* Click to select/deselect times */}
                        <div className="border-t pt-3 space-y-2">
                          <Label className="text-xs text-muted-foreground">Click times to block/unblock</Label>
                          <div className="grid grid-cols-3 gap-1 max-h-[400px] overflow-y-auto p-1">
                            {generateAllTimeSlots().map((time) => {
                              const blocked = isTimeBlocked(selectedBlockDate, time);
                              return (
                                <Button
                                  key={time}
                                  type="button"
                                  size="sm"
                                  variant={blocked ? "default" : "outline"}
                                  onClick={() => toggleTimeBlock(selectedBlockDate, time)}
                                  className={`text-xs h-8 ${blocked ? "bg-red-600 hover:bg-red-700 text-white" : "hover:bg-gray-100"}`}
                                >
                                  {formatTime(time)}
                                </Button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            {(() => {
                              const count = formData.blockedTimeSlots.find(item => item.date === selectedBlockDate)?.slots.length || 0;
                              return count > 0 ? `${count} time slot${count > 1 ? 's' : ''} blocked` : 'No times blocked';
                            })()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground text-center">
                          ← Click a date on the calendar to block specific times
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary of all blocked time slots */}
                {formData.blockedTimeSlots.length > 0 && (
                  <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950/20">
                    <Label className="text-sm font-medium mb-2 block">
                      Summary: {formData.blockedTimeSlots.reduce((acc, item) => acc + item.slots.length, 0)} time slots blocked across {formData.blockedTimeSlots.length} dates
                    </Label>
                    <div className="text-xs text-muted-foreground">
                      Dates with orange highlights have blocked times
                    </div>
                  </div>
                )}

                {/* Quick Save Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={updateSettings.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="save-blocked-times"
                  >
                    {updateSettings.isPending ? "Saving..." : "UPDATE SCHEDULE"}
                  </Button>
                </div>
              </div>

              {/* Color Profiles Section */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <h4 className="text-base font-semibold mb-1">Color Profiles</h4>
                  <p className="text-sm text-muted-foreground">
                    Customize colors for each appointment page
                  </p>
                </div>

                {/* Regular Appointment Page Colors */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Regular Appointment Page</Label>
                  <div className="grid grid-cols-3 gap-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      <Label htmlFor="apt-primary" className="text-xs">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="apt-primary"
                          type="color"
                          value={formData.appointmentPagePrimaryColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPagePrimaryColor: e.target.value })
                          }
                          className="h-10 w-full cursor-pointer"
                          data-testid="color-apt-primary"
                        />
                        <Input
                          type="text"
                          value={formData.appointmentPagePrimaryColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPagePrimaryColor: e.target.value })
                          }
                          className="h-10 text-xs font-mono"
                          placeholder="#16a34a"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apt-bg" className="text-xs">Background</Label>
                      <div className="flex gap-2">
                        <Input
                          id="apt-bg"
                          type="color"
                          value={formData.appointmentPageBackgroundColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageBackgroundColor: e.target.value })
                          }
                          className="h-10 w-full cursor-pointer"
                          data-testid="color-apt-bg"
                        />
                        <Input
                          type="text"
                          value={formData.appointmentPageBackgroundColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageBackgroundColor: e.target.value })
                          }
                          className="h-10 text-xs font-mono"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apt-accent" className="text-xs">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="apt-accent"
                          type="color"
                          value={formData.appointmentPageAccentColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageAccentColor: e.target.value })
                          }
                          className="h-10 w-full cursor-pointer"
                          data-testid="color-apt-accent"
                        />
                        <Input
                          type="text"
                          value={formData.appointmentPageAccentColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageAccentColor: e.target.value })
                          }
                          className="h-10 text-xs font-mono"
                          placeholder="#16a34a"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Page V2 Colors */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Appointment Page V2</Label>
                  <div className="grid grid-cols-3 gap-3 pl-4 border-l-2 border-green-200 dark:border-green-800">
                    <div className="space-y-2">
                      <Label htmlFor="aptv2-primary" className="text-xs">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="aptv2-primary"
                          type="color"
                          value={formData.appointmentPageV2PrimaryColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageV2PrimaryColor: e.target.value })
                          }
                          className="h-10 w-full cursor-pointer"
                          data-testid="color-aptv2-primary"
                        />
                        <Input
                          type="text"
                          value={formData.appointmentPageV2PrimaryColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageV2PrimaryColor: e.target.value })
                          }
                          className="h-10 text-xs font-mono"
                          placeholder="#16a34a"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aptv2-bg" className="text-xs">Background</Label>
                      <div className="flex gap-2">
                        <Input
                          id="aptv2-bg"
                          type="color"
                          value={formData.appointmentPageV2BackgroundColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageV2BackgroundColor: e.target.value })
                          }
                          className="h-10 w-full cursor-pointer"
                          data-testid="color-aptv2-bg"
                        />
                        <Input
                          type="text"
                          value={formData.appointmentPageV2BackgroundColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageV2BackgroundColor: e.target.value })
                          }
                          className="h-10 text-xs font-mono"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aptv2-accent" className="text-xs">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="aptv2-accent"
                          type="color"
                          value={formData.appointmentPageV2AccentColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageV2AccentColor: e.target.value })
                          }
                          className="h-10 w-full cursor-pointer"
                          data-testid="color-aptv2-accent"
                        />
                        <Input
                          type="text"
                          value={formData.appointmentPageV2AccentColor}
                          onChange={(e) =>
                            setFormData({ ...formData, appointmentPageV2AccentColor: e.target.value })
                          }
                          className="h-10 text-xs font-mono"
                          placeholder="#16a34a"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Calendar Background</Label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="calendarBg"
                            value="blue"
                            checked={formData.appointmentPageV2CalendarBg === "blue"}
                            onChange={(e) =>
                              setFormData({ ...formData, appointmentPageV2CalendarBg: e.target.value })
                            }
                            className="cursor-pointer"
                            data-testid="radio-calendar-blue"
                          />
                          <span className="text-xs">Dark Blue</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="calendarBg"
                            value="grey"
                            checked={formData.appointmentPageV2CalendarBg === "grey"}
                            onChange={(e) =>
                              setFormData({ ...formData, appointmentPageV2CalendarBg: e.target.value })
                            }
                            className="cursor-pointer"
                            data-testid="radio-calendar-grey"
                          />
                          <span className="text-xs">Dark Grey</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                  data-testid="button-save-settings"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateSettings.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Google Calendar Integration Card */}
      {settings?.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-green-600" />
              Calendar Integration
            </CardTitle>
            <CardDescription>
              Connect Google Calendar to prevent double-bookings and sync appointments automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!calendarStatus?.connected ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">
                      No calendar connected
                    </p>
                    <p className="text-xs text-blue-700">
                      Connect your Google Calendar to automatically check for conflicts and sync appointments. This prevents double-bookings and keeps your calendar up to date.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => connectGoogleCalendar.mutate()}
                  disabled={connectGoogleCalendar.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-connect-google-calendar"
                >
                  {connectGoogleCalendar.isPending ? "Connecting..." : "Connect Google Calendar"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You'll be redirected to Google to authorize calendar access. Microsoft Outlook support coming soon!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CalendarCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-green-900">
                      Connected to Google Calendar
                    </p>
                    <p className="text-xs text-green-700">
                      {calendarStatus.calendarEmail}
                    </p>
                    {calendarStatus.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(calendarStatus.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="calendar-sync-enabled" className="text-base">
                      Enable Calendar Sync
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create events in Google Calendar when appointments are booked
                    </p>
                  </div>
                  <Switch
                    id="calendar-sync-enabled"
                    checked={calendarStatus.syncEnabled || false}
                    onCheckedChange={(enabled) => toggleCalendarSync.mutate(enabled)}
                    disabled={toggleCalendarSync.isPending}
                    data-testid="toggle-calendar-sync"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => disconnectCalendar.mutate()}
                    disabled={disconnectCalendar.isPending}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    data-testid="button-disconnect-calendar"
                  >
                    {disconnectCalendar.isPending ? "Disconnecting..." : "Disconnect Calendar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {settings?.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              Manage your scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No appointments scheduled yet
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{appointment.attendeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.startTime).toLocaleString()}
                      </p>
                      {appointment.attendeeEmail && (
                        <p className="text-xs text-muted-foreground">
                          {appointment.attendeeEmail}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
