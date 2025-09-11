import { useState, useEffect } from 'react';

export const useLiveDuration = (startTime: string | null) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setDuration(0);
      return;
    }

    const calculateDuration = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diffInMs = now.getTime() - start.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      setDuration(Math.max(0, diffInSeconds));
    };

    // Calculate initial duration
    calculateDuration();

    // Update duration every second for live updates
    const interval = setInterval(calculateDuration, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return {
    durationSeconds: duration,
    durationMinutes: Math.floor(duration / 60),
    formattedDuration: formatDuration(duration)
  };
};