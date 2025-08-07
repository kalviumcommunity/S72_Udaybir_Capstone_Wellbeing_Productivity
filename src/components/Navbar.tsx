
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useUser } from '@/contexts/UserContext';
import { useTimer } from '@/contexts/TimerContext';
import { 
  ChevronDown, 
  Timer, 
  Play, 
  Pause,
  Home,
  BookOpen,
  ShieldAlert,
  Calendar,
  CheckSquare,
  Clock,
  Moon,
  BarChart,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  Heart,
  BarChart3,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();
  const { currentUser, logout } = useUser();
  const { isActive: timerIsActive, timeLeft, isWorking, formatTime } = useTimer();
  const [searchQuery, setSearchQuery] = useState('');
  
  const isActiveRoute = (path: string) => location.pathname === path;
  
  const navLinks = [
    { name: 'Notes Hub', path: '/notes', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { name: 'Study Planner', path: '/study-planner', icon: <Calendar className="w-4 h-4 mr-2" /> },
    { name: 'Task Tracker', path: '/tasks', icon: <CheckSquare className="w-4 h-4 mr-2" /> },
    { name: 'Focus Mode', path: '/focus', icon: <Clock className="w-4 h-4 mr-2" /> },
    { name: 'Mood Tracker', path: '/mood', icon: <Moon className="w-4 h-4 mr-2" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart className="w-4 h-4 mr-2" /> }
  ];
  
  // Don't render navbar if user is not logged in
  if (!currentUser) {
    return null;
  }
  
  return (
    <nav className="fixed top-0 left-0 z-40 w-full backdrop-blur-sm bg-background/80 border-b border-border/40 animate-navbar-slide-down transition-transform duration-500">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo and App Name */}
          <div className="flex items-center flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-medium text-lg">Sentience</span>
            </Link>
          </div>
          

          
          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            
            {/* Timer Indicator */}
            {timerIsActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Timer className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isWorking ? 'Work' : 'Break'}
                </span>
                <span className="text-xs text-green-600 font-bold">
                  ✓ Running
                </span>
              </div>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Pages Dropdown */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-md border transition-colors hover:bg-muted">
                    <span className="text-sm font-medium">Pages</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/notes" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes Hub
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/study-planner" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Study Planner
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/tasks" className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Task Tracker
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/focus" className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Focus Mode
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mood" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Mood Tracker
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/analytics" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* User Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors",
                    isActiveRoute('/profile') 
                      ? "border-primary/50 bg-primary/5" 
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium hidden sm:block">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-transparent hover:bg-muted transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:block">
                    Logout
                  </span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent hover:bg-muted transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">
                  Login
                </span>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
