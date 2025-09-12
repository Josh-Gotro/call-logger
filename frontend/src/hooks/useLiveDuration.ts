import { useState, useEffect } from 'react';

export const useLiveDuration = (startTime: string | null, endTime: string | null = null) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setDuration(0);
      return;
    }

    const calculateDuration = () => {
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();
      const diffInMs = end.getTime() - start.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      setDuration(Math.max(0, diffInSeconds));
    };

    // Calculate initial duration
    calculateDuration();

    // Only set interval if call is still active (no end time)
    if (!endTime) {
      // Update duration every second for live updates
      const interval = setInterval(calculateDuration, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime]);

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