"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  PieChart,
  Target,
  Snowflake,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Movimientos", href: "/transactions", icon: ArrowLeftRight },
  { name: "Cuentas", href: "/accounts", icon: Wallet },
  { name: "Categorías", href: "/categories", icon: Tags },
  { name: "Presupuestos", href: "/budgets", icon: PieChart, badge: "Sprint 2" },
  { name: "Metas de Ahorro", href: "/savings", icon: Target, badge: "Sprint 2" },
  { name: "Bola de Nieve", href: "/debts", icon: Snowflake, badge: "Sprint 3" },
  { name: "Resumen Anual", href: "/reports", icon: BarChart3, badge: "Sprint 4" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 min-h-screen">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800/80 gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">
            MyFi
          </span>
          <span className="text-[10px] block text-zinc-400 font-medium -mt-1">
            Finanzas Personales
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3 text-xs text-zinc-500">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">MyFi MVP v0.1</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Sprint 1: Cuentas y Transacciones</p>
        </div>
      </div>
    </aside>
  );
}
