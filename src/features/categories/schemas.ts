import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
  macroGroup: z.enum(["NEEDS", "WANTS", "SAVINGS_DEBT"]).optional().nullable(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
