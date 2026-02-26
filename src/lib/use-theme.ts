import { createSignal, onMount, createEffect } from "solid-js";

type Theme = "light" | "dark";

const THEME_KEY = "theme-preference";

function getSystemTheme(): Theme {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function getStoredTheme(): Theme | null {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  }
  return null;
}

function getInitialTheme(): Theme {
  const stored = getStoredTheme();
  return stored ?? getSystemTheme();
}

export function createTheme() {
  const [theme, setTheme] = createSignal<Theme>(getInitialTheme());

  const applyTheme = (newTheme: Theme) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      root.setAttribute("data-kb-theme", newTheme);
    }
  };

  onMount(() => {
    applyTheme(theme());

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = getStoredTheme();
      // Only auto-switch if user hasn't set a preference
      if (!stored) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  });

  createEffect(() => {
    applyTheme(theme());
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Also update localStorage when theme changes
  createEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_KEY, theme());
    }
  });

  return {
    theme,
    toggleTheme,
  };
}
