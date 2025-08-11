import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DistractionBlocker: React.FC = () => {
  const [useBlockSiteIntegration, setUseBlockSiteIntegration] = useState(false);

  useEffect(() => {
    // Load state from localStorage on component mount
    const storedIntegration = localStorage.getItem('useBlockSiteIntegration');
    if (storedIntegration !== null) {
      setUseBlockSiteIntegration(JSON.parse(storedIntegration));
    }
  }, []);

  const handleBlockSiteIntegration = (checked: boolean) => {
    setUseBlockSiteIntegration(checked);
    localStorage.setItem('useBlockSiteIntegration', JSON.stringify(checked));
    if (checked) {
      toast({
        title: "BlockSite Integration Enabled",
        description: "Remember to install the official BlockSite extension for full functionality.",
      });
    } else {
      toast({
        title: "BlockSite Integration Disabled",
        description: "Your local blocker settings will now apply.",
      });
    }
  };

  const handleInstallBlockSite = () => {
    window.open('https://chromewebstore.google.com/detail/blocksite-block-websites/eiimnmioipafcokbfikbljfdeojpcgbh?hl=en&pli=1', '_blank');
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            BlockSite Integration
          </CardTitle>
          <CardDescription>
            Integrate with the official BlockSite Chrome Extension for advanced blocking features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* BlockSite Integration */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  BlockSite Integration
                </h3>
              </div>
              <Switch
                checked={useBlockSiteIntegration}
                onCheckedChange={handleBlockSiteIntegration}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Use the official BlockSite extension for enhanced blocking capabilities.
              <br />
              <span className="font-semibold text-red-500">Note: This feature only works on Chrome.</span>
            </p>
            <Button
              onClick={handleInstallBlockSite}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Install BlockSite Extension
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Features: Scheduled blocking, password protection, custom blocked pages, usage limits
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistractionBlocker; 