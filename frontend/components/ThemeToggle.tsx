import React from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  console.log('ThemeToggle: Current theme:', theme);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const Icon = currentTheme?.icon || Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors">
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTheme?.label}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => {
                console.log('ThemeToggle: Setting theme to:', themeOption.value);
                setTheme(themeOption.value as 'light' | 'dark' | 'system');
              }}
              className={cn(
                "flex items-center gap-3",
                theme === themeOption.value && "bg-muted/30"
              )}
            >
              <ThemeIcon className="h-4 w-4" />
              {themeOption.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 