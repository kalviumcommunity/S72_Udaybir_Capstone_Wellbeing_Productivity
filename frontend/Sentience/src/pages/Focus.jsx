import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, RotateCcw, Volume2, Volume1, VolumeX, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';

const Focus = () => {
  // Pomodoro States
  const [mode, setMode] = useState('focus');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [cycles, setCycles] = useState(0);

  // Settings for different modes
  const timerSettings = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  // Reset timer when mode changes
  useEffect(() => {
    setTimeLeft(timerSettings[mode]);
    setIsActive(false);
  }, [mode]);

  // Timer effect
  useEffect(() => {
    let interval;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // When timer ends
      setIsActive(false);
      // Play sound if not muted
      if (!isMuted) {
        // Sound implementation would go here
      }
      
      // Handle cycle completion
      if (mode === 'focus') {
        const newCycles = cycles + 1;
        setCycles(newCycles);
        
        // After 4 focus sessions, take a long break
        if (newCycles % 4 === 0) {
          setMode('longBreak');
        } else {
          setMode('shortBreak');
        }
      } else {
        // After break, go back to focus
        setMode('focus');
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, cycles, isMuted]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercentage = (timeLeft / timerSettings[mode]) * 100;

  // Toggle timer
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Reset timer
  const resetTimer = () => {
    setTimeLeft(timerSettings[mode]);
    setIsActive(false);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Distraction blocker settings
  const [isBlockerEnabled, setIsBlockerEnabled] = useState(false);
  const [blockedSites, setBlockedSites] = useState([
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'youtube.com',
  ]);
  const [newSite, setNewSite] = useState('');

  const addBlockedSite = () => {
    if (newSite.trim() === '') return;
    setBlockedSites([...blockedSites, newSite.trim()]);
    setNewSite('');
  };

  const removeBlockedSite = (site) => {
    setBlockedSites(blockedSites.filter(s => s !== site));
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Focus Mode</h1>
          <p className="text-muted-foreground">Stay productive with Pomodoro technique and block distractions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pomodoro Timer</CardTitle>
                <CardDescription>
                  Focus for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-minute break.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-8">
                  <Tabs defaultValue={mode} onValueChange={(value) => setMode(value)}>
                    <TabsList>
                      <TabsTrigger 
                        value="focus" 
                        className={mode === 'focus' ? 'bg-sentience-500 text-white' : ''}
                      >
                        Focus
                      </TabsTrigger>
                      <TabsTrigger 
                        value="shortBreak" 
                        className={mode === 'shortBreak' ? 'bg-sentience-500 text-white' : ''}
                      >
                        Short Break
                      </TabsTrigger>
                      <TabsTrigger 
                        value="longBreak" 
                        className={mode === 'longBreak' ? 'bg-sentience-500 text-white' : ''}
                      >
                        Long Break
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <div className="w-64 h-64 rounded-full border-8 border-muted flex items-center justify-center">
                      <span className="text-5xl font-bold">{formatTime(timeLeft)}</span>
                    </div>
                    <Progress
                      value={progressPercentage}
                      className="absolute bottom-0 left-0 right-0 h-2"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4 mb-8">
                  <Button 
                    onClick={toggleTimer} 
                    size="lg"
                    className="bg-sentience-500 hover:bg-sentience-600"
                  >
                    {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                    {isActive ? 'Pause' : 'Start'}
                  </Button>
                  <Button 
                    onClick={resetTimer} 
                    variant="outline" 
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1" 
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : volume < 30 ? (
                          <Volume1 className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                      <span className="text-sm ml-2">Notification</span>
                    </div>
                    <div className="w-24">
                      <Slider 
                        value={[isMuted ? 0 : volume]} 
                        min={0} 
                        max={100} 
                        step={1}
                        onValueChange={(value) => {
                          setVolume(value[0]);
                          if (value[0] === 0) {
                            setIsMuted(true);
                          } else if (isMuted) {
                            setIsMuted(false);
                          }
                        }}
                        disabled={isMuted}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <span>Completed Cycles: {cycles}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Distraction Blocker</CardTitle>
                <CardDescription>
                  Block distracting websites during your focus sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Enable Website Blocker</span>
                    <Switch
                      checked={isBlockerEnabled}
                      onCheckedChange={setIsBlockerEnabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Website URL"
                        value={newSite}
                        onChange={(e) => setNewSite(e.target.value)}
                        disabled={!isBlockerEnabled}
                        className="flex-1"
                      />
                      <Button
                        onClick={addBlockedSite}
                        disabled={!isBlockerEnabled || newSite.trim() === ''}
                        className="bg-sentience-500 hover:bg-sentience-600"
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className={`border rounded-lg p-2 ${!isBlockerEnabled ? 'opacity-50' : ''}`}>
                      <div className="text-sm font-medium mb-2">Blocked Websites:</div>
                      <div className="space-y-2">
                        {blockedSites.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            No websites blocked
                          </div>
                        ) : (
                          blockedSites.map((site) => (
                            <div key={site} className="flex items-center justify-between bg-muted/50 py-2 px-3 rounded-md">
                              <span className="text-sm">{site}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => removeBlockedSite(site)}
                                disabled={!isBlockerEnabled}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Note: This feature simulates website blocking for demonstration purposes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-sentience-200 text-sentience-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">1</span>
                    <span>Break large tasks into smaller, manageable chunks.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-sentience-200 text-sentience-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">2</span>
                    <span>Stay hydrated and take short breaks to maintain focus.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-sentience-200 text-sentience-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">3</span>
                    <span>Use the Pomodoro technique to improve productivity.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-sentience-200 text-sentience-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">4</span>
                    <span>Create a dedicated study environment free from distractions.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Helper component for Input
const Input = ({ className, ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default Focus;
