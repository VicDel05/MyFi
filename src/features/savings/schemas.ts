import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  targetAmount: z.coerce.number().positive("El monto objetivo debe ser mayor a 0"),
  targetDate: z.string().optional().nullable(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const addContributionSchema = z.object({
  goalId: z.string().min(1, "Debes seleccionar una meta"),
  accountId: z.string().min(1, "Debes seleccionar una cuenta de origen"),
  amount: z.coerce.number().positive("El monto a aportar debe ser mayor a 0"),
  contributionDate: z.string().optional(),
});

export type AddContributionInput = z.infer<typeof addContributionSchema>;
