
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
import { useEffect, Suspense } from "react";
import { LoadingSpinner } from "./components/LoadingSpinner";

import Navbar from "./components/Navbar";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";

// Lazy load heavy components
const NotesHub = React.lazy(() => import("./pages/NotesHub.tsx"));
const Profile = React.lazy(() => import("./pages/Profile.tsx"));
const NoteDetail = React.lazy(() => import("./pages/NoteDetail.tsx"));
const StudyPlanner = React.lazy(() => import("./pages/StudyPlanner.tsx"));
const TaskTracker = React.lazy(() => import("./pages/TaskTracker.tsx"));
const FocusMode = React.lazy(() => import("./pages/FocusMode.tsx"));
const MoodTracker = React.lazy(() => import("./pages/MoodTracker.tsx"));
const Analytics = React.lazy(() => import("./pages/Analytics.tsx"));

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
