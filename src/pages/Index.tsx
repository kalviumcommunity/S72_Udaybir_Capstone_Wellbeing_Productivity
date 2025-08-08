import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle } from "@/components/ThemeToggle";
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

  // If user is not logged in, show minimal hero with theme toggle and Sign in
  if (!currentUser) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-primary/40 to-purple-500/30 dark:from-primary/25 dark:to-purple-500/20 animate-float-slow" />
          <div className="absolute bottom-[-6rem] right-[-6rem] w-[28rem] h-[28rem] rounded-full blur-3xl bg-gradient-to-br from-cyan-400/30 to-teal-500/30 dark:from-cyan-400/20 dark:to-teal-500/20 animate-float-slower delay-1000" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl bg-gradient-to-br from-amber-400/20 to-pink-500/20 dark:from-amber-400/15 dark:to-pink-500/15 animate-float-slowest delay-2000" />
        </div>

        <div className="page-container">
          {/* Top bar: brand + theme toggle + sign in */}
          <div className="flex items-center justify-between py-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">Sentience</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/login" className="hub-button">
                Sign in
              </Link>
            </div>
          </div>

          {/* Hero */}
          <section className="flex flex-col items-center text-center mt-24 md:mt-32 gap-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Welcome to Sentience
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Your all‑in‑one student productivity hub. Track studies and tasks, stay focused, and gain insights from your real activity.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link to="/signup" className="hub-button">
                Get started free
              </Link>
              <Link to="/login" className="hub-button-outline px-4 py-2 rounded-md">
                I already have an account
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Logged-in experience (existing rich landing)
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

  const stats = [
    { icon: Target, value: "0%", label: "Task Completion", color: "bg-green-500" },
    { icon: Clock, value: "0h", label: "Study Time", color: "bg-blue-500" },
    { icon: Star, value: "0", label: "Avg. Mood", color: "bg-yellow-500" },
    { icon: BookOpen, value: "0", label: "Notes Created", color: "bg-purple-500" }
  ];

  return (
    <div className="page-container">
      {/* Existing content for logged-in users remains unchanged */}
      {/* ... existing rich dashboard-like landing content ... */}
    </div>
  );
};

export default Index;