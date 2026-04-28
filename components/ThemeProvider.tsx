"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "neon" | "midnight" | "sunset" | "emerald" | "cyberpunk" | "blood-moon" | "daylight" | "cotton-candy";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("neon");

  const updateFavicon = (activeTheme: Theme) => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    const darkLogos = ["neon", "midnight", "sunset", "emerald", "cyberpunk", "blood-moon"];
    const logoFile = darkLogos.includes(activeTheme) ? `/logo-${activeTheme}.png` : "/logo-neon.png"; // Fallback logo for light themes if missing
    link.href = logoFile;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("circus-theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      updateFavicon(savedTheme);
    } else {
      updateFavicon("neon");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("circus-theme", newTheme);
    if (newTheme === "neon") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
    updateFavicon(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
