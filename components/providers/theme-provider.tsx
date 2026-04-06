"use client";

import React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Light wrapper - actual theme is controlled via html className="dark"
  return <>{children}</>;
}
