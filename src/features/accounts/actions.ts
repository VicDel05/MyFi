"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { createAccountSchema, CreateAccountInput } from "./schemas";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  const user = await getOrCreateCurrentUser();
  return prisma.account.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createAccount(input: CreateAccountInput) {
  const parsed = createAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }

  const user = await getOrCreateCurrentUser();
  const { name, type, initialBalance, currency, color } = parsed.data;

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      name,
      type,
      initialBalance,
      currentBalance: initialBalance,
      currency,
      color,
    },
  });

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: true, data: account };
}

export async function deleteAccount(id: string) {
  const user = await getOrCreateCurrentUser();
  await prisma.account.updateMany({
    where: { id, userId: user.id },
    data: { isActive: false },
  });

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}
