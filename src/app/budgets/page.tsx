import { getBudgetsWithSpending } from "@/features/budgets/actions";
import { getCategories } from "@/features/categories/actions";
import { Header } from "@/components/layout/header";
import { CreateBudgetDialog } from "@/features/budgets/components/create-budget-dialog";
import { BudgetProgressCard } from "@/features/budgets/components/budget-progress-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PieChart, AlertTriangle, CheckCircle2, TrendingDown, PiggyBank } from "lucide-react";

interface BudgetsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const { period } = await searchParams;
  const currentPeriod = period || new Date().toISOString().slice(0, 7);

  const budgetsData = await getBudgetsWithSpending(currentPeriod);
  const categories = await getCategories("EXPENSE");

  const [yearStr, monthStr] = currentPeriod.split("-");
  const monthDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const monthName = monthDate.toLocaleString("es-MX", { month: "long", year: "numeric" });

  const totalBudgeted = budgetsData.totalBudgeted;
  const totalSpent = budgetsData.totalSpent;
  const totalRemaining = budgetsData.totalRemaining;
  const globalPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header>
        <CreateBudgetDialog
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            color: c.color,
          }))}
          currentPeriod={currentPeriod}
        />
      </Header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">
              Presupuesto Mensual — {monthName}
            </h1>
            <p className="text-xs text-zinc-500">
              Planifica tus topes de gasto por categoría y mantén el control preventivo
            </p>
          </div>
          <CreateBudgetDialog
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              color: c.color,
            }))}
            currentPeriod={currentPeriod}
          />
        </div>

        {/* Resumen Global del Presupuesto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                Total Presupuestado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(totalBudgeted)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Límite asignado para el mes</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                Total Gastado Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {globalPct}% del presupuesto consumido
              </p>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${totalRemaining >= 0 ? "border-l-emerald-600" : "border-l-red-600"}`}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                Remanente Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalRemaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                {formatCurrency(totalRemaining)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {totalRemaining >= 0 ? "Disponible para gastar" : "Presupuesto sobrepasado"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Listado de Presupuestos por Categoría */}
        {budgetsData.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
            <PieChart className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-3" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              No has asignado presupuestos para este mes
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">
              Establecer presupuestos te permite controlar tus gastos antes de que ocurran. Asigna límites para tus categorías más frecuentes como Alimentación o Transporte.
            </p>
            <CreateBudgetDialog
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                color: c.color,
              }))}
              currentPeriod={currentPeriod}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetsData.items.map((b) => (
              <BudgetProgressCard key={b.id} budget={b} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
