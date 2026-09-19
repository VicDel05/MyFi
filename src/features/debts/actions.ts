"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { createDebtSchema, CreateDebtInput, recordPaymentSchema, RecordPaymentInput } from "./schemas";
import { revalidatePath } from "next/cache";

export async function getDebtsOverview() {
  const user = await getOrCreateCurrentUser();

  const allDebts = await prisma.debt.findMany({
    where: { userId: user.id },
    include: {
      payments: {
        include: { account: { select: { name: true, color: true } } },
        orderBy: { paymentDate: "desc" },
      },
    },
    orderBy: { currentBalance: "asc" }, // Algoritmo Bola de Nieve: menor a mayor saldo
  });

  const activeDebts = allDebts.filter((d) => d.status === "ACTIVE" && Number(d.currentBalance) > 0);
  const liquidatedDebts = allDebts.filter((d) => d.status === "LIQUIDATED" || Number(d.currentBalance) <= 0);

  // La Deuda Foco es la primera deuda activa de menor saldo
  const focusDebtId = activeDebts[0]?.id || null;

  let totalInitial = 0;
  let totalCurrent = 0;
  let totalMinimumMonthly = 0;

  const formattedActive = activeDebts.map((d, index) => {
    const initial = Number(d.initialAmount);
    const current = Number(d.currentBalance);
    const paid = Math.max(0, initial - current);
    const percentage = initial > 0 ? Math.min(100, Math.round((paid / initial) * 100)) : 0;
    const minPay = Number(d.minimumPayment || 0);

    totalInitial += initial;
    totalCurrent += current;
    totalMinimumMonthly += minPay;

    return {
      id: d.id,
      name: d.name,
      creditor: d.creditor,
      initialAmount: initial,
      currentBalance: current,
      paidAmount: paid,
      percentagePaid: percentage,
      interestRate: d.interestRate ? Number(d.interestRate) : null,
      minimumPayment: minPay,
      dueDate: d.dueDate,
      status: d.status,
      isFocus: d.id === focusDebtId,
      snowballOrder: index + 1,
      paymentsCount: d.payments.length,
      recentPayments: d.payments.slice(0, 3).map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        date: p.paymentDate,
        notes: p.notes,
        accountName: p.account.name,
      })),
    };
  });

  const formattedLiquidated = liquidatedDebts.map((d) => {
    const initial = Number(d.initialAmount);
    return {
      id: d.id,
      name: d.name,
      creditor: d.creditor,
      initialAmount: initial,
      currentBalance: 0,
      paidAmount: initial,
      percentagePaid: 100,
      status: d.status,
      paymentsCount: d.payments.length,
    };
  });

  const totalPaid = Math.max(0, totalInitial - totalCurrent);
  const generalProgress = totalInitial > 0 ? Math.min(100, Math.round((totalPaid / totalInitial) * 100)) : 0;

  // Datos para gráfico de barras Recharts
  const chartData = formattedActive.map((d) => ({
    name: d.name.length > 14 ? d.name.slice(0, 14) + "..." : d.name,
    "Monto Inicial": d.initialAmount,
    "Saldo Pendiente": d.currentBalance,
    "Total Pagado": d.paidAmount,
  }));

  return {
    totalInitial,
    totalCurrent,
    totalPaid,
    generalProgress,
    totalMinimumMonthly,
    focusDebt: formattedActive.find((d) => d.id === focusDebtId) || null,
    activeDebts: formattedActive,
    liquidatedDebts: formattedLiquidated,
    chartData,
  };
}

export async function createDebt(input: CreateDebtInput) {
  const parsed = createDebtSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }

  const user = await getOrCreateCurrentUser();
  const { name, creditor, initialAmount, currentBalance, interestRate, minimumPayment, dueDate } = parsed.data;

  try {
    const debt = await prisma.debt.create({
      data: {
        userId: user.id,
        name,
        creditor,
        initialAmount,
        currentBalance,
        interestRate: interestRate ?? null,
        minimumPayment: minimumPayment ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: currentBalance <= 0 ? "LIQUIDATED" : "ACTIVE",
      },
    });

    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true, data: debt };
  } catch (error) {
    console.error("Error al registrar deuda:", error);
    return { success: false, error: "No se pudo registrar la deuda" };
  }
}

export async function recordDebtPayment(input: RecordPaymentInput) {
  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }

  const user = await getOrCreateCurrentUser();
  const { debtId, accountId, amount, paymentDate, notes } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener deuda
      const debt = await tx.debt.findFirst({
        where: { id: debtId, userId: user.id },
      });
      if (!debt) throw new Error("Deuda no encontrada");

      // 2. Obtener cuenta
      const account = await tx.account.findFirst({
        where: { id: accountId, userId: user.id },
      });
      if (!account) throw new Error("Cuenta no encontrada");

      // 3. Crear registro de DebtPayment
      const payment = await tx.debtPayment.create({
        data: {
          debtId,
          userId: user.id,
          accountId,
          amount,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          notes: notes || null,
        },
      });

      // 4. Descontar saldo de la cuenta de origen
      await tx.account.update({
        where: { id: accountId },
        data: { currentBalance: { decrement: amount } },
      });

      // 5. Reducir saldo de la deuda
      const newBalance = Math.max(0, Number(debt.currentBalance) - amount);
      const isLiquidated = newBalance <= 0;

      await tx.debt.update({
        where: { id: debtId },
        data: {
          currentBalance: newBalance,
          status: isLiquidated ? "LIQUIDATED" : "ACTIVE",
        },
      });

      // 6. Registrar en el historial de transacciones como DEBT_PAYMENT
      await tx.transaction.create({
        data: {
          userId: user.id,
          accountId,
          type: "DEBT_PAYMENT",
          amount,
          transactionDate: paymentDate ? new Date(paymentDate) : new Date(),
          description: `Abono a deuda: ${debt.name}`,
        },
      });

      return { payment, isLiquidated };
    });

    revalidatePath("/debts");
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true, isLiquidated: result.isLiquidated };
  } catch (error) {
    console.error("Error al registrar abono a deuda:", error);
    return { success: false, error: "No se pudo procesar el pago a la deuda" };
  }
}

export async function deleteDebt(id: string) {
  const user = await getOrCreateCurrentUser();
  await prisma.debt.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  return { success: true };
}
