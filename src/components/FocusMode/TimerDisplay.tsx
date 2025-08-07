import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music } from 'lucide-react';

interface TimerDisplayProps {
  isWorking: boolean;
  timeLeft: number;
  progressPercentage: number;
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  toggleSound: () => void;
  toggleAmbientSound: () => void;
  soundEnabled: boolean;
  ambientSoundEnabled: boolean;
  formatTime: (seconds: number) => string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  isWorking,
  timeLeft,
  progressPercentage,
  isActive,
  toggleTimer,
  resetTimer,
  toggleSound,
  toggleAmbientSound,
  soundEnabled,
  ambientSoundEnabled,
  formatTime
}) => {
  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6">
      {/* Timer Status */}
      <div className="space-y-2">
        <h2 className={`text-2xl font-bold ${
          isWorking ? 'text-blue-600' : 'text-green-600'
        }`}>
          {isWorking ? 'Work Time' : 'Break Time'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isWorking ? 'Stay focused and productive' : 'Take a well-deserved break'}
        </p>
      </div>

      {/* Timer Display with Progress Ring */}
      <div className="relative flex items-center justify-center">
        {/* Progress Ring */}
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              className={`transition-all duration-300 ${
                isWorking ? 'text-blue-500' : 'text-green-500'
              }`}
            />
          </svg>
          
          {/* Timer text in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-light tracking-widest text-gray-800 dark:text-gray-200" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-2 tracking-wide">
                {isActive ? (isWorking ? 'Focusing' : 'On Break') : 'Ready'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-full ${
            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={resetTimer}
          className="w-12 h-12 rounded-full"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={toggleSound}
          className={`w-12 h-12 rounded-full ${
            soundEnabled ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={toggleAmbientSound}
          className={`w-12 h-12 rounded-full ${
            ambientSoundEnabled ? 'text-blue-600' : 'text-gray-400'
          }`}
          title={ambientSoundEnabled ? 'Disable ambient sound' : 'Enable ambient sound'}
        >
          <Music className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default TimerDisplay; 