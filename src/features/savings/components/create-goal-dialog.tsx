"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSavingsGoal } from "../actions";
import { Plus, Target, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateGoalDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(targetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Ingresa un monto objetivo válido mayor a 0");
      return;
    }

    if (!name.trim()) {
      setError("Ingresa un nombre para tu meta");
      return;
    }

    setIsPending(true);
    try {
      const res = await createSavingsGoal({
        name: name.trim(),
        targetAmount: amountNum,
        targetDate: targetDate || null,
      });

      if (!res.success) {
        setError(res.error || "Error al crear la meta de ahorro");
      } else {
        setIsOpen(false);
        setName("");
        setTargetAmount("");
        setTargetDate("");
        router.refresh();
      }
    } catch {
      setError("Error inesperado al guardar la meta");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 shadow-xs"
      >
        <Plus className="h-4 w-4" />
        Nueva Meta de Ahorro
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crear Meta de Ahorro"
        description="Fija un objetivo financiero claro para mantenerte enfocado y motivado."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre de la Meta
            </label>
            <Input
              type="text"
              placeholder="Ej. Fondo de Emergencia, Vacaciones a Cancún, Enganche..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Monto Objetivo ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 20000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="text-base font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Fecha Límite (Opcional)
              </label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
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
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Crear Meta
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
