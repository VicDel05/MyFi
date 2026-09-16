import { getFinancialSummary, getTransactions } from "@/features/transactions/actions";
import { getAccounts } from "@/features/accounts/actions";
import { getCategories } from "@/features/categories/actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickTransactionDialog } from "@/features/transactions/components/quick-transaction-dialog";
import { CreateAccountDialog } from "@/features/accounts/components/create-account-dialog";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Scale, PieChart } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const summary = await getFinancialSummary();
  const accounts = await getAccounts();
  const categories = await getCategories();
  const recentTransactions = await getTransactions({ limit: 8 });

  const totalExpense = summary.totalExpenses || 1;
  const needsPct = Math.round((summary.breakdown503020.needs / totalExpense) * 100) || 0;
  const wantsPct = Math.round((summary.breakdown503020.wants / totalExpense) * 100) || 0;
  const savingsPct = Math.round((summary.breakdown503020.savingsDebt / totalExpense) * 100) || 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header currency={summary.currency}>
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

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Saldo en Cuentas */}
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Saldo en Cuentas
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <Wallet className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(summary.totalBalance, summary.currency)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Patrimonio líquido en {accounts.length} {accounts.length === 1 ? "cuenta" : "cuentas"}
              </p>
            </CardContent>
          </Card>

          {/* Ingresos del Mes */}
          <Card className="border-l-4 border-l-emerald-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Ingresos (Mes)
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(summary.totalIncome, summary.currency)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Entradas de dinero este mes</p>
            </CardContent>
          </Card>

          {/* Gastos del Mes */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Gastos (Mes)
              </CardTitle>
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500">
                <TrendingDown className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                -{formatCurrency(summary.totalExpenses, summary.currency)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Salidas y consumos del mes</p>
            </CardContent>
          </Card>

          {/* Balance Neto */}
          <Card className={`border-l-4 ${summary.netCashflow >= 0 ? "border-l-indigo-600" : "border-l-amber-600"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Flujo Neto (Mes)
              </CardTitle>
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <Scale className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netCashflow >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600"}`}>
                {summary.netCashflow >= 0 ? "+" : ""}
                {formatCurrency(summary.netCashflow, summary.currency)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {summary.netCashflow >= 0 ? "Superávit disponible" : "Déficit mensual"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cuentas y Distribución 50/30/20 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cuentas Activas */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Cuentas Financieras</CardTitle>
                <CardDescription>Fuentes de efectivo y depósitos bancarios</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <CreateAccountDialog />
                <Link
                  href="/accounts"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Ver todas
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: acc.color || "#3b82f6" }}
                      >
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 block">
                          {acc.name}
                        </span>
                        <span className="text-[11px] text-zinc-400 uppercase font-medium">
                          {acc.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 block">
                        {formatCurrency(Number(acc.currentBalance), acc.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regla 50/30/20 del Mes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-zinc-500" />
                <CardTitle className="text-base">Regla 50/30/20</CardTitle>
              </div>
              <CardDescription>Distribución de gastos del mes actual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Necesidades 50% */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-700 dark:text-zinc-300">Necesidades (Meta 50%)</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{needsPct}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min(needsPct, 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400">
                  {formatCurrency(summary.breakdown503020.needs, summary.currency)}
                </div>
              </div>

              {/* Deseos 30% */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-700 dark:text-zinc-300">Deseos (Meta 30%)</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{wantsPct}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.min(wantsPct, 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400">
                  {formatCurrency(summary.breakdown503020.wants, summary.currency)}
                </div>
              </div>

              {/* Ahorro y Deudas 20% */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-700 dark:text-zinc-300">Ahorro y Deudas (Meta 20%)</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{savingsPct}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(savingsPct, 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400">
                  {formatCurrency(summary.breakdown503020.savingsDebt, summary.currency)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Últimos Movimientos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Últimos Movimientos
              </h2>
              <p className="text-xs text-zinc-500">Trazabilidad de tus ingresos y gastos recientes</p>
            </div>
            <Link
              href="/transactions"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Ver historial completo &rarr;
            </Link>
          </div>

          <TransactionsTable
            transactions={recentTransactions.map((t) => ({
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
        </div>
      </main>
    </div>
  );
}
