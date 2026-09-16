"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteBudget } from "../actions";
import { Trash2, AlertTriangle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BudgetProgressCardProps {
  budget: {
    id: string;
    categoryName: string;
    categoryColor: string | null;
    macroGroup: string | null;
    monthlyLimit: number;
    spentAmount: number;
    remainingAmount: number;
    percentage: number;
    status: "SAFE" | "WARNING" | "EXCEEDED";
  };
}

export function BudgetProgressCard({ budget }: BudgetProgressCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el presupuesto para ${budget.categoryName}?`)) return;
    setIsDeleting(true);
    try {
      await deleteBudget(budget.id);
      router.refresh();
    } catch {
      alert("Error al eliminar el presupuesto");
    } finally {
      setIsDeleting(false);
    }
  };

  const isExceeded = budget.status === "EXCEEDED";
  const isWarning = budget.status === "WARNING";

  return (
    <Card className="overflow-hidden border-zinc-200/80 dark:border-zinc-800">
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: budget.categoryColor || "#3b82f6" }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: budget.categoryColor || "#3b82f6" }}
          />
          <CardTitle className="text-sm font-semibold">{budget.categoryName}</CardTitle>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-zinc-400 hover:text-red-600 p-1 rounded-md transition-colors"
          title="Eliminar presupuesto"
        >
          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {/* Montos: Gastado vs Límite */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Gastado:</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(budget.spentAmount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400 block">Límite:</span>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {formatCurrency(budget.monthlyLimit)}
            </span>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="space-y-1">
          <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isExceeded
                  ? "bg-red-600"
                  : isWarning
                  ? "bg-amber-500"
                  : "bg-blue-600"
              }`}
              style={{ width: `${Math.min(budget.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium pt-0.5">
            <span
              className={
                isExceeded
                  ? "text-red-600 font-bold"
                  : isWarning
                  ? "text-amber-600 font-semibold"
                  : "text-zinc-500"
              }
            >
              {budget.percentage}% consumido
            </span>
            <span>
              {isExceeded ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Excedido por {formatCurrency(Math.abs(budget.remainingAmount))}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Restante: {formatCurrency(budget.remainingAmount)}
                </span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
