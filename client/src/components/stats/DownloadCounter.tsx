import { useState, useEffect } from "react";
import { Download } from "lucide-react";

// Calculate daily growth based on days since launch
const calculateDailyCount = () => {
  const launchDate = new Date('2024-01-01'); // Base launch date
  const today = new Date();
  const daysSinceLaunch = Math.floor((today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Start at 1.5M and add ~2,500 signups per day
  const baseCount = 1500000;
  const dailyGrowth = 2500;
  
  return baseCount + (daysSinceLaunch * dailyGrowth);
};

export function DownloadCounter() {
  const [displayCount, setDisplayCount] = useState<number>(calculateDailyCount());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update count at midnight each day
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Set initial count
    setDisplayCount(calculateDailyCount());
    
    // Update at midnight
    const midnightTimeout = setTimeout(() => {
      setDisplayCount(calculateDailyCount());
      
      // Then update every 24 hours
      const dailyInterval = setInterval(() => {
        setDisplayCount(calculateDailyCount());
      }, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    return () => clearTimeout(midnightTimeout);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4 text-muted-foreground">
        <Download className="h-8 w-8 animate-pulse" />
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 text-muted-foreground">
      <Download className="h-8 w-8" />
      <span className="text-lg font-bold transition-all duration-300">
        {formatNumber(displayCount)} potential client signups
      </span>
    </div>
  );
}