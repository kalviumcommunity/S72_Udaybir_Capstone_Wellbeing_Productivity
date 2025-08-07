
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import TimerDisplay from '@/components/FocusMode/TimerDisplay';
import SettingsPanel from '@/components/FocusMode/SettingsPanel';
import StatsDisplay from '@/components/FocusMode/StatsDisplay';
import FocusTips from '@/components/FocusMode/FocusTips';
import { useTimer } from '@/contexts/TimerContext';
import { toast } from '@/hooks/use-toast';
import DistractionBlocker from '@/components/DistractionBlocker';

const FocusMode: React.FC = () => {
  const {
    // Timer state
    isWorking,
    timeLeft,
    isActive,
    sessionsCompleted,
    totalFocusTime,
    
    // Timer settings
    workDuration,
    breakDuration,
    soundEnabled,
    ambientSoundEnabled,
    distractionBlockerEnabled,
    
    // Timer actions
    toggleTimer,
    resetTimer,
    setWorkDuration,
    setBreakDuration,
    toggleSound,
    toggleAmbientSound,
    toggleDistractionBlocker,
    
    // Utility functions
    formatTime,
    formatTotalTime,
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);

  // Apply settings
  const applySettings = () => {
    setShowSettings(false);
    
    toast({
      title: "Settings Applied",
      description: "Timer settings have been updated",
    });
  };

  // Calculate progress percentage
  const progressPercentage = isWorking 
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;
  
  return (
    <div className="page-container">
      <header className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold tracking-tight">Focus Mode</h1>
        <p className="text-muted-foreground mt-1">
          Stay productive with focused work sessions
        </p>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="sentience-card p-6 flex flex-col items-center">
            {/* Timer display */}
            <TimerDisplay 
              isWorking={isWorking}
              timeLeft={timeLeft}
              progressPercentage={progressPercentage}
              isActive={isActive}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              toggleSound={toggleSound}
              toggleAmbientSound={toggleAmbientSound}
              soundEnabled={soundEnabled}
              ambientSoundEnabled={ambientSoundEnabled}
              formatTime={formatTime}
            />
            
            {/* Settings panel */}
            <SettingsPanel 
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              workDuration={workDuration}
              setWorkDuration={setWorkDuration}
              breakDuration={breakDuration}
              setBreakDuration={setBreakDuration}
              applySettings={applySettings}
            />
          </div>
        </div>
        
        <div>
          {/* Stats display */}
          <StatsDisplay 
            isActive={isActive}
            isWorking={isWorking}
            totalFocusTime={totalFocusTime}
            sessionsCompleted={sessionsCompleted}
            workDuration={workDuration}
            formatTotalTime={formatTotalTime}
          />
          
          {/* Distraction Blocker */}
          <div className="mt-6">
            <DistractionBlocker />
          </div>
          
          {/* Focus Tips */}
          <FocusTips />
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
