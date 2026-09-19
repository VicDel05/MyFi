"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { deleteDebt } from "../actions";
import { Snowflake, Calendar, Percent, CreditCard, Trash2, Loader2, Sparkles, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface DebtCardProps {
  debt: {
    id: string;
    name: string;
    creditor: string;
    initialAmount: number;
    currentBalance: number;
    paidAmount: number;
    percentagePaid: number;
    interestRate: number | null;
    minimumPayment: number;
    dueDate: Date | null;
    status: string;
    isFocus: boolean;
    snowballOrder: number;
    paymentsCount: number;
    recentPayments: Array<{
      id: string;
      amount: number;
      date: Date;
      notes: string | null;
      accountName: string;
    }>;
  };
  accounts: Array<{ id: string; name: string; currentBalance: any; currency: string }>;
}

export function DebtCard({ debt, accounts }: DebtCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la deuda "${debt.name}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteDebt(debt.id);
      router.refresh();
    } catch {
      alert("Error al eliminar la deuda");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`overflow-hidden border transition-all flex flex-col justify-between ${
        debt.isFocus
          ? "border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/20"
          : "border-zinc-200/80 dark:border-zinc-800"
      }`}
    >
      <div>
        <div
          className={`h-1.5 w-full ${
            debt.isFocus
              ? "bg-gradient-to-r from-indigo-500 to-purple-600"
              : "bg-zinc-300 dark:bg-zinc-700"
          }`}
        />

        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {debt.isFocus ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  #1 DEUDA FOCO
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-zinc-400">
                  #{debt.snowballOrder} en Bola de Nieve
                </span>
              )}
            </div>
            <CardTitle className="text-base font-semibold">{debt.name}</CardTitle>
            <CardDescription className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
              <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
              {debt.creditor}
            </CardDescription>
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-zinc-400 hover:text-red-600 p-1 rounded-md transition-colors"
            title="Eliminar deuda"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Montos: Saldo Pendiente vs Monto Original */}
          <div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">Saldo Pendiente:</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(debt.currentBalance)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Deuda Original:</span>
                <span className="text-sm font-medium text-zinc-500">
                  {formatCurrency(debt.initialAmount)}
                </span>
              </div>
            </div>

            {/* Barra de Progreso de Liquidación */}
            <div className="mt-2 space-y-1">
              <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${debt.percentagePaid}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-medium pt-0.5 text-zinc-500">
                <span>{debt.percentagePaid}% pagado</span>
                <span>Pagado: {formatCurrency(debt.paidAmount)}</span>
              </div>
            </div>
          </div>

          {/* Detalles de pago mínimo, tasa y vencimiento */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
            {debt.minimumPayment > 0 && (
              <div>
                <span className="text-zinc-400 block text-[10px]">Pago Mínimo:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {formatCurrency(debt.minimumPayment)}
                </span>
              </div>
            )}
            {debt.interestRate !== null && (
              <div>
                <span className="text-zinc-400 block text-[10px]">Tasa de Interés:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {debt.interestRate}% anual
                </span>
              </div>
            )}
            {debt.dueDate && (
              <div className="col-span-2">
                <span className="text-zinc-400 block text-[10px]">Próximo Vencimiento:</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {formatDate(debt.dueDate)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-3">
        <span className="text-[11px] text-zinc-400">
          {debt.paymentsCount} {debt.paymentsCount === 1 ? "abono registrado" : "abonos registrados"}
        </span>
        <RecordPaymentDialog
          debtId={debt.id}
          debtName={debt.name}
          pendingBalance={debt.currentBalance}
          accounts={accounts}
        />
      </div>
    </Card>
  );
}
