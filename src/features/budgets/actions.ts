"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { createBudgetSchema, CreateBudgetInput } from "./schemas";
import { revalidatePath } from "next/cache";

export async function getBudgetsWithSpending(period?: string) {
  const user = await getOrCreateCurrentUser();
  const currentPeriod = period || new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const [yearStr, monthStr] = currentPeriod.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  // 1. Obtener presupuestos definidos para el periodo
  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      period: currentPeriod,
    },
    include: {
      category: {
        select: { id: true, name: true, color: true, icon: true, macroGroup: true },
      },
    },
    orderBy: { monthlyLimit: "desc" },
  });

  // 2. Obtener gastos del mes agrupados por categoría
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      transactionDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      type: { in: ["EXPENSE", "DEBT_PAYMENT"] },
      categoryId: { not: null },
    },
    select: {
      categoryId: true,
      amount: true,
    },
  });

  // Mapear gastos reales por categoría
  const spendingMap = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.categoryId) {
      const current = spendingMap.get(tx.categoryId) || 0;
      spendingMap.set(tx.categoryId, current + Number(tx.amount));
    }
  }

  let totalBudgeted = 0;
  let totalSpent = 0;

  const items = budgets.map((b) => {
    const limit = Number(b.monthlyLimit);
    const spent = spendingMap.get(b.categoryId) || 0;
    const remaining = limit - spent;
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    totalBudgeted += limit;
    totalSpent += spent;

    let status: "SAFE" | "WARNING" | "EXCEEDED" = "SAFE";
    if (percentage >= 100) status = "EXCEEDED";
    else if (percentage >= 75) status = "WARNING";

    return {
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.category.name,
      categoryColor: b.category.color,
      categoryIcon: b.category.icon,
      macroGroup: b.category.macroGroup,
      period: b.period,
      monthlyLimit: limit,
      spentAmount: spent,
      remainingAmount: remaining,
      percentage,
      status,
    };
  });

  return {
    period: currentPeriod,
    totalBudgeted,
    totalSpent,
    totalRemaining: totalBudgeted - totalSpent,
    items,
  };
}

export async function upsertBudget(input: CreateBudgetInput) {
  const parsed = createBudgetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }

  const user = await getOrCreateCurrentUser();
  const { categoryId, monthlyLimit, period } = parsed.data;

  try {
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_period: {
          userId: user.id,
          categoryId,
          period,
        },
      },
      update: {
        monthlyLimit,
      },
      create: {
        userId: user.id,
        categoryId,
        period,
        monthlyLimit,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { success: true, data: budget };
  } catch (error) {
    console.error("Error al guardar presupuesto:", error);
    return { success: false, error: "No se pudo guardar el presupuesto" };
  }
}

export async function deleteBudget(id: string) {
  const user = await getOrCreateCurrentUser();
  await prisma.budget.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}
