import { getCategories } from "@/features/categories/actions";
import { Header } from "@/components/layout/header";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tags, Sparkles, PieChart, TrendingUp } from "lucide-react";

export default async function CategoriesPage() {
  const categories = await getCategories();

  const needs = categories.filter((c) => c.type === "EXPENSE" && c.macroGroup === "NEEDS");
  const wants = categories.filter((c) => c.type === "EXPENSE" && c.macroGroup === "WANTS");
  const savings = categories.filter((c) => c.type === "EXPENSE" && c.macroGroup === "SAVINGS_DEBT");
  const incomes = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header>
        <CreateCategoryDialog />
      </Header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Categorías Adaptables
            </h1>
            <p className="text-xs text-zinc-500">
              Organiza tus gastos bajo la regla 50/30/20 y personaliza tus fuentes de ingreso
            </p>
          </div>
          <CreateCategoryDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Necesidades (50%) */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  Necesidades Básicas (50%)
                </CardTitle>
                <Badge variant="secondary">{needs.length}</Badge>
              </div>
              <CardDescription>Gastos imprescindibles para vivir y operar día a día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {needs.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color || "#3b82f6" }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deseos (30%) */}
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  Deseos y Estilo de Vida (30%)
                </CardTitle>
                <Badge variant="secondary">{wants.length}</Badge>
              </div>
              <CardDescription>Ocio, entretenimiento, salidas y compras personales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {wants.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color || "#f59e0b" }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ahorro y Deudas (20%) */}
          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  Ahorro y Deudas (20%)
                </CardTitle>
                <Badge variant="secondary">{savings.length}</Badge>
              </div>
              <CardDescription>Abonos a capital, fondos de emergencia e inversiones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {savings.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color || "#10b981" }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingresos */}
          <Card className="border-t-4 border-t-indigo-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Fuentes de Ingreso
                </CardTitle>
                <Badge variant="secondary">{incomes.length}</Badge>
              </div>
              <CardDescription>Nómina, rendimientos, honorarios y otras entradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {incomes.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color || "#6366f1" }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
