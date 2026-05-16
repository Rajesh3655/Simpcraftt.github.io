"use client";

import { useEffect } from "react";

export default function ThemeToggle() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    localStorage.setItem("theme", "light");
  }, []);

  return null;
}
