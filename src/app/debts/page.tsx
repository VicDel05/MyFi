import { getDebtsOverview } from "@/features/debts/actions";
import { getAccounts } from "@/features/accounts/actions";
import { Header } from "@/components/layout/header";
import { CreateDebtDialog } from "@/features/debts/components/create-debt-dialog";
import { DebtCard } from "@/features/debts/components/debt-card";
import { DebtSnowballChart } from "@/features/debts/components/debt-snowball-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Snowflake, Sparkles, Trophy, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default async function DebtsPage() {
  const overview = await getDebtsOverview();
  const accounts = await getAccounts();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header>
        <CreateDebtDialog />
      </Header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Snowflake className="h-6 w-6 text-indigo-600" />
              Gestión de Deudas — Método Bola de Nieve
            </h1>
            <p className="text-xs text-zinc-500">
              Paga tus deudas de menor a mayor saldo para ganar impulso psicológico y acelerar tu libertad financiera
            </p>
          </div>
          <CreateDebtDialog />
        </div>

        {/* KPIs de Deuda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-600">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                Deuda Total Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(overview.totalCurrent)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                De un total inicial de {formatCurrency(overview.totalInitial)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                Total Reducido / Pagado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(overview.totalPaid)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {overview.generalProgress}% del endeudamiento total saldado
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                Pagos Mínimos del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(overview.totalMinimumMonthly)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Compromiso base mensual obligatorio
              </p>
            </CardContent>
          </Card>

          {/* Tarjeta de la Deuda Foco */}
          <Card className="border-l-4 border-l-indigo-600 bg-gradient-to-br from-indigo-50/50 to-purple-50/20 dark:from-indigo-950/20 dark:to-purple-950/10">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Deuda Foco (Target)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview.focusDebt ? (
                <div>
                  <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                    {overview.focusDebt.name}
                  </div>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                    Saldo: {formatCurrency(overview.focusDebt.currentBalance)}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-base font-bold text-emerald-600">¡Libre de deudas!</div>
                  <p className="text-[11px] text-zinc-400">No tienes deudas activas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico y Estrategia Bola de Nieve */}
        {overview.activeDebts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Snowflake className="h-4 w-4 text-indigo-600" />
                  Comparativa de Deudas (Orden Bola de Nieve)
                </CardTitle>
                <CardDescription>
                  Visualiza la proporción de saldo pendiente contra el monto original de cada crédito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DebtSnowballChart data={overview.chartData} />
              </CardContent>
            </Card>

            {/* Guía rápida de la metodología */}
            <Card className="border-zinc-200/80 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  ¿Cómo funciona la Bola de Nieve?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <p>
                  <strong>1. Paga los mínimos:</strong> Cubre el pago mínimo en todas tus deudas para proteger tu historial crediticio.
                </p>
                <p>
                  <strong>2. Ataca la Deuda Foco:</strong> Destina todo el dinero extra que puedas a la deuda con el <strong>menor saldo</strong> (la #1).
                </p>
                <p>
                  <strong>3. Efecto Bola de Nieve:</strong> Al liquidarla por completo, el pago mínimo que hacías en ella se suma directamente al abono de la siguiente deuda.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Listado de Deudas Activas */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Plan de Pagos Activo ({overview.activeDebts.length})
              </h2>
              <p className="text-xs text-zinc-500">
                Ordenadas automáticamente de menor a mayor saldo para concentrar esfuerzos
              </p>
            </div>
          </div>

          {overview.activeDebts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
              <Trophy className="h-12 w-12 text-amber-500 mb-3" />
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                ¡Sin deudas activas registradas!
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">
                Si cuentas con créditos personales, tarjetas bancarias o deudas por liquidar, regístralas para que MyFi genere tu estrategia de pago óptima.
              </p>
              <CreateDebtDialog />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.activeDebts.map((d) => (
                <DebtCard
                  key={d.id}
                  debt={d}
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

        {/* Deudas Liquidadas */}
        {overview.liquidatedDebts.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Deudas Liquidadas ({overview.liquidatedDebts.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {overview.liquidatedDebts.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 block">
                        {d.name}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {d.creditor} • Total: {formatCurrency(d.initialAmount)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success">Liquidada</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
