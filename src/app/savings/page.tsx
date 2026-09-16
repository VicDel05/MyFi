import { getSavingsGoals, get503020Comparison } from "@/features/savings/actions";
import { getAccounts } from "@/features/accounts/actions";
import { Header } from "@/components/layout/header";
import { CreateGoalDialog } from "@/features/savings/components/create-goal-dialog";
import { GoalCard } from "@/features/savings/components/goal-card";
import { Rule503020Chart } from "@/features/savings/components/rule-50-30-20-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Target, PieChart, Sparkles, TrendingUp, CheckCircle } from "lucide-react";

export default async function SavingsPage() {
  const goals = await getSavingsGoals();
  const accounts = await getAccounts();
  const comparison = await get503020Comparison();

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTargets = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const completedGoalsCount = goals.filter((g) => g.status === "COMPLETED" || g.percentage >= 100).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header>
        <CreateGoalDialog />
      </Header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Metas de Ahorro y Regla 50/30/20
            </h1>
            <p className="text-xs text-zinc-500">
              Construye tu patrimonio, planifica tus sueños y mantén una distribución financiera sana
            </p>
          </div>
          <CreateGoalDialog />
        </div>

        {/* Comparativa Visual 50/30/20 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">Análisis Visual 50/30/20</CardTitle>
              </div>
              <CardDescription>
                Comparación entre la recomendación financiera y tu distribución real de gastos este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Rule503020Chart data={comparison.chartData} />
            </CardContent>
          </Card>

          {/* Tarjetas resumen de ahorro */}
          <div className="space-y-4">
            <Card className="border-l-4 border-l-emerald-600">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                  Total Acumulado en Metas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalSaved)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  De un objetivo total de {formatCurrency(totalTargets)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                  Metas Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {goals.length - completedGoalsCount} en curso
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  {completedGoalsCount} {completedGoalsCount === 1 ? "meta cumplida" : "metas cumplidas"}
                </p>
              </CardContent>
            </Card>

            <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 text-xs space-y-2">
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Filosofía de la Regla 50/30/20
              </div>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                • <strong>50% Necesidades:</strong> Lo indispensable para vivir.<br />
                • <strong>30% Deseos:</strong> Estilo de vida y gustos personales.<br />
                • <strong>20% Ahorro y Deudas:</strong> Construcción de tu libertad financiera.
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Metas de Ahorro */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Tus Metas Financieras ({goals.length})
              </h2>
              <p className="text-xs text-zinc-500">
                Haz clic en &quot;Abonar&quot; para registrar aportaciones desde tus cuentas bancarias o efectivo
              </p>
            </div>
          </div>

          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
              <Target className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-3" />
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                Aún no has creado metas de ahorro
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">
                Tener un objetivo específico (como un fondo para imprevistos o un viaje) aumenta hasta un 70% la probabilidad de ahorrar con éxito.
              </p>
              <CreateGoalDialog />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  accounts={accounts.map((a) => ({
                    id: a.id,
                    name: a.name,
                    currentBalance: a.currentBalance,
                    currency: a.currency,
                  }))}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
