import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, X } from 'lucide-react';

interface SettingsPanelProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  workDuration: number;
  setWorkDuration: (duration: number) => void;
  breakDuration: number;
  setBreakDuration: (duration: number) => void;
  applySettings: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showSettings,
  setShowSettings,
  workDuration,
  setWorkDuration,
  breakDuration,
  setBreakDuration,
  applySettings
}) => {
  if (!showSettings) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowSettings(true)}
        className="mt-4"
      >
        <Settings className="h-4 w-4 mr-2" />
        Timer Settings
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Timer Settings</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="work-duration">Work Duration (minutes)</Label>
            <Input
              id="work-duration"
              type="number"
              min="1"
              max="120"
              value={workDuration}
              onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="break-duration">Break Duration (minutes)</Label>
            <Input
              id="break-duration"
              type="number"
              min="1"
              max="60"
              value={breakDuration}
              onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={applySettings} className="flex-1">
            Apply Settings
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel; 