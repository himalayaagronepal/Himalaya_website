"use client";

import { useEffect } from "react";

export default function ForceBodyClassClient({ className }: { className: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(className);
    return () => root.classList.remove(className);
  }, [className]);

  return null;
}
