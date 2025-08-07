
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, TrendingUp, Target, Activity, BarChart3 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { taskAPI, moodAPI, studyAPI, focusAPI } from '@/services/api';

// Type definitions
interface MoodEntry {
  _id: string;
  mood: 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent';
  note: string;
  date: string;
}

interface StudySession {
  _id: string;
  subject: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  notes: string;
}

interface FocusSession {
  _id: string;
  date: string;
  duration: number;
  type: 'work' | 'break';
}

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  estimatedTime?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProcessedDayData {
  day: string;
  score?: number;
  hours?: number;
  minutes?: number;
  sessions?: number;
  entries?: number;
}

const Analytics = () => {
  const { currentUser } = useUser();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [data, setData] = useState({
    tasks: [],
    moodEntries: [],
    studySessions: [],
    focusSessions: []
  });

  // Check API availability and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if API is available
        const response = await fetch('http://localhost:8000/api/health');
        setApiAvailable(response.ok);
        
        if (response.ok && currentUser) {
          // Load data from API
          const [apiTasks, apiMoodEntries, apiStudySessions, apiFocusSessions] = await Promise.all([
            taskAPI.getAll().catch(() => []),
            moodAPI.getAll().catch(() => []),
            studyAPI.getAll().catch(() => []),
            focusAPI.getAll().catch(() => [])
          ]);
          
          setData({
            tasks: apiTasks,
            moodEntries: apiMoodEntries,
            studySessions: apiStudySessions,
            focusSessions: apiFocusSessions
          });
        } else {
          // Fallback to localStorage
          const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
          const storedMoodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
          const storedStudySessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
          const storedFocusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
          
          setData({
            tasks: storedTasks,
            moodEntries: storedMoodEntries,
            studySessions: storedStudySessions,
            focusSessions: storedFocusSessions
          });
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // Fallback to localStorage
        const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const storedMoodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        const storedStudySessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
        const storedFocusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        
        setData({
          tasks: storedTasks,
          moodEntries: storedMoodEntries,
          studySessions: storedStudySessions,
          focusSessions: storedFocusSessions
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [currentUser]);

  // Listen for data updates
  useEffect(() => {
    const handleDataUpdate = async () => {
      if (apiAvailable && currentUser) {
        try {
          const [apiTasks, apiMoodEntries, apiStudySessions, apiFocusSessions] = await Promise.all([
            taskAPI.getAll().catch(() => []),
            moodAPI.getAll().catch(() => []),
            studyAPI.getAll().catch(() => []),
            focusAPI.getAll().catch(() => [])
          ]);
          
          setData({
            tasks: apiTasks,
            moodEntries: apiMoodEntries,
            studySessions: apiStudySessions,
            focusSessions: apiFocusSessions
          });
        } catch (error) {
          console.error('Error updating analytics data:', error);
        }
      }
    };

    window.addEventListener('storage', handleDataUpdate);
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('storage', handleDataUpdate);
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, [apiAvailable, currentUser]);

  const processMoodData = (moodEntries: MoodEntry[]): ProcessedDayData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const moodMap = { terrible: 1, bad: 2, neutral: 3, good: 4, excellent: 5 };
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last7Days.map((date, index) => {
      const dayEntries = moodEntries.filter((entry: MoodEntry) => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === date;
      });
      
      const averageScore = dayEntries.length > 0 
        ? dayEntries.reduce((sum: number, entry: MoodEntry) => sum + (moodMap[entry.mood] || 3), 0) / dayEntries.length
        : 0;
      
      return {
        day: days[index],
        score: Math.round(averageScore * 10) / 10,
        entries: dayEntries.length
      };
    });
  };

  const processStudyData = (studySessions: StudySession[]): ProcessedDayData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last7Days.map((date, index) => {
      const daySessions = studySessions.filter((session: StudySession) => {
        const sessionDate = new Date(session.date).toISOString().split('T')[0];
        return sessionDate === date;
      });
      
      const totalHours = daySessions.reduce((sum: number, session: StudySession) => {
        return sum + (session.duration || 0) / 60; // Convert minutes to hours
      }, 0);
      
      return {
        day: days[index],
        hours: Math.round(totalHours * 10) / 10,
        sessions: daySessions.length
      };
    });
  };

  const processFocusData = (focusSessions: FocusSession[]): ProcessedDayData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last7Days.map((date, index) => {
      const daySessions = focusSessions.filter((session: FocusSession) => {
        const sessionDate = new Date(session.date).toISOString().split('T')[0];
        return sessionDate === date;
      });
      
      const totalMinutes = daySessions.reduce((sum: number, session: FocusSession) => {
        return sum + (session.duration || 0);
      }, 0);
      
      return {
        day: days[index],
        minutes: totalMinutes,
        sessions: daySessions.length
      };
    });
  };

  const weeklyMoodData = processMoodData(data.moodEntries);
  const weeklyStudyData = processStudyData(data.studySessions);
  const weeklyFocusData = processFocusData(data.focusSessions);

  // Calculate statistics
  const completedTasks = data.tasks.filter((task: Task) => task.status === 'done').length;
  const inProgressTasks = data.tasks.filter((task: Task) => task.status === 'in_progress').length;
  const todoTasks = data.tasks.filter((task: Task) => task.status === 'todo').length;
  const totalTasks = data.tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const averageStudyHours = data.studySessions.length > 0 
    ? data.studySessions.reduce((sum: number, session: StudySession) => sum + (session.duration || 0), 0) / data.studySessions.length / 60
    : 0;

  const averageFocusMinutes = data.focusSessions.length > 0
    ? data.focusSessions.reduce((sum: number, session: FocusSession) => sum + (session.duration || 0), 0) / data.focusSessions.length
    : 0;

  const moodValues = { terrible: 1, bad: 2, neutral: 3, good: 4, excellent: 5 };
  const averageMoodScore = data.moodEntries.length > 0
    ? data.moodEntries.reduce((sum: number, entry: MoodEntry) => sum + (moodValues[entry.mood] || 3), 0) / data.moodEntries.length
    : 0;

  const moodScoreToLabel = (score: number) => {
    if (score === 0) return 'No Data';
    if (score < 2) return 'Poor';
    if (score < 3) return 'Fair';
    if (score < 4) return 'Good';
    return 'Excellent';
  };

  const taskCompletionData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
    { name: 'To Do', value: todoTasks, color: '#6b7280' }
  ].filter(item => item.value > 0);

  // Find most productive day
  const mostProductiveDay = weeklyStudyData.reduce((max, day) => 
    (day.hours || 0) > (max.hours || 0) ? day : max
  );

  // Find best mood day
  const bestMoodDay = weeklyMoodData.reduce((max, day) => 
    (day.score || 0) > (max.score || 0) ? day : max
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="mb-8 animate-slide-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your productivity and well-being patterns
            </p>
          </div>
          <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'semester') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStudyHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Average per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageFocusMinutes)}m</div>
            <p className="text-xs text-muted-foreground">
              Average per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mood Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMoodScore.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              {moodScoreToLabel(averageMoodScore)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mood Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Mood Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyMoodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Study Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyStudyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Task Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskCompletionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskCompletionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No tasks data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productivity Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mostProductiveDay.hours && mostProductiveDay.hours > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your most productive day was <strong>{mostProductiveDay.day}</strong> with{' '}
                  <strong>{mostProductiveDay.hours} hours</strong> of study time.
                </p>
                <p className="text-xs text-muted-foreground">
                  Try to maintain this schedule for better productivity.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  Start tracking your study sessions to see your productivity patterns.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Correlations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bestMoodDay.score && bestMoodDay.score > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your best mood was on <strong>{bestMoodDay.day}</strong> with a score of{' '}
                  <strong>{bestMoodDay.score}/5</strong>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Reflect on what made that day special.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  Start tracking your mood to understand your emotional patterns.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Improvement Suggestions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completionRate < 70 && (
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Improve Task Completion</p>
                  <p className="text-sm text-muted-foreground">
                    Your completion rate is {completionRate}%. Try breaking down larger tasks into smaller, manageable pieces.
                  </p>
                </div>
              </div>
            )}
            
            {averageStudyHours < 2 && data.studySessions.length > 0 && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Increase Study Time</p>
                  <p className="text-sm text-muted-foreground">
                    Your average study session is {averageStudyHours.toFixed(1)} hours. Aim for longer, focused study sessions.
                  </p>
                </div>
              </div>
            )}
            
            {averageMoodScore < 3 && data.moodEntries.length > 0 && (
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Focus on Well-being</p>
                  <p className="text-sm text-muted-foreground">
                    Your average mood score is {averageMoodScore.toFixed(1)}/5. Consider taking more breaks and practicing self-care.
                  </p>
                </div>
              </div>
            )}
            
            {data.tasks.length === 0 && data.studySessions.length === 0 && data.moodEntries.length === 0 && (
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Start Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Begin using the Task Tracker, Study Planner, and Mood Tracker to get meaningful insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
