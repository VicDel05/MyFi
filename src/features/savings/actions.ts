"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { createGoalSchema, CreateGoalInput, addContributionSchema, AddContributionInput } from "./schemas";
import { revalidatePath } from "next/cache";

export async function getSavingsGoals() {
  const user = await getOrCreateCurrentUser();

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    include: {
      contributions: {
        include: { account: { select: { name: true, color: true } } },
        orderBy: { contributionDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return goals.map((g) => {
    const current = Number(g.currentAmount);
    const target = Number(g.targetAmount);
    const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const remaining = Math.max(0, target - current);

    return {
      id: g.id,
      name: g.name,
      targetAmount: target,
      currentAmount: current,
      remainingAmount: remaining,
      percentage,
      targetDate: g.targetDate,
      status: g.status,
      contributionsCount: g.contributions.length,
      contributions: g.contributions.map((c) => ({
        id: c.id,
        amount: Number(c.amount),
        date: c.contributionDate,
        accountName: c.account.name,
        accountColor: c.account.color,
      })),
    };
  });
}

export async function createSavingsGoal(input: CreateGoalInput) {
  const parsed = createGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }

  const user = await getOrCreateCurrentUser();
  const { name, targetAmount, targetDate } = parsed.data;

  try {
    const goal = await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name,
        targetAmount,
        currentAmount: 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        status: "IN_PROGRESS",
      },
    });

    revalidatePath("/savings");
    revalidatePath("/dashboard");
    return { success: true, data: goal };
  } catch (error) {
    console.error("Error al crear meta de ahorro:", error);
    return { success: false, error: "No se pudo crear la meta de ahorro" };
  }
}

export async function addSavingsContribution(input: AddContributionInput) {
  const parsed = addContributionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }

  const user = await getOrCreateCurrentUser();
  const { goalId, accountId, amount, contributionDate } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar cuenta
      const account = await tx.account.findFirst({
        where: { id: accountId, userId: user.id },
      });
      if (!account) throw new Error("Cuenta no encontrada");

      // 2. Registrar aporte
      const contribution = await tx.savingsContribution.create({
        data: {
          goalId,
          userId: user.id,
          accountId,
          amount,
          contributionDate: contributionDate ? new Date(contributionDate) : new Date(),
        },
      });

      // 3. Descontar saldo de la cuenta
      await tx.account.update({
        where: { id: accountId },
        data: { currentBalance: { decrement: amount } },
      });

      // 4. Aumentar saldo de la meta
      const updatedGoal = await tx.savingsGoal.update({
        where: { id: goalId },
        data: { currentAmount: { increment: amount } },
      });

      // 5. Si alcanza la meta, marcarla como completada
      if (Number(updatedGoal.currentAmount) >= Number(updatedGoal.targetAmount)) {
        await tx.savingsGoal.update({
          where: { id: goalId },
          data: { status: "COMPLETED" },
        });
      }

      return contribution;
    });

    revalidatePath("/savings");
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error al registrar aporte de ahorro:", error);
    return { success: false, error: "No se pudo registrar la aportación" };
  }
}

export async function deleteSavingsGoal(id: string) {
  const user = await getOrCreateCurrentUser();
  await prisma.savingsGoal.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function get503020Comparison(period?: string) {
  const user = await getOrCreateCurrentUser();
  const currentPeriod = period || new Date().toISOString().slice(0, 7);

  const [yearStr, monthStr] = currentPeriod.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      transactionDate: { gte: startOfMonth, lte: endOfMonth },
    },
    include: { category: true },
  });

  let totalIncome = 0;
  let spentNeeds = 0;
  let spentWants = 0;
  let spentSavingsDebt = 0;

  for (const t of transactions) {
    const amt = Number(t.amount);
    if (t.type === "INCOME") {
      totalIncome += amt;
    } else if (t.type === "EXPENSE" || t.type === "DEBT_PAYMENT") {
      const macro = t.category?.macroGroup;
      if (macro === "NEEDS") spentNeeds += amt;
      else if (macro === "WANTS") spentWants += amt;
      else if (macro === "SAVINGS_DEBT") spentSavingsDebt += amt;
    }
  }

  // Si no hay ingresos registrados este mes, usamos los gastos totales como base de referencia
  const baseReference = totalIncome > 0 ? totalIncome : spentNeeds + spentWants + spentSavingsDebt || 1000;

  const idealNeeds = baseReference * 0.5;
  const idealWants = baseReference * 0.3;
  const idealSavings = baseReference * 0.2;

  const chartData = [
    {
      name: "Necesidades (50%)",
      Ideal: Math.round(idealNeeds),
      Real: Math.round(spentNeeds),
    },
    {
      name: "Deseos (30%)",
      Ideal: Math.round(idealWants),
      Real: Math.round(spentWants),
    },
    {
      name: "Ahorro/Deuda (20%)",
      Ideal: Math.round(idealSavings),
      Real: Math.round(spentSavingsDebt),
    },
  ];

  return {
    totalIncome,
    totalSpent: spentNeeds + spentWants + spentSavingsDebt,
    chartData,
  };
}
