"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDebt } from "../actions";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateDebtDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [creditor, setCreditor] = React.useState("");
  const [initialAmount, setInitialAmount] = React.useState("");
  const [currentBalance, setCurrentBalance] = React.useState("");
  const [interestRate, setInterestRate] = React.useState("");
  const [minimumPayment, setMinimumPayment] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const initialNum = parseFloat(initialAmount);
    const balanceNum = parseFloat(currentBalance);

    if (isNaN(initialNum) || initialNum <= 0) {
      setError("Ingresa un monto inicial válido mayor a 0");
      return;
    }

    if (isNaN(balanceNum) || balanceNum < 0) {
      setError("Ingresa un saldo pendiente válido");
      return;
    }

    if (!name.trim() || !creditor.trim()) {
      setError("El nombre de la deuda y el acreedor son obligatorios");
      return;
    }

    setIsPending(true);
    try {
      const res = await createDebt({
        name: name.trim(),
        creditor: creditor.trim(),
        initialAmount: initialNum,
        currentBalance: balanceNum,
        interestRate: interestRate ? parseFloat(interestRate) : null,
        minimumPayment: minimumPayment ? parseFloat(minimumPayment) : null,
        dueDate: dueDate || null,
      });

      if (!res.success) {
        setError(res.error || "Error al registrar la deuda");
      } else {
        setIsOpen(false);
        setName("");
        setCreditor("");
        setInitialAmount("");
        setCurrentBalance("");
        setInterestRate("");
        setMinimumPayment("");
        setDueDate("");
        router.refresh();
      }
    } catch {
      setError("Error inesperado al registrar la deuda");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2 shadow-xs"
      >
        <Plus className="h-4 w-4" />
        Registrar Deuda
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Registrar Deuda o Crédito"
        description="Ingresa los datos de tu deuda para incorporarla al método Bola de Nieve."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre de la Deuda
              </label>
              <Input
                type="text"
                placeholder="Ej. Tarjeta Oro, Préstamo Personal..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Acreedor / Institución
              </label>
              <Input
                type="text"
                placeholder="Ej. BBVA, Santander, Liverpool..."
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Monto Original ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 15000.00"
                value={initialAmount}
                onChange={(e) => {
                  setInitialAmount(e.target.value);
                  if (!currentBalance) setCurrentBalance(e.target.value);
                }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Saldo Pendiente Actual ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 12000.00"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Pago Mínimo ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 800.00"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tasa Anual (% opcional)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ej. 36.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Día Límite / Vencimiento
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar Deuda
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
