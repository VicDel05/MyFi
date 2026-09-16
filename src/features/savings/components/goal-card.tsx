"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContributeDialog } from "./contribute-dialog";
import { deleteSavingsGoal } from "../actions";
import { Target, Calendar, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GoalCardProps {
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    percentage: number;
    targetDate: Date | null;
    status: string;
    contributionsCount: number;
  };
  accounts: Array<{ id: string; name: string; currentBalance: any; currency: string }>;
}

export function GoalCard({ goal, accounts }: GoalCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar la meta "${goal.name}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteSavingsGoal(goal.id);
      router.refresh();
    } catch {
      alert("Error al eliminar la meta");
    } finally {
      setIsDeleting(false);
    }
  };

  const isCompleted = goal.status === "COMPLETED" || goal.percentage >= 100;

  return (
    <Card className="overflow-hidden border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
      <div>
        <div className={`h-1.5 w-full ${isCompleted ? "bg-emerald-500" : "bg-blue-600"}`} />
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                isCompleted ? "bg-emerald-600" : "bg-blue-600"
              }`}
            >
              {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Target className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
              {goal.targetDate && (
                <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-zinc-400" />
                  Meta: {formatDate(goal.targetDate)}
                </CardDescription>
              )}
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-zinc-400 hover:text-red-600 p-1 rounded-md transition-colors"
            title="Eliminar meta"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Montos y Porcentaje */}
          <div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">Acumulado:</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(goal.currentAmount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Objetivo:</span>
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  {formatCurrency(goal.targetAmount)}
                </span>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="mt-2 space-y-1">
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${goal.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-medium pt-0.5">
                <span className="text-zinc-500">{goal.percentage}% alcanzado</span>
                <span className="text-zinc-500">
                  {isCompleted ? (
                    <span className="text-emerald-600 font-bold">¡Meta Cumplida! 🎉</span>
                  ) : (
                    `Faltan ${formatCurrency(goal.remainingAmount)}`
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-2">
        <span className="text-[11px] text-zinc-400">
          {goal.contributionsCount} {goal.contributionsCount === 1 ? "abono registrado" : "abonos registrados"}
        </span>
        <ContributeDialog goalId={goal.id} goalName={goal.name} accounts={accounts} />
      </div>
    </Card>
  );
}
