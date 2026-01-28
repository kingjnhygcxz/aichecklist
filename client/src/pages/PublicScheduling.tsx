import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Clock, User, Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PublicScheduling({ slug }: { slug: string }) {
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeeNotes, setAttendeeNotes] = useState("");
  const [additionalEmails, setAdditionalEmails] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [isMilitaryTime, setIsMilitaryTime] = useState(false);
  
  // Ref for smooth scrolling to contact info section
  const contactInfoRef = useRef<HTMLDivElement>(null);

  const { data: schedule, isLoading, error } = useQuery<any>({
    queryKey: [`/api/public/schedule/${slug}`],
    enabled: !!slug,
  });

  const bookAppointment = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime) return;
      
      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (schedule?.slotDuration || 30));
      
      // Parse additional emails
      const emailList = additionalEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      
      // Get user's timezone offset to send with the request
      const timezoneOffset = -startTime.getTimezoneOffset(); // Minutes from UTC (positive for ahead of UTC)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g., "America/New_York"
      
      const response = await fetch(`/api/public/schedule/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeName,
          attendeeEmail,
          attendeeNotes,
          additionalEmails: emailList.length > 0 ? emailList : undefined,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timezone, // Send user's timezone so server knows how to interpret times
          timezoneOffset, // Send offset for fallback
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to book appointment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsBooked(true);
      toast({
        title: "Success!",
        description: "Appointment confirmed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const formatTime = (time: string) => {
    if (isMilitaryTime) {
      return time; // Already in 24-hour format
    }
    
    // Convert to 12-hour format
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Auto-scroll to contact info when time is selected
  useEffect(() => {
    if (selectedTime && contactInfoRef.current) {
      setTimeout(() => {
        contactInfoRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 200);
    }
  }, [selectedTime]);

  const generateTimeSlots = () => {
    if (!selectedDate || !schedule) return [];
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailability = schedule.availability[dayName];
    
    if (!dayAvailability?.enabled || !dayAvailability.slots?.length) return [];
    
    const slots: string[] = [];
    
    dayAvailability.slots.forEach((slot: { start: string; end: string }) => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);
      
      let currentHour = startHour;
      let currentMin = startMin;
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        slots.push(timeString);
        
        currentMin += schedule.slotDuration || 30;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }
    });
    
    return slots;
  };

  const handleConfirm = () => {
    if (!attendeeName || !attendeeEmail || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    bookAppointment.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Scheduling Not Available</CardTitle>
            <CardDescription>
              This scheduling link is not currently active or does not exist.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-600">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">APPOINTMENT CONFIRMED</CardTitle>
            <CardDescription>
              Your appointment has been successfully scheduled with {schedule.hostName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{selectedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>Confirmation sent to {attendeeEmail}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Professional Header */}
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">APPOINTMENT SCHEDULING</h1>
          <p className="text-gray-600">Schedule your appointment below</p>
        </div>
        
        <div className="grid md:grid-cols-[320px_1fr_320px] gap-6">
          {/* Left Panel - Info */}
          <div className="space-y-6">
            {schedule.showBranding ? (
              // Custom Branding
              <div className="space-y-4">
                {schedule.brandingLogoUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={schedule.brandingLogoUrl} 
                      alt={schedule.businessName || "Business Logo"}
                      className="h-24 w-24 object-contain rounded-lg"
                      data-testid="branding-logo"
                    />
                  </div>
                )}
                {schedule.businessName && (
                  <h2 className="font-bold text-xl text-center" data-testid="business-name">
                    {schedule.businessName}
                  </h2>
                )}
                {schedule.businessPhone && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-green-600" />
                    <a href={`tel:${schedule.businessPhone}`} className="hover:text-green-600" data-testid="business-phone">
                      {schedule.businessPhone}
                    </a>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-gray-600 text-sm font-medium">{schedule.meetingTitle}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{schedule.slotDuration} min</span>
                  </div>
                  {schedule.meetingDescription && (
                    <p className="text-sm leading-relaxed mt-3 text-gray-600">{schedule.meetingDescription}</p>
                  )}
                </div>
              </div>
            ) : (
              // Default Host Info
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-green-600">
                    <AvatarImage src={schedule.hostProfilePicture} alt={schedule.hostName} />
                    <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                      {schedule.hostName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-lg">{schedule.hostName}</h2>
                    <p className="text-gray-600 text-sm">{schedule.meetingTitle}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{schedule.slotDuration} min</span>
                  </div>
                  {schedule.meetingDescription && (
                    <p className="text-sm leading-relaxed">{schedule.meetingDescription}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center Panel - Calendar */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-white">Select a Date & Time</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const dayAvailability = schedule.availability[dayName];
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const isTooFar = date > new Date(Date.now() + schedule.bookingWindowDays * 24 * 60 * 60 * 1000);
                return isPast || isTooFar || !dayAvailability?.enabled || !dayAvailability.slots?.length;
              }}
              className="rounded-md border border-gray-200 p-4"
              classNames={{
                caption_label: "text-lg font-semibold text-gray-900",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border rounded hover:bg-gray-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                head_cell: "text-gray-600 font-medium text-sm w-9",
                cell: "h-9 w-9 text-center text-sm p-0 relative",
                day: "h-9 w-9 p-0 font-medium text-gray-900 hover:bg-gray-100 rounded-md",
                day_selected: "bg-green-600 text-white hover:bg-green-700 font-bold",
                day_today: "bg-green-50 text-green-900 font-bold border border-green-600",
                day_disabled: "text-gray-300 opacity-50",
                day_outside: "text-gray-400 opacity-40",
              }}
              data-testid="calendar-picker"
            />
          </div>

          {/* Right Panel - Time Slots & Form */}
          <div className="space-y-4">
            {selectedDate && (
              <>
                <div>
                  <p className="font-medium text-sm mb-3 text-gray-700">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  
                  {/* Time Format Toggle */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 text-xs ${
                        !isMilitaryTime
                          ? "bg-green-600 text-white hover:bg-green-700 border-green-600"
                          : "border-gray-300 hover:border-green-600"
                      }`}
                      onClick={() => setIsMilitaryTime(false)}
                      data-testid="button-standard-time"
                    >
                      Standard Time
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 text-xs ${
                        isMilitaryTime
                          ? "bg-green-600 text-white hover:bg-green-700 border-green-600"
                          : "border-gray-300 hover:border-green-600"
                      }`}
                      onClick={() => setIsMilitaryTime(true)}
                      data-testid="button-military-time"
                    >
                      Military Time
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {timeSlots.length === 0 ? (
                      <p className="text-sm text-gray-500">No available times for this day</p>
                    ) : (
                      timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`w-full justify-center ${
                            selectedTime === time
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "border-gray-300 hover:border-green-600"
                          }`}
                          onClick={() => setSelectedTime(time)}
                          data-testid={`time-slot-${time}`}
                        >
                          {formatTime(time)}
                        </Button>
                      ))
                    )}
                  </div>
                </div>

                {selectedTime && (
                  <div ref={contactInfoRef} className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          value={attendeeName}
                          onChange={(e) => setAttendeeName(e.target.value)}
                          placeholder="Your name"
                          className="pl-9"
                          data-testid="input-name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={attendeeEmail}
                          onChange={(e) => setAttendeeEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="pl-9"
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="notes"
                          value={attendeeNotes}
                          onChange={(e) => setAttendeeNotes(e.target.value)}
                          placeholder="Anything we should know?"
                          className="pl-9"
                          rows={3}
                          data-testid="input-notes"
                        />
                      </div>
                      <div className="mt-3">
                        <Input
                          id="additional-emails"
                          type="text"
                          value={additionalEmails}
                          onChange={(e) => setAdditionalEmails(e.target.value)}
                          placeholder="Share with others: assistant@email.com, colleague@email.com"
                          className="text-sm"
                          data-testid="input-additional-emails"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Add additional emails to share this appointment (comma-separated)
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleConfirm}
                      disabled={bookAppointment.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                      data-testid="button-confirm"
                    >
                      {bookAppointment.isPending ? "Booking..." : "Confirm"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicScheduling;
