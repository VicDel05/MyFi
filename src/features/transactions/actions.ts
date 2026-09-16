"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { createTransactionSchema, CreateTransactionInput } from "./schemas";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

export async function getTransactions(filters?: {
  type?: TransactionType;
  accountId?: string;
  limit?: number;
}) {
  const user = await getOrCreateCurrentUser();

  return prisma.transaction.findMany({
    where: {
      userId: user.id,
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.accountId ? { accountId: filters.accountId } : {}),
    },
    include: {
      account: { select: { id: true, name: true, color: true, currency: true } },
      category: { select: { id: true, name: true, color: true, icon: true, macroGroup: true } },
    },
    orderBy: { transactionDate: "desc" },
    take: filters?.limit ?? 50,
  });
}

export async function createTransaction(input: CreateTransactionInput) {
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }

  const user = await getOrCreateCurrentUser();
  const { type, amount, transactionDate, description, accountId, categoryId, expenseType } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear transacción
      const newTx = await tx.transaction.create({
        data: {
          userId: user.id,
          accountId,
          categoryId: categoryId || null,
          type,
          amount,
          transactionDate: new Date(transactionDate),
          description,
          expenseType: type === "EXPENSE" ? expenseType || "VARIABLE" : null,
        },
      });

      // 2. Actualizar saldo de la cuenta atómicamente
      if (type === "INCOME") {
        await tx.account.update({
          where: { id: accountId },
          data: { currentBalance: { increment: amount } },
        });
      } else if (type === "EXPENSE" || type === "DEBT_PAYMENT") {
        await tx.account.update({
          where: { id: accountId },
          data: { currentBalance: { decrement: amount } },
        });
      }

      return newTx;
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/accounts");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error al registrar transacción:", error);
    return { success: false, error: "No se pudo registrar la transacción" };
  }
}

export async function deleteTransaction(id: string) {
  const user = await getOrCreateCurrentUser();

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { id, userId: user.id },
      });

      if (!existing) throw new Error("Transacción no encontrada");

      // Revertir saldo de la cuenta
      if (existing.type === "INCOME") {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { decrement: existing.amount } },
        });
      } else if (existing.type === "EXPENSE" || existing.type === "DEBT_PAYMENT") {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { increment: existing.amount } },
        });
      }

      await tx.transaction.delete({
        where: { id },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar transacción:", error);
    return { success: false, error: "No se pudo eliminar la transacción" };
  }
}

export async function getFinancialSummary() {
  const user = await getOrCreateCurrentUser();

  // Obtener cuentas y calcular saldo total
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isActive: true },
  });

  const totalBalance = accounts.reduce(
    (acc, account) => acc + Number(account.currentBalance),
    0
  );

  // Obtener transacciones del mes actual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      transactionDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: { category: true },
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  let needsExpenses = 0;
  let wantsExpenses = 0;
  let savingsDebtExpenses = 0;

  for (const t of monthTransactions) {
    const amount = Number(t.amount);
    if (t.type === "INCOME") {
      totalIncome += amount;
    } else if (t.type === "EXPENSE" || t.type === "DEBT_PAYMENT") {
      totalExpenses += amount;
      const macro = t.category?.macroGroup;
      if (macro === "NEEDS") needsExpenses += amount;
      else if (macro === "WANTS") wantsExpenses += amount;
      else if (macro === "SAVINGS_DEBT") savingsDebtExpenses += amount;
    }
  }

  const netCashflow = totalIncome - totalExpenses;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netCashflow,
    currency: user.currency,
    breakdown503020: {
      needs: needsExpenses,
      wants: wantsExpenses,
      savingsDebt: savingsDebtExpenses,
    },
  };
}
