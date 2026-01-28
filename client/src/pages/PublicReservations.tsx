import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function PublicReservations({ slug }: { slug: string }) {
  const { toast } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Step 1: Date selection
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Step 2: Details
  const [partySize, setPartySize] = useState<string>("2");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  
  // Ref for smooth scrolling to information section
  const infoSectionRef = useRef<HTMLDivElement>(null);

  const { data: schedule, isLoading } = useQuery<any>({
    queryKey: [`/api/public/schedule/${slug}`],
    enabled: !!slug,
  });

  // Extract custom colors with defaults (Appointment Page V2)
  const primaryColor = schedule?.user?.appointmentPageV2PrimaryColor || "#16a34a";
  const backgroundColor = schedule?.user?.appointmentPageV2BackgroundColor || "#ffffff";
  const accentColor = schedule?.user?.appointmentPageV2AccentColor || "#16a34a";
  const calendarBgChoice = schedule?.user?.appointmentPageV2CalendarBg || "blue";
  
  // Calendar background color based on user choice
  const calendarBgColor = calendarBgChoice === "grey" ? "#374151" : "#0f172a"; // grey-700 or slate-900

  const bookReservation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime) {
        throw new Error("Date and time are required");
      }
      
      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (schedule?.slotDuration || 60));
      
      const response = await fetch(`/api/public/schedule/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeName,
          attendeeEmail,
          attendeeNotes: `Party of ${partySize}${attendeePhone ? ` - Phone: ${attendeePhone}` : ''}${specialRequests ? ` - Special requests: ${specialRequests}` : ''}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to book reservation");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep(3);
      toast({
        title: "Reservation Confirmed!",
        description: "You'll receive a confirmation email shortly",
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

  const generateTimeSlots = () => {
    if (!selectedDate || !schedule) return [];
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailability = schedule.availability[dayName];
    
    if (!dayAvailability?.enabled || !dayAvailability.slots?.length) return [];
    
    const slots: string[] = [];
    // Format date in local timezone to match how we store blocked dates
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Find blocked time slots for this date
    const blockedForDate = schedule.blockedTimeSlots?.find((item: any) => item.date === dateStr);
    
    dayAvailability.slots.forEach((slot: { start: string; end: string }) => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);
      
      let currentHour = startHour;
      let currentMin = startMin;
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        
        // Check if this time is blocked
        let isBlocked = false;
        if (blockedForDate) {
          isBlocked = blockedForDate.slots.some((blockedSlot: { start: string; end: string }) => {
            const [blockStart] = blockedSlot.start.split(':').map(Number);
            const [blockEnd] = blockedSlot.end.split(':').map(Number);
            const [slotHour, slotMin] = timeString.split(':').map(Number);
            
            const slotMinutes = slotHour * 60 + slotMin;
            const blockStartMinutes = blockStart * 60 + parseInt(blockedSlot.start.split(':')[1]);
            const blockEndMinutes = blockEnd * 60 + parseInt(blockedSlot.end.split(':')[1]);
            
            return slotMinutes >= blockStartMinutes && slotMinutes < blockEndMinutes;
          });
        }
        
        if (!isBlocked) {
          slots.push(timeString);
        }
        
        currentMin += schedule.slotDuration || 60;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }
    });
    
    return slots;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Auto-scroll to information section when time is selected
  useEffect(() => {
    if (selectedTime && infoSectionRef.current) {
      setTimeout(() => {
        infoSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 200);
    }
  }, [selectedTime]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setTimeout(() => setCurrentStep(2), 300);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTime) {
      toast({
        title: "Time Slot Required",
        description: "Please select an available time slot above. If none are showing, this date may not be available.",
        variant: "destructive",
      });
      return;
    }
    
    if (!attendeeName || !attendeeEmail) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email",
        variant: "destructive",
      });
      return;
    }
    
    bookReservation.mutate();
  };

  const resetReservation = () => {
    setCurrentStep(1);
    setSelectedDate(undefined);
    setPartySize("2");
    setSelectedTime("");
    setAttendeeName("");
    setAttendeeEmail("");
    setAttendeePhone("");
    setSpecialRequests("");
  };

  const slideVariants = {
    enter: {
      x: 300,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: -300,
      opacity: 0,
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Appointment page not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-1.5 md:p-3">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-0">
            {schedule.businessName || schedule.username}
          </h1>
          <p className="text-xs text-gray-600">Make a Reservation</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-2 gap-1.5">
          <div className={`flex items-center gap-0.5 ${currentStep >= 1 ? '' : 'text-gray-400'}`} style={{ color: currentStep >= 1 ? primaryColor : undefined }}>
            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[10px] md:text-xs ${currentStep >= 1 ? 'text-white' : 'bg-gray-200'}`} style={{ backgroundColor: currentStep >= 1 ? primaryColor : undefined }}>
              1
            </div>
            <span className="text-[10px] md:text-xs font-medium hidden sm:inline">Date</span>
          </div>
          <div className={`w-5 md:w-6 h-0.5 ${currentStep >= 2 ? '' : 'bg-gray-200'}`} style={{ backgroundColor: currentStep >= 2 ? primaryColor : undefined }}></div>
          <div className={`flex items-center gap-0.5 ${currentStep >= 2 ? '' : 'text-gray-400'}`} style={{ color: currentStep >= 2 ? primaryColor : undefined }}>
            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[10px] md:text-xs ${currentStep >= 2 ? 'text-white' : 'bg-gray-200'}`} style={{ backgroundColor: currentStep >= 2 ? primaryColor : undefined }}>
              2
            </div>
            <span className="text-[10px] md:text-xs font-medium hidden sm:inline">Details</span>
          </div>
          <div className={`w-5 md:w-6 h-0.5 ${currentStep >= 3 ? '' : 'bg-gray-200'}`} style={{ backgroundColor: currentStep >= 3 ? primaryColor : undefined }}></div>
          <div className={`flex items-center gap-0.5 ${currentStep >= 3 ? '' : 'text-gray-400'}`} style={{ color: currentStep >= 3 ? primaryColor : undefined }}>
            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[10px] md:text-xs ${currentStep >= 3 ? 'text-white' : 'bg-gray-200'}`} style={{ backgroundColor: currentStep >= 3 ? primaryColor : undefined }}>
              3
            </div>
            <span className="text-[10px] md:text-xs font-medium hidden sm:inline">Confirm</span>
          </div>
        </div>

        {/* Animated Steps */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Date Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Card className="shadow-lg" style={{ backgroundColor: calendarBgColor }}>
                  <CardContent className="py-2 md:py-3">
                    <div className="flex flex-col items-center">
                      <CalendarIcon className="h-5 w-5 md:h-6 md:w-6 mb-1 text-white" />
                      <h2 className="text-sm md:text-base font-semibold text-white mb-1.5">Select a Date</h2>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          const today = new Date(new Date().setHours(0, 0, 0, 0));
                          const dateStr = date.toISOString().split('T')[0];
                          const isBlocked = schedule?.blockedDates?.includes(dateStr) || false;
                          return date < today || isBlocked;
                        }}
                        className="rounded-md border scale-90 md:scale-95"
                        data-testid="reservation-calendar"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Details Form */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Card className="shadow-lg">
                  <CardContent className="py-2 md:py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="mb-1.5 h-7"
                      data-testid="button-back-to-date"
                    >
                      <ChevronLeft className="h-3 w-3 mr-0.5" />
                      <span className="text-xs">Back</span>
                    </Button>
                    
                    <div className="text-center mb-2">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1" style={{ color: primaryColor }} />
                      <h2 className="text-sm md:text-base font-semibold text-gray-900">Details</h2>
                      <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">
                        {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <form onSubmit={handleDetailsSubmit} className="space-y-2 md:space-y-2.5 max-w-md mx-auto">
                      <div>
                        <Label htmlFor="partySize" className="text-xs">Party Size</Label>
                        <Select value={partySize} onValueChange={setPartySize}>
                          <SelectTrigger data-testid="select-party-size" className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Guest' : 'Guests'}
                              </SelectItem>
                            ))}
                            <SelectItem value="10+">10+ Guests</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Select Time *</Label>
                        {generateTimeSlots().length === 0 ? (
                          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded-md mt-1">
                            No available time slots for this date
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-1 md:gap-1.5 mt-1">
                            {generateTimeSlots().map((time) => (
                              <Button
                                key={time}
                                type="button"
                                size="sm"
                                variant={selectedTime === time ? "default" : "outline"}
                                onClick={() => setSelectedTime(time)}
                                style={selectedTime === time ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                className={`text-[10px] md:text-xs h-7 px-1 ${selectedTime === time ? "text-white hover:opacity-90" : ""}`}
                                data-testid={`button-time-${time}`}
                              >
                                {formatTime(time)}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div ref={infoSectionRef} className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="name" className="text-xs">Name *</Label>
                          <Input
                            id="name"
                            value={attendeeName}
                            onChange={(e) => setAttendeeName(e.target.value)}
                            required
                            className="text-xs h-8"
                            data-testid="input-name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-xs">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={attendeeEmail}
                            onChange={(e) => setAttendeeEmail(e.target.value)}
                            required
                            className="text-xs h-8"
                            data-testid="input-email"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-xs">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={attendeePhone}
                          onChange={(e) => setAttendeePhone(e.target.value)}
                          className="text-xs h-8"
                          data-testid="input-phone"
                        />
                      </div>

                      <div>
                        <Label htmlFor="requests" className="text-xs">Special Requests</Label>
                        <Textarea
                          id="requests"
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={2}
                          placeholder="Allergies, seating, occasion..."
                          className="text-xs"
                          data-testid="textarea-special-requests"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full text-white hover:opacity-90 h-9 text-xs"
                        style={{ backgroundColor: primaryColor }}
                        disabled={bookReservation.isPending}
                        data-testid="button-confirm-reservation"
                      >
                        {bookReservation.isPending ? "Confirming..." : "Confirm Reservation"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Card className="shadow-lg">
                  <CardContent className="py-4 md:py-5">
                    <div className="text-center max-w-md mx-auto">
                      <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2" style={{ color: primaryColor }} />
                      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Confirmed!</h2>
                      <p className="text-xs md:text-sm text-gray-600 mb-4">
                        Confirmation sent to <strong className="block md:inline">{attendeeEmail}</strong>
                      </p>

                      <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 text-left">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Reservation Details</h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-600">Date</p>
                              <p className="font-medium text-gray-900 text-xs">
                                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-600">Time</p>
                              <p className="font-medium text-gray-900 text-xs">{formatTime(selectedTime)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-600">Party Size</p>
                              <p className="font-medium text-gray-900 text-xs">{partySize} {partySize === "1" ? 'Guest' : 'Guests'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={resetReservation}
                        variant="outline"
                        className="w-full h-9 text-xs"
                        data-testid="button-make-another"
                      >
                        Make Another Reservation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
