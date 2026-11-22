import { useTranslation } from "react-i18next";
import { useTheme, THEME_OPTIONS, type ThemeType } from "./ThemeProvider";

const THEME_KEYS: Record<string, string> = {
  dark: "dark",
  light: "light",
  "rose-red": "roseRed",
  "azure-blue": "azureBlue",
  "magenta-violet": "magentaViolet",
  "cyan-orange": "cyanOrange",
};

export function ThemeSelector({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className={`space-y-2.5 ${className}`}>
      <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {t("theme.activeTheme", "Active Theme:")}
      </span>
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Theme selector"
      >
        {THEME_OPTIONS.map((item) => {
          const isSelected = theme === item.id;
          const themeKey = THEME_KEYS[item.id] || "dark";
          const localizedName = t(`theme.${themeKey}.name`, item.name);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTheme(item.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none ${
                isSelected
                  ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 font-semibold shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              <span className="flex -space-x-1 shrink-0" aria-hidden="true">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                  style={{ backgroundColor: item.badgeColors[0] }}
                />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                  style={{ backgroundColor: item.badgeColors[1] }}
                />
              </span>
              <span>{localizedName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
