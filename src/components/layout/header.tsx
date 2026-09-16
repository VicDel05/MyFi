"use client";

import * as React from "react";
import { Sparkles, Bell } from "lucide-react";

interface HeaderProps {
  userName?: string;
  currency?: string;
  children?: React.ReactNode;
}

export function Header({ userName = "Usuario", currency = "MXN", children }: HeaderProps) {
  return (
    <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Hola, <span className="text-zinc-950 dark:text-white font-bold">{userName}</span> 👋
        </h1>
        <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          Moneda: {currency}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {children}
      </div>
    </header>
  );
}
