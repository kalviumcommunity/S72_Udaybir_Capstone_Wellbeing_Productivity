
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext.js";
import { ThemeProvider } from "./contexts/ThemeContext.js";
import { TimerProvider } from "./contexts/TimerContext.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import { dataSyncService } from "./services/dataSync.js";
import { notificationService } from "./services/notifications.js";
import React, { useEffect, Suspense } from "react";
import { LoadingSpinner } from "./components/LoadingSpinner.js";

import Navbar from "./components/Navbar.js";
import Index from "./pages/Index.js";
import NotFound from "./pages/NotFound.js";
import Signup from "./pages/Signup.js";
import Login from "./pages/Login.js";
import ForgotPassword from "./pages/ForgotPassword.js";
import ResetPassword from "./pages/ResetPassword.js";

// Lazy load heavy components
const NotesHub = React.lazy(() => import("./pages/NotesHub.js"));
const Profile = React.lazy(() => import("./pages/Profile.js"));
const NoteDetail = React.lazy(() => import("./pages/NoteDetail.js"));
const StudyPlanner = React.lazy(() => import("./pages/StudyPlanner.js"));
const TaskTracker = React.lazy(() => import("./pages/TaskTracker.js"));
const FocusMode = React.lazy(() => import("./pages/FocusMode.js"));
const MoodTracker = React.lazy(() => import("./pages/MoodTracker.js"));
const Analytics = React.lazy(() => import("./pages/Analytics.js"));

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
    
    // Track user activity with debouncing
    let activityTimeout; // was: NodeJS.Timeout (TS-only)
    const debouncedUpdateActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(updateActivity, 1000);
    };
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, debouncedUpdateActivity, { passive: true });
    });
    
    // Initial activity update
    updateActivity();
    
    return () => {
      clearTimeout(activityTimeout);
      events.forEach(event => {
        document.removeEventListener(event, debouncedUpdateActivity);
      });
      // Clean up services
      dataSyncService.stopAutoSync();
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
          <Route path="/notes" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><NotesHub /></Suspense></ProtectedRoute>} />
          <Route path="/notes/:noteId" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><NoteDetail /></Suspense></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Profile /></Suspense></ProtectedRoute>} />
          <Route path="/study-planner" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><StudyPlanner /></Suspense></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><TaskTracker /></Suspense></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><FocusMode /></Suspense></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><MoodTracker /></Suspense></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense></ProtectedRoute>} />
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
