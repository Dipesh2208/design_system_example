import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch theme (currently ${theme})`}
      className={`relative inline-flex items-center justify-center min-w-10 min-h-10 p-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-primary shadow-xs ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
      )}
    </button>
  );
}
