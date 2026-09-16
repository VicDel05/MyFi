import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Debes seleccionar una categoría"),
  monthlyLimit: z.coerce.number().positive("El límite mensual debe ser mayor a 0"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "El periodo debe tener formato YYYY-MM"),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
