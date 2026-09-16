"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { deleteTransaction } from "../actions";
import { Trash2, ArrowDownLeft, ArrowUpRight, Loader2, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";

interface TransactionItem {
  id: string;
  type: string;
  amount: any;
  transactionDate: Date;
  description: string;
  expenseType?: string | null;
  account: {
    name: string;
    color?: string | null;
    currency: string;
  };
  category?: {
    name: string;
    color?: string | null;
    macroGroup?: string | null;
  } | null;
}

export function TransactionsTable({ transactions }: { transactions: TransactionItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este movimiento? Se ajustará el saldo de la cuenta automáticamente.")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      router.refresh();
    } catch {
      alert("Error al eliminar la transacción");
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
        <Receipt className="h-10 w-10 text-zinc-400 mb-3" />
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Sin movimientos registrados
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Comienza registrando tu primer ingreso o gasto haciendo clic en &quot;Nuevo Movimiento&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Descripción</th>
            <th className="px-4 py-3">Cuenta</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3 text-right">Monto</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {transactions.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const amountNum = Number(tx.amount);

            return (
              <tr
                key={tx.id}
                className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-500">
                  {formatDate(tx.transactionDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                        {tx.description}
                      </span>
                      {tx.expenseType && (
                        <span className="text-[10px] text-zinc-400">
                          {tx.expenseType === "FIXED" ? "Gasto Fijo" : "Gasto Variable"}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tx.account.color || "#3b82f6" }}
                    />
                    {tx.account.name}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {tx.category ? (
                    <Badge variant="outline" className="text-xs font-normal">
                      {tx.category.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-zinc-400">Sin categoría</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">
                  <span
                    className={
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-900 dark:text-zinc-100"
                    }
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(amountNum, tx.account.currency)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Eliminar movimiento"
                  >
                    {deletingId === tx.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
