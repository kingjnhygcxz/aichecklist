import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Circle, 
  Trash2,
  Bell,
  BellRing,
  AlarmClock
} from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@shared/schema';

interface SubtaskManagerProps {
  mainTask: Task;
  subtasks: Task[];
  onAddSubtask: (subtask: Partial<Task>) => void;
  onUpdateSubtask: (subtaskId: string, updates: Partial<Task>) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
}

export function SubtaskManager({
  mainTask,
  subtasks,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleSubtask
}: SubtaskManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    reminderDate: '',
    reminderTime: '09:00',
    morningReminder: false,
    locationReminder: false,
    locationName: '',
    locationCategory: 'grocery'
  });

  const handleAddSubtask = () => {
    if (!newSubtask.title.trim()) return;

    const subtaskData: Partial<Task> = {
      title: newSubtask.title,
      category: mainTask.category,
      priority: mainTask.priority,
      isSubtask: true,
      mainTaskId: mainTask.id,
      userId: mainTask.userId,
      morningReminder: newSubtask.morningReminder,
      locationReminder: newSubtask.locationReminder,
      locationName: newSubtask.locationName || null,
      locationCategory: newSubtask.locationCategory || null,
      reminderTime: newSubtask.reminderTime || null
    };

    // Parse reminder date if provided
    if (newSubtask.reminderDate) {
      const reminderDateTime = new Date(`${newSubtask.reminderDate}T${newSubtask.reminderTime}:00`);
      subtaskData.reminderDate = reminderDateTime;
    }

    onAddSubtask(subtaskData);
    
    // Reset form
    setNewSubtask({
      title: '',
      reminderDate: '',
      reminderTime: '09:00',
      morningReminder: false,
      locationReminder: false,
      locationName: '',
      locationCategory: 'grocery'
    });
    setShowAddForm(false);
  };

  const formatReminderInfo = (subtask: Task) => {
    const info = [];
    
    if (subtask.reminderDate) {
      info.push(`📅 ${format(new Date(subtask.reminderDate), 'MMM dd, yyyy')}`);
    }
    
    if (subtask.reminderTime) {
      info.push(`⏰ ${subtask.reminderTime}`);
    }
    
    if (subtask.morningReminder) {
      info.push('🌅 Morning');
    }
    
    if (subtask.locationReminder && subtask.locationName) {
      info.push(`📍 Near ${subtask.locationName}`);
    }
    
    return info.join(' • ');
  };

  const getLocationIcon = (category: string) => {
    const icons: Record<string, string> = {
      grocery: '🛒',
      retail: '🏪',
      restaurant: '🍽️',
      office: '🏢',
      home: '🏠',
      gym: '💪',
      medical: '🏥',
      gas: '⛽',
      bank: '🏦',
      other: '📍'
    };
    return icons[category] || icons.other;
  };

  return (
    <div className="space-y-4">
      {/* Subtasks List */}
      <div className="space-y-2">
        <AnimatePresence>
          {subtasks.map((subtask) => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`border-l-4 ${subtask.completed ? 'border-l-green-500 bg-green-50' : 'border-l-orange-400 bg-orange-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => onToggleSubtask(subtask.id, !subtask.completed)}
                      className="mt-1 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      {subtask.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {subtask.title}
                      </div>
                      
                      {/* Reminder Information */}
                      {formatReminderInfo(subtask) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {subtask.reminderDate && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(subtask.reminderDate), 'MMM dd')}
                            </Badge>
                          )}
                          
                          {subtask.reminderTime && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {subtask.reminderTime}
                            </Badge>
                          )}
                          
                          {subtask.morningReminder && (
                            <Badge variant="outline" className="text-xs bg-orange-100">
                              <AlarmClock className="h-3 w-3 mr-1" />
                              Morning Alert
                            </Badge>
                          )}
                          
                          {subtask.locationReminder && subtask.locationName && (
                            <Badge variant="outline" className="text-xs bg-blue-100">
                              <MapPin className="h-3 w-3 mr-1" />
                              {getLocationIcon(subtask.locationCategory || 'other')} {subtask.locationName}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSubtask(subtask.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Subtask Button */}
      {!showAddForm && (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          className="w-full border-dashed border-2 hover:bg-orange-50 hover:border-orange-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subtask with Reminder
        </Button>
      )}

      {/* Add Subtask Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-orange-300 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-orange-600" />
                  Add New Subtask
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subtask Title */}
                <div className="space-y-2">
                  <Label htmlFor="subtask-title">Subtask Title</Label>
                  <Input
                    id="subtask-title"
                    value={newSubtask.title}
                    onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                    placeholder="Enter subtask description..."
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                {/* Date and Time Reminder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-date">Reminder Date</Label>
                    <Input
                      id="reminder-date"
                      type="date"
                      value={newSubtask.reminderDate}
                      onChange={(e) => setNewSubtask({ ...newSubtask, reminderDate: e.target.value })}
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Reminder Time</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={newSubtask.reminderTime}
                      onChange={(e) => setNewSubtask({ ...newSubtask, reminderTime: e.target.value })}
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>
                </div>

                {/* Morning Reminder Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="morning-reminder"
                    checked={newSubtask.morningReminder}
                    onCheckedChange={(checked) => setNewSubtask({ ...newSubtask, morningReminder: checked })}
                  />
                  <Label htmlFor="morning-reminder" className="flex items-center">
                    <AlarmClock className="h-4 w-4 mr-2 text-orange-600" />
                    Enable Morning Reminder (9:00 AM alert with clock)
                  </Label>
                </div>

                {/* Location-based Reminder */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="location-reminder"
                      checked={newSubtask.locationReminder}
                      onCheckedChange={(checked) => setNewSubtask({ ...newSubtask, locationReminder: checked })}
                    />
                    <Label htmlFor="location-reminder" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      Enable Location-based Reminder
                    </Label>
                  </div>

                  {newSubtask.locationReminder && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 ml-6 pl-4 border-l-2 border-blue-200"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="location-name">Location Name</Label>
                        <Input
                          id="location-name"
                          value={newSubtask.locationName}
                          onChange={(e) => setNewSubtask({ ...newSubtask, locationName: e.target.value })}
                          placeholder="e.g., Walmart, Target, Local grocery store"
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location-category">Location Category</Label>
                        <Select
                          value={newSubtask.locationCategory}
                          onValueChange={(value) => setNewSubtask({ ...newSubtask, locationCategory: value })}
                        >
                          <SelectTrigger className="border-blue-200 focus:border-blue-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grocery">🛒 Grocery Store</SelectItem>
                            <SelectItem value="retail">🏪 Retail Store</SelectItem>
                            <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                            <SelectItem value="office">🏢 Office</SelectItem>
                            <SelectItem value="home">🏠 Home</SelectItem>
                            <SelectItem value="gym">💪 Gym</SelectItem>
                            <SelectItem value="medical">🏥 Medical</SelectItem>
                            <SelectItem value="gas">⛽ Gas Station</SelectItem>
                            <SelectItem value="bank">🏦 Bank</SelectItem>
                            <SelectItem value="other">📍 Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Alert className="bg-blue-50 border-blue-200">
                        <MapPin className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Location Feature:</strong> When you're near a {newSubtask.locationCategory} location, 
                          you'll get a notification: "Don't forget to {newSubtask.title.toLowerCase() || 'complete this task'}!"
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleAddSubtask}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    disabled={!newSubtask.title.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subtask
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Information */}
      {subtasks.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700">
                  Subtasks: {subtasks.filter(s => s.completed).length} / {subtasks.length} completed
                </div>
                {subtasks.some(s => s.morningReminder) && (
                  <Badge variant="outline" className="bg-orange-100">
                    <Bell className="h-3 w-3 mr-1" />
                    Morning alerts enabled
                  </Badge>
                )}
                {subtasks.some(s => s.locationReminder) && (
                  <Badge variant="outline" className="bg-blue-100">
                    <MapPin className="h-3 w-3 mr-1" />
                    Location alerts enabled
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Progress: {Math.round((subtasks.filter(s => s.completed).length / subtasks.length) * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}