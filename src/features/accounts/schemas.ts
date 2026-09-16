import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  type: z.enum(["CASH", "BANK", "SAVINGS", "CREDIT", "OTHER"]),
  initialBalance: z.coerce.number().min(0, "El saldo inicial no puede ser negativo"),
  currency: z.string().default("MXN"),
  color: z.string().optional().default("#3b82f6"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
