"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { createCategorySchema, CreateCategoryInput } from "./schemas";
import { CategoryType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getCategories(type?: CategoryType) {
  const user = await getOrCreateCurrentUser();
  return prisma.category.findMany({
    where: {
      userId: user.id,
      isActive: true,
      ...(type ? { type } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(input: CreateCategoryInput) {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }

  const user = await getOrCreateCurrentUser();
  const { name, type, macroGroup, color, icon } = parsed.data;

  const category = await prisma.category.create({
    data: {
      userId: user.id,
      name,
      type,
      macroGroup: type === "EXPENSE" ? macroGroup : null,
      color: color || "#64748b",
      icon: icon || "tag",
    },
  });

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { success: true, data: category };
}

export async function deleteCategory(id: string) {
  const user = await getOrCreateCurrentUser();
  await prisma.category.updateMany({
    where: { id, userId: user.id },
    data: { isActive: false },
  });

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { success: true };
}
