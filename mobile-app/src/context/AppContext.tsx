import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Define the types for our tasks, matching our web app
export type TaskCategory = "Work" | "Personal" | "Shopping" | "Health" | "Other";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  timer?: number; // Timer duration in minutes
  createdAt: string;
}

export type NewTask = Omit<Task, "id" | "createdAt">;

// The shape of our context
interface AppContextType {
  tasks: Task[];
  addTask: (task: NewTask) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  alarmEnabled: boolean;
  setAlarmEnabled: (enabled: boolean) => void;
  alarmSound: string;
  setAlarmSound: (sound: string) => void;
  isLoading: boolean;
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  tasks: [],
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  activeTask: null,
  setActiveTask: () => {},
  alarmEnabled: true,
  setAlarmEnabled: () => {},
  alarmSound: 'gentle_bell',
  setAlarmSound: () => {},
  isLoading: true,
});

// Hook to easily use our context
export const useAppContext = () => useContext(AppContext);

// Provider component to wrap our app
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmSound, setAlarmSound] = useState('gentle_bell');
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks and settings from AsyncStorage on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks
        const tasksJson = await AsyncStorage.getItem('tasks');
        if (tasksJson) {
          setTasks(JSON.parse(tasksJson));
        }

        // Load settings
        const settingsJson = await AsyncStorage.getItem('settings');
        if (settingsJson) {
          const settings = JSON.parse(settingsJson);
          if (settings.alarmEnabled !== undefined) setAlarmEnabled(settings.alarmEnabled);
          if (settings.alarmSound) setAlarmSound(settings.alarmSound);
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks to AsyncStorage:', error);
      }
    };

    if (!isLoading) {
      saveData();
    }
  }, [tasks, isLoading]);

  // Save settings to AsyncStorage when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('settings', JSON.stringify({ 
          alarmEnabled, 
          alarmSound 
        }));
      } catch (error) {
        console.error('Error saving settings to AsyncStorage:', error);
      }
    };

    if (!isLoading) {
      saveSettings();
    }
  }, [alarmEnabled, alarmSound, isLoading]);

  // Task management functions
  const addTask = (newTask: NewTask) => {
    const taskWithId: Task = {
      ...newTask,
      id: uuidv4(),
      createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    };
    setTasks(prevTasks => [...prevTasks, taskWithId]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    if (activeTask?.id === id) {
      setActiveTask(null);
    }
  };

  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    activeTask,
    setActiveTask,
    alarmEnabled,
    setAlarmEnabled,
    alarmSound,
    setAlarmSound,
    isLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};