"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recordDebtPayment } from "../actions";
import { Banknote, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface RecordPaymentDialogProps {
  debtId: string;
  debtName: string;
  pendingBalance: number;
  accounts: Array<{ id: string; name: string; currentBalance: any; currency: string }>;
}

export function RecordPaymentDialog({
  debtId,
  debtName,
  pendingBalance,
  accounts,
}: RecordPaymentDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [accountId, setAccountId] = React.useState(accounts[0]?.id || "");
  const [amount, setAmount] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Ingresa un monto de pago válido");
      return;
    }

    if (!accountId) {
      setError("Selecciona la cuenta de origen del pago");
      return;
    }

    setIsPending(true);
    try {
      const res = await recordDebtPayment({
        debtId,
        accountId,
        amount: amountNum,
        paymentDate,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || "Error al procesar el pago");
      } else {
        setIsOpen(false);
        setAmount("");
        setNotes("");
        if (res.isLiquidated) {
          alert(`¡FELICIDADES! 🎉 Has liquidado por completo la deuda "${debtName}". ¡Ese dinero ahora se sumará a la bola de nieve para tu siguiente meta!`);
        }
        router.refresh();
      }
    } catch {
      setError("Error inesperado al registrar el pago");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5"
      >
        <Banknote className="h-3.5 w-3.5" />
        Abonar
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Abonar a "${debtName}"`}
        description={`Saldo pendiente: $${pendingBalance.toFixed(2)}. Selecciona la cuenta y el monto a pagar.`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Cuenta de Origen (de donde sale el dinero)
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${Number(acc.currentBalance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Monto del Pago ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 1000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-base font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Fecha de Pago
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notas u Observaciones (Opcional)
            </label>
            <Input
              type="text"
              placeholder="Ej. Pago quincenal, abono extraordinario..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Pago
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
