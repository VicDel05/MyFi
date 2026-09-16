"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTransaction } from "../actions";
import { PlusCircle, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickTransactionDialogProps {
  accounts: Array<{ id: string; name: string; currency: string; currentBalance: any }>;
  categories: Array<{ id: string; name: string; type: string; color: string | null }>;
}

export function QuickTransactionDialog({ accounts, categories }: QuickTransactionDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [type, setType] = React.useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [accountId, setAccountId] = React.useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = React.useState("");
  const [expenseType, setExpenseType] = React.useState<"VARIABLE" | "FIXED">("VARIABLE");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);

  // Actualizar categoría por defecto al cambiar de tipo
  const filteredCategories = categories.filter((c) => c.type === type);

  React.useEffect(() => {
    if (filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, filteredCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || parseFloat(amount) <= 0) {
      setError("Por favor ingresa un monto válido");
      return;
    }

    if (!accountId) {
      setError("Por favor selecciona una cuenta");
      return;
    }

    setIsPending(true);
    try {
      const res = await createTransaction({
        type,
        amount: parseFloat(amount),
        description,
        accountId,
        categoryId: categoryId || null,
        expenseType: type === "EXPENSE" ? expenseType : null,
        transactionDate: date,
      });

      if (!res.success) {
        setError(res.error || "Ocurrió un error");
      } else {
        setIsOpen(false);
        setAmount("");
        setDescription("");
        router.refresh();
      }
    } catch {
      setError("Error inesperado al guardar el movimiento");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 shadow-sm"
      >
        <PlusCircle className="h-4 w-4" />
        Nuevo Movimiento
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Registrar Movimiento"
        description="Captura un gasto o ingreso y actualiza tus saldos al instante."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Tipo: Gasto / Ingreso */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType("EXPENSE");
                setCategoryId("");
              }}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-colors ${
                type === "EXPENSE"
                  ? "bg-white dark:bg-zinc-900 text-red-600 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" />
              Gasto
            </button>
            <button
              type="button"
              onClick={() => {
                setType("INCOME");
                setCategoryId("");
              }}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-colors ${
                type === "INCOME"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              Ingreso
            </button>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Monto ($)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-bold"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Descripción
            </label>
            <Input
              type="text"
              placeholder="Ej. Supermercado semanal, Pago de nómina..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Cuenta & Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Cuenta de Origen / Destino
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
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                required
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha y Tipo de Gasto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Fecha
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {type === "EXPENSE" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Naturaleza del Gasto
                </label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value as "VARIABLE" | "FIXED")}
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="VARIABLE">Gasto Variable</option>
                  <option value="FIXED">Gasto Fijo</option>
                </select>
              </div>
            )}
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
            <Button
              type="submit"
              disabled={isPending}
              className={type === "EXPENSE" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar {type === "EXPENSE" ? "Gasto" : "Ingreso"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
