import { getTransactions } from "@/features/transactions/actions";
import { getAccounts } from "@/features/accounts/actions";
import { getCategories } from "@/features/categories/actions";
import { Header } from "@/components/layout/header";
import { QuickTransactionDialog } from "@/features/transactions/components/quick-transaction-dialog";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

interface TransactionsPageProps {
  searchParams: Promise<{ type?: string; accountId?: string }>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const { type, accountId } = await searchParams;
  const accounts = await getAccounts();
  const categories = await getCategories();

  const filterType =
    type === "INCOME" || type === "EXPENSE"
      ? (type as TransactionType)
      : undefined;

  const transactions = await getTransactions({
    type: filterType,
    accountId: accountId || undefined,
    limit: 100,
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header>
        <QuickTransactionDialog
          accounts={accounts.map((a) => ({
            id: a.id,
            name: a.name,
            currency: a.currency,
            currentBalance: a.currentBalance,
          }))}
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            color: c.color,
          }))}
        />
      </Header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Historial de Movimientos
            </h1>
            <p className="text-xs text-zinc-500">
              Registro completo de tus transacciones monetarias
            </p>
          </div>

          {/* Filtros por tipo */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
            <Link
              href="/transactions"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !type ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              Todos
            </Link>
            <Link
              href="/transactions?type=EXPENSE"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                type === "EXPENSE" ? "bg-white dark:bg-zinc-900 text-red-600 shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              Gastos
            </Link>
            <Link
              href="/transactions?type=INCOME"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                type === "INCOME" ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              Ingresos
            </Link>
          </div>
        </div>

        {/* Tabla de Movimientos */}
        <TransactionsTable
          transactions={transactions.map((t) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            transactionDate: t.transactionDate,
            description: t.description,
            expenseType: t.expenseType,
            account: t.account,
            category: t.category,
          }))}
        />
      </main>
    </div>
  );
}
