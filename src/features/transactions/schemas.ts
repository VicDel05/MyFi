import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "DEBT_PAYMENT", "TRANSFER"]),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  transactionDate: z.string().min(1, "La fecha es requerida"),
  description: z.string().min(2, "La descripción debe tener al menos 2 caracteres").max(100),
  accountId: z.string().min(1, "Debes seleccionar una cuenta"),
  categoryId: z.string().optional().nullable(),
  expenseType: z.enum(["FIXED", "VARIABLE"]).optional().nullable(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
