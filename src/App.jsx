
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TimerProvider } from "./contexts/TimerContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { dataSyncService } from "./services/dataSync";
import { notificationService } from "./services/notifications";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound";
import NotesHub from "./pages/NotesHub.tsx";
import Profile from "./pages/Profile.tsx";
import NoteDetail from "./pages/NoteDetail.tsx";
import StudyPlanner from "./pages/StudyPlanner.tsx";
import TaskTracker from "./pages/TaskTracker.tsx";
import FocusMode from "./pages/FocusMode.tsx";
import MoodTracker from "./pages/MoodTracker.tsx";
import Analytics from "./pages/Analytics.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";

const queryClient = new QueryClient();

// App initialization component
const AppInitializer = ({ children }) => {
  useEffect(() => {
    // Initialize data sync service
    dataSyncService.startAutoSync();
    
    // Initialize notification service
    notificationService.startPeriodicNotifications();
    

    
    // Update activity on user interaction
    const updateActivity = () => {
      notificationService.updateActivity();
    };
    
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Initial activity update
    updateActivity();
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  return <>{children}</>;
};

// Layout component that handles conditional navbar rendering
const AppLayout = () => {
  const { currentUser } = useUser();
  
  return (
    <ErrorBoundary>
      <Navbar />
      <div className={currentUser ? "pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/notes" element={<ProtectedRoute><NotesHub /></ProtectedRoute>} />
          <Route path="/notes/:noteId" element={<ProtectedRoute><NoteDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/study-planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TaskTracker /></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
      <Sonner />
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <UserProvider>
        <TooltipProvider>
          <TimerProvider>
            <AppInitializer>
              <BrowserRouter>
                <AppLayout />
              </BrowserRouter>
            </AppInitializer>
          </TimerProvider>
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
