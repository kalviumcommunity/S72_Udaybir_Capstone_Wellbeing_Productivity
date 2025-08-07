import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { 
  BookOpen, 
  CheckSquare, 
  Focus, 
  BarChart3, 
  Shield, 
  Calendar,
  Heart,
  Users,
  ChevronRight,
  Star,
  Clock,
  Target,
  User,
  GraduationCap,
  Building,
  LogIn,
  Timer
} from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, href, gradient }) => (
  <Link
    to={href}
    className="group relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-6 hover:bg-card/80 w-full h-full block feature-card-hover"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${gradient}`} />
    <div className="relative z-10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${gradient.replace('bg-gradient-to-br', 'bg-gradient-to-r')} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
        {description}
      </p>
    </div>
  </Link>
);

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-card/30 border border-border/50 rounded-xl p-4 hover:bg-card/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} transition-transform duration-300 hover:scale-110`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const { currentUser } = useUser();
  
  const features = [
    {
      icon: BookOpen,
      title: "Notes Hub",
      description: "Create, share, and collaborate on notes with other students. Build a knowledge base together.",
      href: "/notes",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Study Planner",
      description: "Plan your study sessions, set goals, and track your progress with detailed analytics.",
      href: "/study-planner",
      gradient: "bg-gradient-to-br from-purple-500 to-violet-500"
    },
    {
      icon: CheckSquare,
      title: "Task Tracker",
      description: "Organize your academic tasks, set deadlines, and track completion with smart reminders.",
      href: "/tasks",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
      icon: Timer,
      title: "Focus Mode",
      description: "Stay focused with Pomodoro technique, ambient sounds, and distraction blocking.",
      href: "/focus",
      gradient: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      icon: Heart,
      title: "Mood Tracker",
      description: "Monitor your mental well-being and track patterns to maintain a healthy study-life balance.",
      href: "/mood",
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Get insights into your study habits, productivity patterns, and academic performance.",
      href: "/analytics",
      gradient: "bg-gradient-to-br from-teal-500 to-cyan-500"
    },
  ];

  // User-specific stats when logged in, dummy stats when not
  const stats = currentUser ? [
    { icon: Target, value: getTaskCompletion() || '0%', label: "Your Task Completion", color: "bg-green-500" },
    { icon: Clock, value: getStudyTime() || '0h', label: "This Week's Study Time", color: "bg-blue-500" },
    { icon: Star, value: getAvgMood() || '0', label: "Your Avg. Mood", color: "bg-yellow-500" },
    { icon: BookOpen, value: getNotesCreated() || '0', label: "Your Notes Created", color: "bg-purple-500" }
  ] : [
    { icon: Target, value: "0%", label: "Task Completion", color: "bg-green-500" },
    { icon: Clock, value: "0h", label: "Study Time", color: "bg-blue-500" },
    { icon: Star, value: "0", label: "Avg. Mood", color: "bg-yellow-500" },
    { icon: BookOpen, value: "0", label: "Notes Created", color: "bg-purple-500" }
  ];

  function getTaskCompletion() {
    try {
      const tasks: { status: string }[] = JSON.parse(localStorage.getItem('tasks') || '[]');
      if (!tasks.length) return '0%';
      const completed = tasks.filter((t) => t.status === 'completed').length;
      return `${Math.round((completed / tasks.length) * 100)}%`;
    } catch { return '0%'; }
  }
  function getStudyTime() {
    // Placeholder: implement real logic if you have study sessions in localStorage
    return '0h';
  }
  function getAvgMood() {
    try {
      const moods: { mood: string }[] = JSON.parse(localStorage.getItem('moodEntries') || '[]');
      if (!moods.length) return '0';
      const moodMap = { terrible: 1, bad: 2, neutral: 3, good: 4, excellent: 5 };
      const avg = moods.reduce((sum, m) => sum + (moodMap[m.mood] || 3), 0) / moods.length;
      return avg.toFixed(1);
    } catch { return '0'; }
  }
  function getNotesCreated() {
    try {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]');
      return notes.length.toString();
    } catch { return '0'; }
  }

  return (
    <div className="page-container relative">
      {/* Sign In Button - Only show when user is not logged in */}
      {!currentUser && (
        <div className="fixed top-6 right-6 z-50 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
          {currentUser ? (
            <>
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {currentUser.name}
              </span>
            </>
          ) : (
            <>
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Sentience
              </span>
            </>
          )}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
          {currentUser 
            ? `Ready to continue your academic journey at ${currentUser.university}?`
            : "Your intelligent companion for academic success. Organize, focus, and thrive in your educational journey."
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="opacity-0 animate-stagger-fade-in"
            style={{ animationDelay: `${0.8 + (index * 0.1)}s`, animationFillMode: "forwards" }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
          Everything you need to excel academically
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="opacity-0 animate-fade-in-scale h-full"
              style={{ animationDelay: `${1.4 + (index * 0.08)}s`, animationFillMode: "forwards" }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {!currentUser ? (
        <div className="text-center py-12 opacity-0 animate-slide-in-from-bottom" style={{ animationDelay: "2.2s", animationFillMode: "forwards" }}>
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-border/50">
            <h3 className="text-2xl font-bold mb-4">Ready to transform your study experience?</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join thousands of students who have improved their academic performance with Sentience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 opacity-0 animate-slide-in-from-bottom" style={{ animationDelay: "2.2s", animationFillMode: "forwards" }}>
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-border/50">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div className="text-left">
                <h3 className="text-2xl font-bold">{currentUser.name}</h3>
                <p className="text-muted-foreground">{currentUser.major} • {currentUser.year} Year</p>
                <p className="text-sm text-muted-foreground">{currentUser.university}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                View Profile
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                to="/notes"
                className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                Start Studying
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;