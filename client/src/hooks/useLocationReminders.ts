import { useState, useEffect } from 'react';
import type { Task } from '@shared/schema';

interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface NearbyLocation {
  task: Task;
  placeName: string;
  distance: number;
}

export function useLocationReminders(tasks: Task[]) {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyTasks, setNearbyTasks] = useState<NearbyLocation[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

  // Request location permission and start watching position
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setPermissionStatus('denied');
      return;
    }

    // Request permission and get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationError(null);
        setPermissionStatus('granted');
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user');
            setPermissionStatus('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );

    // Watch position changes
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.warn('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000 // 1 minute
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Check for nearby location-based tasks
  useEffect(() => {
    if (!location || !tasks.length) {
      setNearbyTasks([]);
      return;
    }

    const checkNearbyTasks = async () => {
      const locationBasedTasks = tasks.filter(task => 
        task.locationReminder && 
        task.locationName && 
        !task.completed
      );

      const nearby: NearbyLocation[] = [];

      for (const task of locationBasedTasks) {
        try {
          // Use a location service to find places matching the task's location name and category
          // For demo purposes, we'll simulate this with a simple keyword search
          const places = await searchNearbyPlaces(
            location.latitude,
            location.longitude,
            task.locationName!,
            task.locationCategory || 'establishment'
          );

          for (const place of places) {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              place.latitude,
              place.longitude
            );

            // Check if within the specified radius (default 500m)
            const radius = task.locationRadius || 500;
            if (distance <= radius) {
              nearby.push({
                task,
                placeName: place.name,
                distance: Math.round(distance)
              });
            }
          }
        } catch (error) {
          console.warn('Error checking nearby places for task:', task.title, error);
        }
      }

      setNearbyTasks(nearby);
    };

    // Check immediately and then every 30 seconds only when app is active
    checkNearbyTasks();
    
    let intervalId: number | null = null;
    
    // Only set up polling if app is focused and visible
    if (document.hasFocus() && document.visibilityState === 'visible') {
      intervalId = window.setInterval(checkNearbyTasks, 30000);
    }

    // Listen for visibility changes to start/stop polling
    const handleVisibilityChange = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      
      if (document.hasFocus() && document.visibilityState === 'visible') {
        intervalId = window.setInterval(checkNearbyTasks, 30000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('blur', handleVisibilityChange);

    return () => {
      if (intervalId !== null) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('blur', handleVisibilityChange);
    };
  }, [location, tasks]);

  return {
    location,
    locationError,
    nearbyTasks,
    permissionStatus,
    requestLocationPermission: () => {
      if (permissionStatus === 'denied') {
        alert('Please enable location access in your browser settings to use location-based reminders.');
      }
    }
  };
}

// Simulated place search function
// In a real implementation, you would use Google Places API, Foursquare, or similar service
async function searchNearbyPlaces(
  lat: number,
  lng: number,
  query: string,
  category: string
): Promise<Array<{ name: string; latitude: number; longitude: number }>> {
  // This is a simplified simulation
  // In reality, you'd make an API call to a places service
  
  const categoryKeywords: Record<string, string[]> = {
    grocery: ['grocery', 'supermarket', 'market', 'walmart', 'target', 'kroger', 'safeway'],
    retail: ['store', 'shop', 'mall', 'outlet'],
    restaurant: ['restaurant', 'cafe', 'diner', 'fast food', 'pizza'],
    office: ['office', 'building', 'workplace'],
    gym: ['gym', 'fitness', 'workout'],
    medical: ['hospital', 'clinic', 'doctor', 'pharmacy'],
    gas: ['gas', 'fuel', 'station', 'shell', 'bp', 'exxon'],
    bank: ['bank', 'atm', 'credit union']
  };

  const keywords = categoryKeywords[category] || [category];
  const queryLower = query.toLowerCase();
  
  // Check if query matches any category keywords
  const isRelevantLocation = keywords.some(keyword => 
    queryLower.includes(keyword.toLowerCase()) || 
    keyword.toLowerCase().includes(queryLower)
  );

  if (!isRelevantLocation) {
    return [];
  }

  // Return simulated nearby places
  // In a real app, this would be actual place data from an API
  return [
    {
      name: query,
      latitude: lat + (Math.random() - 0.5) * 0.01, // Within ~500m
      longitude: lng + (Math.random() - 0.5) * 0.01
    }
  ];
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}