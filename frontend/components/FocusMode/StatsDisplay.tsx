
import React from 'react';
import { cn } from '@/lib/utils';

interface StatsDisplayProps {
  isActive: boolean;
  isWorking: boolean;
  totalFocusTime: number;
  sessionsCompleted: number;
  workDuration: number;
  formatTotalTime: (seconds: number) => string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  isActive,
  isWorking,
  totalFocusTime,
  sessionsCompleted,
  workDuration,
  formatTotalTime
}) => {
  return (
    <div className="sentience-card p-6">
      <h2 className="text-lg font-medium mb-4">Current Session Stats</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <span className="text-muted-foreground">Status</span>
          <span className="flex items-center">
            <span 
              className={cn(
                "w-2 h-2 rounded-full mr-2 animate-pulse-light",
                isActive ? "bg-green-500" : "bg-muted-foreground"
              )}
            ></span>
            {isActive ? (isWorking ? "Focusing" : "On Break") : "Idle"}
          </span>
        </div>
        
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <span className="text-muted-foreground">Total Focus Time</span>
          <span className="font-medium">{formatTotalTime(totalFocusTime)}</span>
        </div>
        
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <span className="text-muted-foreground">Sessions Completed</span>
          <span className="font-medium">{sessionsCompleted}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Current Focus Length</span>
          <span className="font-medium">{workDuration} minutes</span>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
