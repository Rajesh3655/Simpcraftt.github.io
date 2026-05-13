"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check local storage or system preference on mount
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-16 h-8 md:w-20 md:h-10 flex items-center ${isDark ? "justify-end" : "justify-start"} rounded-full p-1 transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isDark
          ? "bg-[#1c1c2e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),_0_1px_2px_rgba(255,255,255,0.05)]"
          : "bg-[#e0e5ec] shadow-[inset_0_3px_6px_rgba(163,177,198,0.5),_inset_0_-3px_6px_rgba(255,255,255,0.8),_0_1px_2px_rgba(0,0,0,0.05)]"
      }`}
      aria-label="Toggle Theme"
    >
      {/* Track Background Glow (Dark Mode) */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-200 ease-out ${
          isDark ? "opacity-100 bg-blue-500/10 blur-sm" : "opacity-0"
        }`}
      />

      {/* Sliding Circular Button */}
      <motion.div
        layout
        className={`relative z-10 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-shadow duration-200 ease-out ${
          isDark
            ? "bg-[#2a2a3e] shadow-[0_4px_8px_rgba(0,0,0,0.6),_inset_0_1px_1px_rgba(255,255,255,0.1)]"
            : "bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),_-4px_-4px_8px_rgba(255,255,255,0.8),_inset_0_1px_1px_rgba(255,255,255,1)]"
        }`}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Moon Icon */}
        <motion.div
          initial={false}
          animate={{
            rotate: isDark ? 360 : 0,
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute"
        >
          <Moon className="w-3 h-3 md:w-4 md:h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        </motion.div>

        {/* Sun Icon */}
        <motion.div
          initial={false}
          animate={{
            rotate: isDark ? 0 : -360,
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute"
        >
          <Sun className="w-3 h-3 md:w-4 md:h-4 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
        </motion.div>
      </motion.div>
    </button>
  );
}
