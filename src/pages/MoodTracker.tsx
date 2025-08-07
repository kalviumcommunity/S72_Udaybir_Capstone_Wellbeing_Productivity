
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Smile, Frown, Meh, Heart, Star } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { moodAPI } from '@/services/api';

interface MoodEntry {
  _id: string;
  mood: 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent';
  note: string;
  date: string;
}

const MoodTracker = () => {
  const { currentUser } = useUser();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    mood: 'neutral' as MoodEntry['mood'],
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Check API availability and load mood entries
  useEffect(() => {
    const initializeMoodEntries = async () => {
      try {
        // Check if API is available
        const response = await fetch('https://sentience.onrender.com/api/health');
        setApiAvailable(response.ok);
        
        if (response.ok && currentUser) {
          // Load mood entries from API
          const apiEntries = await moodAPI.getAll();
          setMoodEntries(apiEntries);
        } else {
          // Fallback to localStorage
          const storedEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
          setMoodEntries(storedEntries);
        }
      } catch (error) {
        console.error('Error loading mood entries:', error);
        // Fallback to localStorage
        const storedEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        setMoodEntries(storedEntries);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMoodEntries();
  }, [currentUser]);

  const resetForm = () => {
    setFormData({
      mood: 'neutral',
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddEntry = async () => {
    try {
      const newEntryData = {
        mood: formData.mood,
        note: formData.note,
        date: formData.date
      };

      if (apiAvailable && currentUser) {
        // Save to API
        const newEntry = await moodAPI.create(newEntryData);
        setMoodEntries([newEntry, ...moodEntries]);
      } else {
        // Save to localStorage
        const newEntry: MoodEntry = {
          _id: Date.now().toString(),
          ...newEntryData,
          date: new Date(formData.date).toISOString()
        };
        const updatedEntries = [newEntry, ...moodEntries];
        setMoodEntries(updatedEntries);
        localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
      }

      toast({
        title: "Mood recorded!",
        description: "Your mood has been saved successfully.",
      });

      resetForm();
      setIsAddingEntry(false);
    } catch (error) {
      console.error('Error creating mood entry:', error);
      toast({
        title: "Error",
        description: "Failed to save mood entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      if (apiAvailable && currentUser) {
        // Delete via API
        await moodAPI.delete(id);
        setMoodEntries(moodEntries.filter(entry => entry._id !== id));
      } else {
        // Delete from localStorage
        const updatedEntries = moodEntries.filter(entry => entry._id !== id);
        setMoodEntries(updatedEntries);
        localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
      }

      toast({
        title: "Entry deleted",
        description: "Mood entry has been removed.",
      });
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete mood entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMoodIcon = (mood: MoodEntry['mood']) => {
    switch (mood) {
      case 'terrible': return <Frown className="h-6 w-6 text-red-500" />;
      case 'bad': return <Frown className="h-6 w-6 text-orange-500" />;
      case 'neutral': return <Meh className="h-6 w-6 text-yellow-500" />;
      case 'good': return <Smile className="h-6 w-6 text-green-500" />;
      case 'excellent': return <Star className="h-6 w-6 text-purple-500" />;
      default: return <Meh className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getMoodColor = (mood: MoodEntry['mood']) => {
    switch (mood) {
      case 'terrible': return 'bg-red-100 text-red-800 border-red-200';
      case 'bad': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'neutral': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'excellent': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMoodLabel = (mood: MoodEntry['mood']) => {
    switch (mood) {
      case 'terrible': return 'Terrible';
      case 'bad': return 'Bad';
      case 'neutral': return 'Neutral';
      case 'good': return 'Good';
      case 'excellent': return 'Excellent';
      default: return mood;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAverageMood = () => {
    if (moodEntries.length === 0) return 0;
    const moodValues = { terrible: 1, bad: 2, neutral: 3, good: 4, excellent: 5 };
    const total = moodEntries.reduce((sum, entry) => sum + moodValues[entry.mood], 0);
    return total / moodEntries.length;
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading mood entries...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold tracking-tight">Mood Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track your daily mood and emotional well-being
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Badge variant="secondary">{moodEntries.length}</Badge>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <Badge variant="outline">{getAverageMood().toFixed(1)}/5</Badge>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Badge variant="outline">
              {moodEntries.filter(entry => {
                const entryDate = new Date(entry.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return entryDate >= weekAgo;
              }).length}
            </Badge>
          </CardHeader>
        </Card>
      </div>

      {/* Add Entry Button */}
      <div className="mb-6">
        <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Mood Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Mood Entry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="mood">How are you feeling?</Label>
                <div className="grid grid-cols-5 gap-2">
                  {(['terrible', 'bad', 'neutral', 'good', 'excellent'] as const).map((mood) => (
                    <Button
                      key={mood}
                      type="button"
                      variant={formData.mood === mood ? "default" : "outline"}
                      className="flex flex-col items-center gap-1 h-auto p-3"
                      onClick={() => setFormData({ ...formData, mood })}
                    >
                      {getMoodIcon(mood)}
                      <span className="text-xs">{getMoodLabel(mood)}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Notes (optional)</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="How was your day? What made you feel this way?"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry}>
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mood Entries List */}
      <div className="space-y-4">
        {moodEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <p className="text-lg font-medium mb-2">No mood entries yet</p>
                <p className="text-sm">Start tracking your mood to see patterns over time!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          moodEntries.map((entry) => (
            <Card key={entry._id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getMoodIcon(entry.mood)}
                      <Badge className={`${getMoodColor(entry.mood)} font-medium`}>
                        {getMoodLabel(entry.mood)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry._id)}
                    className="hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {entry.note && (
                  <p className="mt-3 text-sm text-muted-foreground">{entry.note}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
