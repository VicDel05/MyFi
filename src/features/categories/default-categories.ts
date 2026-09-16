import { CategoryType, MacroGroup } from "@prisma/client";

export interface DefaultCategory {
  name: string;
  type: CategoryType;
  macroGroup?: MacroGroup;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Gastos - Necesidades (50%)
  {
    name: "Alimentación y Supermercado",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.NEEDS,
    icon: "shopping-cart",
    color: "#f97316",
  },
  {
    name: "Vivienda y Renta",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.NEEDS,
    icon: "home",
    color: "#3b82f6",
  },
  {
    name: "Servicios Básicos (Luz, Agua, Internet)",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.NEEDS,
    icon: "zap",
    color: "#06b6d4",
  },
  {
    name: "Transporte y Combustible",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.NEEDS,
    icon: "car",
    color: "#6366f1",
  },
  {
    name: "Salud y Farmacia",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.NEEDS,
    icon: "heart-pulse",
    color: "#ef4444",
  },
  {
    name: "Educación",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.NEEDS,
    icon: "book-open",
    color: "#8b5cf6",
  },

  // Gastos - Deseos / Estilo de Vida (30%)
  {
    name: "Restaurantes y Cafeterías",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.WANTS,
    icon: "coffee",
    color: "#eab308",
  },
  {
    name: "Entretenimiento y Ocio",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.WANTS,
    icon: "film",
    color: "#ec4899",
  },
  {
    name: "Ropa y Cuidado Personal",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.WANTS,
    icon: "sparkles",
    color: "#14b8a6",
  },
  {
    name: "Suscripciones Digitales",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.WANTS,
    icon: "tv",
    color: "#a855f7",
  },
  {
    name: "Viajes y Vacaciones",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.WANTS,
    icon: "plane",
    color: "#f59e0b",
  },

  // Gastos - Ahorro y Deudas (20%)
  {
    name: "Ahorro / Fondo de Emergencia",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.SAVINGS_DEBT,
    icon: "piggy-bank",
    color: "#10b981",
  },
  {
    name: "Abono a Deudas / Tarjetas",
    type: CategoryType.EXPENSE,
    macroGroup: MacroGroup.SAVINGS_DEBT,
    icon: "credit-card",
    color: "#64748b",
  },

  // Ingresos
  {
    name: "Salario / Nómina",
    type: CategoryType.INCOME,
    icon: "briefcase",
    color: "#10b981",
  },
  {
    name: "Freelance / Negocio Propio",
    type: CategoryType.INCOME,
    icon: "laptop",
    color: "#3b82f6",
  },
  {
    name: "Rendimientos e Inversiones",
    type: CategoryType.INCOME,
    icon: "trending-up",
    color: "#f59e0b",
  },
  {
    name: "Otros Ingresos",
    type: CategoryType.INCOME,
    icon: "plus-circle",
    color: "#6b7280",
  },
];
