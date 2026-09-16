"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSavingsContribution } from "../actions";
import { PiggyBank, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContributeDialogProps {
  goalId: string;
  goalName: string;
  accounts: Array<{ id: string; name: string; currentBalance: any; currency: string }>;
}

export function ContributeDialog({ goalId, goalName, accounts }: ContributeDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [accountId, setAccountId] = React.useState(accounts[0]?.id || "");
  const [amount, setAmount] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Ingresa un monto válido mayor a 0");
      return;
    }

    if (!accountId) {
      setError("Debes seleccionar una cuenta de origen");
      return;
    }

    setIsPending(true);
    try {
      const res = await addSavingsContribution({
        goalId,
        accountId,
        amount: amountNum,
      });

      if (!res.success) {
        setError(res.error || "Error al registrar el aporte");
      } else {
        setIsOpen(false);
        setAmount("");
        router.refresh();
      }
    } catch {
      setError("Error inesperado al procesar la aportación");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5"
      >
        <PiggyBank className="h-3.5 w-3.5" />
        Abonar
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Abonar a "${goalName}"`}
        description="Transfiere dinero desde una de tus cuentas para avanzar hacia tu meta."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Cuenta de Origen (de donde saldrá el dinero)
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${Number(acc.currentBalance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Monto a Abonar ($)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ej. 1500.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Aporte
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
