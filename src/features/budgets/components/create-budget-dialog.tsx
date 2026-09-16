"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertBudget } from "../actions";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateBudgetDialogProps {
  categories: Array<{ id: string; name: string; type: string; color: string | null }>;
  currentPeriod: string;
}

export function CreateBudgetDialog({ categories, currentPeriod }: CreateBudgetDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const [categoryId, setCategoryId] = React.useState(expenseCategories[0]?.id || "");
  const [monthlyLimit, setMonthlyLimit] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const limitNum = parseFloat(monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError("Ingresa un límite mensual válido mayor a 0");
      return;
    }

    if (!categoryId) {
      setError("Selecciona una categoría");
      return;
    }

    setIsPending(true);
    try {
      const res = await upsertBudget({
        categoryId,
        monthlyLimit: limitNum,
        period: currentPeriod,
      });

      if (!res.success) {
        setError(res.error || "Error al asignar presupuesto");
      } else {
        setIsOpen(false);
        setMonthlyLimit("");
        router.refresh();
      }
    } catch {
      setError("Error inesperado al guardar el presupuesto");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 shadow-xs"
      >
        <Plus className="h-4 w-4" />
        Fijar Presupuesto
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Fijar Presupuesto Mensual"
        description={`Define el tope de gasto para una categoría en el periodo ${currentPeriod}.`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Categoría de Gasto
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
              required
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Límite Mensual ($)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ej. 4000.00"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="text-base font-semibold"
              required
            />
          </div>

          {error && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar Presupuesto
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
