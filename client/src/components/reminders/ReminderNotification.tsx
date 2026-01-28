import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Clock, 
  MapPin, 
  CheckCircle, 
  X, 
  Timer,
  AlarmClock
} from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@shared/schema';

interface ReminderNotificationProps {
  task: Task;
  type: 'morning' | 'scheduled' | 'location';
  onComplete?: () => void;
  onSnooze?: (minutes: number) => void;
  onDismiss?: () => void;
  locationInfo?: {
    placeName: string;
    distance: number;
  };
}

export function ReminderNotification({
  task,
  type,
  onComplete,
  onSnooze,
  onDismiss,
  locationInfo
}: ReminderNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second for morning reminders
  useEffect(() => {
    if (type === 'morning') {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [type]);

  const getNotificationConfig = () => {
    switch (type) {
      case 'morning':
        return {
          icon: <AlarmClock className="h-6 w-6 text-orange-500" />,
          title: 'Good Morning! 🌅',
          subtitle: "Don't forget your task today",
          bgClass: 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-300',
          showClock: true
        };
      case 'scheduled':
        return {
          icon: <Bell className="h-6 w-6 text-blue-500" />,
          title: 'Reminder 🔔',
          subtitle: 'Time for your scheduled task',
          bgClass: 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300',
          showClock: false
        };
      case 'location':
        return {
          icon: <MapPin className="h-6 w-6 text-green-500" />,
          title: 'Location Reminder 📍',
          subtitle: `You're near ${locationInfo?.placeName || 'your location'}`,
          bgClass: 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300',
          showClock: false
        };
      default:
        return {
          icon: <Bell className="h-6 w-6 text-gray-500" />,
          title: 'Reminder',
          subtitle: 'Task reminder',
          bgClass: 'bg-gray-100 border-gray-300',
          showClock: false
        };
    }
  };

  const config = getNotificationConfig();

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => onComplete?.(), 300);
  };

  const handleSnooze = (minutes: number) => {
    setIsVisible(false);
    setTimeout(() => onSnooze?.(minutes), 300);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="fixed top-4 right-4 z-50 w-96 max-w-[90vw]"
    >
      <Card className={`${config.bgClass} shadow-2xl border-2`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon and Close Button */}
            <div className="flex items-center space-x-3 flex-1">
              {config.icon}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{config.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{config.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Clock Display for Morning Reminders */}
          {config.showClock && (
            <div className="mt-3 p-3 bg-white/50 rounded-lg text-center">
              <div className="text-2xl font-mono font-bold text-gray-800">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-sm text-gray-600">
                {format(currentTime, 'EEEE, MMMM dd, yyyy')}
              </div>
            </div>
          )}

          {/* Task Details */}
          <div className="mt-4 p-3 bg-white/70 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{task.title}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {task.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {task.priority} Priority
                  </Badge>
                  {task.isSubtask && (
                    <Badge variant="outline" className="text-xs bg-blue-100">
                      Subtask
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location Info for Location Reminders */}
          {type === 'location' && locationInfo && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-green-800">
                  <strong>{locationInfo.placeName}</strong> - {locationInfo.distance}m away
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            <div className="flex space-x-2">
              <Button
                onClick={handleComplete}
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Dismiss
              </Button>
            </div>

            {/* Snooze Options */}
            <div className="flex space-x-1">
              <Button
                onClick={() => handleSnooze(5)}
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
              >
                <Timer className="h-3 w-3 mr-1" />
                5min
              </Button>
              <Button
                onClick={() => handleSnooze(15)}
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
              >
                <Timer className="h-3 w-3 mr-1" />
                15min
              </Button>
              <Button
                onClick={() => handleSnooze(60)}
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
              >
                <Timer className="h-3 w-3 mr-1" />
                1hr
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ReminderNotification;